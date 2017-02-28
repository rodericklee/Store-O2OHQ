// app.directive("starRating", function () {
//   return {
//     restrict: "A",
//     scope: {
//       max: "=?", //optional: default is 5
//       on_rating_selected: "&?onRatingSelected",
//       readonly: "=?",
//       product_rating_obj: "=productRatingObj",
//       large: "="
//     },
//
//     templateUrl: function(scope) {
//       scope.readonly = !!(scope.readonly);
//       scope.rating_ng_model = (scope.readonly)
//         ? product_rating_obj.average
//         : (
//           (product_rating_obj. > 0)
//             ? product_rating_obj.average
//             : 5
//         )
//       scope.max = scope.max || 5;
//       scope.on_rating_selected = scope.on_rating_selected || function(){};
//
//       scope.get_rating = function() {
//         return (
//             Math.round(
//               (!scope.readonly && _.get(scope.product_rating_obj, 'value') > 0)
//                 ? scope.product_rating_obj.rating
//                 : (_.get(scope.product_rating_obj, 'average') > 0)
//                   ? scope.product_rating_obj.average
//                   : 5
//                * 2
//             ) / 2
//           )
//           .toFixed(1)
//       };
//
//       scope.get_review_count = function() {
//         return _.get(product_rating_obj, 'num_reviews') || 0;
//       };
//
//       // scope.get_star_states = function() {
//       //   var _fontawesome_large = (!!this.scope.large) ? ' fa-lg' : '';
//       //   this.scope.displayRating = scope.get_rating();
//       //
//       //   return _.times(this.scope.max, function (i) {
//       //     return {
//       //       stateOn: ( (this.scope.displayRating - (i + 1)) < 0)
//       //         ? 'fa fa-star-half-o' + _fontawesome_large
//       //         : 'fa fa-star' + _fontawesome_large,
//       //
//       //       stateOff: 'fa fa-star-o' + _fontawesome_large,
//       //       title: (i + 1)
//       //     }
//       //   });
//       // };
//
//       return 'views/partials/ui/star_rating/custom_uib_rating.html';
//     },
//
//     link: function (scope) {
//       scope.toggle = function (index) {
//         if (!_.get(scope, 'readonly')) {
//           scope.product_rating_obj.value = index + 1;
//           scope.on_rating_selected({
//             rating: index + 1
//           });
//         }
//       };
//     }
//   };
// });
