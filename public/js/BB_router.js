/* eslint-env node, jquery */

window.BB = window.BB || {
	Models: {},
	Collections: {},
	Views: {}
};

BB.Router = Backbone.Router.extend({
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
        console.log("You're in the index page");
		$('#content').off();
		this.loadView(
			new BB.Views.Index({
				model: new BB.Models.Index ({
					tag: tag,
					count: count
				})
			})
		);
    },
    image: function(id) {
        $('#content').off();
        console.log("You're viewing an image!");
        new BB.Views.Image({
            model: new BB.Models.Image({
                id: id
            }),
        });
    },
    upload: function() {
        $('#content').off();
        console.log("You're gonna upload an image!");
        new BB.Views.Upload({
            model: new BB.Models.Upload
        });
    },
    comments: function(id) {
        $('.cardtext').off();
        console.log("You're seeing the comments!");
        new BB.Views.Comments({
            model: new BB.Models.Comments
        });
    },
	loadView: function(view) {
		this.view && this.view.undelegateEvents();
		this.view = view;
	}
});

BB.router = new BB.Router();

Backbone.history.start();
