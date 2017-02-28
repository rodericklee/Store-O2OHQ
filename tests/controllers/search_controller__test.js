// TODO: Add tests for store_controller

describe('SearchController', function () {


  beforeEach(module('o2o_store'));

  var $controller;
  var $scope = {};

  beforeEach(inject(function(_$controller_, _$rootScope_){
    // The injector unwraps the underscores (_) from around the parameter names when matching

    $controller = _$controller_;
    $scope = _$rootScope_;
    $scope.$store.get_store().then(function ($store) {
      console.log($store)
    });
    // $scope.$store = storeService;
    // $scope.$state = $state;
    // $scope.$stateParams = $stateParams;
    // $scope.$translate = $translate;
  }));

  it('- to exist and to be an object', function() {
    var controller = $controller('SearchController', { $scope: $scope });
    expect($scope).not.toBeUndefined();
    expect(typeof $scope).toBe('object');
    expect(Object.keys($scope.categories).length).toBe(0);
  });

  // describe('- $$scope.categories', function() {
  //   it('- to exist and to be an object, and contain categories', function () {
  //     var $scope = {};
  //     var controller = $controller('SearchController', { $scope: $scope });
  //
  //     expect($scope.categories).not.toBeUndefined();
  //     expect(typeof $scope.categories).toBe('object');
  //     expect(Object.keys($scope.categories).length).toBeTruthy();
  //   });
  // });


});
