(function(){

    var pictures;

    var templates = document.querySelectorAll('script[type="text/handlebars"]');

    Handlebars.templates = Handlebars.templates || {};

    Array.prototype.slice.call(templates).forEach(function(script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });


    var Router = Backbone.Router.extend({
        routes: {
            'home': 'home',
            'home/:picture': 'home',
            'tags/:tag': 'tags'
        },

        tags: function (tag) {
            if(tag){
                var tagModel = new TagModel({tag: tag});
                new TagView({
                    el: '#main',
                    model: tagModel
                });
            }
        },

        home: function (picture) {
            if (picture == "clear"){
                console.log("CLEAR");
            } else if (picture) {
                var pictureModel = new PictureModel(
                    {picture: picture}
                );
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

        },
        url: '/photos'
    });

    var PictureModel = Backbone.Model.extend({
        initialize: function(){
            this.fetch({
                data: {picnum: this.get('picture')},
                success: function(data){
                    console.log(data);
                    console.log("success");
                }
            });
        },
        url: '/comments'
    });

    var TagModel = Backbone.Model.extend({
        initialize: function(){
            console.log("weeeee");
            this.fetch({
                data: {tag: this.get('tag')},
                success: function(data){
                    console.log(data);
                }
            });

        },
        url: 'tags'
    });



    var PictureView = Backbone.View.extend({
        initialize: function() {
            var view = this;
            this.model.on('change', function() {
                view.render();
            });
        },

        render: function () {
            var picArray = JSON.parse(pictures);
            var comments = JSON.parse(this.model.get('comments'));
            var id = (this.model.get('picture'));
            var clickedPic = picArray.filter(function(pic){
                if (id == pic.id){
                    return pic;
                }
            });
            this.$el.html(Handlebars.templates['big-pic-script'](
                {pic: clickedPic[0]}
            ));
            $('#page').removeClass('unclickedbackground');
            $('#page').addClass('clickedbackground');
            $('#pic').addClass('big-pic-container');
            $('.picture').css({opacity: 0.2});
            if (this.model.get('comments')){
                $('.comments').html(Handlebars.templates['comments-script']({
                    comments: comments
                }));
            } else {
                $('.comments').html(Handlebars.templates['comments-script']({
                    comments: 'no comments'
                }));
            }
            $('#commenter').val(localStorage.getItem('name'));
            console.log('avatar: ' + localStorage.getItem('avatar'));
            if (localStorage.getItem('avatar')){
                $('#avatar-img').attr('src', localStorage.getItem('avatar'));
            }
            $(".avatar-input").change(function(){
                console.log("input changes");
                var reader = new FileReader();
                reader.onload = function (){
                    $('#avatar-preview').html("<img id='avatar-img' src=" + reader.result + "></img>");
                };
                reader.readAsDataURL($('input[type="file"]').get(0).files[0]);
            });
        },

        events: {
            'click .big-pic-div': 'close',
            'click #submit-comment' : 'submit'
            // 'click #avatar-url': 'previewAvatar'
        },

        // previewAvatar: function (e){
        //
        // },

        close: function(){
            localStorage.setItem('name', $('#commenter').val());
            localStorage.setItem('avatar', $('#avatar-img').attr('src'));
            $('#page').removeClass('clickedbackground').addClass('unclickedbackground');
            $('.big-pic-container').empty();
            $('#pic').removeClass('big-pic-container');
            $('.comments').remove();
            $('.picture').css({opacity: 1});
            this.undelegateEvents();
        },

        submit: function(e) {
            e.preventDefault();
            localStorage.setItem('name', $('#commenter').val());
            if ($('#commenter').val() && $('#comment-string').val()){
                var model = this.model;
                var view = this;
                var file = $('input[type="file"]').get(0).files[0];
                var formData = new FormData();
                formData.append('file', file);
                formData.append('commenter',  $('#commenter').val());
                formData.append('comment',  $('#comment-string').val());
                formData.append('picture', model.get('picture'));
                $.ajax({
                    url: '/comments',
                    method: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(){
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

    var TagView = Backbone.View.extend({
        initialize: function() {
            var view = this;
            this.model.on('change', function(){
                view.render();
            });
        },

        render: function() {
            this.$el.empty();
            var view = this.$el;
            var picData = this.model.get('pictureData');
            picData.forEach(function(pic){
                if(pic.tags) {
                    pic.tags = pic.tags.split(", ");
                }
            });
            var pictureObject = this.model.get('pictureData');
            var size = 9;
            var page = 0;
            var pictureObjectChunks = [];
            for (var i=0; i<pictureObject.length; i+=size) {
                var smallArray = pictureObject.slice(i,i+size);
                pictureObjectChunks.push(smallArray);
            }
            function renderImages(pageNum){
                view.html(Handlebars.templates.hello({
                    data: pictureObjectChunks[pageNum]
                }));
                $('#next').click(function(){
                    if ((page + 1) * size < pictureObject.length){
                        page += 1;
                        renderImages(page);
                    } else {
                        page = 0;
                        renderImages(page);
                    }

                });
            }
            renderImages(page);
        }
    });

    var HomeView = Backbone.View.extend({
        initialize: function() {
            this.render();
            this.model.on('change', function() {
                console.log("changed");
            });
        },
        render: function () {
            var view = this;
            var model = this.model;
            var elem = this.$el;
            $('#home').click(function(){
                view.undelegateEvents();
            });

            this.model.fetch({
                success: function() {
                    console.log("made it here");
                    var pictureObject = JSON.parse(model.get('pictures'));
                    if (pictureObject){
                        pictures =  JSON.stringify(pictureObject);
                        pictureObject.forEach(function(pic){
                            if(pic.tags){
                                pic.tags = pic.tags.split(", ");
                            }
                        });
                        var size = 9;
                        var pictureObjectChunks = [];
                        for (var i=0; i<pictureObject.length; i+=size) {
                            var smallArray = pictureObject.slice(i,i+size);
                            pictureObjectChunks.push(smallArray);
                        }
                        var page = 0;
                        function renderImages(pageNum){
                            elem.html(Handlebars.templates.hello({
                                data: pictureObjectChunks[pageNum]
                            }));
                            $('#next').click(function(){
                                if ((page + 1) * size < pictureObject.length){
                                    page += 1;
                                    renderImages(page);
                                } else {
                                    page = 0;
                                    renderImages(page);
                                }

                            });
                        }
                        renderImages(page);
                    }
                }
            });
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

        submitUrl: function(e) {
            e.preventDefault();
            var inputs = $('#upload :input');
            var values = {};
            var view = this;
            inputs.each(function() {
                values[this.name] = $(this).val();
            });
            values = JSON.stringify(values);
            $.ajax({
                url: '/uploadurl',
                method: 'POST',
                data: {
                    values: values,
                    url: $('#photo-url').val()
                },
                success: function(data){
                    view.render();
                    console.log(data);
                }
            });
        },

        previewUrl: function(e){
            e.preventDefault();
            $('#placeholder-image').attr("src", $('#photo-url').val());
        },

        info: function(e){
            var pictureArray = JSON.parse(this.model.get('pictures'));
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
            $('#page').addClass('clickedbackground').removeClass('unclickedbackground');
            $('.picture').css({opacity: 0.2});
            this.$el.prepend(Handlebars.templates['submit-photo']());
            $(".photo-input").change(function(){
                console.log("input changed");
                var reader = new FileReader();
                reader.onload = function (){
                    $('#placeholder').html("<img src=" + reader.result + "></img>");
                };
                reader.readAsDataURL($('input[type="file"]').get(0).files[0]);
            });
            $('#x').click(function(){
                $('#submit-photo-container').remove();
                $('#page').removeClass('clickedbackground').addClass('unclickedbackground');
                $('.picture').css({opacity: 1});
            }).mouseover(function(){
                $(this).css({cursor: 'pointer'});
            });
        },

        events: {
            'click #submit': 'submit',
            'click #preview-url': 'previewUrl',
            'click #submit-url': 'submitUrl',
            'click #upload-image' : 'uploadform',
            'mouseenter .picture' : 'info',
            'mouseleave .picture' : 'deleteinfo'
        }

    });


    var router = new Router;

    Backbone.history.start();


})();