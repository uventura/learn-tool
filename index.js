const express = require('express')
const app = express()
const port = process.env.PORT || 3000

// Config
app.set('view engine', 'ejs')
app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }))
app.use(express.json())

app.get('/signin', (req, res) => {
  res.render('signin')
})

app.get('/signup', (req, res) => {
  res.render('signup')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
