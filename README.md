# react-applications

Write applications with only React and this library! Simply use this to create a configuration document/object or watch and react to the components changing over time.

## Usage (API)

You can use the synchronous API by just calling react-applications with some JSX elements.

```js
const React = require('react')
const reactApps = require('react-applications')

function MyComp(props) { return props.children }
const structure = reactApps(<MyComp><div foo="bar" /></MyComp>)
console.log(structure)
/*
MyComp {
  state: {},
  children:
  [ { type: 'div', key: null, props: [{ foo: 'bar' }], children: [] } ],
  props: {},
  type: [Function: MyComp] }
*/
```

### Dynamic mode

You can also watch for changes in the components. To do this provide an onChange function. You can also use componentDidUpdate in your components as long as you pass onChange or set the `dynamic: true` option.

```js
const ClassComponent extends React.Component {
  componentDidUpdate(prevProps, prevState, snapshot) {
    console.log('Component updated! Yay!')
  }
  componentDidMount() {
    this.setState({ foo: 'bar' })
  }
}
const structure = reactApps(<ClassComponent />, {
  onChange: (oldState, newState) => {
    const diff = require('json-diff')(oldState, newState)
    console.log(oldState, newState, diff)  // previous component, current component, and diff between
  }
})
structure.state // {}
setImmediate(() => {
  structure.state // { foo: 'bar' }
})
```

