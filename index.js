const express = require('express')
const app = express()
const port = process.env.PORT || 3000

// Config
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Routes
app.get('/', (req, res) => {
  res.render('pages/home')
})

app.get('/signin', (req, res) => {
  res.render('pages/signin')
})

app.get('/signup', (req, res) => {
  res.render('pages/signup')
})

app.get('/groups', (req, res) => {
  res.render('pages/groups')
})

app.get('/profile', (req, res) => {
  res.render('pages/profile')
})

app.get('/change-password', (req, res) => {
  res.render('pages/change-password')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
