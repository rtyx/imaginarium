
var express = require('express');
var app = express();
var bodyParser = require('body-parser')
var multer = require('multer');
var fs = require('fs');
var db = require('./public/js/database.js');
var hb = require('express-handlebars');


app.use(express.static(__dirname +'/public'));
app.use(express.static(__dirname + '/uploads'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

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

app.post('/upload', uploader.single('file'), function(req, res) {
   if (req.file) {
      res.json({
         success: true,
         file:req.file.filename
      });
      console.log(req.file.filename)
   } else {
      res.json({
         success: false
      });
   };
});


//Save in the data base
app.post('/pictures',function(req,res){
   var upload = req.body
   var param = [upload.file,upload.name,upload.title,upload.description]
   console.log(upload.file);
   var query="INSERT INTO images(url,user_name,title,description) Values ($1,$2,$3,$4) RETURNING id"

   if(upload.name || upload.title || upload.description != ""){
      db.query(query,param,function(err,results){
         if(err){
            console.log(err)
         } else {
            console.log(upload);
            res.json({message:"hello angi"});
         }
      });
   } else {
      res.json({message:"no finish"})
   };
});


//Display query
app.get('/images',function(req,res){
   db.query('SELECT * FROM images',[],function(err,data){
      console.log(data);
      res.json({images:data});
   });
})

app.get('/image/:id',function(req,res){
   db.query('SELECT * FROM images WHERE id=$1',[req.params.id],function(err,data){
      res.json(data[0]);
      console.log(data);
   });
})



app.put('/comments/:id',function(req,res){
   var commentsForm = req.body;
   console.log(commentsForm);
   var param = [commentsForm.comment,commentsForm.name,req.params.id];
   var query="INSERT INTO comments(comment,user_name,img_id) Values ($1,$2,$3) RETURNING id"


   if(commentsForm.comment || commentsForm.name != ""){
      db.query(query,param,function(err,results){
         if(err){
            console.log(err)
         } else {
            res.json({message:"hello angi"});
         }
      });
   } else {
      res.json({message:"no finish"})
   };
});


app.get('/comments/:id',function(req,res){
   db.query('SELECT * FROM comments WHERE img_id=$1',[req.params.id],function(err,data){
      res.json(data);
      console.log(data);
   });
})

/*
var auth = function(req,res,next) {
var credentials = basicAuth(req);
if(!credentials || credentials.name != 'admin' || credentials.pass != 'password'){
res.setHeader('WWW-Authenticate', 'Basic realm=www');
res.sendStatus(401);
}else{
next();
}
};

app.use('/admin',auth);
*/

app.listen(8080,function(){
   console.log("listen on port");
});
