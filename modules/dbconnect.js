const fs = require("fs");
const pg = require('pg');

var dbUrl;

if (process.env.DATABASE_URL == undefined) {
    var password = JSON.parse(fs.readFileSync('./passwords.json'));
    dbUrl = process.env.DATABASE_URL || 'postgres://' + password.username + ':' + password.password + '@localhost:5432/imageboard';
} else {
    dbUrl = process.env.DATABASE_URL;
}

dbUrl = require('url').parse(dbUrl);

console.log(dbUrl);

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

var pool = new pg.Pool(dbConfig);

pool.on('error', function(err) {
    console.log(err);
});


function query(queryString, params){
    return new Promise(function (resolve, reject){
        pool.connect(function(err, client, done){
            if(err){
                reject(err);
                return;
            }
            client.query(queryString, params || [], function(err, data){
                console.log("sql request");
                if (err){
                    reject(err);
                } else if (data.rows.length > 1){
                    resolve(data.rows);
                } else {
                    resolve (data.rows[0]);
                }
                done();
            });
        });
    });
}

module.exports.query = query;
