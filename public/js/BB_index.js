/* eslint-env node, jquery */

window.BB = window.BB || {
	Models: {},
	Collections: {},
	Views: {}
};

BB.Models.Index = Backbone.Model.extend({
    url: function() {
        return this.attributes.path;
    },
	count: 0,
    initialize: function() {
        console.log("Instance of Index Model (" + this.cid + ") created!");
        if (this.attributes.count){
            this.attributes.path = '/index'
        } else if (this.attributes.tag){
            this.attributes.path = '/explore/';
			var tag = this.attributes.tag;
        } else {
			this.attributes.path = '/index';
			var tag = null;
		}
        this.fetch({data : $.param({
			'tag': tag,
			'count': this.count
		})});
    },
    showMore: function() {
        this.count += 6;
        // this.attributes.path = '/index/' + this.attributes.count;
		this.fetch({data : $.param({
			'tag': this.attributes.tag,
			'count': this.count
		})});
    },
});

setInterval(function() {
	if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
		console.log("Scrolled!");
		$(document).trigger("scrollEvent");
	}
}, 1000);

BB.Views.Index = Backbone.View.extend({
    template: Handlebars.compile($('#indexTemplate').html()),
    el: '#content',
    render: function() {
		console.log("Rendering...");
        var images = this.model.get('images');
        if (!images) {
            this.$el.html('no images found!');
            return;
        }
        var html = this.template(this.model.toJSON());
        this.$el.html(html);
    },
	enableScroll: function() {
		if (window.removeEventListener)
			window.removeEventListener('DOMMouseScroll', this.preventDefault, false);
			window.onmousewheel = document.onmousewheel = null;
			window.onwheel = null;
			window.ontouchmove = null;
			document.onkeydown = null;
	},
    showMore: function() {
		this.model.showMore();
    },
    initialize: function() {
        console.log('New instance of Index View (' + this.model.cid + ') created...');
		this.enableScroll();
		var model = this.model;
		$(document).off('scrollEvent').on('scrollEvent', function() {
			model.showMore();
		});
		var view = this;
		$(document).off('click', '#uploadButton').on('click', '#uploadButton', function() {
			$('#content').off();
	        console.log("You're gonna upload an image!");
	        new BB.Views.Upload({
	            model: new BB.Models.Upload
	        });
		});
        this.showMore();
        this.model.on('change', function() {
            console.log("Changed!");
            view.render();
        });
    },
	events: {
		'click #showMoreButton' : 'showMore',
	}
});
