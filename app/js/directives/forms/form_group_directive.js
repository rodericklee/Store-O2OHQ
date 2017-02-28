app.directive("formGroup", ['$interpolate', function($interpolate) {
  return {
    template:
    '<div class="form-group label-floating" ng-class="{}" show-errors type="{{type}}">\
      <div class="input-group">\
        <label class="control-label" for="{{for}}">\
          {{label}}\
          <span ng-if="get_is_required()">&#42;</span>\
          </label>\
        <ng-transclude></ng-transclude>\
        <div ng-if="hasError">\
          <span ng-repeat="(key,error) in _.get(form.$name, inputName + \'.$error\')" class="help-block" \
                ng-if="error" translate="form.invalid.{{key}}">\
          </span>\
        </div>\
      </div>\
    </div>',

    restrict: 'E',
    // replace: true,
    transclude: true,
    require: "^form", // Tells Angular the control-group must be within a form

    scope: {
      label: "@", // Gets the string contents of the `label` attribute.
      ngModel: '='
    },

    link: function (scope, element, attrs, form) {
      scope.form = form;
      scope.input = element.find(":input");
      scope.type = (!!_.get(scope.$parent, 'type')) ? scope.$parent.type : '';

      // The <label> should have a `for` attribute that links it to the input.
      // Get the `id` attribute from the input element
      // and add it to the scope so our template can access it.
      //
      // // Get the `name` attribute of the input
      var inputName = $interpolate(scope.input.attr('name') || '')(scope);
      var ngModel_key = (inputName.split('.').length > 1) ? inputName.split('.').pop() : inputName;

      // scope.input.attr('name', inputName);
      // Build the scope expression that contains the validation status.
      // e.g. "form.example.$invalid"
      var form_element_selector =  form.$name + '["' + inputName + '"]';

      scope.for = scope.input.attr("id");

      scope.get_is_required = _.throttle(function() {
        return (
          scope.input.attr("ng-required") == 'true') ||
          Boolean(_.get(scope.$parent, form_element_selector + '.$error.required')
        );
      }, 200);
    }
  };
}]);
