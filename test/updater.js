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
})