(function(){

    var templates = document.querySelectorAll('script[type="text/handlebars"]');

    Handlebars.templates = Handlebars.templates || {};

    Array.prototype.slice.call(templates).forEach(function(script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });


    var Router = Backbone.Router.extend({
        routes: {
            'home': 'home',
            'home/:picture': 'home'
        },

        home: function(picture) {
            if (picture){
                var pictureModel = new PictureModel();
                pictureModel.set({picture: picture});
                new PictureView({
                    el: '#pic',
                    model: pictureModel
                });
            }
            else {
                var homeModel = new HomeModel();
                new HomeView({
                    el: '#main',
                    model: homeModel
                });
            }
        }
    });

    var HomeModel = Backbone.Model.extend({
        initialize: function(){
            this.fetch();
        },
        url: '/photos'
    });

    var PictureModel = Backbone.Model.extend({
        initialize: function(){
            console.log("i'm here");
        },
        url: '/comments'
    });

    var PictureView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },

        render: function () {
            var pictures = localStorage.getItem('pictures');
            var picArray = JSON.parse(pictures);
            var id = (this.model.get('picture'));
            var clickedPic = picArray.filter(function(pic){
                if (id == pic.id){
                    return pic;
                }
            });
            this.$el.html(Handlebars.templates['big-pic-script']({pic: clickedPic[0]}));
            $('#page').css({opacity: 0.2});
        },

        events: {
            'click .big-pic-div': 'close'
        },

        close: function(){
            $('.big-pic-div').remove();
            $('.comments').remove();
            $('#page').css({opacity: 1});
        }


    });

    var HomeView = Backbone.View.extend({
        initialize: function() {
            var view = this;
            view.render();
            this.model.on('change', function() {
                view.render();
            });
        },
        render: function () {
            this.model.fetch();
            var pictureObject = this.model.get('pictures');
            localStorage.setItem('pictures', JSON.stringify(pictureObject));
            this.$el.html(Handlebars.templates.hello({data: pictureObject}));
        },
        submit: function(e){
            e.preventDefault();
            var file = $('input[type="file"]').get(0).files[0];
            var formData = new FormData();
            var inputs = $('#upload :input');
            var values = {};
            var view = this;
            inputs.each(function() {
                values[this.name] = $(this).val();
            });
            values = JSON.stringify(values);
            formData.append('file', file);
            formData.append('values', values);
            $.ajax({
                url: '/photos',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data){
                    console.log(data);
                    view.render();
                }
            });
        },
        info: function(e){
            var pictureArray = this.model.get('pictures');
            var hoveredPicture = pictureArray.filter(function(picture){
                if (picture.id == e.currentTarget.id){
                    return picture;
                }
            });
            $('#' + hoveredPicture[0].id + "-pic").css({opacity: 0.4});
            $('#' + hoveredPicture[0].id).css({cursor: 'pointer'});
            hoveredPicture[0].description = hoveredPicture[0].description.slice(0, 100);
            $(e.currentTarget).prepend(Handlebars.templates.desc({picture: hoveredPicture[0]}));
        },

        deleteinfo: function(e) {
            $('.description-text').remove();
            $("#" + e.currentTarget.id + "-pic").css({opacity: 1});
        },

        events: {
            'click button': 'submit',
            'mouseenter .picture' : 'info',
            'mouseleave .picture' : 'deleteinfo'
        }

    });

    var router = new Router;

    Backbone.history.start();


})();
