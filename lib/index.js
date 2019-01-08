'use strict'

const assert = require('assert')
const { inspect } = require('util')
const React = require('react')
const cloneDeep = require('lodash/cloneDeep')
const jsonDiff = require('json-diff')
const Updater = require('./updater')

const ins = (...a) => console.log(...(a.map(i => inspect(i, { depth: Infinity }))))

const isReactComponent = Symbol('isReactComponent')

const updateWithProto = (old, newStuff = {}, { doCopy } = {}) => {
  if (doCopy) {
    const __proto__ = Object.getPrototypeOf(old)
    old = { ...old, __proto__ }
    for (var k in newStuff) if (newStuff.hasOwnProperty(k)) {
      Object.set
    }
    return old
  }
  for (let k in newStuff) if (newStuff.hasOwnProperty(k)) {
    Object.defineProperty(old, k, { value: newStuff[k] })
  }
  return old
}

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
  const render = node => {
    node = node.render ? node.render() : node.type({ ...node.props, children: node.children })
    if (isObject(node)) return node
    node = updateWithProto(node, {}, { doCopy: true })
    node.children = node.props.children
    node.props = { ...node.props }
    delete node.props.children
    return node
  }
  const isObject = node => {
    return (!node || (node.$$typeof !== Symbol.for('react.element') && node.isReactComponent !== isReactComponent)) && !(node instanceof React.Component)
  }
  const jsxInObject = node => {
    if (isObject(node) && typeof node !== 'object' || !node) return node
    for (var k in node) if (node.hasOwnProperty(k) && k !== 'updater' && k !== 'children') {
      if (node[k] && typeof node[k] === 'object') {
        node[k] = convert(node[k])
      }
    }
    return node
  }
  const pCall = (self, method, ...args) => {
    if (self.constructor.prototype && self.constructor.prototype[method]) {
      return self.constructor.prototype[method].call(self, ...args)
    }
  }
  const convert = (node = {}, { callMount = false } = {}) => {
    if (isObject(node)) {
      node = jsxInObject(node)
      return node
    }
    let { type, key, props: { children, ...props } } = node
    if (!children && node.children) children = node.children
    if (typeof type === 'function') {
      const allProps = Object.assign({}, props, children)
      const Type = type
      let comp = new Type(allProps)
      updateWithProto(comp, {
        updater: comp.updater && new Updater({ comp, props: allProps, onUpdate }),
        isReactComponent,
        state: comp.state || {},
        props,
        type,
        children: isObject(children)
          ? jsxInObject(children)
          : getChildren(children)
      })
      assert(comp.state, 'comp.state')
      assert(comp.props, 'comp.props')
      assert(comp.type, 'comp.type')
      return comp
    }
    const ret = { type, key, props, children: getChildren(children), state: {} }
    Object.defineProperty(ret, 'isReactComponent', { value: isReactComponent })
    assert(ret.type)
    assert(ret.state)
    return ret
  }

  function toUser (node) {
    if (isObject(node)) return jsxInObject(node)
    if (typeof node.type === 'function') {
      node = render(node)
      if (isObject(node)) return jsxInObject(node)
    }
    if (Array.isArray(node.children)) {
      const proto = Object.getPrototypeOf(node)
      node = { ...node, children: node.children.map(toUser), __proto__: proto }
    }
    return node
  }

  let structure = convert(jsx, { callMount: onChange || dynamic })
  if (!onChange && !dynamic) return toUser(structure)

  if (!onChange) onChange = () => null

  let oldState = cloneDeep(structure)

  ;(function mount (node) {
    if (isObject(node)) return node
    mountBack(node)
    pCall(node, 'componentWillMount')
    pCall(node, 'componentDidMount')
    if (Array.isArray(node.children)) {
      updateWithProto(node, { children: node.children.map(mount) })
    }
  })(structure)

  function update (node) {
    if (isObject(node)) {
      return jsxInObject(node)
    }

    const oldChildren = node.children

    if (typeof node.type === 'function') {
      node = convert(node)
    }

    if (isObject(node)) return node

    if (node.props.children && node.props.children.map) {
      node.children = node.props.children.map(update)
    }

    delete node.props.children

    const diff = jsonDiff.diff(oldChildren || [], node.children || [])
    diff && diff.forEach && diff.forEach(([type, diff]) => {
      assert(type == '~' || type == '+' || type == '-')
      // TODO
    })

    return node
  }
  function onUpdate () {
    structure = update(structure)
    ins([
      { state: oldState, asUser: toUser(oldState), },
      { state: structure, asUser: toUser(structure), }
    ])
    onChange(toUser(oldState), toUser(structure))
    oldState = cloneDeep(structure)
  }

  return toUser(structure)
}
