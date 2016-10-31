const express = require('express');
const app = express();
const hb = require('express-handlebars');
app.engine('handlebars', hb({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const Store = require('connect-redis')(session);
const multer = require('multer');
const https = require('https');
const fs = require('fs');
const db = require('./public/js/dbconnect.js');
const chalk = require('chalk');
const path = require('path');
const note = chalk.green;
const prop = chalk.cyan;
const err = chalk.bold.red;

app.use(bodyParser.urlencoded({
    extended:false
}));
var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + Math.floor(Math.random() * 99999999) + '_' + file.originalname);
    }
});
var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});
app.use(cookieParser());
app.use(session({
    store: new Store({
        ttl: 86400,
        host: 'localhost',
        port: 6379
    }),
    resave: false,
    saveUninitialized: true,
    secret: 'This is a secret!'
}));

var staticURL = path.join(__dirname, 'public');
app.use(express.static(staticURL));
var staticURL2 = path.join(__dirname, 'uploads');
app.use(express.static(staticURL2));

app.get('/', function(req,res){
    console.log("got");
});
app.post('/upload', uploader.single('file'), function(req,res){
    if (req.file) {
        var filepath = './uploads/' + req.file.filename;
        res.send(filepath);
    } else {
        var url = req.body.url;
        filepath = './uploads/'+ Date.now() + '_' + Math.floor(Math.random() * 99999999) + '_' + req.body.title + '.png';
        var file = fs.createWriteStream(filepath);
        function getImage(url){
            return new Promise(function(resolve,reject){
                file.on('open', function(){
                    https.get(url, function(headRes){
                        var maxSize = 2097152;
                        var size = headRes.headers['content-length'];
                        if (size > maxSize) {
                            fs.unlink(filepath);
                            reject('Resource size exceeds limit of 2MB. Acutal size is (' + size + ')');
                        } else {
                            console.log("well...");
                            headRes.pipe(file);
                            file.on('finish', function(){
                                file.close();
                                resolve(filepath);
                            }).on('error', function(err){
                                reject(err);
                            });
                        }
                    }).on('error', function(err){
                        reject(err);
                    });
                });
            });
        }
        getImage(url).then(function(filepath){
            res.send(filepath);
        }).catch(function(err){
            res.status(500).send(err);
        });
    }
});

app.post('/insert', function(req,res){
    var call = 'INSERT INTO images (Username, URL, Title, Description) VALUES ($1,$2,$3,$4) RETURNING URL;';
    var params = [req.body.username, req.body.path, req.body.title, req.body.description];
    db.pgConnect(call, params).then(function(url){
        res.json({
            success: true
        });
    });
});

app.listen(8080, console.log(note('Listening on port 8080')));
