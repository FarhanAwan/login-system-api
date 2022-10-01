// npm install -y
// npm i express nodemon ejs express-session body-parser uuid

const express = require("express");
const app = express()

app.set('view engine', 'ejs');

// home route

app.get("/", (req, res)=>{
    res.render("base", { title : "Home"})
})

app.listen(3000)