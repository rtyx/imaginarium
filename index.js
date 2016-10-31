const express = require('express');
const parser = require('body-parser');
const router = require('./modules/routes.js');
const dbconnect = require('./modules/dbconnect');
const session = require('express-session');
const Store = require('connect-redis')(session);
const cache = require('./modules/redis.js');
const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const maxLen = 10000000;

const multer = require('multer');

var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/imageuploads');
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

var app = express();

app.use(session({
    store: new Store({
        ttl: 86400,
        host: 'localhost',
        port: 6379
    }),
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET || 'sugarplumfairy'
}));

app.use(parser.json());

app.use(parser.urlencoded({
    extended: false
}));

app.use(function logUrl(req, res, next) {
    console.log('requesting: ' + req.method + req.url);
    next();
});

app.post('/photos', uploader.single('file'), function (req, res) {
    if (req.file) {
        var values = JSON.parse(req.body.values);
        console.log(values);
        var photoQuery = 'INSERT INTO pictures (uploader, filename, title, description, tags) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        var photoVariables = [values.uploader || null, req.file.filename, values.title || null, values.description || null, values.tags || null];
        dbconnect.query(photoQuery, photoVariables).then(function(id){
            var tags = values.tags.split(", ");
            var tagQuery = "INSERT INTO tags (tag_name, picture_id) VALUES ($1, $2)";
            var promiseArray = [];
            for (var i=0; i<tags.length;i++){
                promiseArray.push(dbconnect.query(tagQuery, [tags[i], id.id]));
            }
            Promise.all(promiseArray).then(function(){
                var cacheArray = [cache.del('photos'), cache.del('tags')];
                Promise.all(cacheArray).then(function(){
                    res.json({
                        success: true,
                        file: '/imageuploads/' + req.file.filename
                    });
                });
            })
            .catch(function(err){
                console.log(err);
            });
        }).catch(function(err){
            console.log(err);
        });
    } else {
        res.json({
            success: false
        });
    }
});


app.post('/uploadurl', function (req, res) {
    var parsedUrl = url.parse(req.body.url);
    var pathArray = parsedUrl.path.split('/');
    var fileName = pathArray[pathArray.length - 1];
    var uniqueFile = Date.now() + '_' + Math.floor(Math.random() * 99999999) + '_' + fileName;
    var file = './imageuploads/' +  uniqueFile;
    var options = {
        hostname: parsedUrl.host,
        path: parsedUrl.path
    };
    console.log("options: ");
    console.log(options);

    if (parsedUrl.protocol == 'http:'){
        console.log("http");
        var request = http.request(options, callback);
        request.end();
    }
    else if (parsedUrl.protocol == 'https:'){
        var requestS = https.request(options, callback);
        requestS.end();
    }
    function callback(resp){
        console.log(resp.headers);
        if (resp.headers['content-type'].split('/')[0] == 'image' && resp.headers['content-length'] < maxLen) {
            resp.pipe(fs.createWriteStream(file));
            var size;
            resp.on('data', (data) => {
                size += data.length;
                if (size > maxLen){
                    console.log("invalid file, maximum file size permitted is " + maxLen);
                }
            });
            resp.on('end', () => {
                var values = JSON.parse(req.body.values);
                console.log(values);
                var photoQuery = 'INSERT INTO pictures (uploader, filename, title, description, tags) VALUES ($1, $2, $3, $4, $5) RETURNING id';
                var photoVariables = [values.uploader || null, uniqueFile, values.title || null, values.description || null, values.tags || null];
                dbconnect.query(photoQuery, photoVariables).then(function(id){
                    var tags = values.tags.split(", ");
                    var tagQuery = "INSERT INTO tags (tag_name, picture_id) VALUES ($1, $2)";
                    var promiseArray = [];
                    for (var i=0; i<tags.length;i++){
                        promiseArray.push(dbconnect.query(tagQuery, [tags[i], id.id]));
                    }
                    Promise.all(promiseArray).then(function(){
                        var cacheArray = [cache.del('photos'), cache.del('tags')];
                        Promise.all(cacheArray).then(function(){
                            res.json({
                                success: true,
                                file: '/imageuploads/' + uniqueFile
                            });
                        });
                    })
                    .catch(function(err){
                        console.log(err);
                    });
                }).catch(function(err){
                    console.log(err);
                });
            });
        }
        else {
            console.log("invalid file");
            console.log("length " + res.headers['content-length']);
        }
    }
});

app.use('/', router);

app.route('/');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/'));


app.listen(8080, function(){
    console.log("hey, i'm listening");
});
