app.directive("allProductReviews", ['reviewsService', function (reviewsService) {
  return {
    restrict: "E",
    scope: {
      _product: "=ngModel"
    },
    templateUrl: 'views/partials/store/reviews/all-reviews.html',
    link: function (scope, elem, attrs) {
      'use strict';
      
      scope.product = angular.copy(scope._product);
  
      scope.reviews = [];
      scope.noMoreReviews = false;
  
      var currentReviewOffset = 0;
  
      reviewsService
      .getProductReviews(scope.product.id, 3, currentReviewOffset)
      .then(function(res) {
        scope.reviews = res;
        if (currentReviewOffset + 3 >= scope.product.rating.num_reviews)
          scope.noMoreReviews = true;
      });
  
      scope.moreReviews = function() {
        currentReviewOffset += 3;
    
        if (currentReviewOffset + 3 >= scope.product.rating.num_reviews)
          scope.noMoreReviews = true;
    
        reviewsService
        .getProductReviews(scope.product.id, 3, currentReviewOffset)
        .then(function(res) {
          scope.reviews = _.concat(scope.reviews, res);
        });
      }
    }
  }
}]);
