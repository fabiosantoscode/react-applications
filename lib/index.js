'use strict'

const assert = require('assert')
const cloneDeep = require('lodash/cloneDeep')
const Updater = require('./updater')

module.exports = (jsx, { mountBack = () => null, onChange, dynamic } = {}) => {
  const getChildren = (children) => {
    return (
      Array.isArray(children)
        ? children
        : children == null
          ? []
          : [children]
    ).map(convert)
  }
  const convert = (node = {}) => {
    if (typeof node === 'string') return node
    const { type, key, props: { children, ...props } } = node
    if (typeof type === 'function') {
      const allProps = Object.assign({}, props, children)
      const Type = type
      let comp = new Type(allProps)
      comp = { ...comp }
      Object.setPrototypeOf(comp, Type.prototype)
      if (comp.updater) comp.updater = new Updater({ comp, props: allProps, onUpdate })
      Object.assign(comp, { state: comp.state || {}, props, type })
      comp.children = getChildren(comp.render ? comp.render() : comp.type(comp.props))
      assert(comp.state)
      assert(comp.props)
      mountBack(comp)
      return comp
    }
    const ret = { type, key, props, children: getChildren(children), state: {} }
    assert(ret.type)
    assert(ret.state)
    mountBack(ret)
    return ret
  }
  let structure = convert(jsx)
  if (!onChange && !dynamic) return structure

  if (!onChange) onChange = () => null

  const pCall = (Type, self, method, ...args) => {
    if (Type.prototype && Type.prototype[method]) {
      return Type.prototype[method].call(self, ...args)
    }
  }

  let oldState = cloneDeep(structure)
  function update (node) {
    const { type, key, props: { children, ...props }, state = {} } =
      node.render
        ? node.render()
        : node.type(node.props)
    node.children = [{ type, key, props, children: getChildren(children), state }]

    assert(node.children[0].type)
    assert(node.children[0].state)
    assert(node.children[0].props)
    return node
  }
  function onUpdate () {
    structure = update(structure)
    onChange(oldState, structure)
    oldState = cloneDeep(structure)
  }

  const mount = node => {
    if (typeof node === 'string') return node
    const compProto = Object.getPrototypeOf(node)
    try {
      node.state = node.state || {}
    } catch (e) {
      node = { ...node }
      Object.setPrototypeOf(node, compProto)
    }
    node.children.forEach(mount)

    pCall(compProto.constructor, node, 'componentWillMount')
    pCall(compProto.constructor, node, 'componentDidMount')
  }

  mount(structure)

  return structure
}
