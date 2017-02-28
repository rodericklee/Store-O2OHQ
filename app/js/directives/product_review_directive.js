app.directive("productReview", [
  'storeService',
  'reviewsService',
  'helpfulnessService',
  function ($store, reviewsService, helpfulnessService) {
  return {
    restrict: "E",
    scope: {
      _review: "=ngModel"
    },
    templateUrl: 'views/partials/store/reviews/default.html',
    link: function (scope, elem, attrs) {
      scope.review = angular.copy(scope._review);
      scope.is_current_users_review = false;
      scope.num_helpful = null;
      scope.vote_sending = false;
      scope.voted = false;

      var _currentUser = $store.user;

      var _checkIfUserVoted = function() {
        if (!!_currentUser) {
          helpfulnessService
          .check_user_vote(_currentUser.id, scope.review.id)
          .then(function (data) {
            scope.voted = data[0];
          })
        }
      }

      var _checkIfUsersReview = function() {
        if (!!_currentUser) {
          scope.is_current_users_review =
            (scope.review.author_user_id == _currentUser.id);
        }
      }

      var _getNumHelpfulVotes = function() {
        return helpfulnessService
        .get_num_helpful(scope.review.id)
        .then(function (data) {
          scope.num_helpful = data;
        })
      }

      scope.submit_vote = function (vote) {
        if (!!_currentUser) {
          vote = vote.toLowerCase();
          scope.vote_sending = true;
          helpfulnessService
          .submit_vote(_currentUser.id, scope.review.id, vote)
          .then(function (data) {
            scope.vote_sending = false;
            if (vote === 'helpful') {
              _getNumHelpfulVotes();
            }
            scope.voted = data[0];
          })
        } else {
          alert('You must be logged in to leave feedback.');
        }
      }

      _checkIfUsersReview();
      _getNumHelpfulVotes();
      _checkIfUserVoted();
    }
  }
}]);
