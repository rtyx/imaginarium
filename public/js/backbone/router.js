$(document).ready(function() {
    Window.site = {
        routes: {},
        views: {},
        models: {}
    };

    var Router = Backbone.Router.extend({
        routes:{
            '': 'home',
            'upload': 'upload',
            'image/:id': 'image'
        },
        home: function(){
            this.loadView(new HomeView({
                model: new Images,
                el: '#body'
            }));
        },
        upload: function(){
            this.loadView(new uploadView({
                model: new Upload,
                el: '#body'
            }));
        },
        image: function(id){
            this.loadView(new imageView({
                model: new Image({
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

    var router = new Router;
    Backbone.history.start();
});
