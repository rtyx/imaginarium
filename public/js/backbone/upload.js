site.models.Upload = Backbone.Model.extend({
    url: '/upload',
    putData: function(inputs){
        $.post({
            url: '/insert',
            data: inputs,
            success: function(data){
                site.router.navigate('image/' + data.id,{trigger: true});
            }
        });
    }
});
var upload = new site.models.Upload;

site.views.upload = Backbone.View.extend({
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
        if (elements[5].value != '') {
            inputs.tags = elements[5].value.split(",");
            inputs.tags = inputs.tags.map(function(elem){
                return elem.trim();
            });
        }
        var view = this;
    //Deal with files uploaded
        if ($('input[type="file"]').get(0).files.length != 0){
            var file = $('input[type="file"]').get(0).files[0];
            var formData = new FormData();
            formData.append('file', file);
            $.post({
                url: '/upload',
                data: formData,
                processData: false,
                contentType: false,
                success: function(path) {
                    inputs.path = path;
                    view.model.putData(inputs);
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
                $.post({
                    url:'/upload',
                    data: {
                        'url': url,
                        'title': $('input[name="title"]').val()
                    },
                    success: function(path){
                        inputs.path = path;
                        view.model.putData(inputs);
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
