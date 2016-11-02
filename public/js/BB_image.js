/* eslint-env node, jquery */

window.BB = window.BB || {
	Models: {},
	Collections: {},
	Views: {}
};

BB.Models.Image = Backbone.Model.extend({
    baseUrl: '/images',
    url: function() {
        return this.baseUrl + '/' + this.id;
    },
    initialize: function() {
        this.fetch('id');
        console.log('New instance of Image Model (' + this.cid + ') created...');
    }
});

BB.Views.Image = Backbone.View.extend({
    template: Handlebars.compile($('#imageTemplate').html()),
    className: 'selectedCard',
    el: '#content',
    createCommentsView: function () {
        new BB.Views.Comments({
            model: new BB.Models.Comments({
                id: this.model.attributes.id
            })
        });
    },
    // urlifyHashtags: function(text) {
    //     var re = ["#([a-z0-9]+)"];
    //     re = new RegExp(re.join('|'), "gi");
    //     return text.replace(re, function(url) {
    //         return "<a href=\"#explore/" + url + "\">" + url + "</a>";
    //     });
    // },
    render: function () {
        var image = this.model.attributes;
        if (!image) {
            this.$el.html('Image not found!');
            return;
        }
        var html = this.template(this.model.toJSON());
        this.$el.html(html);
        this.createCommentsView();
    },
    initialize: function(){
        console.log('New instance of Image View (' + this.model.cid + ') created...');
        var view = this;
        this.model.on('change', function() {
            view.render();
        });
    },
});
