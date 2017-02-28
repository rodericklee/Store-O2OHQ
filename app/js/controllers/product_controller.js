/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'ProductController', [
    '$scope',
    '$translate',
    '$location',
    '$anchorScroll',
    'product',

    function ( $scope, $translate, $location, $anchorScroll, product ) {
      'use strict';

      var MAXIMUM_CATEGORIES = 2;

      var currentLang = $scope.lang.current().split('-')[0];

      var categories = $scope.$store.categories;

      $scope.breadcrumbs = [];

      if (!_.isEmpty(product.categories)) {
        var productCategory = categories[product.categories[0]];

        $scope.breadcrumbs.push(productCategory.id);

        for (var i = 0; i <= MAXIMUM_CATEGORIES; i++) {
          if ( parseInt(productCategory.parent_id) == 1
            || _.isEmpty(productCategory.ancestry)
            || parseInt(productCategory.ancestry[i]) == 1) {
            break;
          }

          $scope.breadcrumbs.unshift(categories[productCategory.ancestry[i]].id);
        }
      }

      if ( !product ) {
        // $scope.$state.go( 'root.home' );
      } else {
        if ( !!!_.get($scope.$stateParams, 'slug') ) {
          $scope.$state.go('root.product.slug', {sku: product.sku, slug: product.slug}, {notify:false, reload:false, location:'replace'});
        }

        /* calculating the average rating */
        var average = 0.0,
          count = 0;

        if (product.reviews && product.reviews.length > 0 ) {
          for ( var k in product.reviews ) {
            average += product.reviews[ k ].rating;
            count++;
          }

          if ( count > 1 ) {
            average = ( average / count );
          }
        }

        // product.rating = {
        //   average: average,
        //   count: count
        // };

        $scope.product = product;

        // Set other item specific scope vars
        $scope.is_product_in_cart = !!$scope.$cart.getItemBySku(product.sku);
        // $scope.should_show_msrp = (_.get(product.msrp) && product.msrp)

        $scope.thumbnail = {
          active_index: 0,
          active_image: {}, // defaulted to below
          is_active: function ( index ) {
            return $scope.thumbnail.active_index === index;
          },
          show: function ( index ) {
            if ( index in $scope.product.images ) {
              $scope.thumbnail.active_index = index;
              $scope.thumbnail.active_image = $scope.product.images[ index ];
            }
          }
        };

        $scope.thumbnail.show( 0 );

        $scope.$on('$viewContentLoaded', function() {
          // Enable tooltips
          _.delay(function() { // need to wait for digest cycle to finish
            $('[data-toggle="tooltip"]').tooltip();
          },1)
        });
      }

      $scope.gotoAnchor = function(x) {
        var newHash = 'anchor' + x;
        if ($location.hash() !== newHash) {
          // set the $location.hash to `newHash` and
          // $anchorScroll will automatically scroll to it
          $location.hash('anchor' + x);
        } else {
          // call $anchorScroll() explicitly,
          // since $location.hash hasn't changed
          $anchorScroll();
        }
      };

    } ] );
