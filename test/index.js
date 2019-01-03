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
        },
        children: []
      }
    )
  })
  it('can invoke function and class components', () => {
    function FComp(props) { return props.foo }
    class CComp extends React.Component {
      render() { return this.props.bar }
    }
    assert.deepEqual(
      reactApp(
        <div>
          <FComp foo="bar" />
          <CComp bar="baz" />
        </div>
      ),
      {
        type: 'div',
        key: null,
        props: {},
        children: [
          {
            type: FComp,
            key: null,
            props: {
              foo: 'bar',
            },
            children: []
          }, {
            type: CComp,
            key: null,
            props: {
              bar: 'baz'
            },
            children: []
          }
        ]
      }
    )
  })
  it.skip('reads JSX into an object', () => {
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
  it.skip('reads JSX into an object', () => {
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
