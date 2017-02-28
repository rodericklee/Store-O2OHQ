/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  "AccountReviewsController", [
    '$scope',
    'storeService',
    'reviewsService',
    
    function ($scope, store, reviewsService) {
      "use strict";
      
      var user = store.user;
      
      $scope.unreviewedProducts = [];
      $scope.reviewedProducts = [];
      
      $scope.activeReview = 0;
      
      $scope.getProductsAndReviews = function () {
        reviewsService
        .getProductsWithReviews()
        .then(function (reviewedProducts) {
          $scope.reviewedProducts = reviewedProducts;
          console.log(reviewedProducts);
        })
  
        reviewsService
        .getUnReviewedProducts()
        .then(function (products) {
          $scope.unreviewedProducts = products;
        });
      }
  
      $scope.getProductsAndReviews();
    }
  ]);
