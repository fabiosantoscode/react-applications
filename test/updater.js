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
        assert.deepEqual(oldState.state, {})
        assert.deepEqual(newState.state, { foo: 'bar' })
        onChangeCalled = true
      }
    })
    assert.deepEqual(comp.state, {})
    setImmediate(() => {
      assert(onChangeCalled)
      assert(didMountCalled)
      assert.deepEqual(comp.state, { foo: 'bar' })
      done()
    })
  })
  it('processes componentDidUpdate', done => {
    let didUpdateCalled = false
    class CComp extends React.Component {
      constructor(...args) {
        super(...args)
        this.state = {}
      }
      componentWillMount() {
        this.setState({ foo: 'bar' })
      }
      componentDidUpdate() {
        didUpdateCalled = true
      }
      render() {
        return <div foo={this.state.foo} />
      }
    }
    const comp = reactApp(<CComp />, { dynamic: true })
    assert.deepEqual(comp.state, {})
    setImmediate(() => {
      assert(didUpdateCalled)
      assert.deepEqual(comp.state, { foo: 'bar' })
      done()
    })
  })
  it('Updates subtree on state changes', done => {
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
  it('Allows for deep changes', done => {
    class CComp extends React.Component {
      constructor(...args) {
        super(...args)
        this.state = {}
      }
      componentDidMount() {
        this.setState({ foo: 'bar' })
      }
      render() {
        return <div>{
          this.state && this.state.foo ? <div>{this.state.foo}</div> : <pre>foo</pre>
        }</div>
      }
    }
    reactApp(<CComp />, {
      onChange(oldState, newState) {
        assert.equal(oldState.children[0].children[0].type, 'pre')
        assert.equal(newState.children[0].children[0].type, 'div')
        assert.equal(oldState.children[0].children[0].children[0], 'foo')
        assert.equal(newState.children[0].children[0].children[0], 'bar')
        done()
      }
    })
  })
})
