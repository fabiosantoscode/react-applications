'use strict'

module.exports = (jsx) => {
  const convert = ({ type, key, props }) => ({ type, key, props })
  return convert(jsx)
}
