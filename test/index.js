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
            children: []
          },
          {
            type: 'div',
            key: null,
            props: {
              foo: 'bar'
            },
            children: [
              {
                type: 'div',
                key: null,
                props: {
                  bar: 'baz'
                },
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
