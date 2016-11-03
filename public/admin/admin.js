(function() {

    var myApp = angular.module('myApp', []);
    // var url = $("#image-url").val();

    myApp.controller('admin', ['$scope', '$http', function($scope,$http) {

        $scope.submit = function() {
            var url = $scope.text;
            var id = url.slice(url.lastIndexOf('/')+1);
            var obj = {'id':id};
            $http.post('/admin/get-pic', obj).then(function(result) {
                $scope.image = result.data.file.image[0];
                $scope.comments = result.data.file.comments;
            });
        };

        $scope.deleteComment = function(e) {
            var id = e.target.id;
            $http.delete('/admin/deleteComment/' + id).then(function(result) {
                $scope.comments = $scope.comments.filter(function(obj) {
                    return obj.id!==id;
                });
            });
        };

        $scope.deleteImage = function(e) {
            var id = e.target.id;
            $http.delete('/admin/deleteImage/' + id).then(function(result){
                $scope.image = {};
                $scope.comments = {};
                $('#image-url')[0].value = '';
                alert('picture is deleted');
            });
        };

        $scope.updateDescription = function(e) {
            var id = e.target.id;
            var desc = $('#description').val();
            console.log(desc);
            var obj = {
                'id':id,
                'desc':desc
            };
            $http.post('/admin/updateDesc', obj).then(function(result) {
                console.log(result);
            });
        };

        $scope.updateTitle = function(e) {
            var id = e.target.id;
            var title = $('#title')[0].value.toUpperCase();
            console.log(title);
            var obj = {
                'id':id,
                'title':title
            };
            console.log(obj);
            $http.post('/admin/updateTitle', obj).then(function(result) {
                console.log(title);
                $('#title')[0].value = title;
            });

        }

    }]);


})();
