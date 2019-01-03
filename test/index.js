'use strict'

const React = require('react')
const assert = require('assert')
const reactApp = require('..')

const noUpdater = node => {
  node.children = node.children.map(noUpdater)
  delete node.updater
  delete node.refs
  delete node.context
  return node
}

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
      noUpdater(reactApp(
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
            children: []
          }, {
            type: CComp,
            props: {
              bar: 'baz'
            },
            state: {},
            children: []
          }
        ]
      }
    )
  })
  it('gives us mount callbacks', (done) => {
    const allMounted = []
    reactApp(
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
    }
    reactApp(<CComp />, { dynamic: true })
    setImmediate(() => {
      assert(componentWillMountCalled)
      assert(componentDidMountCalled)
      done()
    })
  })
  it.skip('Supports state', () => {
    class CComp extends React.Component {
      componentDidMount() {
        this.setState({ foo: 'bar' })
      }
      render() {
        return this.state.foo
      }
    }
    reactApp(<CComp />, {
      onChange({ oldState, newState, changed, added, removed }) {
        console.log('onChange', { oldState, newState, changed, added, removed } , {componentDidMountCalled})
      }
    })
  })
})
