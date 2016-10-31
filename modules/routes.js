const dbconnect = require('../modules/dbconnect');
const express = require('express');
const router = express.Router();

router.route('/photos')
    .get( (req, res) => {
        var dbqueries = [dbconnect.query('SELECT * FROM pictures'), dbconnect.query('SELECT * FROM tags')];
        Promise.all(dbqueries).then(function(results){
            results[0].reverse();
            res.json({
                success: true,
                pictures: results[0],
                tags: results[1]
            });
        }).catch(function(err){
            console.log(err);
        });
    });

router.route('/comments')
    .get( (req, res) => {
        dbconnect.query('SELECT * FROM comments WHERE picture_id = $1', [req.query.picnum]).then(function(results){
            if (results){
                res.json({comments: results});
            }
            else {
                res.json({comments: 'none'});
            }
        }).catch(function(err){
            console.log(err);
        });

    })

    .post( (req, res) => {
        var query = 'INSERT INTO comments (picture_id, comment, commenter) VALUES ($1, $2, $3)';
        console.log([req.body.picture, req.body.new.comment, req.body.new.commenter]);
        var variables = [req.body.picture, req.body.new.comment, req.body.new.commenter];
        dbconnect.query(query, variables).then(function(){
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
