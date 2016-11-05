const chalk = require('chalk');
const db = require('./SQL/db.js');

module.exports = {
    saveImage: function (data) {
        console.log(chalk.blue("Saving image..."));
        return db.usedb('INSERT INTO images (url, author, title, description, hashtags) VALUES ($1, $2, $3, $4, $5) RETURNING id;', [data.url, data.author, data.title, data.description, data.hashtags]);
    },
    getImage: function(id) {
        console.log(chalk.blue("Getting image (" + id + ") from the server..."));
        return db.usedb('SELECT * FROM images WHERE id = $1;', [id]);
    },
    updateImage: function(description, hashtags, id) {
        console.log(chalk.blue("Updating image (" + id + ") at the server..."));
        return db.usedb('UPDATE images SET description = $1, hashtags = $2 WHERE id = $3;', [description, hashtags, id]);
    },
    deleteImage: function(id) {
        console.log(chalk.blue("Deleting image (" + id + ") from the server..."));
        return db.usedb('DELETE FROM images WHERE id = $1;', [id]);
    },
    getImages: function(count) {
        console.log(chalk.blue("Getting the images from the server..."));
        return db.usedb('SELECT * FROM images ORDER BY timestamp DESC LIMIT $1;', [count]);
    },
    getImagesByTag: function(tag, count) {
        console.log(chalk.blue("Getting the images tagged as " + tag + " from the server..."));
        return db.usedb('SELECT * FROM images WHERE $1 = ANY(hashtags) ORDER BY timestamp DESC LIMIT $2;', [tag, count]);
    },
    getComments: function(id) {
        console.log(chalk.blue("Getting comments from the server..."));
        return db.usedb('SELECT * FROM comments WHERE imageid = $1 ORDER BY timestamp DESC LIMIT 6;', [id]);
    },
    postComment: function(imageId, author, comment) {
        console.log(chalk.blue("Saving comment..."));
        return db.usedb('INSERT INTO comments (imageId, author, comment) VALUES ($1, $2, $3) RETURNING id;', [imageId, author, comment]);
    },
    deleteComment: function(id) {
        console.log(chalk.blue("Deleting comment " + id + "..."));
        return db.usedb('DELETE * FROM comments WHERE id = $1;', [id]);
    },
    deleteAllComments: function(imageid) {
        console.log(chalk.blue("Deleting comments in image (" + imageid + ") from the server..."));
        return db.usedb('DELETE FROM comments WHERE imageid = $1;', [imageid]);
    },
};
