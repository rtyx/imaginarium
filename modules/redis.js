const redis = require('redis');

var client = redis.createClient({
    host: 'localhost',
    port: 6379
});

client.on('error', function(err) {
    console.log(err);
});

module.exports.set = function(key, expiry, value){
    return new Promise (function (resolve, reject) {
        client.setex(key, expiry, value, function(err, data){
            if (err){
                reject(err);
            }
            else{
                resolve(data);
            }
        });
    });
};

module.exports.get = function(key){
    return new Promise (function (resolve, reject) {
        client.get(key, function (err, data){
            if (err) {
                reject(err);
            }
            else {
                resolve(data);
            }
        });
    });
};


module.exports.del = function(key){
    return new Promise (function (resolve, reject) {
        client.del(key, function (err, data){
            if (err){
                reject (err);
            }
            else {
                resolve (data);
            }
        });
    });
};
