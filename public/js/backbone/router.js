site.Router = Backbone.Router.extend({
    routes:{
        '': 'home',
        'grid': 'home',
        'grid/:count': 'home',
        'tag/:tag': 'home',
        'upload': 'upload',
        'image/:id': 'image'
    },
    home: function(tag, count){
        this.loadView(new site.views.Home({
            model: new site.models.Images({
                tag: tag,
                count: count
            }),
            el: '#body'
        }));
    },
    upload: function(){
        this.loadView(new site.views.upload({
            model: new site.models.Upload,
            el: '#body'
        }));
    },
    image: function(id){
        this.loadView(new site.views.image({
            model: new site.models.Image({
                id: id
            }),
            el:'#body'
        }));
    },
    loadView : function(view) {
        this.view && this.view.undelegateEvents();
        this.view = view;
    }
});

site.router = new site.Router;
Backbone.history.start();
