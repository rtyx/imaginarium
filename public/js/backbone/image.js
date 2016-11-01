var Image = Backbone.Model.extend({
    initialize: function() {
        console.log("image " + this.id + " initialized");
        this.fetch();
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
    url: function() {return '/image'+ '/' + this.id;}
});
var imageView = Backbone.View.extend({
    template: Handlebars.compile($('#singleimage').html()),
    el: '#body',
    render: function(){
        var image = this.model.attributes;
        if (!image.created) {
            console.log("failed to render");
            this.$el.html(this.template({"message": "Hold Up"}));
        } else {
            console.log("Rendered");
            console.log(image);
            console.log("trying to render");
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
    events: {
        'click #commentsubmit': 'handleComment'
    }
});
