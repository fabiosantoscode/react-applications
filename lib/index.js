'use strict'

const assert = require('assert')

module.exports = (jsx) => {
  const convert = ({ type, key, props: { children, ...props } }) => {
    assert(type !== 'function', 'just to make sure')
    children = (children || []).map(convert)
    return { type, key, props, children }
  }
  return convert(jsx)
}
