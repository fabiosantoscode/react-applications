'use strict'

const React = require('react')
const assert = require('assert')
const reactApps = require('..')

function clean (node) {
  if (node.$$typeof !== Symbol.for('react.element')) {
    for (const k in node) {
      if (node.hasOwnProperty(k)) {
        node[k] = clean(node[k])
      }
    }
  }
  node = { ...node, props: node.props ? { ...node.props } : undefined }
  if (node.props == null) delete node.props
  if (node.props && node.props.children === undefined) delete node.props.children
  delete node.ref
  delete node.$$typeof
  delete node._owner
  delete node._store
  return node
}
describe('react-applications', () => {
  it('Calls componentWillMount', done => {
    let componentWillMountCalled = false
    class CComp extends React.Component {
      componentWillMount () {
        componentWillMountCalled = true
      }
      render () {
        return <div>foo</div>
      }
    }
    reactApps(<CComp />, { dynamic: true })
    setImmediate(() => {
      assert(componentWillMountCalled)
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
      clean(reactApps(<div foo={{ bar: 'baz' }} />)),
      {
        type: 'div',
        key: null,
        props: {
          foo: { bar: 'baz' }
        }
      }
    )
  })
  it('Allows for rendering objects as children', () => {
    assert.deepEqual(
      clean(reactApps(<div>{{ foo: 'bar' }}</div>)),
      {
        type: 'div',
        key: null,
        props: {
          children: {
            foo: 'bar'
          }
        }
      }
    )
  })
  it.skip('Allows for rendering objects in props and children', () => {
    function FComp (props) { return <div foo={{ bar: 'baz' }}>{props.children}</div> }
    assert.deepEqual(
      reactApps(<FComp>{{ baz: 'qux' }}</FComp>),
      {
        type: 'div',
        key: null,
        props: {
          foo: { bar: 'baz' }
        },
        state: {},
        children: [{
          baz: 'qux'
        }]
      }
    )
  })
  it('Allows for JSX inside objects', () => {
    function FComp () { return <div foo={{ bar: 'baz' }}/> }
    assert.deepEqual(
      clean(reactApps({
        foo: <FComp />
      })),
      {
        foo: {
          type: 'div',
          key: null,
          props: {
            foo: {
              bar: 'baz'
            }
          }
        }
      }
    )
  })
  it('Allows for rendering objects instead of jsx', () => {
    assert.deepEqual(
      reactApps({ foo: 'bar' }),
      { foo: 'bar' }
    )
  })
  it('Allows for purely creating objects', () => {
    function FComp (props) { return props.children }
    assert.deepEqual(
      reactApps(<FComp>{{ foo: 'bar' }}</FComp>),
      {
        foo: 'bar'
      }
    )
  })
  it('components are transparent', () => {
    function FComp (props) { return props.children }
    class CComp extends React.Component {
      render () {
        assert(this.props.bar)
        return this.props.bar; return <FComp>{this.props.bar}</FComp>
      }
    }
    // console.log(reactApps(<CComp bar="baz" />))
    assert.deepEqual(
      reactApps(<CComp bar="baz" />),
      'baz'
    )
  })
  it('Updates subtree on state changes', done => {
    class CComp extends React.Component {
      constructor (...args) {
        super(...args)
        this.state = {}
      }
      componentDidMount () {
        this.setState({ foo: 'bar' })
      }
      render () {
        return <div>{this.state.foo}</div>
      }
    }
    reactApps(<CComp />, {
      onUpdate (oldState, newState) {
        assert.deepEqual(clean(oldState), {
          type: 'div',
          key: null,
          props: {}
        })
        assert.deepEqual(clean(newState), {
          type: 'div',
          key: null,
          props: {
            children: 'bar'
          }
        })
        done()
      }
    })
  })
})
