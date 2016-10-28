var pg = require('pg');
var client = new pg.Client('postgres://spicedling:036363976@localhost:5432/users');

client.connect(function(err) {
    console.log(err);
});


exports.insertData = function(url,username,title,description) {
    return getFromDb('INSERT into images(url, user_name, title, description) VALUES($1, $2, $3, $4) RETURNING id',[url, username, title, description]).then(function(result) {
        return result;
    }).catch(function(err) {
        console.log(err);
    });
};



exports.getImages = function() {
    return getFromDb('SELECT * FROM images ORDER BY created_at DESC LIMIT 12').then(function(result) {
        return result;
    }).catch(function(err) {
        console.log(err);
    });
};

exports.getImage = function(id) {
    return getFromDb('SELECT * FROM images WHERE id=$1', [id]).then(function(result) {
        return result;
    }).catch(function(err) {
        console.log(err);
    });
};



function getFromDb(str, params) {
    return new Promise(function(resolve, reject) {
            client.query(str, params || [], function(err, result) {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
}
