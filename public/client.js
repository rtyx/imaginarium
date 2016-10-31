
(function() {
    var templates = document.querySelectorAll('script[type="text/handlebars"]');
    Handlebars.templates = Handlebars.templates || {};
    Array.prototype.slice.call(templates).forEach(function(script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });

    var Router = Backbone.Router.extend({
        routes: {
            'images': 'images',
            'image/:id': 'image',
            'upload': 'upload',
            'images/:tag': 'tag'
        },
        upload: function() {
            $('#main').off();
            new UploadView({
                el:"#main"
            });
        },
        images: function(){
            $('#main').off();
            new ImagesView ({
                el:"#main",
                model: new ImagesModel
            });
        },
        image: function(id) {
            $('#main').off();
            new ImageView({
                el:"#main",
                model: new ImageModel({id:id})
            });
        },
        tag: function(tag) {
            $('#main').off();
            new TagView({
                el:"#main",
                model: new TagModel({tag:tag})
            });
        }
    });





    var ImagesModel = Backbone.Model.extend({
        initialize: function() {
            var newModel = this;
            this.fetch({
                success: function(data) {
                    var arrOfImages = data.attributes.file;
                    newModel.set({
                        arrOfImages:arrOfImages
                    });
                    newModel.trigger('showImages');
                }
            });
        },
        url: '/images'
    });

    var ImagesView = Backbone.View.extend({
        initialize: function() {
            var thisView = this;
            this.model.on('showImages', function() {
                var arrOfImages = thisView.model.get('arrOfImages');
                thisView.render(arrOfImages);
            });
        },
        render: function(arrOfImages) {
            this.$el.html(Handlebars.templates.showImages(arrOfImages));
        },
        events: {
            'click #upload-button': function() {
                router.navigate('/upload', {trigger:true});
            }
        }
    });


    var TagModel = Backbone.Model.extend({
        initialize: function() {
            var newTagModel = this;
            this.fetch({
                success: function(data) {
                    newImageModel.trigger('showTagImages');
                }
            });
        },
        url: function() {
            return '/images/'+this.tag;
        }
    });



    var ImageModel = Backbone.Model.extend({
        initialize: function() {
            var newImageModel = this;
            this.fetch({
                success: function(data) {
                    newImageModel.trigger('showImage');
                }
            });
        },
        url: function() {
            return '/image/'+this.id;

        }
    });

    var ImageView = Backbone.View.extend({
        initialize: function() {
            var newImageView = this;
            this.model.on('showImage', function() {
                newImageView.render();
            })
        },
        render: function() {
            this.$el.html(Handlebars.templates.showImage(this.model.toJSON()));

        },
        events: {
            'click #upload-button': function() {
                router.navigate('/upload', {trigger:true});
            },
            'click #home-button': function() {
                router.navigate('/images', {trigger:true});
            },
            'click #submit-comment': function() {
                var comment = $('#comment-area').val();
                var usernameComment = $('#user_comment').val();
                if (comment.length===0 || usernameComment.length===0 ) {
                    alert('Please fill all the fields')
                }
                else {
                    var id = this.model.attributes.file.image[0].id;
                    $('#comment-area').val('');
                    $('#user_comment').val('');
                    this.model = new InsertCommentModel({
                        comment:comment,
                        image_id:this.model.attributes.file.image[0].id,
                        username_comment:usernameComment
                    });
                }
            },
            'click #submit-tags': function() {
                var tags = $('#tags-area').val();
                var tagsArr = tags.split(',').map(function(str) {
                    return str.trim();
                })
                if (tags.length===0) {
                    alert('Please specify a tag')
                }
                else {
                    var id = this.model.attributes.file.image[0].id;
                    $('#tags-area').val('');
                    this.model = new InsertTagsModel({
                        tags:tagsArr,
                        image_id:id
                    });
                }
            }
        }
    });

    var InsertTagsModel = Backbone.Model.extend({
        initialize: function() {
            var newInsertTagsModel = this;
            var data = JSON.stringify(this.attributes);
            // var id = this.attributes.image_id;
            return new Promise(function(resolve,reject) {
                newInsertTagsModel.save(data, {
                    success: function(data) {
                        console.log('hereee');
                        return;
                    }
                }).then(function() {
                    console.log('heyyyyy');
                    Backbone.history.loadUrl();
                }).catch(function(err) {
                    if(err) {
                        console.log(err);
                    }
                });
            });
        },
        url: '/insert-tags'
    })

    var InsertCommentModel = Backbone.Model.extend({
        initialize: function() {
            var newInsertCommentModel = this;
            var data = JSON.stringify(this.attributes);
            // var id = this.attributes.image_id;
            return new Promise(function(resolve,reject) {
                newInsertCommentModel.save(data, {
                    success: function(data) {
                        return;
                    }
                }).then(function() {
                    Backbone.history.loadUrl();
                }).catch(function(err) {
                    if(err) {
                        console.log(err);
                    }
                });
            });
        },
        url:'/insert-comment'
    });

    var UploadModel = Backbone.Model.extend({
        initialize: function() {
            var saveModel = this.save;
            this.on('change', saveModel);
        },

        save: function() {
            var file = this.get('file');
            var params = {
                username: this.get('username'),
                title: this.get('title').toUpperCase(),
                description: this.get('description')
            };
            $.ajax({
                url:'/upload',
                method: 'POST',
                data: file,
                processData: false,
                contentType: false,
                success: function(data) {
                    if(data.success===true) {
                        console.log(data.file);
                        params.url = data.file;
                        $.ajax({
                            url:'/InsertToDb',
                            method: 'POST',
                            data: params,
                            // processData: false,
                            success: function(data) {
                                router.navigate('/images', {trigger:true})
                            }
                        });
                    }
                },
                error: function(err) {
                    console.log(err);
                }
            });
        }
    });


    var UploadView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        render: function() {
            this.$el.html(Handlebars.templates.upload());
        },

        events: {
            'click #submit': function() {
                this.model = new UploadModel();
                var file = $('input[type="file"]').get(0).files[0];
                var formData = new FormData();
                formData.append('file', file);
                this.model.set({
                    username: $('#username').val(),
                    title: $('#title').val().toUpperCase(),
                    description: $('#description').val(),
                    file: formData
                });
            },
            'click #home-button': function() {
                router.navigate('/images', {trigger:true});
            }
        }
    });

    var router = new Router();
    Backbone.history.start();

})();
