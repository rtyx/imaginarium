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
    })

    .post( (req, res) => {
        console.log(req);
        var query = 'INSERT INTO comments (picture_id, comment, commenter) VALUES ($1, $2, $3)';
        console.log([req.body.picture, req.body.new.comment, req.body.new.commenter]);
        var variables = [req.body.picture, req.body.new.comment, req.body.new.commenter];
        dbconnect.query(query, variables).then(function(){
            cache.del('comments-' + req.body.picture);
            res.json({success: true});
        }).catch(function(err){
            console.log(err);
        });
    });

router.route('/tags')
    .get( (req, res) => {
        dbconnect.query('SELECT * FROM tags WHERE tag_name=$1', [req.query.tag]).then(function(results){
            var promiseArray = [];
            if (results.length > 1){
                results.forEach(function(result){
                    promiseArray.push(dbconnect.query('SELECT * FROM pictures WHERE id=$1', [result['picture_id']]));
                });
            }
            else {
                promiseArray.push(dbconnect.query('SELECT * FROM pictures WHERE id=$1', [results['picture_id']]));
            }
            Promise.all(promiseArray).then(function(pictures){
                pictures.reverse();
                console.log(pictures);
                res.json({
                    pictureData: pictures,
                    success: true
                });
            });
        }).catch(function(err){
            console.log(err);
        });
    });

module.exports = router;
