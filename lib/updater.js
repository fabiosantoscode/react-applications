
const assert = require('assert')
const events = require('events')
const cloneDeep = require('lodash/cloneDeep')

const changes = new events.EventEmitter({ maxListeners: 0 })

let imm = null
function enqueueChange () {
  if (imm) return
  imm = setImmediate(() => {
    imm = null
    changes.emit('change')
  })
}

module.exports = class Updater {
  constructor ({ onUpdate }) {
    Object.assign(this, { onUpdate })
  }
  enqueueForceUpdate () {
    changes.once('change', () => {
      if (this.onUpdate) this.onUpdate()
    })
    enqueueChange()
  }
  enqueueSetState (comp, partialState, cb = () => null) {
    changes.once('change', () => {
      const prevState = cloneDeep(comp.state)
      Object.assign(comp.state, partialState)
      cb()
      if (comp.componentDidUpdate) {
        comp.componentDidUpdate(comp.props, prevState)
      }
      if (this.onUpdate) this.onUpdate()
    })
    enqueueChange()
  }
}
