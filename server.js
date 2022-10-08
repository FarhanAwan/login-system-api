// npm install -y
// npm i express nodemon ejs express-session body-parser uuid

const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const router = require('./router');
var vhost = require('vhost');
const {v4:uuidv4} = require("uuid");
var cookieParser = require('cookie-parser');
// no need to install it, already included in node
const path = require("path");
const session = require("express-session")
app.set('view engine', 'ejs');

var redis = require('redis');

var db = redis.createClient();

// npm install redis


// populate search

db.sadd('ferret', 'tobi');
db.sadd('ferret', 'loki');
db.sadd('ferret', 'jane');
db.sadd('cat', 'manny');
db.sadd('cat', 'luna');

/**
 * GET search for :query.
 */

app.get('/search/:query?', function(req, res){
  var query = req.params.query;
  db.smembers(query, function(err, vals){
    if (err) return res.send(500);
    res.send(vals);
  });
});




// Main server app

// const main = express();

// if (!module.parent) main.use(logger('dev'));

// main.get('/', function(req, res){
//   res.send('Hello from main app!');
// });

// main.get('/:sub', function(req, res){
//   res.send('requested ' + req.params.sub);
// });

// // Redirect app

// var redirect = express();

// redirect.use(function(req, res){
//   if (!module.parent) console.log(req.vhost);
//   res.redirect('http://example.com:3000/' + req.vhost[0]);
// });

// // Vhost app

// var app = module.exports = express();

// app.use(vhost('*.example.com', redirect)); // Serves all subdomains via Redirect app
// app.use(vhost('example.com', main)); // Serves top level domain via Main server app



// static is virtual path
// app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')))

/**
 * GET client javascript. Here we use sendFile()
 * because serving __dirname with the static() middleware
 * would also mean serving our server "index.js" and the "search.jade"
 * template.
 */
app.use(express.static(path.join(__dirname, 'public')));
app.get('/client.js', function(req, res){
  res.sendFile(path.join(__dirname, 'client.js'));
});


app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}))

// parses request cookies, populating
// req.cookies and req.signedCookies
// when the secret is passed, used
// for signing the cookies.

app.use(cookieParser('my secret code is here'));
app.use(session({
    // secret: 'secret', 
    // I can use the hash value here with uuid
    secret: uuidv4(),

    resave: false,
    saveUninitialized: true }))

app.use('/route',router);

    // home route

// app.get("/", (req, res)=>{
//     res.render("base", { title : "Home"})
// })
// app.get('/', function(req, res){
//     if (req.cookies.remember) {
//       res.send('Remembered :). Click to <a href="/forget">forget</a>!.');
//     } else {
//       res.send('<form method="post"><p>Check to <label>'
//         + '<input type="checkbox" name="remember"/> remember me</label> '
//         + '<input type="submit" value="Submit"/>.</p></form>');
//     }
//   });
  
//   app.get('/forget', function(req, res){
//     res.clearCookie('remember');
//     res.redirect('back');
//   });
  
//   app.post('/', function(req, res){
//     var minute = 60000;
//     if (req.body.remember) res.cookie('remember', 1, { maxAge: minute });
//     res.redirect('back');
//   });



app.listen(3000)