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

app.get('/group', (req, res) => {
  res.render('pages/group')
})

app.get('/groups', (req, res) => {
  res.render('pages/groups')
})

app.get('/new-group', (req, res) => {
  res.render('pages/new-group')
})

app.get('/new-filter', (req, res) => {
  res.render('pages/new-filter')
})

app.get('/new-task', (req, res) => {
  res.render('pages/new-task')
})

app.get('/statistics', (req, res) => {
  res.render('pages/statistics')
})

app.get('/search', (req, res) => {
  res.render('pages/search')
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
