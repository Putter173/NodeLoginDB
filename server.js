// Dependencies
const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const session = require('express-session')
const mysql = require('mysql');
const con = mysql.createPool({
  host: 'us-cdbr-east-02.cleardb.com', 
  user:'be9ca5edca85a9', 
  password: 'ea9b1cc5',
  database: 'heroku_78afe11673ee41e'
});

// Envionment Settings
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  secure: true
}))

// Variables
var mail = "E-Mail"
var word = "Password"

// Connect to database function(s)
function checkInput(email, password, request, response) {
  con.getConnection((err, connection) => {
    if(err) throw err;
    connection.query("SELECT * FROM users WHERE email = '" + email + "'", (err, result, fields) => {
    connection.release(); // return the connection to pool
    if (err) throw err;
    if (JSON.stringify(result).includes(email) == false) {
      var errorMsg = "Incorrect Email"
      return response.redirect('/login?valid=' + errorMsg)
    } else if (JSON.stringify(result).includes(password)) {
      request.session.isLoggedIn = true
      return response.redirect('/')
    } else { 
      var errorMsg = "Incorrect Password"
      return response.redirect('/login?valid=' + errorMsg)
      }
    });
  });

}
function insert(email, password, request, response) {
  con.getConnection((err, connection) => {
    if (err) throw err;
    connection.query("SELECT * FROM users WHERE email = '" + email + "'", (err, result, fields) => {
      connection.release(); // return the connection to pool
      if (err) throw err;
      if (JSON.stringify(result).includes(email) == true) {
        var errorMsg = "Email Already Exists"
        return response.redirect('/register?valid=' + errorMsg)
      } else {
        add2DB(email, password, response)
        return response.redirect('/login')
      }
    });
  })
}
function add2DB(email, password) {
  con.getConnection((err, connection) => {
    if (err) throw err;
    connection.query("INSERT INTO users (email, password) VALUES ('" + email + "', '" + password + "')",
      function (err, result, fields) {
        if (err) throw err;
        return 
      })
  }
  )
}

// For Development Purposes Only
function checkDB(email) {
  con.getConnection((err, connection) => {
        if(err) throw err;
        connection.query('SELECT * from users', (err, result, fields) => {
            connection.release(); // return the connection to pool
            if(err) throw err;
        });
    });
}
  
// Handling HTTP "get" Requests
app.get('/', (req, res) => {
  if (req.session.isLoggedIn == undefined || req.session.isLoggedIn == false) {
    req.session.errorMsg = ""
    res.redirect('/login')
  } else {
    res.render("index.ejs")
  }
})
app.get('/register', (req, res) => {
  if (req.session.isLoggedIn == true) {
    res.redirect('/')
  } else {
    var errorMsg = req.query.valid;
    res.render("register.ejs", {errorMsg})
  }
})
app.get('/login', (req, res) => {
  if (req.session.isLoggedIn == true) {
    res.redirect('/')
  } else {
    var errorMsg = req.query.valid;
    res.render("login.ejs", {errorMsg})
  }
})
// For Development Purposes Only
app.get('/db', (req, res) => {
  checkDB()
})
app.get('/logged', (req, res) => {
  console.log(req.session.isLoggedIn)
})
app.get('/error', (req, res) => {
  console.log(req.session.errorMsg)
})

// Handling HTTP "post" Requests
app.post('/register', (req, res) => {
  mail = req.body.email
  word = req.body.password
  insert(mail, word, req, res)
})
app.post('/login', (req, res) => {
  mail = req.body.email
  word = req.body.password
  checkInput(mail, word, req, res)
})
app.post('/logout', (req, res) => {
  req.session.isLoggedIn = false
  res.redirect('/login')
})

// For Development Purposes Only
app.post('/', (req, res) => {
  res.render("index.ejs")
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})