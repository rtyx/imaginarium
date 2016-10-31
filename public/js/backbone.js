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
            'image': 'image'
        },
        home: function(){
            new HomeView({
                model: Image,
                el: '#body'
            });
        },
        upload: function(){
            new uploadView({
                model: new Upload,
                el: '#body'
            });
        }
        // image: function(){
        //     new imageView({
        //         model: Image,
        //         el:'#body'
        //     });
        // }
    });

    var Image = Backbone.Model.extend({
        initialize: function() {
            this.fetch();
        },
        url: '/'
    });
    var image = new Image;

    var HomeView = Backbone.View.extend({
        template: Handlebars.compile($('#imageGrid').html()),
        el: '#body',
        render: function () {
            this.$el.html(this.template(image.toJSON()));
        },
        initialize: function(){
            console.log('Collection view initialized...');
            this.render();
        },
        openupload: function(){
            console.log("button pressed");
            router.navigate("upload", {trigger: true});
        },
        events: {
            'click #uploadbutton': 'openupload'
        }
    });

    var Upload = Backbone.Model.extend({
        url: '/upload'
    });
    var upload = new Upload;

    var uploadView = Backbone.View.extend({
        template: Handlebars.compile($('#uploadcontainer').html()),
        el: '#body',
        render: function(){
            this.$el.html(this.template(upload.toJSON()));
        },
        initialize: function(){
            console.log('upload view initialized...');
            this.render();
            var view = this;
            this.model.on('change', function(){
                view.render();
            });
        },
        submit: function(){
            event.preventDefault();
        //Deal  with all input fields
            var elements = $('#uploadform')[0].elements;
            var inputs = {};
            for (var i = 2; i < 5; i++) {
                if (elements[i].value == '') {
                    $('#message').html("Please complete all text fields");
                    return;
                } else {
                    inputs[elements[i].name] = elements[i].value;
                }
            }
        //Deal with files uploaded
            if ($('input[type="file"]').get(0).files.length != 0){
                var file = $('input[type="file"]').get(0).files[0];
                var formData = new FormData();
                formData.append('file', file);
                $.ajax({
                    url: '/upload',
                    method: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(path) {
                        inputs.path = path;
                        $.ajax({
                            url: '/insert',
                            method: 'POST',
                            data: inputs,
                            success: function(){
                                router.navigate('',{trigger: true});
                            }
                        });
                    }
                });
            }
        //Deal with url image
            else {
                var url = $('input[name="imgurl"]').val();
                if (url == '') {
                    $('#message').html("Please enter a URL or File to upload");
                    return;
                } else if (url.search('http') == -1){
                    $('#message').html("Please enter a valid URL");
                    return;
                } else {
                    $.ajax({
                        url:'/upload',
                        method: 'POST',
                        data: {
                            'url': url,
                            'title': $('input[name="title"]').val()
                        },
                        success: function(path){
                            inputs.path = path;
                            $.ajax({
                                url: '/insert',
                                method: 'POST',
                                data: inputs,
                                success: function(){
                                    router.navigate('',{trigger: true});
                                }
                            });
                        },
                        error: function(err){
                            console.log(err);
                            $('#message').html(err.responseText);
                            return;
                        }
                    });
                }
            }
        },
        events: {
            'click #submit': 'submit'
        }
    });

    var router = new Router;
    Backbone.history.start();
});
