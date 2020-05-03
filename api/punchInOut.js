import express from 'express'
const isBase64 = require('is-base64')

const app = express()
app.use(express.json())

const { body, validationResult } = require('express-validator')

const checkLat = /^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/
const checkLng = /^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/

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
  (req, res) => {
    // Finds the validation errors in this request
    // and wraps them in an object with handy functions
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    } else {
      return res.status(200).json(req.body.positions[0].lat)
    }
  }
)

export default {
  path: '/api/punchInOut',
  handler: app
}
