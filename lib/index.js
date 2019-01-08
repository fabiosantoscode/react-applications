'use strict'

const assert = require('assert')
const React = require('react')
const fromPairs = require('lodash/fromPairs')
const cloneDeep = require('lodash/cloneDeep')
const Updater = require('./updater')

const isObject = node => {
  return (!node || node.$$typeof !== Symbol.for('react.element')) && !(node instanceof React.Component)
}

module.exports = function reactApplications (jsx, { onUpdate, dynamic } = {}) {
  let structure
  let prevStructure
  const updater = new Updater({
    onUpdate () {
      if (onUpdate) onUpdate(toUser(prevStructure), toUser(structure))
      prevStructure = cloneDeep(structure)
    }
  })
  const jsxInObject = node => {
    if ((isObject(node) && typeof node !== 'object') || !node) return node
    for (var k in node) {
      if (node.hasOwnProperty(k) && k !== 'updater' && k !== 'children') {
        if (node[k] && typeof node[k] === 'object') {
          node[k] = convert(node[k])
        }
      }
    }
    return node
  }
  function convert (node) {
    if (isObject(node)) return jsxInObject(node)
    if (typeof node.type === 'function') {
      const Type = node.type
      const comp = new Type(node.props)
      if (!comp.type) Object.defineProperty(comp, 'type', { value: node.type, enumerable: true })
      if (onUpdate || (dynamic && comp.updater)) Object.defineProperty(comp, 'updater', { value: updater })
      assert(comp.type)
      return comp
    }
    const ret = React.createElement(node.type, node.props, node.props && node.props.children)
    assert(ret.type)
    return ret
  }

  const render = (elm, self) => {
    if (typeof elm.type === 'string') {
      return elm
    } else if (self.render) {
      return self.render()
    } else {
      return self.type(self.props)
    }
  }
  const toUser = node => {
    if (isObject(node) && typeof node.type === 'function') {
      node = cloneDeep(node)
      delete node.type
    }
    if (isObject(node) && typeof node !== 'object' || node == null) return node
    if (isObject(node)) {
      return fromPairs(
        Object.keys(node).map(key => {
          const value = toUser(node[key])
          return [key, value]
        })
      )
    }
    const elm = React.createElement(node.type, node.props, node.props.children)

    return render(elm, node)
  }

  structure = convert(jsx)
  prevStructure = cloneDeep(structure)

  if (!(onUpdate || dynamic)) return toUser(structure)

  ;(function mount (node) {
    if (isObject(node)) {
      Object.keys(node).forEach(key => {
        if (!isObject(node[key])) mount(node[key])
      })
    }
    if (node.type.prototype.componentWillMount) {
      node.type.prototype.componentWillMount.apply(node)
    }
    if (node.type.prototype.componentDidMount) {
      node.type.prototype.componentDidMount.apply(node)
    }
  })(structure)

  return toUser(structure)
}
