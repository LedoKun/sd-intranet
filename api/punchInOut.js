import express from 'express'
const app = express()

app.post('/', (req, res) => {
  res.write('twsda')
  res.end()
})

export default {
  path: '/api/punchInOut',
  handler: app
}
