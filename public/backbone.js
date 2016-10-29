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
            if (picture == "clear"){
                console.log("CLEAR");
            } else if (picture) {
                var pictureModel = new PictureModel({picture: picture});
                new PictureView({
                    el: '#pic',
                    model: pictureModel
                });
            } else {
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
            console.log(this.get('picture'));
            this.fetch({
                data: {picnum: this.get('picture'),
                success: function(){
                    console.log("success");
                }}
            });
        },
        url: '/comments'
    });

    var PictureView = Backbone.View.extend({
        initialize: function() {
            var view = this;
            this.model.on('change', function() {
                view.render();
            });
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
            $('#page').removeClass('unclickedbackground');
            $('#page').addClass('clickedbackground');
            $('.picture').css({opacity: 0.2});
            if (this.model.get('comments')){
                $('.comments').html(Handlebars.templates['comments-script']({comments: this.model.get('comments')}));
            } else {
                $('.comments').html(Handlebars.templates['comments-script']({comments: 'no comments'}));
            }
        },

        events: {
            'click .big-pic-div': 'close',
            'click #submit-comment' : 'submit'
        },

        close: function(){
            $('#page').removeClass('clickedbackground');
            $('#page').addClass('unclickedbackground');
            $('.big-pic-div').remove();
            $('.comments').remove();
            $('.picture').css({opacity: 1});
            this.undelegateEvents();
        },

        submit: function(e) {
            e.preventDefault();
            if ($('#commenter').val() && $('#comment-string').val()){
                console.log("sent comment to server");
                var model = this.model;
                var view = this;
                this.model.save({
                    new: {
                        commenter: $('#commenter').val(),
                        comment: $('#comment-string').val()
                    }
                }, {success: function(){
                    console.log("updated");
                    console.log(model);
                    model.fetch({
                        data: {picnum: model.get('picture')},
                        success: function(){
                            view.render();
                            model.destroy();
                        }
                    });
                }
                });
            } else {
                console.log("invalid comment");
            }
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

        uploadform: function() {
            $('#page').addClass('clickedbackground');
            $('#page').removeClass('unclickedbackground');
            $('.picture').css({opacity: 0.2});
            this.$el.prepend(Handlebars.templates['submit-photo']());
            $('#x').click(function(){
                $('#submit-photo-container').remove();
                $('#page').removeClass('clickedbackground');
                $('#page').addClass('unclickedbackground');
                $('.picture').css({opacity: 1});
            }).mouseover(function(){
                $(this).css({cursor: 'pointer'});
            });
        },

        events: {
            'click button': 'submit',
            'mouseenter .picture' : 'info',
            'mouseleave .picture' : 'deleteinfo',
            'click #upload-image' : 'uploadform'
        }

    });

    var router = new Router;

    Backbone.history.start();


})();
