(function() {

    var myApp = angular.module('myApp', []);

    myApp.controller('index', function($scope, $http) {
        $http.get('/admin/index').then(function(resp) {
            $scope.index = resp.data;
        });
        $scope.update = function() {
            console.log("Updating...");
            var tags = this.image.hashtags;
            var newTags;
            if (typeof tags == "object") {
                newTags = tags;
            } else {
                newTags = tags.split(',');
            }
            var url = '/admin/update/';
            var data = {
                id: this.image.id,
                description: this.image.description,
                hashtags: newTags
            };
            $http.post(url, data).then(function() {
                alert("Updated!");
            });
        };
        $scope.delete = function() {
            console.log("Deleting...");
            var url = '/admin/delete/';
            var data = {
                id: this.image.id,
            };
            $http.post(url, data).then(function(resp) {
                console.log(resp);
                alert("Deleted!");
                $http.get('/admin/index').then(function(resp) {
                    $scope.index = resp.data;
                });
            });
        };
    });
})();
