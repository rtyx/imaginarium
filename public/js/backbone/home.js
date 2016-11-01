window.site = {
    routes: {},
    views: {},
    models: {}
};

site.models.Images = Backbone.Model.extend({
    initialize: function() {
        if (this.attributes.count){
            this.attributes.path = '/grid/' + this.attributes.count;
        } else if (this.attributes.tag){
            this.attributes.path = '/tag/' + this.attributes.tag;
        } else {
            this.attributes.count = 6;
            this.attributes.path = '/grid/' + this.attributes.count;
        }
        this.fetch();
    },
    loadmore: function(){
        this.attributes.count += 6;
        this.attributes.path = '/grid/' + this.attributes.count;
        this.fetch();
    },
    url: function(){return this.attributes.path;}
});

site.views.Home = Backbone.View.extend({
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
        site.router.navigate("upload", {trigger: true});
    },
    loadmore: function(){
        this.model.loadmore();
    },
    events: {
        'click #uploadbutton': 'openupload',
        'click #more': 'loadmore'
    }
});
