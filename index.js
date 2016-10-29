const express = require('express');
const multer = require('multer');
const parser = require('body-parser');
const dbconnect = require('./modules/dbconnect');

const pathToUploads = './imageuploads'


var app = express();

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

app.use(parser.json());

app.use(parser.urlencoded({
    extended: false
}));

app.use(function logUrl(req, res, next) {
    console.log('requesting: ' + req.method + req.url);
    next();
});


app.get('/photos', function(req, res) {
    dbconnect.query('SELECT * FROM pictures').then(function(results){
        console.log("res " + results);
        res.json({pictures: results});
    });
});

app.post('/photos', uploader.single('file'), function(req, res) {
    if (req.file) {
        var values = JSON.parse(req.body.values);
        console.log(values.uploader);
        var query = 'INSERT INTO pictures (uploader, filename, title, description) VALUES ($1, $2, $3, $4)';
        var variables = [values.uploader || null, req.file.filename, values.title || null, values.description || null];
        dbconnect.query(query, variables).catch(function(err){
            console.log(err);
        });
        res.json({
            success: true,
            file: '/imageuploads/' + req.file.filename
        });
    } else {
        res.json({
            success: false
        });
    }
});

app.get('/comments', function(req, res) {
    dbconnect.query('SELECT * FROM comments WHERE picture_id = $1', [req.query.picnum]).then(function(results){
        if (results){
            res.json({comments: results});
        }
        else {
            res.json({comments: 'none'});
        }
    }).catch(function(err){
        console.log(err);
    });

});

app.post('/comments', function (req, res) {
    var query = 'INSERT INTO comments (picture_id, comment, commenter) VALUES ($1, $2, $3)';
    console.log([req.body.picture, req.body.new.comment, req.body.new.commenter]);
    var variables = [req.body.picture, req.body.new.comment, req.body.new.commenter];
    dbconnect.query(query, variables).then(function(){
        res.json({success: true});
    }).catch(function(err){
        console.log(err);
    });
});

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/'));


app.listen(8080, function(){
    console.log("hey, i'm listening");
});
