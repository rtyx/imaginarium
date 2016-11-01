const express = require('express'),
    app = express(),
    hb = require('express-handlebars'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    Store = require('connect-redis')(session),
    multer = require('multer'),
    https = require('https'),
    fs = require('fs'),
    basicAuth = require('basic-auth'),
    db = require('./public/js/dbconnect.js'),
    chalk = require('chalk'),
    path = require('path'),
    util = require('util'),
    note = chalk.green,
    prop = chalk.cyan,
    err = chalk.bold.red;

app.engine('handlebars', hb({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

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

var  auth = function(req,res,next){
    var credentials = basicAuth(req);
    if (!credentials || credentials.name != 'Elder' || credentials.pass != 'scrolls') {
        res.setHeader('WWW-Authenticate', 'Basic realm=skyrim');
        res.sendStatus(401);
    } else {
        next();
    }
};
app.use('/admin', auth);

var staticURL = path.join(__dirname, 'public');
app.use(express.static(staticURL));
var staticURL2 = path.join(__dirname, 'uploads');
app.use(express.static(staticURL2));

app.get('/grid', function(req,res){
    var call = 'SELECT URL, Title, ID FROM images;';
    db.pgConnect(call).then(function(data){
        res.json(data);
    });
});

app.get('/image/*', function(req,res){
    console.log("one step farther");
    var id = path.basename(req.url);
    var call = 'SELECT * FROM images WHERE id=$1;';
    db.pgConnect(call, [id]).then(function(data){
        var callcomments = 'SELECT * FROM comments WHERE ImageID=$1 ORDER BY created DESC;';
        db.pgConnect(callcomments, [id]).then(function(comments){
            data.rows[0].comments = comments.rows;
            console.log(data.rows[0]);
            res.json(data.rows[0]);
        });
    });
});

app.post('/comments', function(req,res){
    console.log(req.body);
    var call = 'INSERT INTO comments (ImageID, Username, Comment) VALUES ($1,$2,$3);';
    var params = [req.body.id, req.body.username, req.body.text];
    db.pgConnect(call, params).then(function(){
        console.log("success");
        res.json({success:true});
    });
});

app.post('/upload', uploader.single('file'), function(req,res){
    if (req.file) {
        res.send(req.file.filename);
    } else {
        var url = req.body.url;
        var filepath = './uploads/'+ Date.now() + '_' + Math.floor(Math.random() * 99999999) + '_' + req.body.title + '.png';
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
            res.send(path.basename(filepath));
        }).catch(function(err){
            res.status(500).send(err);
        });
    }
});
app.post('/insert', function(req,res){
    var call = 'INSERT INTO images (Username, URL, Title, Description) VALUES ($1,$2,$3,$4) RETURNING ID;';
    var params = [req.body.username, req.body.path, req.body.title, req.body.description];
    db.pgConnect(call, params).then(function(data){
        res.json({
            success: true,
            "id": data.rows[0].id
        });
    });
});

app.listen(8080, console.log(note('Listening on port 8080')));
