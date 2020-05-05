import express from 'express'
import isBase64 from 'is-base64'
import morgan from 'morgan'
import moment from 'moment'
import mongoose from 'mongoose'

const app = express()
app.use(express.json())
app.use(morgan('combined'))

const { body, query, validationResult } = require('express-validator')
const PunchTimeModel = require('./models/punchTime')

const checkLat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/
const checkLng = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/

mongoose.connect('mongodb://localhost:27017/sd', {
  useNewUrlParser: true
})

app.get(
  '/',
  [query('startDate').toDate(), query('stopDate').toDate()],
  async (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    let payload

    if (req.query.startDate && req.query.stopDate) {
      payload = await PunchTimeModel.find({
        punchTime: {
          $gte: moment.utc(req.query.startDate).startOf('Day'),
          $lte: moment.utc(req.query.stopDate).endOf('Day')
        }
      })
    } else if (req.query.startDate && !req.query.stopDate) {
      payload = await PunchTimeModel.find({
        punchTime: {
          $gte: moment.utc(req.query.startDate).startOf('Day'),
          $lte: moment.utc(req.query.startDate).endOf('Day')
        }
      })
    } else {
      payload = await PunchTimeModel.find()
    }

    return res.status(200).json(payload)
  }
)

app.post(
  '/',
  [
    body('positions').custom((values) => {
      if (values.length < 9) {
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

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    const payload = {
      ...req.body,
      punchTime: moment()
        .utc()
        .toDate()
    }

    const punchTime = new PunchTimeModel(payload)
    await punchTime.save()

    return res.status(200).json({ msg: 'success', payload })
  }
)

export default {
  path: '/api/punchInOut',
  handler: app
}
