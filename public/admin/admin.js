var myApp = angular.module('myApp', []);

myApp.controller('imageList',function($scope, $http) {
  $scope.deleteRequest = function(e){
    console.log(e.target.id);
    $http.get('/delete/' + e.target.id).then(function(result){
      $scope.delete= result.data;
      console.log();
    });
  };
  $scope.updateRequest = function(e){
    $http.post('/update/' + e.target.id).then(function(result){
      $scope.update= result.data;
      console.log(result.data);
    });
  };
  $http.get('/images').then(function(result){
    $scope.images= result.data.images;
  })
  .catch(function(err){
    console.log(err);
  });
});
