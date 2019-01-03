'use strict'

const assert = require('assert')
const cloneDeep = require('lodash/cloneDeep')
const Updater = require('./updater')

module.exports = (jsx, { mountBack = () => null, onChange, dynamic } = {}) => {
  const getChildren = children => (
    Array.isArray(children)
      ? children
      : children == null
        ? []
        : [children]
  ).map(convert)
  const convert = ({ type, key, props: { children, ...props } }) => {
    if (typeof type === 'function') {
      const allProps = Object.assign({}, props, children)
      const Type = type
      const comp = new Type(allProps)
      if (comp.updater) comp.updater = new Updater({ comp, props: allProps, onUpdate })
      comp.children = getChildren(children)
      Object.assign(comp, { state: comp.state || {}, props, type })
      assert(comp.state)
      mountBack(comp)
      return comp
    }
    children = getChildren(children)
    const ret = { type, key, props, children, state: {} }
    assert(ret.state)
    mountBack(ret)
    return ret
  }
  const structure = convert(jsx)
  if (!onChange && !dynamic) return structure

  if (!onChange) onChange = () => null

  const pCall = (Type, self, method, ...args) => {
    if (Type.prototype && Type.prototype[method]) {
      return Type.prototype[method].call(self, ...args)
    }
  }

  let oldState = cloneDeep(structure)
  function onUpdate () {
    onChange(oldState, structure)
    oldState = cloneDeep(structure)
  }

  const mount = node => {
    node.state = node.state || {}
    node.children.forEach(mount)

    pCall(node.type, node, 'componentWillMount')
    pCall(node.type, node, 'componentDidMount')
  }

  mount(structure)

  return structure
}
