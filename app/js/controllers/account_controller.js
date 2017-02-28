/*global app*/

app.controller(
  "AccountController", [
    '$scope',
    '$rootScope',
    '$location',
    '$anchorScroll',
    'DTOptionsBuilder',

    function ( $scope, $rootScope, $location, $anchorScroll, DTOptionsBuilder ) {
      "use strict";


      $scope.dtOptions = {};

      var setup_dataTables_options;
      (setup_dataTables_options = function() {
        $scope.dtOptions = DTOptionsBuilder.newOptions()
          .withLanguageSource('/assets/json/translate/datatables/' + $scope.lang.current() + '.json')
          .withBootstrap();
        $scope.dtOptions.order = [[0, 'desc']];
      })();

      $rootScope.$on('$translateChangeSuccess', function() {setup_dataTables_options();});

      // {
      //   'hasBootstrap': true,
      //   'oClasses': {
      //     'sPageButtonActive': 'active'
      //   }
      // }

      console.log($scope.$state.current.name);

      $scope.subtitle = '';

      var root_account = function () {
        if (!$scope.$store.user) {
          $scope.$notify.error.translate('notify.error.account_must_be_loggedin');
          $scope.$state.go( "root.login" );
        }

        $scope.$translate('account.my_orders')
          .then(function(str) {
            $scope.subtitle = str;
          });
        $scope.show_banner = true;
      };

      var root_account_order = function() {
        $scope.$translate('account.my_account')
          .then(function(str) {
            $scope.subtitle = str;
          });

        var bad_order = true;
        $scope.order_identifier = '';
        $scope.order = false;

        if ('order_id' in $scope.$stateParams) {
          $scope.order_identifier = $scope.$stateParams.order_id;
          bad_order = false;

          $scope.$store.get_orders($scope.order_identifier)
            .then(function(order) {
              if (order) {
                $scope.order = order;
                $scope.order_identifier = order.invoice_no;
              } else {
                $scope.order = false;
              }
            });
        }

        if (bad_order) {
          $scope.$notify.error('Error: Did not reconize the order_id.');
          $scope.$state.go( "root.account" );
        }
      };

      $scope.commissions_calc = {
        total: 0.00,
        total_yuan: 0.00,
        percentage: 0,
        percentage_to_next: 100,
        next_percentage: 0,
        next_percentage_payout_usd: 0.00
      };

      var root_account_commissions = function () {

        _.map($scope.$store.customer_orders, function(o) {
          $scope.commissions_calc.total += parseFloat(o.subtotal);
        });

        $scope.commissions_calc.total_yuan = $scope.commissions_calc.total * $scope.$store.yuan_conversion_rate;

        for (var i in $scope.$store.commissions_table) {
          if ($scope.$store.commissions_table[i] >= $scope.commissions_calc.total_yuan) {
            var cperc = _.toInteger(i);
            $scope.commissions_calc.percentage = cperc;

            if ((cperc+1) in $scope.$store.commissions_table) {
              $scope.commissions_calc.next_percentage = cperc+1;
              $scope.commissions_calc.next_percentage_payout_usd =
                (
                  $scope.commissions_calc.next_percentage
                  *
                  $scope.$store.commissions_table[cperc+1]
                ) / $scope.$store.yuan_conversion_rate;

              $scope.commissions_calc.percentage_to_next = $scope.$store.commissions_table[cperc+1] / $scope.commissions_calc.total_yuan;
            }

            break;
          }
        }
      };

      $scope.scroll_to = function(id) {
        $location.hash(id);
        $anchorScroll();
      };

      $scope.sentance_case = function(str) {
        return (!!!str) ? str : str
          .replace(/_/g, ' ')
          .replace(
            /([^a-z]|^)([a-z])(?=[a-z]{2})/g,
            function(_, g1, g2) {
              return g1 + g2.toUpperCase();
            }
          );
      };

      $scope.stateChange = function() {
        setTimeout(function() {
          if ($scope.$state.current.name === 'root.account') {
            root_account();
          }

          if ($scope.$state.current.name === 'root.account.order') {
            root_account_order();
          } else {
            root_account_commissions();
          };
        }, 1);
      };

      $scope.$on('$stateChangeStart', function() {
        $scope.stateChange();
      });

      $scope.stateChange();

} ] );
