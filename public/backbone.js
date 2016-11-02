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
                $('#overlay').css({display: 'none'});
                console.log("CLEAR");
            } else if (picture) {
                $('#overlay').css({display: 'block'});
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
                }
            });
        },
        url: '/comments'
    });

    var TagModel = Backbone.Model.extend({
        initialize: function(){
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
            if (this.model.get('comments') != false){
                $('.comments').html(Handlebars.templates['comments-script']({
                    comments: comments
                }));
                updateScroll();
            } else {
                console.log("no comments");
                $('.comments').html(Handlebars.templates['comments-script']({}));
            }
            function updateScroll(){
                $('#comments').scrollTop($('#comments')[0].scrollHeight);
            }

            var c = document.getElementById("avatar-preview");
            var ctx = c.getContext("2d");
            if (localStorage.getItem('name') && localStorage.getItem('name') != "undefined"){
                $('#commenter').val(localStorage.getItem('name'));
            }
            if (localStorage.getItem('avatar') && localStorage.getItem('avatar') != "undefined"){
                var storedImg = new Image();
                storedImg.src = localStorage.getItem('avatar');
                ctx.clearRect(0, 0, 50, 50);
                ctx.drawImage(storedImg, 0, 0, 50, 50);
                var icon = c.toDataURL();
                $('#avatar-canvas-input').val(icon);
            }
            $(".avatar-input").change(function(){
                console.log("changes");
                var reader = new FileReader();
                var picToScale = $('input[type="file"]').get(0).files[0];
                reader.onload = function (){
                    img.src = reader.result;
                    ctx.clearRect(0, 0, 50, 50);
                    ctx.drawImage(img, 0, 0, 50, 50);
                    var icon = c.toDataURL();
                    $('#avatar-canvas-input').val(icon);
                };
                reader.readAsDataURL(picToScale);
                var img = new Image();
            });
        },

        events: {
            'click .big-pic-div': 'close',
            'click #submit-comment' : 'submit',
            'click #avatar-url': 'previewAvatar'
        },

        previewAvatar: function (e){
            e.preventDefault();
            var c = document.getElementById("avatar-preview");
            var ctx = c.getContext("2d");
            var img = new Image();
            img.src = $('#avatar-url-input').val();
            // ctx.clearRect(0, 0, 50, 50);
            console.log(img);
            if (img){
                ctx.drawImage(img, 0, 0, 50, 50);
            }
        },

        close: function(){
            localStorage.setItem('name', $('#commenter').val());
            localStorage.setItem('avatar', $('#avatar-canvas-input').val());
            console.log(localStorage);
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
            localStorage.setItem('avatar', $('#avatar-canvas-input').val());
            if ($('#commenter').val() && $('#comment-string').val()){
                var model = this.model;
                var view = this;
                var file = $('#avatar-canvas-input').val();
                var formData = new FormData();
                formData.append('commenter',  $('#commenter').val());
                formData.append('comment',  $('#comment-string').val());
                formData.append('picture', model.get('picture'));
                formData.append('avatar', file);
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
            var size = 9;
            var page = 0;
            var pictureObjectChunks = [];
            var picData = this.model.get('pictureData');
            if (Array.isArray(picData)){
                picData.forEach(function(pic){
                    if(pic.tags) {
                        pic.tags = pic.tags.split(", ");
                    }
                });
                for (var i=0; i<picData.length; i+=size) {
                    var smallArray = picData.slice(i,i+size);
                    pictureObjectChunks.push(smallArray);
                }
            } else {
                if(picData.tags) {
                    picData.tags = picData.tags.split(", ");
                }
                pictureObjectChunks.push(picData);
            }
            function renderImages(pageNum){
                view.html(Handlebars.templates.hello({
                    data: pictureObjectChunks[pageNum]
                }));
                $('#next').click(function(){
                    if ((page + 1) * size < picData.length){
                        page += 1;
                        renderImages(page);
                    } else {
                        page = 0;
                        renderImages(page);
                    }

                });
                $('#prev').click(function(){
                    console.log("prev");
                    if (page - 1 < 1){
                        page = Math.floor(picData.length / size);
                        renderImages(page);
                    } else {
                        page -= 1;
                        renderImages(page);
                    }
                });
            }
            renderImages(page);
        }
    });

    var HomeView = Backbone.View.extend({
        initialize: function() {
            checkNewPhotos();
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
                            $('#prev').click(function(){
                                if (page - 1 < 1){
                                    page = Math.floor(pictureObject.length / size);
                                    console.log(page);
                                    renderImages(page);
                                } else {
                                    page -= 1;
                                    renderImages(page);
                                    console.log(page);
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

    function checkNewPhotos(){
        console.log("refreshing");
        $.ajax({
            url: '/photos',
            method: 'GET',
            data: {
                checking: true
            },
            success: function(data){
                console.log(data);
                // setTimeout(checkNewPhotos, 2000);
            }
        });
    }

})();
