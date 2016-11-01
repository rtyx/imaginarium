var Images = Backbone.Model.extend({
    initialize: function() {
        console.log("images initialized");
        this.fetch();
    },
    url: function(){return '/grid';}
});

var HomeView = Backbone.View.extend({
    template: Handlebars.compile($('#imageGrid').html()),
    el: '#body',
    render: function () {
        var images = this.model.attributes.rows;
        if (!images) {
            this.$el.html(this.template({"message": "Hold Up"}));
        } else {
            console.log(images);
            this.$el.html(this.template(images));
        }
    },
    initialize: function(){
        this.render();
        var view = this;
        this.model.on('change', function() {
            view.render();
        });
    },
    openupload: function(){
        console.log("button pressed");
        router.navigate("upload", {trigger: true});
    },
    events: {
        'click #uploadbutton': 'openupload'
    }
});
