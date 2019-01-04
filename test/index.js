'use strict'

const React = require('react')
const assert = require('assert')
const reactApps = require('..')

const noUpdater = node => {
  if (typeof node === 'string') return node
  node.children = node.children.map(noUpdater)
  delete node.updater
  delete node.refs
  delete node.context
  return node
}

describe('react-applications', () => {
  it('reads JSX into an object', () => {
    assert.deepEqual(
      reactApps(<div foo="bar" />),
      {
        type: 'div',
        key: null,
        props: {
          foo: 'bar'
        },
        state: {},
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
      noUpdater(reactApps(
        <div>
          <FComp foo="bar" />
          <CComp bar="baz" />
        </div>
      )),
      {
        type: 'div',
        key: null,
        props: {},
        state: {},
        children: [
          {
            type: FComp,
            props: {
              foo: 'bar',
            },
            state: {},
            children: ['bar']
          }, {
            type: CComp,
            props: {
              bar: 'baz'
            },
            state: {},
            children: ['baz']
          }
        ]
      }
    )
  })
  it('gives us mount callbacks', (done) => {
    const allMounted = []
    reactApps(
      <div foo="bar"><div bar="baz" /></div>,
      {
        mountBack (mounted) {
          allMounted.push(mounted)
          if (allMounted.length === 2) end()
        }
      }
    )
    function end() {
      assert.deepEqual(
        allMounted,
        [
          {
            type: 'div',
            key: null,
            props: {
              bar: 'baz'
            },
            state: {},
            children: []
          },
          {
            type: 'div',
            key: null,
            props: {
              foo: 'bar'
            },
            state: {},
            children: [
              {
                type: 'div',
                key: null,
                props: {
                  bar: 'baz'
                },
                state: {},
                children: []
              }
            ]
          },
        ]
      )
      done()
    }
  })
  it('Calls componentDidMount and componentWillMount', done => {
    let componentDidMountCalled = false
    let componentWillMountCalled = false
    class CComp extends React.Component {
      componentDidMount() {
        componentDidMountCalled = true
      }
      componentWillMount() {
        componentWillMountCalled = true
      }
      render() { }
    }
    reactApps(<CComp />, { dynamic: true })
    setImmediate(() => {
      assert(componentWillMountCalled)
      assert(componentDidMountCalled)
      done()
    })
  })
  it('Allows for rendering objects instead of jsx', () => {
    assert.deepEqual(
      reactApps({ foo: 'bar' }),
      { foo: 'bar' }
    )
  })
  it('Allows for rendering objects in props', () => {
    assert.deepEqual(
      reactApps(<div foo={{bar: 'baz'}} />),
      {
        type: 'div',
        key: null,
        props: {
          foo: { bar: 'baz' }
        },
        state: {},
        children: []
      }
    )
  })
  it('Allows for rendering objects as children', () => {
    assert.deepEqual(
      reactApps(<div>{{foo: 'bar'}}</div>),
      {
        type: 'div',
        key: null,
        props: {},
        state: {},
        children: [{
          foo: 'bar'
        }]
      }
    )
  })
  it('Allows for JSX inside objects', () => {
    assert.deepEqual(
      reactApps({
        foo: <div foo={{ bar: 'baz' }}/>
      }),
      {
        foo: {
          type: 'div',
          key: null,
          props: {
            foo: {
              bar: 'baz'
            }
          },
          state: {},
          children: []
        }
      }
    )
  })
})
