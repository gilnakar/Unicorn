var myApp = angular.module('myApp', []);

myApp.controller('MyController', ['$scope', '$http', function($scope, $http) {
  $http.get('js/data.json').success(function(data) {
    $scope.a = data;
  });

}]);

// function multiply(){
// var a=Number(document.
//          getElementById('QTY').value);
// var b=33;
// var c=a*b;
// document.getElementById('TOTAL').value=c;

// };