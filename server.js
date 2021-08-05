const http = require('http')
const express = require('express')
const mongoose = require('mongoose')
const yup = require('yup')
const { Schema } = mongoose

const app = express()
const PORT = process.env.PORT || 3000
const emailValidationSchema = yup.string().email().required()

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    validate: {
      validator: v => /[A-ZА-Яa-zа-я]{2,32}/.test(v)
    }
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: v => emailValidationSchema.isValid(v)
    }
  },
  isMale: {
    type: Boolean,
    required: true
  },
  birthday: {
    type: Date,
    required: true
  }
})

const User = mongoose.model('users', userSchema)

mongoose.connect('mongodb://localhost:27017/fm_mongo_server', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.use(express.json())
app.post('/', async (req, res, next) => {
  try {
    const { body } = req
    const newUser = await User.create(body)
    res.send(newUser)
  } catch (error) {
    next(error)
  }
})
app.get('/', async (req, res, next) => {
  const users = await User.find()
  res.send(users)
})
app.patch('/:userId', async (req, res, next) => {
  try {
    const {
      body,
      params: { userId }
    } = req
    const updatedUser = await User.findOneAndUpdate({ _id: userId }, body, {
      new: true
    })
    res.send(updatedUser)
  } catch (error) {
    next(error)
  }
})
app.delete('/:userId', async (req, res, next) => {
  try {
    const {
      body,
      params: { userId }
    } = req
    const deletedUser = await User.findOneAndRemove({ _id: userId })
    if (deletedUser) {
      return res.send(deletedUser)
    }
    res.sendStatus(404)
  } catch (error) {
    next(error)
  }
})

const server = http.createServer(app)
server.listen(PORT, () => console.log('Started'))
