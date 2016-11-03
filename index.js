
var express = require('express');
var app = express();
var basicAuth = require('basic-auth');
var url = require("url");
const path = require('path');


var auth = function(req, res, next) {
    var creds = basicAuth(req);
    if (!creds || creds.name != 'admin' || creds.pass != 'password') {
        res.setHeader('WWW-Authenticate', 'Basic realm=www');
        res.sendStatus(401);
    } else {
        next();
    }
};

app.use('/admin', auth);


var multer = require('multer');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(bodyParser.json());

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
app.use(bodyParser.json());

app.get('/images', function(req, res) {
    db.getImages().then(function(result) {
        res.json({
            success:true,
            file: result.rows
        });
    });
});

app.get('/images/:tag', function(req,res){
    var tag=req.params.tag;
    db.getTaggedImages(tag).then(function(result) {
        res.json({
            success:true,
            file:result.rows
        });
    });
});


app.get('/image/:id', function(req,res) {
    var id = req.params.id;
    var imageDetails = db.getImage(id);
    var imageComments = db.imageComments(id);
    var imageTags = db.imageTags(id);
    return Promise.all([imageDetails,imageComments,imageTags])
    .then(function(results) {
        var result = {};
        result.image = results[0].rows;
        result.comments = results[1].rows;
        result.tags = results[2].rows;
        res.json({
            success:true,
            file:result
        });

    }).catch(function(err) {
        if(err) {
            console.log(err);
        }
    });
});



app.post('/insert-tags', function(req,res) {
    var tags = req.body.tags;
    var image_id = req.body.image_id;
    db.insertTags(tags,image_id)
    .then(function(result) {
        res.json({
            success:true,
            file:result
        });
    }).catch(function(err) {
        console.log(err);
    });
});


app.post('/insert-comment', function(req,res) {
    var comment = req.body.comment;
    var image_id = req.body.image_id;
    var username_comment = req.body.username_comment;
    db.insertComment(comment,image_id,username_comment)
    .then(function(result) {
        res.json({
            success:true,
            file:result
        });
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
    db.insertData(url, username, title, description).then(function() {
        res.json({
            success:true
        });
    });
});

app.post('/admin/get-pic', function(req, res) {
    var id = req.body.id;
    var imageDetails = db.getImage(id);
    var imageComments = db.imageComments(id);

    return Promise.all([imageDetails,imageComments])
    .then(function(results) {
        var result = {};
        result.image = results[0].rows;
        result.comments = results[1].rows;
        res.json({
            success:true,
            file:result
        });

    }).catch(function(err) {
        if(err) {
            console.log(err);
        }
    });
});

app.delete('/admin/deleteComment/:id', function(req,res) {
    var commentId = path.basename(req.url);
    console.log(commentId);
    db.deleteComment(commentId).then(function(result) {
        res.json({
            success:true,
            file:result
        });
    });
});


app.delete('/admin/deleteImage/:id', function(req, res) {
    var image = path.basename(req.url);
    var deleteImage = db.deleteImage(image);
    var deleteComments = db.deleteComments(image);
    return Promise.all([deleteImage,deleteComments])
    .then(function(results) {
        res.json({
            success:true,
            file:results
        });

    }).catch(function(err) {
        if(err) {
            console.log(err);
        }
    });
});

app.post('/admin/updateDesc', function(req, res) {
    var id = req.body.id;
    var desc = req.body.desc;
    db.updateDesc(desc,id).then(function(result) {
        res.json({
            success:true,
            file:result
        });

    }).catch(function(err) {
        if(err) {
            console.log(err);
        }
    });
});

app.post('/admin/updateTitle', function (req, res){
    var id = req.body.id;
    var title = req.body.title;
    db.updateTitle(title,id).then(function(result) {
        res.json({
            success:true,
            file:result
        });

    }).catch(function(err) {
        if(err) {
            console.log(err);
        }
    });
});

app.listen(8080);
