app.directive("referralInput", ['$storeService', function($store) {
  return {
    template:
    '<div class="referral-input-container">\
      <div ng-if=""></div>\
    </div>',

    restrict: 'E',
    require: "^form", // Tells Angular the control-group must be within a form

    scope: {
      ngModel: '='
    },

    link: function (scope, element, attrs, form) {
      scope.$store = $store;
      scope.form = form;
    }
  };
}]);
