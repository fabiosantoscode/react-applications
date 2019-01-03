
const assert = require('assert')
const events = require('events')

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
  constructor ({ comp, props, onUpdate }) {
    assert(onUpdate)
    Object.assign(this, { comp, props, onUpdate })
  }
  enqueueForceUpdate () {
    throw new Error('enqueueForceUpdate is disabled')
  }
  enqueueSetState (comp, partialState, cb = () => null) {
    changes.once('change', () => {
      Object.assign(comp.state, partialState)
      cb()
      this.onUpdate()
    })
    enqueueChange()
  }
}
