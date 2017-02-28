/*global app*/

app.controller(
  'SearchController', [
    '$scope',
    'sharedProperties',
    '$q',

    function ( $scope, sharedProperties, $q ) {
      'use strict';
      $scope._filtered_brands = [];

      // pagination controls
      $scope.maxSize = 6;
    	$scope.currentPage = 1;
    	$scope.totalItems = $scope.$store.products.length;
    	$scope.itemsPerPage = 16; // items per page
    	$scope.noOfPages = 0;

      $scope.search_query = null;
      $scope.search_category = false;
      $scope.search_rating = 0;

      // nice self–running init function()
      var init; (init = function () {
        var shared_property = sharedProperties.getProperty('search_query');
        $scope.search_query = shared_property || $scope.$state.params.query;
        $scope.current_search_query = $scope.search_query ? $scope.search_query.toLowerCase() : null;

        // Set the sharedProperties value so if the user opens the top nav search
        //    bar the correct value will be in it
        if (!shared_property) {
          sharedProperties.setProperty('search_query', $scope.search_query);
        }

        $scope.sort_by_label = '';

        $scope.$translate('filter.search.sort_options.sort_by')
          .then(function(sort_by) {
            return $scope.$translate('filter.search.sort_options.relevance')
              .then(function(relevance) {
                focus('root.search_products');
                return $scope.sort_by_label = sort_by + ': ' + relevance;
              })
          });

        $scope.sort = {
          'attribute': 'relevance',
          'reverse': false
        };
      })();

      // triggered by the top nav search bar if the user is on this search page
      $scope.$on('search_initiated', function(event, search_query) {
        $scope.search_query = search_query;
      });

      $scope.get_currency_char = function () {
        return ($scope.lang.current() !== 'en') ? '¥' : '$';
      };

      // the sort button has been pressed
      $scope.sort_by = function ($event, attribute, reverse) {
        $scope.sort = {
          'attribute': attribute,
          'reverse': !!reverse
        };

        if (attribute == 'relevance') {
          return $scope.$translate('filter.search.sort_options.sort_by')
            .then(function (sort_by) {
              return $scope.sort_by_label = sort_by + ': ' + $event.currentTarget.innerHTML;
            })
        }

        $scope.currentPage = 1
        return $scope.sort_by_label = $event.currentTarget.innerHTML;
      };

      var _get_search_hash = function() {
        var category_str = (!!$scope.search_category || $scope.search_category.id == '1')
          ? $scope.search_category.id
          : '';

        var rating_str = (!!$scope.search_rating || $scope.search_rating == 0)
          ? 'r' + $scope.search_rating
          : '';

        var str =
          $scope.search_query +
          category_str +
          rating_str;

        str = str.toLowerCase();

        if (Array.prototype.reduce){
            return str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a;},0);
        }

        var hash = 0;
        if (this.length === 0) return hash;
        for (var i = 0; i < this.length; i++) {
            var character  = str.charCodeAt(i);
            hash  = ((hash<<5)-hash)+character;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
      };

      var _filter_matching_brands = function (_search_query) {
        return $q(function(resolve, reject) {
          $scope._filtered_brands = [];

          // if there's nothing searched for, return all the brands
          if (_.isEmpty(_search_query)) {
            return resolve($scope._filtered_brands = $scope.$store.brands);
          }

          return resolve($scope._filtered_brands = _.filter($scope.$store.brands, function(b) {
            return b.name.toLowerCase().indexOf(_search_query) > -1
          }));
        });
      };

      var _filter_matching_products = function (_search_query) {
        return $q(function(resolve, reject) {
          var langs = $scope.lang.available();

          // clear out the filtered products - start off fresh
          $scope._filtered_products = [];

          // filter the matching brands here so that they're avaible for the products
          //    that don't match directly
          _filter_matching_brands(_search_query)
            .then(function() {
              if (
                _.isEmpty(_search_query)
                && _.get($scope.search_category.id) == '1')
               {
                return resolve($scope._filtered_products = $scope.$store.products);
              }

              $scope._filtered_products = _.uniq(
                _.filter($scope.$store.products, function(product) {

                  // If a search category has been set,
                  //     and it's not the root category (there's no reason to preform this opperation if we're viewing the root category)
                  //     force the product to be in the categories progeny (in the category, or in one of it's children)
                  if (
                    !_.isEmpty($scope.search_category) &&
                    _.get($scope.search_category, 'id') !== '1' &&
                    _.isEmpty(_.intersection(product.categories, $scope.search_category.progeny))
                  ) {
                    return false;
                  }

                  if (parseFloat(product.rating.average) < $scope.search_rating) {
                    return false;
                  }

                  // if it's already in the filtered products don't worry about it
                  if (_.includes($scope._filtered_products, product)) {
                    return true;
                  }

                  // Check the SKU
                  if (_.includes(product.sku.toLowerCase(), _search_query)) {
                    return true;
                  }

                  // Quick and dirty search before we go into the langs -- if the product name matches, add it
                  if (_.includes(product.name.toLowerCase(), _search_query)) {
                    return true;
                  }

                  // iterate over all of the product's lang[name] values and add if a match is found
                  if ('lang' in product) {
                    for (var lang_i in langs) {
                      if (!!_.get(product.lang[langs[lang_i]], 'name') && _.includes(product.lang[langs[lang_i]].name.toLowerCase(), _search_query)) {
                        return true;
                      }
                    }
                  }

                  // search brands - they've already been filtered at the beggining of
                  //   the function
                  if (!_.isEmpty($scope._filtered_brands)) {
                    for (var brand_i in $scope._filtered_brands) {
                      if (product.brand.id == $scope._filtered_brands[brand_i].id) {
                        return true;
                      }
                    }
                  }

                })
              );

              return resolve($scope._filtered_products);
            });
        });
      };

      // These two are not meant to be accessed directly, but are contained on the
      //    $scope to prevent scoping problems (ironically ;P )
      $scope._filtered_products = [];
      $scope._filtered_brands = [];

      $scope.filter_hash = '';

      /**
      * An optimized search function - optimized so that it only re-builds the _filtered_products
      *   array if the has of the search terms has changed.
      */
      $scope.search_products = function () {
        // trim and clean up the search
        $scope.search_query = $scope.search_query
          .trim()
          .replace(/\s\s+/g, ' ');

        // disreguard any puncuation, spaces...etc. as well as case insensitive
        var _search_query = $scope.search_query.toLowerCase();

        // setup the hash for the search (combination of search params)
        var current_search_hash = _get_search_hash();

        // Don't re-filter/search if the current search hasn't changed
        if (current_search_hash !== $scope.filter_hash) {
          // Change the URL without reloading the view :)
          $scope.$state.go('root.search', {query:_search_query}, {notify:false, reload:false, location:'replace'});
          sharedProperties.setProperty('search_query', _search_query);

          // filter the products, then update the hash and pagination vars
          _filter_matching_products(_search_query)
            .then(function() {
              $scope.filter_hash = current_search_hash;
              $scope.totalItems = $scope._filtered_products.length;
            });
        }

        return $scope._filtered_products;
      };

      $scope.search_brands = function () {
        // Normally we would search the products, but since the product's ng-repeate
        //   is before the brand ng-repeate we can safely assume that the products &
        //   brands have already been filtered according to the search paramaters
        return $scope._filtered_brands;
      };

      // Sets the search query, and makes sure that the styling for the input box
      //   reflects that it has a value
      $scope.set_search_query = function(str) {
        $('.search-form-container').removeClass('is-empty');
        $scope.search_query = str;
      };

      $scope.set_selected_category = function (id) {
        $scope.$store.get_category({id: id})
          .then(function(category) {
            $scope.search_category = category;
          });
      };

      $scope.get_categories_of_parent = function (parent_category_id) {
        var children = [];
        var categories = $scope.$store.categories;
        var parent = categories[parent_category_id];

        for (var i = 0; i < parent.child_ids.length; i++){
          children.push(categories[parent.child_ids[i]]);
        }

      }

      $scope._filtered_categories = $scope.$store.categories;

      $scope.get_sidebar_categories = function() {
        // If no search_category has been set, return the Root Category/level 1 categories
        if (!$scope.search_category || $scope.search_category.id == '1') {
          return $scope._filtered_categories = _.filter($scope.$store.categories, {'level':'1'});
        }

        var results = _.filter($scope.$store.categories, {
          'parent_id'  :  String($scope.search_category.id),
          'level'      :  String(parseInt($scope.search_category.level) + 1)
        });

        if (!_.isEmpty(results)) {
          return $scope._filtered_categories = results;
        }

        return $scope._filtered_categories;
      }

      $scope.set_search_rating = function(rating_num) {
        $scope.search_rating = rating_num;
      }

    }
  ]
);
