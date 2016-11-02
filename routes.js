const express = require('express');
const router = express.Router();
const multer = require('multer');
const aux = require('./aux.js');

var diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + '/public/images');
    },
    filename: function(req, file, callback) {
        callback(null, Date.now() + '_' + Math.floor(Math.random() * 99999999) + '_' + file.originalname);
    }
});

var maxSize = 2097152;

var uploader = multer({
    storage: diskStorage,
    limits: {
        filesize: maxSize
    }
});

//HOME

router.get('/index/:count', function (req,res) {
    var count = req.url.split('/').pop();
    aux.getImages(count)
    .then(function(response){
        res.json(response.rows);
    })
    .catch(function(error){
        console.log(error(error));
        res.json({
            success: false,
            reason: error
        });
    });
});

router.get('/explore/:tag', function(req,res) {
    var tag = req.url.split('/').pop();
    aux.getImagesByTag(tag)
    .then(function(response){
        res.json(response.rows);
    })
    .catch(function(error){
        console.log(error(error));
        res.json({
            success: false,
            reason: error
        });
    });
});

//UPLOAD

router.post('/upload', uploader.single('file'), function(req, res){
    if (req.file) {
        res.json({
            success: true,
            file: '/images/' + req.file.filename
        });
    } else {
        res.json({
            success: false
        });
    }
});

router.get('/images/:id', function(req, res){
    var id = req.url.split('/').pop();
    aux.getImage(id)
    .then(function(response){
        res.json(response.rows[0]);
    })
    .catch(function(error){
        console.log(error(error));
        res.json({
            success: false,
            reason: error
        });
    });
});

router.get('/comments/:imageID', function(req, res){
    var id = req.url.split('/').pop();
    aux.getComments(id)
    .then(function(response){
        res.json(response.rows);
    })
    .catch(function(error){
        console.log(error(error));
        res.json({
            success: false,
            reason: error
        });
    });
});

router.put('/comments/:imageID', function(req, res){
    aux.postComment(req.body.id, req.body.author, req.body.comment)
    .then(function() {
        res.json({
            success: true,
        });
    })
    .catch(function(error){
        console.log(error(error));
        res.json({
            success: false,
            reason: error
        });
    });
});


router.post('/save', function(req, res){
    aux.saveImage(req.body)
    .then(function(id){
        res.json({
            succes: true,
            id: id.rows[0].id
        });
    })
    .catch(function(error){
        console.log(error(error));
        res.json({
            success: false,
            reason: error
        });
    });
});

router.get('/cities', function(req, res) {
    res.json(
        [
            {
                name: "Berlin",
                country: "Germany"
            },
            {
                name: "Barcelona",
                country: "Spain"
            }
        ]
    );
});

// admin get images
// admin update description
// admin delete image

module.exports = router;
