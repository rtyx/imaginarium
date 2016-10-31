var pg = require('pg');

var dbUrl = process.env.DATABASE_URL ||'postgres://website:spicedacademy@localhost:5432/imageboard';

dbUrl = require('url').parse(dbUrl);

var dbUser = dbUrl.auth.split(':');

var dbConfig = {
    user: dbUser[0],
    database: dbUrl.pathname.slice(1),
    password: dbUser[1],
    host: dbUrl.hostname,
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
};
var pool= new pg.Pool(dbConfig);
pool.on('error',function(err){
    console.log(err);
})

module.exports.query= query;
function query(query,parameters,callback){
    parameters = parameters || [];
    pool.connect(function(err,client,done){
        if(err){
            callback(err);
            return;
        }
        client.query(query,parameters,function(err,results){
            if(err){
                console.log(err);
                callback(err);
            }else{
                callback(null,results.rows);
            }
            done();
        });
    });
};
