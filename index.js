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
const basicAuth = require('basic-auth');
const multer = require('multer');

const maxLen = 10000000;

var auth = function(req, res, next) {
    var creds = basicAuth(req);
    if (!creds || creds.name != 'admin' || creds.pass != 'password') {
        res.setHeader('WWW-Authenticate', 'Basic realm=www');
        res.sendStatus(401);
    } else {
        next();
    }
};


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

var avatarDiskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/avatars');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + Math.floor(Math.random() * 99999999) + '_' + file.originalname);
    }
});

var avatarUploader = multer({
    storage: avatarDiskStorage,
    limits: {
        filesize: 2097152
    }
});

var app = express();

app.use('/admin', auth);

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

function dbPhoto(req, fileVar, response) {
    return new Promise (function (resolve, reject){
        var valuesJson = JSON.parse(req.body.values);
        var photoQuery = 'INSERT INTO pictures (uploader, filename, title, description, tags) VALUES ($1, $2, $3, $4, $5) RETURNING id';
        var photoVariables = [valuesJson.uploader || null, fileVar, valuesJson.title || null, valuesJson.description || null, valuesJson.tags || null];
        dbconnect.query(photoQuery, photoVariables).then(function(id){
            var tags = valuesJson.tags.split(", ");
            var tagQuery = "INSERT INTO tags (tag_name, picture_id) VALUES ($1, $2)";
            var promiseArray = [];
            for (var i=0; i<tags.length;i++){
                promiseArray.push(dbconnect.query(tagQuery, [tags[i], id.id]));
            }
            Promise.all(promiseArray).then(function(){
                var cacheArray = [cache.del('photos'), cache.del('tags')];
                Promise.all(cacheArray).then(function(){
                    response.json({
                        success: true,
                        file: '/imageuploads/' + fileVar
                    });
                });
            })
            .catch(function(err){
                reject(err);
            });
        }).catch(function(err){
            reject(err);
        });
    });
}

app.post('/photos', uploader.single('file'), function (req, res) {
    if (req.file) {
        dbPhoto(req, req.file.filename, res).catch(function(err){
            console.log("invalid file");
            console.log(err);
            res.json({
                success: false
            });
        });

    } else {
        res.json({
            success: false
        });
    }
});

app.post('/comments', avatarUploader.single('file'), function(req, res){
    console.log(req.file);
    console.log(req.body);
    var query = 'INSERT INTO comments (picture_id, comment, commenter, avatar) VALUES ($1, $2, $3, $4)';
    var variables = [req.body.picture || null, req.body.comment || null, req.body.commenter || null, req.file.filename];
    dbconnect.query(query, variables).then(function(){
        cache.del('comments-' + req.body.picture);
        res.json({success: true});
    }).catch(function(err){
        console.log(err);
    });
});


app.post('/uploadurl', function (req, res) {
    var parsedUrl = url.parse(req.body.url);
    var uniqueFile = Date.now() + '_' + Math.floor(Math.random() * 99999999) + '_uploaded-from-url';
    var file = './imageuploads/' +  uniqueFile;
    var options = {
        hostname: parsedUrl.host,
        path: parsedUrl.path
    };
    if (parsedUrl.protocol == 'http:'){
        console.log("http");
        var request = http.request(options, callback);
        request.end();
    }
    else if (parsedUrl.protocol == 'https:'){
        var requestS = https.request(options, callback);
        requestS.end();
    }
    function callback(callbackResponse){
        console.log(callbackResponse.headers);
        if (callbackResponse.headers['content-type'].split('/')[0] == 'image' && callbackResponse.headers['content-length'] < maxLen) {
            callbackResponse.pipe(fs.createWriteStream(file));
            var size;
            callbackResponse.on('data', (data) => {
                size += data.length;
                if (size > maxLen){
                    console.log("invalid file, maximum file size permitted is " + maxLen);
                }
            });
            callbackResponse.on('end', () => {
                dbPhoto(req, uniqueFile, res).catch(function(err){
                    console.log("invalid file");
                    console.log(err);
                    res.json({
                        success: false
                    });
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
