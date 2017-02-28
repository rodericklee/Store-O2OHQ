app.directive("unreviewedProduct",
  [
    'reviewsService',
  function (reviewsService) {
  return {
    restrict: "E",
    scope: false,
    templateUrl: 'views/partials/account/unreviewed_product.html',
    link: function (scope, elem, attrs) {
  
      scope.product.rating._current = 0;
      
      scope.isReviewing = false;
      scope.submitted = false;
      
      scope.$watch('product.rating._current', function (newValue, oldValue) {
        if (newValue > 0) {
          scope.isReviewing = true;
        }
      })
      
      scope.cancelReview = function() {
        scope.isReviewing = false;
      }
      
      scope.submitReview = function() {
        var reviewTitle = $('#review-title-input-' + scope.product.id).val();
        var reviewBody = $('#review-body-input-' + scope.product.id).val();
        
        return reviewsService.submitNewReview({
          star_rating: scope.product.rating._current,
          ref_table: 'products',
          ref_table_id: scope.product.id,
          title: reviewTitle !== '' ? reviewTitle : null,
          body: reviewBody !== '' ? reviewBody : null,
          lang_code: scope.lang.current()
        })
          .then(function (data) {
            scope.submitted = true;
          }, function (error) {
            console.log(error);
          })
          .then(function() {
            scope.getProductsAndReviews();
          });
      }
    }
  }
}]);
