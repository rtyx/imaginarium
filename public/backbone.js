(function(){

    var templates = document.querySelectorAll('script[type="text/handlebars"]');

    Handlebars.templates = Handlebars.templates || {};

    Array.prototype.slice.call(templates).forEach(function(script) {
        Handlebars.templates[script.id] = Handlebars.compile(script.innerHTML);
    });


    var Router = Backbone.Router.extend({
        routes: {
            'test': 'test'
        },
        test: function() {
            var testModel = new TestModel();
            console.log("hello");
            new TestView({
                el: '#main',
                model: testModel
            });
        }
    });

    var TestModel = Backbone.Model.extend({
        initialize: function(){
            console.log(this);
        },
        url: '/photos'
    });

    var TestView = Backbone.View.extend({
        initialize: function() {
            var view = this;
            view.render();
            this.model.on('change', function() {
                view.render();
            });
        },
        render: function () {
            this.model.fetch();
            var pictureObject = this.model.get('pictures');
            if(pictureObject){
                console.log(pictureObject);
            }
            this.$el.html(Handlebars.templates.hello({data: pictureObject}));
        },
        clickHandler: function(e){
            e.preventDefault();
            var file = $('input[type="file"]').get(0).files[0];
            var formData = new FormData();
            var inputs = $('#upload :input');
            var values = {};
            var view = this;
            inputs.each(function() {
                values[this.name] = $(this).val();
            });
            values = JSON.stringify(values);
            formData.append('file', file);
            formData.append('values', values);
            $.ajax({
                url: '/photos',
                method: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data){
                    console.log(data);
                    view.render();
                }
            });
        },
        events: {
            'click button': 'clickHandler'
        }

    });

    var router = new Router;

    Backbone.history.start();


})();
