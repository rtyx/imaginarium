site.models.Image = Backbone.Model.extend({
    initialize: function() {
        console.log("image " + this.id + " initialized");
        if (!this.attributes.commentCount) {
            console.log("no comment count yet");
            this.attributes.commentCount = 10;
        }
        this.fetch({data: $.param({'count': this.attributes.commentCount})});
    },
    postComment: function(inputs){
        var view = this;
        $.post({
            url: '/comments',
            data: inputs
        }).then(function(){
            view.fetch();
        });
    },
    moreComments: function(){
        this.attributes.commentCount += 10;
        this.fetch({data: $.param({'count': this.attributes.commentCount})});
    },
    url: function() {return '/image'+ '/' + this.id;}
});
site.views.image = Backbone.View.extend({
    template: Handlebars.compile($('#singleimage').html()),
    el: '#body',
    render: function(){
        var image = this.model.attributes;
        if (!image.created) {
            this.$el.html(this.template({"message": "Hold Up"}));
        } else {
            this.$el.html(this.template(image));
        }
    },
    initialize: function(){
        this.render();
        var view = this;
        this.model.on('change', function(){
            view.render();
        });
    },
    handleComment: function(e){
        e.preventDefault();
        var elements = $('.addcomment')[0].elements;
        var inputs = {};
        for (var i = 0; i < 3; i++) {
            if (elements[i].value == '') {
                $('#message').html("Please complete all text fields");
                return;
            } else {
                inputs[elements[i].name] = elements[i].value;
            }
        }
        this.model.postComment(inputs);
    },
    moreComments: function(){
        this.model.moreComments();
    },
    events: {
        'click #commentsubmit': 'handleComment',
        'click #morecomments': 'moreComments'
    }
});
