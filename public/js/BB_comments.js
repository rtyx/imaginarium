/* eslint-env node, jquery */

window.BB = window.BB || {
	Models: {},
	Collections: {},
	Views: {}
};

BB.Models.Comments = Backbone.Model.extend({
    baseUrl: '/comments',
    url: function() {
        return this.baseUrl + '/' + this.id;
    },
    postComment: function(data) {
        console.log("Posting comment...");
        var model = this;
        this.save(data,
            {
                success: function(id) {
                    console.log("All the information saved!");
                    model.fetch('id');
                    // imageRouter.navigate('/images/'+ id.id);
                }
            }
        );
    },
    initialize: function() {
        this.fetch('id');
        console.log('New instance of Comments Model (' + this.cid + ') created...');
    }
});

BB.Views.Comments = Backbone.View.extend({
    template: Handlebars.compile($('#commentsTemplate').html()),
    el: '#commentsBox',
    render: function () {
        var html = this.template(this.model.toJSON());
        this.$el.html(html);
    },
    submit: function(){
        console.log("Submitting comment...");
        var author = $('#commentAuthorInput').val();
        var comment = $('#commentInput').val();
        this.model.postComment({
            imageId: this.model.id,
            author: author,
            comment: comment
        });
    },
    events: {
        'click #submit': 'submit',
    },
    initialize: function(){
        console.log('New instance of Comments View (' + this.model.cid + ') created...');
        this.render();
        var view = this;
        this.model.on('change', function() {
            view.render();
        });
    },
});
