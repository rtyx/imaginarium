/* eslint-env node, jquery */

window.BB = window.BB || {
	Models: {},
	Collections: {},
	Views: {}
};

BB.Models.Image = Backbone.Model.extend({
	baseUrl: '/images',
	url: function() {
		return this.baseUrl + '/' + this.id;
	},
	initialize: function() {
		this.fetch('id');
		console.log('New instance of Image Model (' + this.cid + ') created...');
	},
});

BB.Views.Image = Backbone.View.extend({
	template: Handlebars.compile($('#imageTemplate').html()),
	className: 'selectedCard',
	el: '#content',
	createCommentsView: function () {
		new BB.Views.Comments({
			model: new BB.Models.Comments({
				id: this.model.attributes.id
			})
		});
	},
	render: function () {
		var image = this.model.attributes;
		if (!image) {
			this.$el.html('Image not found!');
			return;
		}
		var html = this.template(this.model.toJSON());
		this.disableScroll();
		this.$el.append(html);
		this.createCommentsView();
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
	initialize: function(){
		console.log('New instance of Image View (' + this.model.cid + ') created...');
		var view = this;
		this.model.on('change', function() {
			view.render();
		});
	},
	cancel: function() {
		console.log("Cancelling...");
		this.$el.find('.newBackground').remove();
		this.$el.find('.cancel').remove();
		this.$el.find('.selectedCard').remove();
		this.enableScroll();
		this.undelegateEvents();
	},
	events: {
		"click .cancel": "cancel",
		"click .newBackground": "cancel"
	}
});

//
// doge
