/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'StoreController', [
    '$scope',
    '$store',
    '$q',

    function ( $scope, $store, $q ) {
      'use strict';

      $scope.$q = $q;

      $scope.active = 0;
      $scope.slides = [
        {
          id: 0,
          src: 'assets/images/home/banner2.jpg',
          background: 'rgb(241, 83, 35);'
        },
        {
          id: 1,
          src: 'assets/images/home/banner.jpg',
          background: 'rgb(238, 238, 238);'
        }
      ];

      // $scope.$store.products = [];
      $scope.$store.featured_products = [];
      var num_pag = 15;

      // wrapping this into a function for some promise magic
      (function() {
        return $q(function(resolve, reject) {
          if (!!$scope.$store.marketer.user && _.size($scope.$store.marketer_products) > 0 ) {
            resolve($q.all(
              _.map($scope.$store.marketer_products, function (p_id) {
                return $scope.$store.get_product({id: p_id});
              })
            ));
          } else {
            resolve($scope.$store.products);
          }
        })
        .then(function(products) {
          return _.compact(
            _.map(products, function(p) {
              if (!!_.get(p, 'id')) {
                if (_.includes($scope.$store.marketer_featured, p.id)) {
                  $scope.$store.featured_products.push(p);
                } else {
                  return p;
                }
              } else {
                return null;
              }
            })
          );
        })
        .then(function(products) {
          return (_.isEmpty(products) && _.isEmpty($scope.$store.featured_products)) ? $scope.$store.products : products;
        })
        .then(function(_products) {
          $scope.pag_products = _.chunk(_products, num_pag);
          $scope.load_more()
        });
      })();

      $scope.load_more = function() {
        if (_.size($scope.pag_products) !== 0) {
          $scope.products = (_.size($scope.products) > 0)
            ? _.concat($scope.products, _.pullAt($scope.pag_products, 0)[0])
            : _.pullAt($scope.pag_products, 0)[0];
        }
      };

      _.delay(function() {
        $scope.$store.check_app_version()
          .then(function(update_url) {
            if (!!update_url && $scope.is_mobile_app()) {
              $scope.$notify.error(
                $scope.$translate.instant('notify.app_upgrade.update_needed')
                  + '<a href="' + update_url + '" class="btn btn-default btn-sm btn-raised">'
                  + $scope.$translate.instant('notify.app_upgrade.download_now') + ' <i class="material-icons material-icons-update"></i></a>',

                'bottom_left'
              );
            }
          });
      }, 2000);
} ] );
