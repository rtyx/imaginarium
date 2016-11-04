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
    url = require('url'),
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

var staticURL = path.join(__dirname, 'public');
app.use(express.static(staticURL));
var staticURL2 = path.join(__dirname, 'uploads');
app.use(express.static(staticURL2));

app.use('/admin', auth);
app.post('/admin/edit', function(req){
    var description = req.query.description;
    var title = req.query.title;
    var id = req.query.id;
    var call = 'UPDATE images SET Title = $1, Description = $2 WHERE ID = $3;';
    db.pgConnect(call, [title,description,id]);
});
app.post('/admin/delete', function(req){
    var id = req.query.id;
    var call = 'DELETE FROM images WHERE ID=$1;';
    db.pgConnect(call,[id]);
});

app.get('/grid', function(req,res){
    var count = req.query.count;
    var offset = req.query.offset;
    var call = 'SELECT * FROM images ORDER BY Created DESC LIMIT $1 OFFSET $2;';
    db.pgConnect(call, [count,offset]).then(function(data){
        res.json({
            success: true,
            "data": data
        });
    });
});
app.get('/tag/*', function(req,res){
    var tag = path.basename(url.parse(req.url).pathname);
    var count = req.query.count;
    var offset = req.query.offset;
    var call = "SELECT * FROM images WHERE tags && ARRAY[$1] ORDER BY Created DESC LIMIT $2 OFFSET $3;";
    db.pgConnect(call, [tag,count,offset]).then(function(data){
        if (data.rows.length != 0) {
            data.rows[0].tagcalled = tag;
        }
        res.json({
            success: true,
            "data": data
        });
    });
});

app.get('/image/*', function(req,res){
    var parsed = url.parse(req.url);
    var id = path.basename(parsed.pathname);
    var count = req.query.count;
    var offset = req.query.offset;
    var call = 'SELECT * FROM images WHERE images.id=$1;';
    db.pgConnect(call, [id]).then(function(data){
        var callcomments = 'SELECT * FROM comments WHERE ImageID=$1 ORDER BY created DESC LIMIT $2 OFFSET $3;';
        db.pgConnect(callcomments, [id, count, offset]).then(function(comments){
            data.rows[0].comments = comments.rows;
            res.json(data.rows[0]);
        });
    });
});

app.post('/comments', function(req,res){
    var call = 'INSERT INTO comments (ImageID, Username, Comment) VALUES ($1,$2,$3);';
    var params = [req.body.id, req.body.username, req.body.text];
    db.pgConnect(call, params).then(function(){
        console.log("saved");
        res.json({success:true});
    });
});

app.post('/like/*', function(req,res){
    var id = path.basename(req.url);
    var call = 'UPDATE images SET likes = likes+1 WHERE id=$1';
    db.pgConnect(call, [id]).then(function(){
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
    var inputs = req.body;
    var tags = inputs.tags;
    if (tags != '') {
        if (tags.search(",") == -1) {
            tags = [tags];
        } else {
            tags = tags.split(",");
            tags = tags.map(function(elem){
                return elem.trim();
            });
        }
    } else {
        tags = [];
    }
    var call = 'INSERT INTO images (Username, URL, Title, Description, Tags) VALUES ($1,$2,$3,$4,$5) RETURNING ID;';
    var params = [inputs.username, inputs.path, inputs.title, inputs.description, tags];
    db.pgConnect(call, params).then(function(data){
        res.json({
            success: true,
            "id": data.rows[0].id
        });
    });
});

app.listen(8080, console.log(note('Listening on port 8080')));
