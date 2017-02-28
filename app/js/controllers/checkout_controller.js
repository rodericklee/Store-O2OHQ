/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  "CheckoutController", [
    '$scope',
    '$window',
    '$location',
    '$http',
    '$q',
    'focus',

    function ( $scope, $window, $location, $http, $q, focus ) {
      "use strict";

      $scope.orders_fetched = false;
      $scope.order = false;
      $scope.order_status = '';

      $scope.progress_visible = true;
      $scope.progress_striped = true;
      $scope.progress_active = true;
      $scope.progress_class = '';

      $scope.show_action = {
        complete_payment: true,
        buy_again: false,
        leave_review: false,
        seller_feedback: false,
        package_feedback: false,
        _return: false,
        _return_status: false
      };

      $scope.show_things_to_know = false;
      $scope.show_controls = false;

      $scope.order_statuses = {
        created               : 10,    // created
        payment_pending       : 20,    // payment authorized
        payment_failed        : 30,    // payment failed - issue email & resolve
        confirmed             : 40,    // ready to batch - delay between shipping
        hold                  : 50,    // order is placed on hold for some reason (fraud...)
        shipping_batched      : 60,    // order has been successfully submitted to fulfilment house
        shipping_hold         : 70,    // fulfilment house placed order on hold for some reason (internal problem)
        shipped               : 80,    // order has been marked as shipped and should have a tracking number
        shipment_failed       : 90,    // shipment failed for some reason - see tracking data
        delivered             : 100,   // order has been delivered, start 7-day clock
        completed             : 110,   // order's 7-day return window is closed

        pending_cancel        : 200,   // Someone is requesting to cancle this order (mostly a note-status in order_notes)
        cancelled             : 210,   // order was successfully cancled
        rejected              : 220,   // the order was rejected for some reason - maybe fraud?
        rma                   : 230,   // order in RMA status - see RMA status
        rma_failed            : 240,   // RMA failed - customer may have failed to return the item(s)
        rma_completed         : 250   // RMA finished
      };

      $scope.manual_order_status_index = 3;
      $scope.move_order_status = function (num, overwrite) {
        var keys = Object.keys($scope.order_statuses);
        var requested = $scope.manual_order_status_index + num;

        if (requested >= 0 && requested < keys.length) {
          if (num > 0 && (overwrite !== undefined && overwrite)) {
            switch (keys[requested]) {
              case 'payment_failed':
              case 'hold':
              case 'shipping_hold':
              case 'shipment_failed':
                requested++;
                break;
              case 'pending_cancel':
                requested = $scope.manual_order_status_index;
                break;
            }
          }

          $scope.order.order_status = keys[requested];
          $scope.order.order_status_id = $scope.order_statuses[keys[requested]];
          $scope.manual_order_status_index = requested;
          setup_order_status_vars();

          console.log($scope.order.order_status);
          console.log($scope.order.order_status_id);
        }
      };

      var setup_order_status_vars = function() {
        if ('order_status' in $scope.order) {
          switch ($scope.order.order_status) {
            case 'payment_pending':
            case 'hold':
            case 'shipping_hold':
              $scope.progress_class = "progress-bar-warning";
              $scope.show_things_to_know = false;
              break;

            case 'shipment_failed':
              $scope.progress_class = "progress-bar-danger";
              $scope.progress_striped = false;
              $scope.progress_active = false;
              $scope.show_things_to_know = false;
              break;

            case 'payment_failed':
            $scope.show_things_to_know = false;
              $scope.progress_class = "progress-bar-danger";
              break;

            case 'created':
            case 'confirmed':
              $scope.show_action.buy_again = true;
            case 'shipping_batched':
            case 'shipped':
              $scope.show_action.buy_again = true;
              $scope.show_action._return = false;
              $scope.show_things_to_know = false;
              $scope.progress_class = "progress-bar-success";
              break;

            case 'delivered':
              $scope.show_action.buy_again = true;
              $scope.show_action.leave_review = true;
              $scope.show_action.seller_feedback = true;
              $scope.show_action.package_feedback = true;
              $scope.show_action._return = true;
              $scope.show_things_to_know = true;
              $scope.progress_class = "progress-bar-success";
              $scope.progress_striped = false;
              $scope.progress_active = false;
              break;

            case 'completed':
              $scope.show_action.buy_again = true;
              $scope.show_action.leave_review = true;
              $scope.show_action.seller_feedback = true;
              $scope.show_action.package_feedback = true;
              $scope.show_action._return = false;
              $scope.show_things_to_know = true;
              $scope.progress_class = "progress-bar-success";
              $scope.progress_striped = false;
              $scope.progress_active = false;
              break;

            case 'rma_completed':
              $scope.show_action.buy_again = true;
              $scope.show_action.leave_review = true;
              $scope.show_action.seller_feedback = true;
              $scope.show_action.package_feedback = true;
              $scope.show_things_to_know = false;
              $scope.progress_class = "progress-bar-success";
              $scope.progress_striped = false;
              $scope.progress_active = false;
              break;

            case 'cancelled':
              $scope.show_action.buy_again = true;
              $scope.progress_striped = false;
              $scope.progress_active = false;
              $scope.show_things_to_know = false;
              $scope.progress_class = "progress-bar-warning";
              break;

            case 'rma':
              $scope.show_action.buy_again = true;
              $scope.show_action.leave_review = true;
              $scope.show_action.seller_feedback = true;
              $scope.show_action.package_feedback = true;
              $scope.show_action._return_status = true;
              $scope.show_things_to_know = true;
              $scope.progress_class = "progress-bar-warning";
              break;

            case 'pending_cancel':
              $scope.progress_class = "progress-bar-warning";
              $scope.show_action.buy_again = true;
              break;

            case 'rma_failed':
              $scope.show_action.buy_again = true;
              $scope.progress_striped = false;
              $scope.progress_active = false;
              $scope.progress_class = "progress-bar-danger";
              break;

            case 'rejected':
              $scope.progress_class = "progress-bar-danger";
              $scope.show_action.buy_again = true;
              $scope.progress_striped = false;
              $scope.progress_active = false;
              break;
            default:
              break;
          }
        }
      };

      if ('order_id' in $scope.$stateParams) {
        $scope.order_id = $scope.$stateParams.order_id;

        $scope.$store.get_orders($scope.$stateParams.order_id)
          .then(function(order) {
            order.order_link = $scope.$state.href('root.checkout.complete', {order_id: order.id}, {absolute: true});

            var update_order = false;

            // NOTE: This is semi-unsafe; this could be potentially exploited
            //           to change a user's data. Although, it is not a concern
            //           because upon the next update, or login/logout it will
            //           be overridden.

            // The backend can pass certian data via $_GET params.
            _.map($location.search(), function(v, k) {
              if (!!_.get(order, k) && !_.isEmpty(v)) {
                console.log("[Updating Order][" + k + "] = " + v);
                update_order = true;
                order[k] = v;
              }
            });

            // Update the order details if it has gotten updated data from the params.
            if (!!update_order) {
              _.delay(function() {
                $scope.$store.add_order(order);
              }, 2000);
            }

            return $q.all(
                _.map(order.products, function(order_i, key) {
                  return $scope.$store.get_product({id: order_i.product_id})
                    .then(function(prod) {
                      return order.products[key].product = prod;
                    });
                })
              )
              .then(function() {
                $scope.order = order;
                return $scope.update_order_status();
              })
              .then(function() {
                $scope.orders_fetched = true;
              })
          })
          .catch(function(str) {
            $scope.$translate(str)
              .then(function(tstr) {
                $scope.$notify.error(tstr);
                $scope.$state.go('root.home');
              })
          });
      };

      $scope.update_order_status = function() {
        return $q.all(
          $scope.$translate('order_status.long.' + $scope.order.order_status)
            .then(function(order_status_str) {
              return $scope.order_status = order_status_str;
            }),
          $q.when(setup_order_status_vars())
        );
      };

      $scope.refresh_order = function() {
        $scope.order.update($scope.order)
          .then(function(order) {
            $scope.order = order;
            console.log('update_order_status', $scope.order.order_status);
            return $scope.update_order_status();
          });
      };

      $scope.showModal = false;
      $scope.toggleModal = function(){
        $scope.showModal = !$scope.showModal;
      };

      $scope.show_order_link = false;
      $scope.toggle_status_link = function() {
        // TODO: On mobile phones this displays file://null:/...
        //         This should be fixed to display the store.o2ohq.com URL
        $scope.show_order_link = !$scope.show_order_link;
        if ($scope.show_order_link) {
          $('#order_link-ellipsis').slideUp();
          $('#order_link-full').slideDown(function() {
            var range = null;
            var text = $('#full_order_link').get(0);
            if (document.body.createTextRange) { // ms
                range = document.body.createTextRange();
                range.moveToElementText(text);
                range.select();
            } else if (window.getSelection) {
                var selection = window.getSelection();
                range = document.createRange();
                range.selectNodeContents(text);
                selection.removeAllRanges();
                selection.addRange(range);
            }
            $('#full_order_link-button').tooltip({
              title: $scope.$translate.instant('checkout.order_link.tooltip'),
              trigger: "manual",
              placement: "right"
            }).tooltip('show');
          });
        } else {
          // $('#full_order_link').tooltip('hide');
          // $('#order_link-ellipsis').slideDown();
          // $('#order_link-full').slideUp();
        }
      };

      $scope.login_function = function(event) {
        if (event === undefined) {
          event = {
            target: {
              nodeName: 'FORM'
            }
          };
        }
        var form_data = {};
        if (event.target.nodeName === 'FORM') {
          form_data.email = $('#checkout-login-email').val();
          form_data.password = $('#checkout-login-password').val();
        }

        return $scope.$store.login(form_data, false)
          .then(
            function(msg) {
              $scope.showModal = false;
              // Notification now originates from store_service
              // $scope.$notify.success.translate('notify.success.login_fetched', {name: $scope.$store.user.last_name + ' ' + $scope.$store.user.first_name});
            },
            function(msg) {
              $scope.$notify.error(msg);
            }
          );
      };

      $scope.login_hit_count = 0;
      $scope.key_watch_login = function(e) {
        var combo = [32];

        if (combo.indexOf(e.keyCode) !== -1) {
          $scope.login_hit_count++;

          if ($scope.login_hit_count == 3) {
            if ($scope.$state.current.name === 'root.checkout.info') {
              $('#checkout-login-email').val('greenman@yoursite.com');
              $('#checkout-login-password').val('modern1zed');
              setTimeout(function() {
                $scope.login_function();
              }, 1);
            }
          }
        } else {
          $scope.login_hit_count = 0;
        }
      };

      $scope.info_test_autofill = '';
      $scope.info_hit_count = 0;
      var num = 0;
      $scope.key_watch_info = function (e) {
        if ($scope.login_hit_count == 3) {
          console.log('login_hit_count === 3');
          // ENTER
          if (e.keyCode == 13 && $scope.info_test_autofill.length > 0) {

            // fill in the form
            $scope.info.form_data = {
              "shipping_and_billing_same": true,
              "shipping": {
                "gov_id_no":"",
                "last_name": "测试" + $scope.info_test_autofill,
                "first_name": "测试" + $scope.info_test_autofill,
                "country": _.find($scope.$store.countries, {id:'44'}),
                "zone": _.find($scope.$store.zones, {id:'686'}),
                "city": "厦门市",
                "district": "同安区",
                "address1": "莲花镇小坪村",
                "address2": "道地上社"  + $scope.info_test_autofill + "号",
                "zipcode": "510000",
                "phone": "138001380" + (($scope.info_test_autofill.length == 1) ? $scope.info_test_autofill + '0' : $scope.info_test_autofill.substr(-2))
              },
              "cart": [],
              "toc": true
            };

            $scope.active_payment_option = 0;

            // Disabled: Stripe is not in use
            // $scope.payments = {
            //   card: {
            //     number: '4242424242424242',
            //     name: "测试" + $scope.info_test_autofill,
            //     exp_month: '08',
            //     exp_year: '2018',
            //     cvv: '111'
            //   }
            // };

            if (!$scope.$store.user) {
              angular.extend($scope.info.form_data, {
                "first_name": "测试" + $scope.info_test_autofill,
                "last_name": "测试" + $scope.info_test_autofill,
                "email": "o2otest" + $scope.info_test_autofill + "@g.c",
                "phone": "138001380" + (($scope.info_test_autofill.length == 1) ? $scope.info_test_autofill + '0' : $scope.info_test_autofill.substr(-2)),
                "password": "password",
                "password_confirm": "password",
                "company_name": "测试" + $scope.info_test_autofill + " LLC"
              });
            }

            $scope.info_test_autofill = '';
          } else {
            num = e.keyCode - 48;

            if (num >= 0) {
              $scope.info_test_autofill += num.toString();
            } else {
              $scope.login_hit_count = 0;
              console.log('Reset');
            }
          }
        } else {
          // space
          var combo = [32];

          if (combo.indexOf(e.keyCode) !== -1) {
            $scope.login_hit_count++;
          } else {
            $scope.login_hit_count = 0;
          }
        }
      };

      $scope.complete_title_click = function() {
        $scope.login_hit_count++;
        console.log($scope.login_hit_count);
        if ($scope.login_hit_count >= 3) {
          $scope.show_controls = true;
        }
      };

      $scope.user = $scope.$store.user;

      $scope.$cart.setTaxRate(11.9);
      $scope.$cart.setShipping(9.99 * $scope.$cart.getTotalItems());

      $scope.processing_modal = {
        modal: false,
        title: false,
        is_processing: true,
        redirect_time: 0,
        payment_redirect_url : false,

        open: function(_is_processing) {
          if (_is_processing !== undefined) {
            $scope.processing_modal.is_processing = _is_processing;
          }

          return $q(function(resolve) {
            if ($scope.processing_modal.is_processing) {
              return resolve($scope.$translate('checkout.processing_order'));
            }

            return $scope.$translate('checkout.payment_options.' + $scope.get_active_payment_option().id + '.label')
              .then(function(tpayment_option) {
                return resolve($scope.$translate('checkout.will_be_directed', {payment_option: tpayment_option}));
              });
          })
          .then($scope.processing_modal._open_modal);
        },

        close: function() {
          return $q(function(resolve) {
            if (!!$scope.processing_modal.modal && _.isFunction($scope.processing_modal.modal.close)) {
              $scope.processing_modal.modal.close()
              $scope.processing_modal.modal = false;
            }
            resolve(true);
          })
        },

        redirect_countdown: function() {
          $scope.processing_modal.redirect_time = 10;
          return $scope.processing_modal._count_down_func();
        },

        redirect: _.once(function() {
          $scope.processing_modal.close();

          if (!!$scope.processing_modal.payment_redirect_url) {
            return $window.location.href = $scope.processing_modal.payment_redirect_url;
          }

          return $scope.$state.go(
            ( ($scope.$store.user) ? 'root.account.order' : 'root.checkout.complete' ),
            {'order_id' : $scope.order.id}
          );
        }),

        _count_down_func: function() {
          return $q(function(resolve) {
            console.log($scope.processing_modal.redirect_time);
            if ($scope.processing_modal.redirect_time > 0) {
              _.delay(function() {
                $scope.$apply(function() {
                  $scope.processing_modal.redirect_time--;
                });
                resolve($scope.processing_modal._count_down_func());
              }, 1000)
            } else {
              resolve($scope.processing_modal.redirect_time);
            }
          });
        },

        _open_modal: function(modal_title) {
          $scope.processing_modal.close();

          return $q(function(resolve) {
            $scope.processing_modal.title = modal_title;

            $scope.processing_modal.modal = $scope.$uibModal.open({
              bindToController: true,
              scope: $scope,
              templateUrl: 'views/partials/checkout/modal_processing.html'
            });

            resolve($scope.processing_modal.modal);
          });
        }
      };

      var checkout_func = function() {
        $scope.processing_modal.open()
          .then(_checkout_func);
      };

      var
        _register_user = function() {
          return $q(function(resolve, reject) {
            $http.jsonp( $scope.$store.jsonp_url('users/register', $scope.info.form_data))
              .then(function(resp) {
                if (!!_.get(resp, 'data.status') && !!_.get(resp, 'data.data.user') && !!_.get(resp, 'data.data.user.id')) {
                  return _.get(resp, 'data.data');
                }
                return reject('checkout.errors.register_failed');
              })
              .then(function(data) {
                $scope.$store.load(data)
                  .then(function() {
                    resolve(data.user);
                  });
              });
            });
        },
        _checkout_func = function() {
          if ($scope.get_active_payment_option().id == 'stripe') {
            // add on payments to order (credit card information)
            $scope.payments.billing_address = $scope.info.form_data.billing;
            $scope.info.form_data.payments = $scope.payments;
          }

          var submit_data = angular.copy($scope.info.form_data);

          submit_data.billing.country_id = submit_data.billing.country.id;
          submit_data.billing.zone_id = submit_data.billing.zone.id;

          submit_data.shipping.country_id = submit_data.shipping.country.id;
          submit_data.shipping.zone_id = submit_data.shipping.zone.id;

          delete submit_data.billing.country;
          delete submit_data.billing.zone;

          delete submit_data.shipping.country;
          delete submit_data.shipping.zone;

          _.map(submit_data.shipping, function(v, k) {
            if (_.isEmpty(v)) {
              delete submit_data.shipping[k];
            }
          });

          _.map(submit_data.billing, function(v, k) {
            if (_.isEmpty(v)) {
              delete submit_data.billing[k];
            }
          });

          console.log('submit_data', submit_data);

          return $http.jsonp( $scope.$store.jsonp_url('order', submit_data))
            .then(function(resp) {
              if (!!_.get(resp, 'data.status') && !!_.get(resp, 'data.data.order')) {
                return _.get(resp, 'data.data');
              }
            })
            .then(
              function(data) { // success
                console.log('redirect_url: ' + data.payment_redirect);
                $scope.order = data.order;
                $scope.processing_modal.payment_redirect_url = data.payment_redirect;

                $scope.$store.add_order(data.order);
                $scope.$cart.empty();

                $scope.processing_modal.open(false)
                  .then(function(_modal) {

                    if ($scope.get_active_payment_option().id == 'stripe') {
                      $scope.processing_modal.redirect();
                    }

                    _modal.opened
                      .then(function() {
                        _modal.closed
                          .then($scope.processing_modal.redirect);
                        return _modal;
                      })
                      .then($scope.processing_modal.redirect_countdown)
                      .then($scope.processing_modal.redirect);


                  });
              },
              function() {
                $scope.$notify.error.translate('checkout.errors.placing_order_failed')
                  .then(function(tstr) {
                    $scope.processing_modal.close()
                  });
              }
            );


            // .success( function ( data, status, headers, config ) {
            //   console.log('success');
            //   if ('status' in data) {
            //     if (data.status && 'data' in data && 'order' in data.data) {
            //
            //       console.log($scope.$store.orders);
            //       console.log(_.size($scope.$store.orders));
            //
            //       $scope.$store.add_order(data.data.order);
            //
            //       // console.log("------------");
            //       // console.log($scope.$store.orders);
            //       // console.log(Object.keys($scope.$store.orders).length);
            //       // return false;
            //
            //       $scope.$cart.empty();
            //
            //       $scope.$state.go(
            //         ( ($scope.$store.user) ? 'root.account.order' : 'root.checkout.complete' ),
            //         {'order_id' : data.data.order.id}
            //       );
            //
            //     } else {
            //       alert(data.message);
            //     }
            //   } else {
            //     $scope.$notify.error('Woops! Recived unexpected response from server - the order may have been created. This message should never be seen.');
            //   }
            // } )
            // .error( function ( data, status, headers, config ) {
            //   $scope.$notify.error('Woops, something went wrong when trying to place your order.');
            // } );
        };

      $scope.info = {
        'past': '',
        'success': false,
        'submit_error': false,
        'show_form_errors': false,
        'form_data': {
          "shipping_and_billing_same": true,
          "shipping":{
            "address2":"",
            "zone": "",
            "country": _.find($scope.$store.countries, {id:'44'})
          },
          "billing":{
            "address2":"",
            "country": _.find($scope.$store.countries, {id:'44'})
          },
          "payment":{},
          "cart":[],
          "toc":true
        },
        submit: function () {
          $scope.$broadcast( '$validate' );
          // $scope.$broadcast( 'show-errors-check-validity' ); – causing error

          if ( $scope.info_form.$valid ) {
            console.log( "form: valid" );
            $scope.info.show_form_errors = false;

            $scope.info.form_data.cart = [];
            var cart = $scope.$cart.getItems();

            for (var i in cart) {
              var item = cart[i];
              if ('_quantity' in item && '_data' in item && 'id' in item._data ) {
                // console.log(item._data);
                // TODO: verify server total calculations match frontend
                // TODO: the frontend is using this data to display, we really
                //       shouldn't trust it ... and it should come from the server.
                $scope.info.form_data.cart.push({
                  product_id: item._data.id,
                  quantity: item._quantity,
                  // price: item._data.price,
                  // subtotal: (item._data.price * item._quantity)
                });
              }
            }

            $scope.info.form_data.user_id = _.get($scope.$store, 'user.id');

            if ($scope.info.form_data.shipping_and_billing_same) {
              $scope.info.form_data.billing = angular.copy($scope.info.form_data.shipping);
            }

            $scope.info.form_data.payment_option = $scope.get_active_payment_option().id;
            $scope.info.form_data.back_url = $scope.$state.href($scope.$state.current.name, $scope.$state.params, {absolute: true});

            if ($scope.$store.user) {
              return checkout_func();
            } else {
              return _register_user()
                .then(
                  checkout_func, // success
                  function(tmsg) { // fail
                    $scope.$translate(tmsg)
                      .then($scope.$notify.error);
                  }
                );
            }

          } else {
            $scope.info.show_form_errors = true;
            console.log( "bo_signup: not valid" );
          }
          return false;
        },
        showHelp: function ( elm, attr ) {
          if ( !$scope.info.show_form_errors ) {
            return false;
          }

          // if the fault is happening
          if ( elm && elm.hasOwnProperty( '$error' ) && elm.$error.hasOwnProperty( attr ) && elm.$error[ attr ] ) {
            return true;
          }

          return false;
        }
      }; // $scope.info

      if ($scope.$state.current.name === 'root.checkout.info') {
        $scope.$watch('info.form_data.shipping.country', function() {
          if (!_.get($scope.info.form_data, 'shipping.country') || _.get($scope.info.form_data, 'shipping.country.id') == 44) {
            $scope.$cart.setTaxRate( 11.9 );
            $scope.$cart.setShipping( 9.99 );
          } else {
            $scope.$cart.setTaxRate( 6.75 );
            $scope.$cart.setShipping( 9.99 );
          }
        });

        if (!!_.get($scope.$store.user, 'id') && !_.isEmpty(_.get($scope.$store, 'user.addresses.all'))) {
          var default_shipping = $scope.$store.user.addresses.default('shipping');
          var default_billing = $scope.$store.user.addresses.default('billing');

          if (!_.isEmpty(default_shipping)) {
            default_shipping.country = (!!default_shipping.country_id) ? _.find($scope.$store.countries, {id: default_shipping.country_id}) : '';
            default_shipping.zone = (!!default_shipping.zone_id) ? _.find($scope.$store.zones, {id: default_shipping.zone_id}) : '';
            $scope.info.form_data.shipping = default_shipping;
          }

          if (!_.isEmpty(default_billing)) {
            default_billing.country = _.find($scope.$store.countries, {id: default_billing.country_id});
            default_billing.zone = _.find($scope.$store.zones, {id: default_billing.zone_id});
            $scope.info.form_data.billing = default_billing;
          }

          if (!_.isEmpty(default_billing) && !_.isEmpty(default_shipping)) {
            $scope.info.form_data.shipping_and_billing_same = true;
          }
        }
      }

      $scope.get_cart_total = function() {
        var total = 0;
        var cart_items = $scope.$cart.$cart.items;
        for (var i in cart_items) {
          total += (cart_items[i]._price * cart_items[i]._quantity);
        }
        return total;
      };

      $scope.active_payment_option = 0;
      $scope.is_active_payment_option = function ($index) {
        return $index === $scope.active_payment_option;
      };

      $scope.set_active_payment_option = function ($index) {
        if (!!_.get(_.get($scope.payment_options, $index), 'active')) {
          $scope.active_payment_option = $index;
        } else {
          $scope.$notify.error('WTF Error: Tried to select a payment method that is disabled.');
        }
      };

      $scope.is_required_payment_input = function (id) {
        var pmidx = _.findIndex($scope.payment_options, {'id':id});
        return (_.has($scope.payment_options, pmidx) && pmidx === $scope.active_payment_option);
      };

      $scope.get_active_payment_option = function() {
        return _.get($scope.payment_options, $scope.active_payment_option);
      }

      $scope.payment_options = [
        {
          active: true,
          id: 'ali_pay',
          image: 'assets/images/checkout/alipay-icon-blue.png',
          image_active: 'assets/images/checkout/alipay-icon-white.png',
          view: "views/partials/checkout/payment_options/ali_pay.html"
        },
        {
          active: false,
          id: 'icbc_pay',
          image: 'assets/images/checkout/icbc-icon-gray.png',
          image_active: 'assets/images/checkout/icbc-icon-white.png',
          view: "views/partials/checkout/payment_options/icbc_pay.html"
        },
        {
          active: false,
          id: 'stripe',
          icon: 'fa fa-credit-card pl5',
          view: "views/partials/checkout/payment_options/credit_card.html"
        },
        {
          active: false,
          id: 'union_pay',
          view: "views/partials/checkout/payment_options/union_pay.html"
        },

        {
          active: false,
          id: 'apple_pay',
          icon: 'fa fa-apple pl5',
          view: "views/partials/checkout/payment_options/apple_pay.html"
        }
      ];

      $scope.payments = {
        card: {
          number: '',
          name: ($scope.$store.user) ? ($scope.$store.user.last_name + $scope.$store.user.first_name) : '',
          exp_month: '',
          exp_year: '',
          cvv: ''
        }
        // card: {
        //   number: '4242424242424242',
        //   name: $scope.$store.user.last_name + ' ' + $scope.$store.user.first_name,
        //   exp_month: '08',
        //   exp_year: '2018',
        //   cvv: '111'
        // }
      };
    }
  ]
);
