(function() {

    var myApp = angular.module('myApp', []);

    myApp.controller('cityList', function($scope, $http) {
        $http.get('/cities').then(function(resp) {
            console.log("hi!");
            $scope.cities = resp.data;
        });
        // $scope.cities = [
            // {
            //     name: "Berlin",
            //     country: "Germany"
            // },
            // {
            //     name: "Barcelona",
            //     country: "Spain"
            // }
        // ];
        $scope.update = function() {
            console.log($scope.cities);
        };
    });
})();
