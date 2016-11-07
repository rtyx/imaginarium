window.site = {
    routes: {},
    views: {},
    models: {}
};

site.models.Images = Backbone.Model.extend({
    initialize: function() {
        if (this.attributes.tag){
            this.attributes.count = 6;
            this.attributes.offset = 0;
            this.attributes.done = false;
            this.attributes.path = '/tag/' + this.attributes.tag;
        } else {
            this.attributes.count = 6;
            this.attributes.offset = 0;
            this.attributes.path = '/grid';
        }
        this.fetch({data: $.param({
            'count': this.attributes.count,
            'offset': this.attributes.offset
        })});
    },
    like: function(id){
        var view = this;
        $.post({
            url: '/like/' + id
        }).then(function(){
            var image = view.get("data").rows.find(function(row){
                return row.id == id;
            });
            image.likes++;
            view.trigger('change');
        });
    },
    loadmore: function(){
        this.attributes.count += 6;
        this.attributes.offset += 6;
        if (this.attributes.tag) {
            this.attributes.path = '/tag/' + this.attributes.tag;
        } else {
            this.attributes.path = '/grid';
        }
        var view = this;
        $.get({
            url: this.attributes.path,
            data: $.param({
                'count': this.attributes.count,
                'offset': this.attributes.offset
            })
        }).then(function(object){
            console.log(object);
            if (object.data.rows.length == 0) {
                view.attributes.done = true;
                view.trigger('change');
            } else {
                [].push.apply(view.get('data').rows,object.data.rows);
                view.trigger('change');
            }
        });
    },
    url: function(){return this.attributes.path;}
});

site.views.Home = Backbone.View.extend({
    template: Handlebars.compile($('#imageGrid').html()),
    el: '#body',
    render: function () {
        var images = this.model.attributes.data;
        if (!images) {
            this.$el.html(this.template({"message": "Hold Up"}));
        } else if (this.model.attributes.done){
            this.$el.html(this.template({"message": "No More Images to Load", "done": true, "images": images.rows}));
        } else {
            this.$el.html(this.template({"images": images.rows}));
        }
    },
    initialize: function(){
        this.render();
        var view = this;
        this.model.on('change', function() {
            console.log("hey gurl");
            view.render();
        });
    },
    loadmore: function(){
        this.model.loadmore();
    },
    like: function(e){
        this.model.like(e.currentTarget.id);
    },
    events: {
        'click #more': 'loadmore',
        'click .like': 'like'
    }
});
