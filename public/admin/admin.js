(function() {

    var myApp = angular.module('myApp', []);
    // var url = $("#image-url").val();

    myApp.controller('admin', ['$scope', '$http', function($scope,$http) {

        $scope.submit = function() {
            var url = $scope.text;
            var id = url.slice(url.lastIndexOf('/')+1);
            var obj = {'id':id}
            $http.post('/admin/get-pic', obj).then(function(result) {
                $scope.image = result.data.file.image[0];
                $scope.comments = result.data.file.comments;
            });
        }

        $scope.deleteComment = function(e) {
            var id = e.target.id;
            $http.delete('/admin/deleteComment/' + id).then(function(result) {
                console.log(result);
                // $scope.$apply();
            });
        };

        $scope.deleteImage = function(e) {
            var id = e.target.id;
            $http.delete('/admin/deleteImage/' + id).then(function(result) {
                //  $window.location.reload();
            });
        }

        $scope.updateDescription = function(e) {
            var id = e.target.id;
            var desc = $('#description').val();
            console.log(desc);
            var obj = {
                'id':id,
                'desc':desc
            }
            $http.post('/admin/updateDesc', obj).then(function(result) {
                console.log(result);
                // $scope.image = result.data.file.image[0];
                // $scope.comments = result.data.file.comments;
            });

        }



    }])


})();


// $http.post('/someUrl', data, config).then(successCallback, errorCallback);
//
//
// app.post('/admin/image')

// <form ng-submit="submit()" ng-controller="ExampleController">
//   Enter text and hit enter:
//   <input type="text" ng-model="text" name="text" />
//   <input type="submit" id="submit" value="Submit" />
//   <pre>list={{list}}</pre>
// </form>
//



// angular.module('submitExample', [])
// .controller('ExampleController', ['$scope', function($scope) {
//     $scope.list = [];
//     $scope.text = 'hello';
//     $scope.submit = function() {
//         if ($scope.text) {
//             $scope.list.push(this.text);
//             $scope.text = '';
//         }
//     };
// }]);
// </script>
