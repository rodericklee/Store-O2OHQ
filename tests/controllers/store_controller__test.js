// TODO: Add tests for store_controller

describe('store_controller.js', function () {

  var scope;
  var controller;

  beforeEach(module('StoreController'));
  describe('StoreController Test', function() {
    beforeEach(inject(function($controller, $scope){
      scope = $scope();
      controller = $controller(
        'StoreController as ctrl', {
          $scope: scope
        });

      it('- to exist and to be an object', function() {
        expect(scope).not.toBeUndefined();
        expect(typeof scope).toBe('object');
      });

      describe('- $scope.$store', function() {
        it('- to exist and to be an object, and contain categories', function () {
          expect(scope.$store).not.toBeUndefined();
          expect(typeof scope.$store).toBe('object');
          expect(Object.keys(scope.$store).length).toBeTruthy();
        });
      });

    }));
  });

});
