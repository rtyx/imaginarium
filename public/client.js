
(function() {



    var templates = document.querySelectorAll('script[type="text/handlebars"]');

    Handlebars.templates = Handlebars.templates || {};

    Array.prototype.slice.call(templates).forEach(function(script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });




    var Router = Backbone.Router.extend({
        routes: {
            'images': 'images',
            'image': 'image',
            'upload': 'upload'
        },

        upload: function() {

            new UploadView({
                el:"#main"
            });
        },
        images: function(){
            new ImagesView ({
                el:"#images",
                model: new ImagesModel
            });
        }
    });


    // document.body.innerHTML = Handlebars.templates.upload({});

    var UploadModel = Backbone.Model.extend({
        initialize: function() {
            var saveModel = this.save;
            this.on('change', saveModel)
        },

        save: function() {
            var file = this.get('file');
            var params = {
                username: this.get('username'),
                title: this.get('title'),
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
                                console.log(data);
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

var ImagesModel = Backbone.Model.extend({
    initialize: function() {
        var newModel = this;
            this.fetch({
                success: function(data) {
                    var arrOfImages = data.attributes.file;
                    newModel.set({
                        arrOfImages:arrOfImages
                    })
                    $(document).trigger('showImages')
                }
            });
    },
    url: '/images'
})

var ImagesView = Backbone.View.extend({
    initialize: function() {
        var thisView = this;
         $(document).on('showImages', function() {
             var arrOfImages = thisView.model.get('arrOfImages');
             console.log(arrOfImages)
            thisView.render(arrOfImages);
         })
        // this.model = new ImagesModel();
        // this.model.on('change', function(arrOfImages) {
        // });
    },
    render: function(arrOfImages) {
        this.$el.html(Handlebars.templates.showImages(arrOfImages));
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
                    title: $('#title').val(),
                    description: $('#description').val(),
                    file: formData
                });

            }
        }
    });

    var router = new Router();
    Backbone.history.start();

})();
