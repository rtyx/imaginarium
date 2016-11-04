site.models.Image = Backbone.Model.extend({
    initialize: function() {
        console.log("image " + this.id + " initialized");
        if (!this.attributes.commentCount) {
            console.log("no comment count yet");
            this.attributes.commentOffset = 0;
            this.attributes.commentCount = 6;
        }
        this.fetch({data: $.param({
            'count': this.attributes.commentCount,
            'offset': this.attributes.commentOffset
        })});
    },
    postComment: function(inputs){
        var view = this;
        $.post({
            url: '/comments',
            data: inputs
        }).then(function(){
            view.fetch({data: $.param({
                'count': view.attributes.commentCount,
                'offset': view.attributes.commentOffset
            })});
        });
    },
    moreComments: function(){
        this.attributes.commentCount += 6;
        this.attributes.commentOffset += 6;
        var view = this;
        $.get({
            url: '/image/'+ this.id,
            data: $.param({
                'count': this.attributes.commentCount,
                'offset': this.attributes.commentOffset
            })
        }).then(function(object){
            if (object.comments.length == 0) {
                view.attributes.done = true;
                view.trigger('change');
            } else {
                [].push.apply(view.attributes.comments,object.comments);
                view.trigger('change');
            }
        });
    },
    like: function(){
        var view = this;
        $.post({
            url: '/like/' + view.id
        }).then(function(){
            console.log("saved");
            view.attributes.liked = true;
            view.trigger('change');
        });
    },
    url: function() {return '/image/' + this.id;}
});
site.views.image = Backbone.View.extend({
    template: Handlebars.compile($('#singleimage').html()),
    el: '#body',
    render: function(){
        var image = this.model.attributes;
        if (!image.created) {
            this.$el.html(this.template({"message": "Hold Up"}));
        } else if (this.model.attributes.done){
            this.$el.html(this.template({"message": "No More Comments to Load", "done": true, "image": image}));
        } else {
            this.$el.html(this.template({"image": image}));
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
    like: function(){
        this.model.like();
    },
    events: {
        'click #commentsubmit': 'handleComment',
        'click #morecomments': 'moreComments',
        'click #like': 'like'
    }
});
