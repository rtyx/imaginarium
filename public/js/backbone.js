(function() {
  var pictures  = Backbone.Model.extend({
    initialize :function(imageData){
      this.set(imageData);
      this.on("change",function(){
      });
      this.save();
    },
    url:'/image'
  });


  var templates = document.querySelectorAll('script[type="text/handlebars"]');
  Handlebars.templates = Handlebars.templates || {};
  Array.prototype.slice.call(templates).forEach(function(script) {
    Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
  });

  var Router = Backbone.Router.extend({
    routes: {
      'home': 'home',
      'upload':'upload',
      'picture/:id': 'bigImage'
    },
    home: function() {
      this.loadNewView(
        new AllImagesView({
          el: '#displayContainer',
          model: new ImageList()
        })
      );
    },


    bigImage:function(id) {
      this.loadNewView(
        new ImageView({
          el: '#displayContainer',
          model: new Image({id:id})
        })
      );
    },

    loadNewView:function(view){
      if(this.view){
        this.view.undelegateEvents();
      }
      this.view = view;
    }
  });


  var AllImagesView = Backbone.View.extend({
    initialize: function() {
      var view = this;
      this.model.on('change', function() {
        view.render();
      });
      view.render();
    },
    render: function() {
      this.$el.html(Handlebars.templates.home(this.model.toJSON()));
    },
    events:{
      'submit #upload': function(){
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
            console.log(imageData);
            new ImageRecord(imageData);
            new AllImagesView({
              el: '#displayContainer',
              model: new ImageList()
            });
            console.log(imageData);
          }
        });
      }
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
      new CommentsView ({
        el:'#commentContainer',
        model:new CommentsModel(this.model.attributes.id)
      });
    }
  });

  var CommentsView = Backbone.View.extend({
    initialize: function(){
      var view = this;
      this.model.on('change',function(){
        view.render();
      });
      view.render();
    },
    render: function(){
      var data = turnObjectinArray(this.model.attributes);
      this.$el.html(Handlebars.templates.comments(data));
      console.log(data);
    },
    events:{
      'submit #commentsForm': function(e) {
        e.preventDefault();//this is where we need to deal with comments and comment
        var comment = this.$el.find('#comment').val();
        var name = this.$el.find('#user_name').val();
        this.model.addComment({
          name: name,
          comment:comment
        });

      }
    }
  });

  var CommentsModel= Backbone.Model.extend({
    initialize: function(id) {
      this.set({id:id});
      console.log(this);
      this.fetch();
    },
    addComment: function(comment){
      var model = this;
      $.ajax({
        method:"put",
        url:"/comments/"+ this.id,
        data: comment,
        success: function(){
          model.fetch();
        }
      })
    },
    urlRoot:'/comments'
  });

  var ImageList = Backbone.Model.extend({
    initialize: function() {
      this.fetch();
    },
    url:'/images'
  });

  var ImageRecord = Backbone.Model.extend({
    initialize: function(options) {
      this.save();
      //  this.set({id:options});
      //this.fetch();
    },
    url:'/pictures'
  });

  var Image= Backbone.Model.extend({
    initialize: function(options) {
      this.fetch();
    },
    urlRoot:'/image'
  });


  var UploadView= Backbone.View.extend({
    initialize:function(){
      this.$el.html(Handlebars.templates.upload());
    }
  });

  var imageListModel=new ImageList();


function turnObjectinArray(obj){
  var array = [];
  for(var key in obj){
    array.push(obj[key]);
  }
  return array;
}

  new Router;
  Backbone.history.start();
})();
