
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
            'images/:tag': 'tags',
            'error':'error'
        },
        upload: function() {
            $('#main').off();
            new UploadView({
                el:"#main",
                model: new UploadModel
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
        tags: function(tag) {
            $('#main').off();
            new ImagesView({
                el:"#main",
                model: new TagModel({tag:tag})
            });
        },
        error: function() {
            $('#main').off();
            new ErrorView({
                el:"#main"
            });
        }

    });

    var ErrorView = Backbone.View.extend({
        initialize: function() {
            this.render();
        },
        render: function() {
            this.$el.html(Handlebars.templates.error())
        },
        events: {
            'click #home-button': function() {
                router.navigate('/images', {trigger:true});
            }
        }


    })

    var ImagesModel = Backbone.Model.extend({
        initialize: function() {
            var newModel = this;
            this.fetch({
                success: function(data) {
                    newModel.trigger('showImages');
                }
            });
        },
        url: '/images'
    });

    var ImagesView = Backbone.View.extend({
        initialize: function() {
            var newImagesView = this;
            this.model.on('showImages', function() {
                newImagesView.render();

            });
        },
        render: function() {
            this.$el.html(Handlebars.templates.showImages(this.model.toJSON()));
        },
        events: {
            'click #upload-button': function() {
                router.navigate('/upload', {trigger:true});
            },
            'click #home-button': function() {
                router.navigate('/images', {trigger:true});
            }
        }
    });



    var ImageModel = Backbone.Model.extend({
        initialize: function() {
            var newImageModel = this;
            this.fetch({
                success: function(data) {
                    console.log(data);
                    if(data.attributes.file.image.length>0) {
                        newImageModel.trigger('showImage');
                    }
                    else {
                        console.log('navigating');
                        router.navigate('/error', {trigger:true});

                    }
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
            });
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
                    alert('Please fill all the fields');
                }
                else {
                    var id = this.model.attributes.file.image[0].id;
                    $('#comment-area').val('');
                    $('#user_comment').val('');
                    this.model = new InsertCommentModel({
                        comment:comment,
                        image_id:id,
                        username_comment:usernameComment
                    });
                }
            },
            'click #submit-tags': function() {
                var tags = $('#tags-area').val();
                var tagsArr = tags.split(',').map(function(str) {
                    return str.trim();
                });
                if (tags.length===0) {
                    alert('Please specify a tag');
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

    var TagModel = Backbone.Model.extend({
        initialize: function() {
            var newTagModel = this;
            this.fetch({
                success: function(data) {
                    newTagModel.set({
                        button:true
                    })
                    console.log(newTagModel);
                    newTagModel.trigger('showImages');
                }
            });
        },
        url: function() {
            return '/images/'+ this.attributes.tag;
        }
    });



    var InsertTagsModel = Backbone.Model.extend({
        initialize: function() {
            var newInsertTagsModel = this;
            var data = JSON.stringify(this.attributes);
            console.log(this.attributes);
            var id = this.attributes.image_id;
            return new Promise(function(resolve,reject) {
                newInsertTagsModel.save(data, {
                    success: function(data) {
                        console.log(router.image);
                        return;
                    }
                }).then(function() {
                    router.image(id);
                }).catch(function(err) {
                    if(err) {
                        console.log(err);
                    }
                });
            });
        },
        url: '/insert-tags'
    });

    var InsertCommentModel = Backbone.Model.extend({
        initialize: function() {
            var newInsertCommentModel = this;
            var data = JSON.stringify(this.attributes);
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
                                router.navigate('/images', {trigger:true});
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
            'click #submit-photo': function() {
                console.log('submit!');
                // this.model = new UploadModel();
                var file = $('input[type="file"]').get(0).files[0];
                var formData = new FormData();
                formData.append('file', file);
                var username = $('#username').val();
                var title = $('#title').val().toUpperCase();
                var description = $('#description').val();
                this.model.set({
                    username: username,
                    title: title,
                    description: description,
                    file: formData
                });
                console.log(this.model);
            },
            'click #home-button': function() {
                router.navigate('/images', {trigger:true});
            }
        }
    });

    var router = new Router();
    Backbone.history.start();

})();
