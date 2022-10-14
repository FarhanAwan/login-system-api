// npm install -y
// npm i express nodemon ejs express-session body-parser uuid

const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const router = require('./router');
var vhost = require('vhost');
// const {v4:uuidv4} = require("uuid");
var cookieParser = require('cookie-parser');
var multiparty = require('multiparty');
var format = require('util').format;
// no need to install it, already included in node
const path = require("path");
const session = require("express-session")
app.set('view engine', 'ejs');

// path to where the files are stored on disk
// var FILES_DIR = path.join(__dirname, 'files')

// app.get('/', function(req, res){
//   res.send('<ul>' +
//         '<li>Download <a href="/files/Hello.txt">Hello.txt</a>.</li>' +
//           '</ul>')
// });

// /files/* is accessed via req.params[0]
// but here we name it :file
app.get('/files/:file(*)', function(req, res, next){
  res.download(req.params.file, { root: FILES_DIR }, function (err) {
    if (!err) return; // file sent
    if (err.status !== 404) return next(err); // non-404 error
    // file for download not found
    res.statusCode = 404;
    res.send('Cant find that file, sorry!');
  });
});

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


// Ad-hoc example resource method

// app.resource = function(path, obj) {
//   this.get(path, obj.index);
//   this.get(path + '/:a..:b.:format?', function(req, res){
//     var a = parseInt(req.params.a, 10);
//     var b = parseInt(req.params.b, 10);
//     var format = req.params.format;
//     obj.range(req, res, a, b, format);
//   });
//   this.get(path + '/:id', obj.show);
//   this.delete(path + '/:id', function(req, res){
//     var id = parseInt(req.params.id, 10);
//     obj.destroy(req, res, id);
//   });
// };

// // Fake records

// var users = [
//   { name: 'tj' }
//   , { name: 'ciaran' }
//   , { name: 'aaron' }
//   , { name: 'guillermo' }
//   , { name: 'simon' }
//   , { name: 'tobi' }
// ];

// Fake controller.

var User = {
  index: function(req, res){
    res.send(users);
  },
  show: function(req, res){
    res.send(users[req.params.id] || { error: 'Cannot find user' });
  },
  destroy: function(req, res, id){
    var destroyed = id in users;
    delete users[id];
    res.send(destroyed ? 'destroyed' : 'Cannot find user');
  },
  range: function(req, res, a, b, format){
    var range = users.slice(a, b + 1);
    switch (format) {
      case 'json':
        res.send(range);
        break;
      case 'html':
      default:
        var html = '<ul>' + range.map(function(user){
          return '<li>' + user.name + '</li>';
        }).join('\n') + '</ul>';
        res.send(html);
        break;
    }
  }
};

// curl http://localhost:3000/users     -- responds with all users
// curl http://localhost:3000/users/1   -- responds with user 1
// curl http://localhost:3000/users/4   -- responds with error
// curl http://localhost:3000/users/1..3 -- responds with several users
// curl -X DELETE http://localhost:3000/users/1  -- deletes the user

app.resource('/users', User);

app.get('/', function(req, res){
  res.send([
    '<h1>Examples:</h1> <ul>'
    , '<li>GET /users</li>'
    , '<li>GET /users/1</li>'
    , '<li>GET /users/3</li>'
    , '<li>GET /users/1..3</li>'
    , '<li>GET /users/1..3.json</li>'
    , '<li>DELETE /users/4</li>'
    , '</ul>'
  ].join('\n'));
});

// Accepting multipart-encoded forms
// app.get('/', function(req, res){
//   res.send('<form method="post" enctype="multipart/form-data">'
//     + '<p>Title: <input type="text" name="title" /></p>'
//     + '<p>Image: <input type="file" name="image" /></p>'
//     + '<p><input type="submit" value="Upload" /></p>'
//     + '</form>');
// });

// app.post('/', function(req, res, next){
//   // create a form to begin parsing
//   var form = new multiparty.Form();
//   var image;
//   var title;

//   form.on('error', next);
//   form.on('close', function(){
//     res.send(format('\nuploaded %s (%d Kb) as %s'
//       , image.filename
//       , image.size / 1024 | 0
//       , title));
//   });


//  // listen on field event for title
//   form.on('field', function(name, val){
//     if (name !== 'title') return;
//     title = val;
//   });

//   // listen on part event for image file
//   form.on('part', function(part){
//     if (!part.filename) return;
//     if (part.name !== 'image') return part.resume();
//     image = {};
//     image.filename = part.filename;
//     image.size = 0;
//     part.on('data', function(buf){
//       image.size += buf.length;
//     });
//   });


//   // parse the form
//   form.parse(req);
// });

var online = require('online');


// online

online = online(db);

// activity tracking, in this case using
// the UA string, you would use req.user.id etc

app.use(function(req, res, next){
  // fire-and-forget
  online.add(req.headers['user-agent']);
  next();
});

/**
 * List helper.
 */

function list(ids) {
  return '<ul>' + ids.map(function(id){
    return '<li>' + id + '</li>';
  }).join('') + '</ul>';
}

/**
 * GET users online.
 */

app.get('/', function(req, res, next){
  online.last(5, function(err, ids){
    if (err) return next(err);
    res.send('<p>Users online: ' + ids.length + '</p>' + list(ids));
  });
});


app.listen(3000)