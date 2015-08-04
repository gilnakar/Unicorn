var myApp = angular.module('myApp', ['ngSanitize']);

myApp.controller('MyController', ['$scope', '$http', function($scope, $http) {
  $http.get('js/data.json').success(function(data) {
    $scope.a = data;
    
  });

}]);

