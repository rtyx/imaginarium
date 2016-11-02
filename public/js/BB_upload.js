/* eslint-env node, jquery */

window.BB = window.BB || {
	Models: {},
	Collections: {},
	Views: {}
};

BB.Models.Upload = Backbone.Model.extend({
    upload: function(data) {
        console.log("Uploading...");
        var model = this;
        $.ajax({
            url: '/upload',
            type: 'POST',
            data: data.file,
            processData: false,
            contentType: false,
        })
        .done(function(path) {
            console.log("Uploaded successfully!");
            data.url = path.file;
            console.log("Saving in database...");
            model.save(data,
                {
                    success: function(id) {
                        console.log("All the information saved!");
                        BB.router.navigate('/images/'+ id.id, true);
                    }
                }
            );
        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            console.log("complete");
        });
    },
    url: '/save',
    processData: false,
    contentType: false,
    initialize: function() {
        console.log("Upload model " + this.cid + " generated!");
    }
});

BB.Views.Upload = Backbone.View.extend({
    template: Handlebars.compile($('#uploadTemplate').html()),
    el: '#content',
    render: function () {
        var html = this.template(this.model.toJSON());
        this.$el.append(html);
    },
    submit: function(){
        console.log("Submitting image...");
        var file = $('input[type="file"]').get(0).files[0];
        var title = $('#titleInput').val();
		var descriptionAndHashtags = $('#descriptionInput').val();
		var description = descriptionAndHashtags.replace(/#\S+/ig,"")
		var hashtags = descriptionAndHashtags.match(/#\S+/g);
        var tags = this.removeHash(hashtags);
        var formData = new FormData();
        formData.append('file', file);
        this.model.upload({
            file: formData,
            title: title,
            description: description,
            hashtags: tags
        });
    },
    removeHash: function(array) {
        for (var i = 0; i < array.length; i++) {
            array[i] = array[i].substr(1);
        }
        return array;
    },
    events: {
        'click #submit': 'submit',
    },
    initialize: function() {
        console.log("Upload view for " + this.model.cid + " generated!");
        this.render();
        var view = this;
        this.model.on('change', function(){
            view.render();
        });
    }
});
