const express = require('express');
const parser = require('body-parser');
const router = require('./modules/routes.js');
const dbconnect = require('./modules/dbconnect');

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

app.use(parser.json());

app.use(parser.urlencoded({
    extended: false
}));

app.use(function logUrl(req, res, next) {
    console.log('requesting: ' + req.method + req.url);
    next();
});

app.post('/photos', uploader.single('file'), function (req, res) {
    console.log("made it here");
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
                res.json({
                    success: true,
                    file: '/imageuploads/' + req.file.filename
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

app.use('/', router);

app.route('/');

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/'));


app.listen(8080, function(){
    console.log("hey, i'm listening");
});
