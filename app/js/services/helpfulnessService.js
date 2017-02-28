app.service('helpfulnessService', [
  'storeService',
  '$http',
  '$q',
  function (store, $http, $q) {
    
    this.submit_vote = function (userId, reviewId, vote) {
      
      var params = {
        'user_id': userId,
        'review_id': reviewId,
        'vote': vote
      };
      
      return $http.jsonp(
        store.jsonp_url(
          'reviews/helpful_abusive_post', params))
      .then(function (resp) {
        if (
          resp.status == 200 &&
          'data' in resp &&
          'status' in resp.data &&
          'data' in resp.data &&
          resp.data.status) {
          
          return resp.data.data;
          
        } else {
          console.log("(store) HTTP bad response:");
          console.log(resp);
          
          return false;
        }
      });
    }
    
    this.get_num_helpful = function (reviewId) {
      
      params = {
        'review_id': reviewId
      }
      
      return $http.jsonp(store.jsonp_url('reviews/num_helpful', params))
      .then(function (resp) {
        if (
          resp.status == 200 &&
          'data' in resp &&
          'status' in resp.data &&
          'data' in resp.data &&
          resp.data.status) {
          
          return resp.data.data['num_votes'];
          
        } else {
          console.log("(store) HTTP bad response:");
          console.log(resp);
          
          return false;
        }
      });
    }
    
    this.check_user_vote = function (userId, reviewId) {
      params = {
        'user_id': userId,
        'review_id': reviewId
      }
      
      return $http.jsonp(store.jsonp_url('reviews/check_user_voted', params))
      .then(function (resp) {
        if (
          resp.status == 200 &&
          'data' in resp &&
          'status' in resp.data &&
          'data' in resp.data &&
          resp.data.status) {
          
          return resp.data.data;
          
        } else {
          console.log("(store) HTTP bad response:");
          console.log(resp);
          
          return false;
        }
      });
    }
    
  }
]);
