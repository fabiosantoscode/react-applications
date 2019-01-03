'use strict'

const assert = require('assert')

module.exports = (jsx, { mountBack = () => null } = {}) => {
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
  return convert(jsx)
}
