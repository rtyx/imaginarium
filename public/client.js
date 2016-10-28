
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
            'upload': 'upload'
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
                    })
                    newModel.trigger('showImages')
                }
            });
        },
        url: '/images'
    })

    var ImagesView = Backbone.View.extend({
        initialize: function() {
            var thisView = this;
            // console.log('images model ')
            // console.log(thisView.model);
            this.model.on('showImages', function() {
                var arrOfImages = thisView.model.get('arrOfImages');
                console.log(arrOfImages)
                thisView.render(arrOfImages);
            })
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


    var ImageModel = Backbone.Model.extend({
        initialize: function() {

            // console.log(id);
            var newImageModel = this;
            this.fetch({
                success: function() {
                    newImageModel.trigger('showImage');
                }
            });

        },
        url: function() {
            return '/image/'+this.id;

        }
    })

    var ImageView = Backbone.View.extend({
        initialize: function() {
            var newImageView = this;
            this.model.on('showImage', function() {
                console.log(newImageView.model.toJSON());
                newImageView.render();
            })
        },
        render: function(arrOfImage) {
            this.$el.html(Handlebars.templates.showImage(this.model.toJSON()));

        },
        events: {
            'click #upload-button': function() {
                router.navigate('/upload', {trigger:true});

            },
            'click #home-button': function() {
                router.navigate('/images', {trigger:true});
            }
        }
    })



    var UploadModel = Backbone.Model.extend({
        initialize: function() {
            var saveModel = this.save;
            this.on('change', saveModel)
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
                                console.log('data');
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
