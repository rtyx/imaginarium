const dbconnect = require('../modules/dbconnect');
const express = require('express');
const router = express.Router();
const cache = require('../modules/redis.js');

router.route('/photos')
    .get( (req, res) => {
        cache.get('photos').then(function(photos){
            if(!photos){
                console.log("no cache, getting photos");
                var dbqueries = [dbconnect.query('SELECT * FROM pictures'), dbconnect.query('SELECT * FROM tags')];
                Promise.all(dbqueries).then(function(results){
                    results[0].reverse();
                    res.json({
                        success: true,
                        pictures: JSON.stringify(results[0]),
                        tags: JSON.stringify(results[1])
                    });
                    cache.set('photos', 3600, JSON.stringify(results[0]));
                    cache.set('tags', 3600, JSON.stringify(results[1]));
                }).catch(function(err){
                    console.log(err);
                });
            } else {
                var caches = [cache.get('photos'), cache.get('tags')];
                Promise.all(caches).then(function(results){
                    res.json({
                        success: true,
                        pictures: results[0],
                        tags: results[1]
                    });
                }).catch(function(err){
                    console.log(err);
                });
            }
        });
    });

router.route('/comments')
    .get( (req, res) => {
        cache.get('comments-' + req.query.picnum).then(function(result){
            if(!result){
                dbconnect.query('SELECT * FROM comments WHERE picture_id = $1', [req.query.picnum]).then(function(results){
                    if (results){
                        res.json({
                            comments: JSON.stringify(results)
                        });
                        cache.set('comments-' + req.query.picnum, 3600, JSON.stringify(results));
                    }
                    else {
                        res.json({
                            comments: JSON.stringify({
                                commenter: "default",
                                comment: "no comments"
                            })
                        });
                    }
                }).catch(function(err){
                    console.log(err);
                });
            } else {
                console.log("CACHE!");
                res.json({
                    comments: result
                });
            }

        });
    });

router.route('/tags')
    .get( (req, res) => {
        dbconnect.query('SELECT * from tags JOIN pictures on pictures.id=tags.picture_id WHERE tags.tag_name=$1', [req.query.tag]).then(function(pictures){
            pictures.reverse();
            console.log(pictures);
            res.json({
                pictureData: pictures,
                success: true
            });
        }).catch(function(err){
            console.log(err);
        });
    });

module.exports = router;
