'use strict'

const assert = require('assert')

module.exports = (jsx, { mountBack = () => null, onChange, dynamic } = {}) => {
  const convert = ({ type, key, props: { children, ...props } }) => {
    assert(type !== 'function', 'just to make sure')
    children = (
      Array.isArray(children)
        ? children
        : children == null
          ? []
          : [children]
    ).map(convert)
    const ret = { type, key, props, children }
    mountBack(ret)
    return ret
  }
  const structure = convert(jsx)
  if (!onChange && !dynamic) return structure

  if (!onChange) onChange = () => null

  const changed = []
  const added = []
  const removed = []
  function setState (newStateProps) {
    for (var k in newStateProps) {
      if (newStateProps.hasOwnProperty(k)) {
        this.state[k] = newStateProps[k]
      }
    }
    changed.push(this)
    enqueueChange()
  }
  function change () {
    console.log('change invoked')
  }
  let imm = null
  function enqueueChange () {
    if (imm) return
    imm = setImmediate(() => {
      imm = null
      change()
    })
  }
  const pCall = (Type, self, method, ...args) => {
    if (Type.prototype && Type.prototype[method]) {
      return Type.prototype[method](...args)
    }
  }
  const mount = node => {
    node.state = {}
    node.setState = setState
    node.children.forEach(mount)

    pCall(node.type, node, 'componentWillMount')
    added.push(node)
    pCall(node.type, node, 'componentDidMount')
  }

  mount(structure)

  return structure
}
