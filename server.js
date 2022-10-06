// npm install -y
// npm i express nodemon ejs express-session body-parser uuid

const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const router = require('./router');
const {v4:uuidv4} = require("uuid");
var cookieParser = require('cookie-parser');
// no need to install it, already included in node
const path = require("path");
const session = require("express-session")
app.set('view engine', 'ejs');
// static is virtual path
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')))

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
app.get('/', function(req, res){
    if (req.cookies.remember) {
      res.send('Remembered :). Click to <a href="/forget">forget</a>!.');
    } else {
      res.send('<form method="post"><p>Check to <label>'
        + '<input type="checkbox" name="remember"/> remember me</label> '
        + '<input type="submit" value="Submit"/>.</p></form>');
    }
  });
  
  app.get('/forget', function(req, res){
    res.clearCookie('remember');
    res.redirect('back');
  });
  
  app.post('/', function(req, res){
    var minute = 60000;
    if (req.body.remember) res.cookie('remember', 1, { maxAge: minute });
    res.redirect('back');
  });



app.listen(3000)