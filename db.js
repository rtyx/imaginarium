
var pg = require('pg');
var client = new pg.Client('postgres://spicedling:036363976@localhost:5432/users');

client.connect(function(err) {
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
        for (var i=0;i<tags.length;i++) {
            getFromDb('INSERT into tags(tag,image_id) VALUES($1,$2) RETURNING id', [tags[i],image_id]);
        }
        return;
    }).catch(function(err) {
            if(err) {
                console.log(err);
            }
        });

};

exports.imageTags = function(id) {
    return getFromDb('SELECT * from tags WHERE image_id=$1 ORDER BY created_at', [id]).then(function(result) {
        // console.log('tags result');
        // console.log(result);
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
