var admin = angular.module('imageboard', []);

admin.controller('imageContainer', function($scope, $http) {
    var count = 6;
    var offset = 0;
    var images;

    $http({
        url: '/grid',
        method: 'GET',
        params: {
            "count": count,
            "offset": offset
        }
    }).then(function(resp){
        images = resp.data.data.rows;
        $scope.images = images;
    });
    $scope.getmore = function(){
        count += 6;
        offset += 6;
        $http({
            url: '/grid',
            method: 'GET',
            params: {
                "count": count,
                "offset": offset
            }
        }).then(function(resp){
            console.log("got");
            images = resp.data.data.rows;
            if (images.length == 0) {
                $scope.done = true;
            } else {
                [].push.apply($scope.images,images);
            }
        });
    };
    $scope.edit = function(){
        $http({
            url: '/admin/edit',
            method: 'POST',
            params: {
                "description": this.image.description,
                "title": this.image.title,
                "id": this.image.id
            }
        });
    };
    $scope.erase = function(){
        var index = $scope.images.indexOf(this.image);
        $scope.images.splice(index,1);
        $http({
            url:'/admin/delete',
            method: 'POST',
            params: {
                "id": this.image.id
            }
        });
    };
});
