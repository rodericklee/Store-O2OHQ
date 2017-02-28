
app.directive('address', ['storeService', function($store) {
  return {
    restrict: "E",
    require: '^form',
    scope: {
      'ngModel': '=',
      'type': '@'
    },
    templateUrl: 'views/partials/ui/templates/address.html',
    link: function (scope, element, attributes, form) {
      scope.inital_ngModel = angular.copy(scope.ngModel);
      scope.$store = $store;
      scope.Form = form;
    },

  };
}]);
