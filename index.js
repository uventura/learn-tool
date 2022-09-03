const express = require('express')
const app = express()
const port = process.env.PORT || 3000

// Connection
const connection = require('./config/database.js')
connection
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

// Config
app.set('view engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(express.json())
app.use(express.static('public'))

// Sessions
const session = require('express-session')
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 24 * 60 * 60 * 10000}
}))

// Middlewares
const userAuth = require('./middlewares/signin.js')

// External Routes
const UserRoutes = require('./routes/User.js')
const GroupRoutes = require('./routes/Group.js')

// Use Routes
app.use('/', UserRoutes)
app.use('/', GroupRoutes)

// Routes(get)
app.get('/', userAuth.signinAuthNotLogged,(req, res) => {
  res.render('pages/home')
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

// Routes(post)
app.get('/signup', (req, res) => {
  res.render('signup')
})