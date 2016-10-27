

var express = require('express');
var app = express();
var multer = require('multer');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));

var fs = require('fs');
var diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + '/public/uploads');
    },
    filename: function (req, file, callback) {
        callback(null, Date.now() + '_' + Math.floor(Math.random() * 99999999) +  '_' + file.originalname);
    }
});

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: 2097152
    }
});

var db=require('./db');
app.use(express.static('public'));
app.use('/uploads', express.static('./uploads'));
app.get('/images', function(req, res) {
    db.getImages().then(function(result) {
        res.json({
            success:true,
            file: result.rows
        })
    });
});

app.post('/upload', uploader.single('file'), function(req, res) {
    if (req.file) {
        res.json({
            success: true,
            file: '/uploads/' + req.file.filename
        });
    } else {
        res.json({
            success: false
        });
    }
});

app.post('/InsertToDb', function(req, res) {
    var params = req.body;
    var url=params.url;
    var username = params.username;
    var title = params.title;
    var description = params.description;
    db.insertData(url, username, title, description).then(function(result) {
        console.log(result);
    })
});


app.listen(8080);
