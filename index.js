const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const serveStatic = require('serve-static');
const routes = require('./routes.js');
const chalk = require('chalk');
const basicAuth = require('basic-auth');
// const wiii = chalk.bold.green;
// const error = chalk.bold.red;

app.use(serveStatic('public'));

app.use(bodyParser.json());

// app.use(bodyParser.urlencoded({
//     extended: true
// }));

var auth = function(req,res,next){
    var credentials = basicAuth(req);
    if (!credentials || credentials.name != 'perro' || credentials.pass != 'salchicha') {
        res.setHeader('WWW-Authenticate', 'Basic realm=backproblems');
        res.sendStatus(401);
    } else {
        next();
    }
};

app.use('/admin', auth);

app.use('/', routes);

app.listen(8080, function () {
    console.log(chalk.blue('Listening on port 8080!'));
});
