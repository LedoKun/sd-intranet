const mongoose = require('mongoose')
const Schema = mongoose.Schema

// https://devahoy.com/blog/2019/08/build-api-with-express-and-mongoose/
const punchTimeSchema = new Schema({
  punchTime: { type: Date },
  image: { type: String },
  positions: { type: Array, default: [] },
  updated: { type: Date, default: Date.now }
})

const punchTimeModel =
  mongoose.models.punchTime || mongoose.model('punchTime', punchTimeSchema)

module.exports = punchTimeModel
