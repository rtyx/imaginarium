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
    initialize: function() {
        console.log("Instance of Index Model (" + this.cid + ") created!");
        if (this.attributes.count){
            this.attributes.path = '/index/' + this.attributes.count;
        } else if (this.attributes.tag){
            this.attributes.path = '/explore/' + this.attributes.tag;
        } else {
            this.attributes.count = 6;
            this.attributes.path = '/index/' + this.attributes.count;
        }
        console.log(this.attributes.path);
        this.fetch();
    },
    showMore: function() {
        this.attributes.count += 6;
        this.attributes.path = '/index/' + this.attributes.count;
        this.fetch();
    },
});

BB.Views.Index = Backbone.View.extend({
    template: Handlebars.compile($('#indexTemplate').html()),
    el: '#content',
    render: function() {
        var images = this.model.attributes;
        if (!images) {
            this.$el.html('no images found!');
            return;
        }
        var html = this.template(this.model.toJSON());
        this.$el.html(html);
    },
    showMore: function() {
		this.model.showMore();
    },
    initialize: function() {
        console.log('New instance of Index View (' + this.model.cid + ') created...');
        this.showMore();
        var view = this;
        this.model.on('change', function() {
            console.log("Changed!");
            view.render();
        });
    },
	events: {
		'click #showMoreButton' : 'showMore'
	}
});

// document.off.on
