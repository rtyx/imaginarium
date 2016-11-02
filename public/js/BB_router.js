/* eslint-env node, jquery */

var Router = Backbone.Router.extend({
    routes: {
        '': 'index',
        'index': 'index',
        'index/:count': 'index',
        'explore/:tag': 'index',
        'images/:id': 'image',
        'upload': 'upload',
        'images/:id/comments': 'comments'
    },
    index: function(tag, count) {
        $('#content').off();
        console.log("You're in the index page");
        new IndexView({
            model: new IndexModel({
                tag: tag,
                count: count
            })
        });
    },
    image: function(id) {
        $('#content').off();
        console.log("You're viewing an image!");
        new ImageView({
            model: new ImageModel({
                id: id
            }),
        });
    },
    upload: function() {
        $('#content').off();
        console.log("You're gonna upload an image!");
        new UploadView({
            model: new UploadModel
        });
    },
    comments: function(id) {
        $('.cardtext').off();
        console.log("You're seeing the comments!");
        new CommentsView({
            model: new CommentsModel
        });
    }
});

var imageRouter = new Router();

Backbone.history.start();
