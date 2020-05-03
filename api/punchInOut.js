import express from 'express'
import isBase64 from 'is-base64'
import morgan from 'morgan'
import moment from 'moment'
import mongoose from 'mongoose'

const app = express()
app.use(express.json())
app.use(morgan('combined'))

const { body, validationResult } = require('express-validator')

const checkLat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/
const checkLng = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/

mongoose.connect('mongodb://localhost:27017/sd', {
  useNewUrlParser: true
})

app.post(
  '/',
  [
    body('positions').custom((values) => {
      if (values.length < 4) {
        throw new Error('Insufficient coordinate data')
      }

      const checkCoordinate = ({ lat, lng }) => {
        const validLat = checkLat.test(lat)
        const validLng = checkLng.test(lng)

        return validLat && validLng
      }
      const checkArray = (arrayToCheck) => {
        return arrayToCheck.every(checkCoordinate)
      }

      if (!checkArray(values)) {
        throw new Error('Invalid coordinate data')
      }

      return true
    }),
    body('image').custom((value) => {
      return isBase64(value, { allowMime: true })
    })
  ],
  async (req, res) => {
    // Finds the validation errors in this request
    // and wraps them in an object with handy functions
    const errors = validationResult(req)

    const payload = {
      ...req.body,
      punchTime: moment()
        .utc()
        .toDate()
    }

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    const PunchTimeModel = require('./models/punchTime')
    const punchTime = new PunchTimeModel(payload)
    await punchTime.save()

    return res.status(200).json({ msg: 'success', payload })
  }
)

export default {
  path: '/api/punchInOut',
  handler: app
}
