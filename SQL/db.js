const chalk = require('chalk');
const wiii = chalk.bold.green;
const error = chalk.bold.red;
const pg = require('pg');

var dbUrl = process.env.DATABASE_URL || 'postgress://rtyx:password@localhost/imaginarium';

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

var pool = new pg.Pool(dbConfig);

pool.on('error', function(err) {
    console.log(error(err));
});

exports.usedb = function (str, params) {
    console.log(chalk.blue(str) + " " + chalk.cyan(params));
    return new Promise(function(resolve, reject) {
        pool.connect(function(err, client, done) {
            if (err) {
                console.log(error(err));
                reject(err);
                return;
            }
            console.log(wiii('Connected to the database!'));
            client.query(str, params || [], function(err, data) {
                if (err) {
                    console.log(error(err));
                    reject(err);
                } else {
                    console.log(wiii('Successful query!'));
                    resolve(data);
                }
                done();
            });
        });
    });
};

// {
//     "checkDBContent": "SELECT * FROM images",
//     "addImage": "INSERT INTO images (url, title, description) VALUES ($1, $2, $3) RETURNING id",
//     "initialImageLoad": "SELECT * FROM images ORDER BY time_added DESC LIMIT 12",
//     "getImage": "SELECT * FROM images WHERE id=$1"
// }
