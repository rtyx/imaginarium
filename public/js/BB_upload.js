/* eslint-env node, jquery */

window.BB = window.BB || {
	Models: {},
	Collections: {},
	Views: {}
};

var keys = {37: 1, 38: 1, 39: 1, 40: 1};

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
						window.location.reload();
						// BB.router.navigate('/', true);
                        // BB.router.navigate('/images/'+ id.id, true);
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
		this.disableScroll();
        this.$el.append(html);
    },
	enableScroll: function() {
		if (window.removeEventListener)
			window.removeEventListener('DOMMouseScroll', this.preventDefault, false);
			window.onmousewheel = document.onmousewheel = null;
			window.onwheel = null;
			window.ontouchmove = null;
			document.onkeydown = null;
	},
	disableScroll: function() {
		if (window.addEventListener) // older FF
		window.addEventListener('DOMMouseScroll', this.preventDefault, false);
		window.onwheel = this.preventDefault; // modern standard
		window.onmousewheel = document.onmousewheel = this.preventDefault; // older browsers, IE
		window.ontouchmove  = this.preventDefault; // mobile
		document.onkeydown  = this.preventDefaultForScrollKeys;
	},
	preventDefault: function (e) {
		e = e || window.event;
		if (e.preventDefault)
		e.preventDefault();
		e.returnValue = false;
	},
	preventDefaultForScrollKeys: function (e) {
		if (keys[e.keyCode]) {
			preventDefault(e);
			return false;
		}
	},
    submit: function(){
        console.log("Submitting image...");
        var file = $('input[type="file"]').get(0).files[0];
		var author = $('#authorInput').val();
        var title = $('#titleInput').val();
		var descriptionAndHashtags = $('#descriptionInput').val();
		var description = descriptionAndHashtags.replace(/#\S+/ig,"")
		var hashtags = descriptionAndHashtags.match(/#\S+/g);
        var tags = this.removeHash(hashtags);
        var formData = new FormData();
        formData.append('file', file);
        this.model.upload({
            file: formData,
			author: author,
            title: title,
            description: description,
            hashtags: tags
        });
    },
	cancel: function() {
		console.log("Cancelling...");
		this.$el.find('.newBackground').remove();
		this.$el.find('#uploadBox').remove();
		this.enableScroll();
		this.undelegateEvents();
	},
    removeHash: function(array) {
        for (var i = 0; i < array.length; i++) {
            array[i] = array[i].substr(1);
        }
        return array;
    },
    events: {
        'click #submit': 'submit',
		'click #uploadCancel': 'cancel',
		"click .newBackground": "cancel"
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
