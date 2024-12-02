var fs = require("fs")
var express = require('express')
var exphbs = require('express-handlebars')

var peopleData = require('./peopleData.json')

var app = express()
var port = process.env.PORT || 8000

app.engine('handlebars', exphbs.engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')

app.use(express.json())
app.use(express.static('static'))

app.get('/', function (req, res, next) {
  res.status(200).render('homePage')
})

app.get('/people', function (req, res, next) {
  res.status(200).render('peoplePage', {
    people: peopleData
  })
})

app.get('/people/:person', function (req, res, next) {
  var person = req.params.person.toLowerCase()
  if (peopleData[person]) {
    res.status(200).render('photoPage', peopleData[person])
  } else {
    next()
  }
})

app.post('/people/:person/addPhoto', function (req, res, next) {
  console.log("  -- req.body:", req.body)
  if (req.body && req.body.url && req.body.caption) {
    var person = req.params.person.toLowerCase()
    var personData = peopleData[person]
    if (personData) {
      personData.photos.push({
        url: req.body.url,
        caption: req.body.caption
      })
      console.log("  -- personData:", personData)
      fs.writeFile(
        __dirname + "/peopleData.json",
        JSON.stringify(peopleData, null, 2),
        function (err, result) {
          if (!err) {
            res.status(200).send()
          } else {
            res.status(500).send("Server error.  Try again soon.")
          }
        }
      )
    } else {
      next()
    }
  } else {
    res.status(400).send("Request body must contain url and caption.")
  }
})

app.get('*', function (req, res, next) {
  res.status(404).render('404', {
    page: req.url
  })
})

app.listen(port, function () {
  console.log("== Server listening on port", port)
})
