'use strict'

const React = require('react')
const reactApp = require('..')
const Updater = require('../lib/updater')
const assert = require('assert')

describe('Updater', () => {
  it('doesn\'t force update because we can\'t implement the universe. Send a PR!', () => {
    assert.throws(() => {
      const up = new Updater(null, {})
      up.enqueueForceUpdate()
    }, 'Error: enqueueForceUpdate is disabled')
  })
  it('enqueueSetState', done => {
    let didMountCalled = false
    class CComp extends React.Component {
      constructor(...args) {
        super(...args)
        this.state = {}
      }
      componentDidMount() {
        console.log('didMountCalled')
        didMountCalled = true
        this.setState({ foo: 'bar' })
      }
      render() {
        return <div foo={this.state.foo} />
      }
    }
    let onChangeCalled = false
    const comp = reactApp(<CComp />, {
      onChange(oldState, newState) {
        //console.log({oldState, newState})
        assert.deepEqual(oldState.state, {})
        assert.deepEqual(newState.state, { foo: 'bar' })
        assert(didMountCalled, 'didMountCalled')
        done()
      }
    })
  })
  it('processes componentDidUpdate', done => {
    let didUpdateCalled = false
    let comp
    class CComp extends React.Component {
      constructor(...args) {
        super(...args)
        this.state = {}
      }
      componentWillMount() {
        this.setState({ foo: 'bar' })
        comp = this
      }
      componentDidUpdate() {
        didUpdateCalled = true
      }
      render() {
        return <div foo={this.state.foo} />
      }
    }
    reactApp(<CComp />, { dynamic: true })
    setImmediate(() => {
      assert(didUpdateCalled)
      assert.deepEqual(comp.state, { foo: 'bar' })
      done()
    })
  })
  it.only('Updates subtree on state changes', done => {
    class CComp extends React.Component {
      constructor(...args) {
        super(...args)
        this.state = {}
      }
      componentDidMount() {
        this.setState({ foo: 'bar' })
      }
      render() {
        return <div>{this.state.foo}</div>
      }
    }
    reactApp(<CComp />, {
      onChange(oldState, newState) {
        assert.deepEqual(oldState.children, [{
          type: 'div',
          key: null,
          props: {},
          children: [],
          state: {}
        }])
        assert.deepEqual(newState.children, [{
          type: 'div',
          key: null,
          props: {},
          children: ['bar'],
          state: {}
        }])
        done()
      }
    })
  })
  it('Calls componentDidUpdate on subtree prop changes')
  it('Allows for deep changes', done => {
    class CComp extends React.Component {
      constructor(...args) {
        super(...args)
        this.state = {}
      }
      componentDidMount() {
        console.log('setState')
        this.setState({ foo: 'bar' })
      }
      render() {
        return <div>{
          this.state && this.state.foo ? <div>{this.state.foo}</div> : <pre>foo</pre>
        }</div>
      }
    }
    reactApp(<CComp />, {
      mountBack(node) {
        console.log('mountBack', node)
      },
      onChange(oldState, newState) {
        console.log({oldState: oldState, newState: newState})
        assert.equal(oldState.children[0].type, 'pre')
        assert.equal(newState.children[0].type, 'div')
        assert.equal(oldState.children[0].children[0], 'foo')
        assert.equal(newState.children[0].children[0], 'bar')
        done()
      }
    })
  })
  it('supports componentDidUpdate', () => {
    class CComp extends React.Component {
      componentDidMount() {
        this.setState({ foo: 'bar' })
      }
      componentDidUpdate() {
        assert.equal(this.state.foo, 'bar')
      }
    }
    // TODO
  })
  it('supports componentWillUnmount')
})
