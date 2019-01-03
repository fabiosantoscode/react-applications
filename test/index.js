'use strict'

const React = require('react')
const assert = require('assert')
const reactApp = require('..')

describe('react-applications', () => {
  it('reads JSX into an object', () => {
    assert.deepEqual(
      reactApp(<div foo="bar" />),
      {
        type: 'div',
        key: null,
        props: {
          foo: 'bar'
        }
      }
    )
  })
})
