'use strict'

const jsonDiff = require('json-diff')
const assert = require('assert')
const cloneDeep = require('lodash/cloneDeep')
const isEqual = require('lodash/isEqual')
const toPairs = require('lodash/toPairs')
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
      comp.__proto__ = Type.prototype
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
  function toPairsRecursive(node) {
    const pairs = toPairs(node)
    return pairs.map(pair => {
      if (typeof pair[1] === 'object' && pair[1] !== null) {
        return [pair].concat(toPairsRecursive(pair[1]))
      }
      return [
        pair
      ]
    }).reduce((a, b) => a.concat(b), [])
    return pairs
  }
  function update(node) {
    const oldChildren = node.children
    const { type, key, props: { children, ...props }, state = {} } = 
      node.render
        ? node.render()
        : node.type(node.props)
    node.children = [{ type, key, props, children: getChildren(children), state }]

    assert(node.children[0].type)
    assert(node.children[0].state)
    assert(node.children[0].props)
      /*
    const added = []
    const diff = jsonDiff.diff(oldChildren, node.children)
    Object.keys(diff).forEach(function addToDiff (diffProp) {
      if (isEqual(diffProp.__old, [])) {
        console.log('equal!')
      }
    })
    console.log()
    */
    //oldChildren.forEach((oldChild) => {
    //const newChild = node.children[key]
    //})
    return node
  }
  function onUpdate () {
    structure = update(structure)
    onChange(oldState, structure)
    oldState = cloneDeep(structure)
  }

  const mount = node => {
    if (typeof node === 'string') return node
    try {
      node.state = node.state || {}
    } catch (e) {
      const compProto = node.__proto__
      node = { ...node }
      node.__proto__ = compProto
    }
    node.children.forEach(mount)

    pCall(node.__proto__.constructor, node, 'componentWillMount')
    pCall(node.__proto__.constructor, node, 'componentDidMount')
  }

  mount(structure)

  return structure
}
