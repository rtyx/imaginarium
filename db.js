
var pg = require('pg');
var dbUrl = 'postgres://spicedling:036363976@localhost:5432/users';

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
    if(err) {
        console.log(err);
    }
});


exports.insertData = function(url,username,title,description) {
    return getFromDb('INSERT into images(url, user_name, title, description) VALUES($1, $2, $3, $4) RETURNING id',[url, username, title, description]).then(function(result) {
        return result;
    }).catch(function(err) {
        if(err) {
            console.log(err);
        }
    });
};

exports.getImages = function() {
    return getFromDb('SELECT * FROM images ORDER BY created_at DESC LIMIT 20').then(function(result) {
        return result;
    }).catch(function(err) {
        if(err) {
            console.log(err);
        }
    });
};

exports.getImage = function(id) {
    return getFromDb('SELECT * FROM images WHERE id=$1', [id]).then(function(result) {
        return result;
    }).catch(function(err) {
        if(err) {
            console.log(err);
        }
    });
};

exports.insertComment = function(comment,image_id,username_comment) {
    return getFromDb('INSERT into comments(comment,image_id,username_comment) VALUES($1,$2,$3) RETURNING id', [comment,image_id,username_comment]).then(function(result) {
        return result;
    }).catch(function(err) {
        if(err) {
            console.log(err);
        }
    });
};

exports.insertTags = function(tags,image_id) {
    return new Promise(function(resolve, reject) {
        var arr = [];
        for (var i=0;i<tags.length;i++) {
            arr.push(getFromDb('INSERT into tags(tag,image_id) VALUES($1,$2) RETURNING id', [tags[i],image_id]));
        }
        Promise.all(arr).then(resolve).catch(reject);
    });
};

exports.imageTags = function(id) {
    return getFromDb('SELECT * from tags WHERE image_id=$1 ORDER BY created_at', [id]).then(function(result) {
        return result;
    }).catch(function(err) {
        if(err) {
            console.log(err);
        }
    });
};


exports.getTaggedImages = function(tag) {
    return getFromDb('SELECT * from tags JOIN images on images.id=tags.image_id WHERE tags.tag=$1', [tag]).then(function(result) {
        return result;
    }).catch(function(err) {
        if(err) {
            console.log(err);
        }
    });
};


exports.imageComments = function(id) {
    return getFromDb('SELECT * FROM comments WHERE image_id=$1 ORDER BY created_at DESC LIMIT 30',[id]).then(function(result) {
        return result;
    }).catch(function(err) {
        if(err) {
            console.log(err);
        }
    });
};

function getFromDb(str, params) {
    return new Promise(function(resolve, reject) {
        pool.connect(function(err, client, done) {
            if (err) {
                reject(err);
                return;
            }
            client.query(str, params || [], function(err, result) {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
                done();
            });
        });
    });
}
