// npm install -y
// npm i express nodemon ejs express-session body-parser uuid

const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const {v4:uuidv4} = require("uuid");
// no need to install it, already included in node
const path = require("path");
const session = require("express-session")
app.set('view engine', 'ejs');
// static is virtual path
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, 'public/assets')))

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true}))

app.use(session({
    // secret: 'secret', 
    // I can use the hash value here with uuid
    secret: uuidv4(),

    resave: false,
    saveUninitialized: true }))
// home route

app.get("/", (req, res)=>{
    res.render("base", { title : "Home"})
})

app.listen(3000)