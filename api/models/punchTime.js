const mongoose = require('mongoose')
const Schema = mongoose.Schema

const punchTimeSchema = new Schema({
  punchTime: { type: Date },
  image: { type: String },
  positions: { type: Array, default: [] },
  updated: { type: Date, default: Date.now }
})

const punchTimeModel = mongoose.model('punchTime', punchTimeSchema)

module.exports = punchTimeModel
