'use strict'

const React = require('react')
const assert = require('assert')
const reactApps = require('..')

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
      reactApps(
        <div>
          <FComp foo="bar" />
          <CComp bar="baz" />
        </div>
      ),
      {
        type: 'div',
        key: null,
        props: {},
        state: {},
        children: ['bar', 'baz']
      }
    )
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
      render() {
        return <div>foo</div>
      }
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
  it.skip('Allows for rendering objects in props and children', () => {
    function FComp(props) { return <div foo={{bar: 'baz'}}>{props.children}</div>}
    assert.deepEqual(
      reactApps(<FComp>{{baz: 'qux'}}</FComp>),
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
  it('Allows for rendering objects instead of jsx', () => {
    assert.deepEqual(
      reactApps({ foo: 'bar' }),
      { foo: 'bar' }
    )
  })
  it('Allows for purely creating objects', () => {
    function FComp(props) { return props.children }
    assert.deepEqual(
      reactApps(<FComp>{{ foo: 'bar' }}</FComp>),
      {
        foo: 'bar'
      }
    )
  })
  it('components are transparent', () => {
    function FComp(props) { return props.children }
    class CComp extends React.Component {
      render() {
        assert(this.props.bar)
        return this.props.bar; return <FComp>{this.props.bar}</FComp>
      }
    }
    //console.log(reactApps(<CComp bar="baz" />))
    assert.deepEqual(
      reactApps(<CComp bar="baz" />),
      'baz'
    )
  })
})
