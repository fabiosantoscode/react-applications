'use strict'

const assert = require('assert').strict
const React = require('react')
const reactApps = require('..')
const Updater = require('../lib/updater')

describe('Updater', () => {
  it('supports forceUpdate', done => {
    let called
    const up = new Updater({ onUpdate () { called = true } })
    up.enqueueForceUpdate()
    setImmediate(() => {
      assert.equal(called, true)
      done()
    })
  })
  it('enqueueSetState', done => {
    let didMountCalled = false
    class CComp extends React.Component {
      constructor (...args) {
        super(...args)
        this.state = {}
      }
      componentDidMount () {
        console.log('didMountCalled')
        didMountCalled = true
        this.setState({ foo: 'bar' })
      }
      render () {
        return <div foo={this.state.foo} />
      }
    }
    let onChangeCalled = false
    reactApps(<CComp />, {
      onUpdate (oldState, newState) {
        assert(didMountCalled, 'didMountCalled')
        assert.equal(oldState.props.foo, undefined)
        assert.equal(newState.props.foo, 'bar')
        done()
      }
    })
  })
  it('processes componentDidUpdate', done => {
    let didUpdateCalled = false
    let comp
    class CComp extends React.Component {
      constructor (...args) {
        super(...args)
        this.state = {}
      }
      componentWillMount () {
        this.setState({ foo: 'bar' })
        comp = this
      }
      componentDidUpdate () {
        didUpdateCalled = true
      }
      render () {
        return <div foo={this.state.foo} />
      }
    }
    reactApps(<CComp />, { dynamic: true })
    setImmediate(() => {
      assert(didUpdateCalled)
      assert.deepEqual(comp.state, { foo: 'bar' })
      done()
    })
  })
  it('Calls componentDidUpdate on subtree prop changes')
  it('Allows for deep changes', done => {
    class CComp extends React.Component {
      constructor (...args) {
        super(...args)
        this.state = {}
      }
      componentDidMount () {
        this.setState({ foo: 'bar' })
      }
      render () {
        return <div>{
          this.state && this.state.foo ? <div>{this.state.foo}</div> : <pre>foo</pre>
        }</div>
      }
    }
    reactApps(<CComp />, {
      onUpdate (oldState, newState) {
        assert.equal(oldState.props.children.type, 'pre')
        assert.equal(newState.props.children.type, 'div')
        assert.equal(oldState.props.children.props.children, 'foo')
        assert.equal(newState.props.children.props.children, 'bar')
        done()
      }
    })
  })
  it('supports componentDidUpdate', () => {
    class CComp extends React.Component {
      componentDidMount () {
        this.setState({ foo: 'bar' })
      }
      componentDidUpdate () {
        assert.equal(this.state.foo, 'bar')
      }
    }
    // TODO
  })
  it('supports componentWillUnmount')
})
