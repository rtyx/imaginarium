(function() {
  var pictures  = Backbone.Model.extend({
    initialize :function(imageData){
      this.set(imageData);
      this.on("change",function(){
        console.log("modelChange");
      });
      this.save();
    },
    url:'/image'
  });

  $('#upload').on("submit",function(event){
    event.preventDefault();
    var file = $('input[type="file"]').get(0).files[0];
    var formData = new FormData();
    formData.append('file', file);
    $.ajax({
      url: '/upload',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function(data) {
        var imageData={
          file: data.file,
          name: $('#user_name').val(),
          title: $('#title').val(),
          description: $('#description').val()
        };
        new Image(imageData);
        new HelloView({
          el: '#displayContainer',
          model: new GetImages
        });
        console.log(imageData);
      }
    });
  });



  var templates = document.querySelectorAll('script[type="text/handlebars"]');
  Handlebars.templates = Handlebars.templates || {};
  Array.prototype.slice.call(templates).forEach(function(script) {
    Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
  });

  var Router = Backbone.Router.extend({
    routes: {
      'home': 'home',
      'picture/:id': 'bigImage'
    },
    home: function() {
      this.loadNewView(
        new HelloView({
          el: '#displayContainer',
          model: new GetImages
        })
      );
    },

    bigImage:function(id) {
      this.loadNewView(
        new ImageView({
          el: '#displayImage',
          model: new Image(id)
        })
      );
    },
    loadNewView:function(view){
      if(this.view){
        this.view.remove();
      }
      this.view = view;

    }
  });


  var HelloView = Backbone.View.extend({
    initialize: function() {
      console.log("hello")
      var view = this;
      this.model.on('change', function() {
        view.render();
      });
      view.render();
    },
    render: function() {
      this.$el.html(Handlebars.templates.home(this.model.toJSON()));
    }
  });

  var ImageView = Backbone.View.extend({
    initialize: function(){
      var view = this;
      this.model.on('change',function(){
        view.render();
      });
    },
    render: function() {
      this.$el.html(Handlebars.templates.bigImage(this.model.toJSON()));
    }
  });

  var GetImages = Backbone.Model.extend({
    initialize: function() {
      this.fetch();
    },
    url:'/images'
  });

  var Image = Backbone.Model.extend({
    initialize: function(options) {
      this.set({id:options});
      this.fetch();
    },
    urlRoot:'/image'
  });


  new Router;
  Backbone.history.start();
})();
