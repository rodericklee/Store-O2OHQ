app.service('reviewsService', [
  'storeService',
  '$http',
  '$q',
  function (store, $http, $q) {

    var _fetch_reviews = function (params) {
      return $http.jsonp(store.jsonp_url('reviews/find_all', params))
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
    };

    this.submitNewReview = function(review) {
      review.author_user_id = store.user.id;
      review.author_username = angular.copy(store.user.username);
      return $http.jsonp(store.jsonp_url('reviews/save_post', review))
    }

    this.getProductReviews = function (productId, limit, offset) {
      offset = offset || 0;
      limit = limit || 3;

      var params = {
        where: {
          ref_table: "products",
          ref_table_id: productId
        },
        limit: limit,
        offset: offset
      };

      return _fetch_reviews(params);
    }

    this.getUserProductReviews = function (userId, limit, offset) {
      offset = offset || 0;
      limit = limit || 3;

      var params = {
        where: {
          ref_table: "products",
          author_user_id: userId
        },
        limit: limit,
        offset: offset
      };

      return _fetch_reviews(params);
    }

    this.getProductsWithReviews = function () {
      return this.getUserProductReviews(store.user.id)
      .then(function (reviews) {
        return $q.all(
          _.map(
            reviews, function (review, review_id) {
              return store.get_product({id: review.ref_table_id})
                .then(function(product) {
                  product.review = review;
                  return product;
                })
          })
        )
      })
    }

    this.getUnReviewedProducts = function () {
      return store.get_orders()
      .then(function (orders) {
        return _.uniq(
          _.flattenDeep(
            _.map(orders, function (order, order_id) {
              return Object.keys(order.products);
            })
          )
        );
      })
      .then(function (uniq_product_ids) {
        if (!_.get(store.user, 'id')) {
          return uniq_product_ids;
        }
        return _fetch_reviews({
          where: {
            ref_table: 'products',
            author_user_id: store.user.id
          }
          , select: 'ref_table_id'
        })
        .then(function (reviews) {
          return _.xor(
            uniq_product_ids,
            _.uniq(
              _.map(reviews, function (review) {
                if (!!_.get(review, 'ref_table_id')) {
                  return review.ref_table_id;
                }
              })
            )
          )
        });
      })
      .then(function (uniq_filtered_product_ids) {
        return $q.all(
          _.map(uniq_filtered_product_ids, function (p_id) {
            return store.get_product({id: p_id})
          })
        );
      });
    }
  }
])
