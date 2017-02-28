
app.directive('addressSelect', ['$rootScope', 'storeService', function($rootScope, $store) {
  return {
    restrict: "E",
    require: '^form',
    scope: {
      'ngModel': '=',
      'type': '@'
    },
    template:
    '<div ng-if="display_change">\
        <div class="col-xs-8" ng-class="{\'text-lighter-2x\': (should_display_address_form && is_hover_discard)}">\
          <p ng-bind-html="get_html_address_display()" class="display-inline address-display"></p>\
        </div>\
        <div ng-if="!!$store.user" class="btn-group pull-right" role="group">\
          <a ng-if="should_display_address_form" ng-click="comfirm_address()" \
            class="btn btn-success"\
            >\
            <i class="material-icons material-icons-check"></i>\
          </a>\
          <a ng-click="toggle_should_display_address_form()" \
            ng-mouseover="discard_hover(true)"\
            ng-mouseleave="discard_hover(false)"\
            class="btn btn-default"\
            ng-class="{\'btn-danger\': should_display_address_form}"\
            >\
            <i class="material-icons" ng-class="icon_class_str"></i>\
          </a>\
        </div>\
      </div>\
      <div class="clearfix"></div>\
      <div ng-if="should_display_address_form">\
        <hr ng-if="display_change" class="b20">\
        <address type="{{type}}" ng-model="ngModel"></address>\
        <div ng-if="display_change" class="btn-group pull-right">\
          <a ng-click="toggle_should_display_address_form()" \
            class="btn btn-default btn-raised"\
            >\
            <i class="material-icons material-icons-delete_forever"></i>\
            <span translate="{{toggle_button_text}}"></span>\
          </a>\
          <a ng-if="should_display_address_form" ng-click="comfirm_address()" \
            class="btn btn-success btn-raised"\
            >\
            <i class="material-icons material-icons-check"></i>\
            <span translate="general.save"></span>\
          </a>\
        </div>\
      </div>',
    link: function (scope, element, attributes, form) {
      scope.inital_ngModel = angular.copy(scope.ngModel);
      scope.display_change = !_.isEmpty(_.get(scope.ngModel, 'id'));
      scope.should_display_address_form = (!scope.display_change);
      scope.is_hover_discard = false;
      scope.$store = $store;
      scope.icon_class_str = 'material-icons-edit';

      scope.toggle_should_display_address_form = function() {
        if (!!scope.should_display_address_form) {
          scope.reset();
        }
        scope.should_display_address_form = !scope.should_display_address_form;
        scope.update_toggle_btn_txt();
      };

      scope.comfirm_address = function() {
        scope.should_display_address_form = false;
        scope.inital_ngModel = angular.copy(scope.ngModel);
        scope.update_toggle_btn_txt();
      };

      scope.discard_hover = function(status) {
        scope.is_hover_discard = (status == undefined) ? false : status;
      };

      // auto running/initalizing function
      (scope.update_toggle_btn_txt = function() {
        scope.icon_class_str = "material-icons-" + (
            (!scope.should_display_address_form)
              ? 'edit'
              : 'clear'
          )
        scope.toggle_button_text = "general.address." + (
          (scope.should_display_address_form)
            ? "discard_changes"
            : "change_address"
          );
      })();

      scope.reset = function() {
        scope.ngModel = angular.copy(scope.inital_ngModel);
        scope.ngModel.country = _.find($store.countries, {id: scope.ngModel.country_id});
        scope.ngModel.zone = _.find($store.zones, {id: scope.ngModel.zone_id});
      };

      scope.get_html_address_display = function() {
        var should_show_inital = !!(scope.is_hover_discard && scope.should_display_address_form);
        return $store.format_html_address( (should_show_inital) ? scope.inital_ngModel : scope.ngModel );
      }
    },

  };
}]);
