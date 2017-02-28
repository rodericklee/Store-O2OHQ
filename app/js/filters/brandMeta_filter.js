app.filter('brandMeta', [ '$rootScope', 'storeService', function($rootScope, $store) {
  return function(brand_id, key) {
    return $rootScope.brand_meta(brand_id, key);
  };
}]);
