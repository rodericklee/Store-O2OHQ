app.config([
  '$urlRouterProvider',
  '$stateProvider',

  function($urlRouterProvider, $stateProvider) {

    $stateProvider
      .state('root', {
        url: '',
        abstract: true,
        views: {
          'header': {
            templateUrl: 'views/partials/ui/header.html',
            controller: 'HeaderController'
          }
        },
        resolve: {
          $store: [ 'storeService', function (storeService) {
            return storeService.get_store();
          } ],
          locale: [ '$translatePartialLoader', '$translate', function ($translatePartialLoader, $translate) {
            $translatePartialLoader
              .addPart('general')
              .addPart('countries_zones')
            // We have to include this refresh, because at this root state
            // app.run has not yet setup automatic refreshing.
            return $translate.refresh()
          } ],
        }
      })

      .state('root.home', {
        url: '/',
        views: {
          '@': {
            templateUrl: 'views/partials/store/store.html',
            // templateUrl: 'views/partials/store/store.html',
            controller: 'StoreController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader.addPart('store')
          } ]
        }
      })

      .state('root.login', {
        url: '/login',
        views: {
          '@': {
            templateUrl: 'views/partials/ui/login.html',
            controller: 'LoginController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader.addPart('login')
          } ]
        }
      })
      .state('root.logout', {
        url: '/logout',
        views: {
          '@': {
            templateUrl: 'views/partials/ui/login.html',
            controller: 'LoginController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader.addPart('login')
          } ]
        }
      })
      .state('root.signup', {
        url: '/signup',
        views: {
          '@': {
            templateUrl: 'views/partials/signup/customer.html',
            controller: 'LoginController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader.addPart('signup')
          } ]
        }
      })
      .state('root.signup.social_marketer', {
        url: '/social_marketer',
        views: {
          '@': {
            templateUrl: 'views/partials/signup/social_marketer.html',
            controller: 'LoginController'
          }
        }
      })

      .state('root.product', {
        url: '/product/:sku',
        views: {
          '@': {
            templateUrl: 'views/partials/store/product.html',
            controller: 'ProductController'
          }
        },
        data: {
          displayName: 'Products'
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader.addPart('product')
          } ],
          product: [ '$stateParams', 'storeService', function ($stateParams, storeService) {
            return storeService.get_product({sku: $stateParams.sku})
          } ]
        }
      })

      .state('root.product.slug', {
        url: '/:slug'
      })

      .state('root.checkout', {
        url: '/checkout',
        views: {
          '@': {
            templateUrl: 'views/partials/checkout/index.html',
            controller: 'CheckoutController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader
              .addPart('checkout')
              .addPart('order_status')
          } ]
        }
      })

      .state('root.checkout.info', {
        url: '/info',
        views: {
          '@': {
            templateUrl: 'views/partials/checkout/info.html',
            controller: 'CheckoutController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader
              .addPart('checkout')
              .addPart('order_status')
          } ]
        }
      })

      .state('root.checkout.complete', {
        url: '/complete/:order_id',
        views: {
          '@': {
            templateUrl: 'views/partials/checkout/complete.html',
            controller: 'CheckoutController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader
              .addPart('checkout')
              .addPart('order_status')
          } ]
        }
      })

      .state('root.rma', {
        url: '/return-center/{order_id}',
        views: {
          '@': {
            templateUrl: 'views/partials/rma/index.html',
            controller: 'RMAController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader
              .addPart('rma');
          } ]
        }
      })
      .state('root.rma.info', {
        url: '/info',
        views: {
          '@': {
            templateUrl: 'views/partials/rma/info.html',
            controller: 'RMAController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader
              .addPart('rma');
          } ]
        }
      })
      .state('root.rma.status', {
        url: '/status',
        views: {
          '@': {
            templateUrl: 'views/partials/rma/status.html',
            controller: 'RMAController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader
              .addPart('rma');
          } ]
        }
      })

      .state('root.filter', {
        url: '/filter/:type/:filter_id',
        views: {
          '@': {
            templateUrl: 'views/partials/filter/filter.html',
            controller: 'FilterController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader.addPart('filter')
          } ]
        }
      })

      .state('root.search', {
        url: '/search/:query',
        views: {
          '@': {
            templateUrl: 'views/partials/filter/search.html',
            controller: 'SearchController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader.addPart('filter');
          } ]
        }
      })

      .state('root.account', {
        url: '/account',
        views: {
          '@': {
            templateUrl: 'views/partials/account/index.html',
            controller: 'AccountController',
            resolve: {
              account_locale: [ '$translatePartialLoader', '$translate', function ($translatePartialLoader, $translate) {
                $translatePartialLoader
                  .addPart('account')
                  .addPart('checkout')
                  .addPart('order_status');

                return $translate.refresh();
              } ]
            }
          },
          'sidebar@root.account': {
            templateUrl: 'views/partials/account/sidebar.html'
          },
          'content@root.account': {
            templateUrl: 'views/partials/account/account.html'
          }
        }
      })
      .state('root.account.my_orders', {
        url: '/my-orders',
        views: {
          'content@root.account': {
            templateUrl: 'views/partials/account/my_orders.html',
            controller: 'AccountController'
          },
          resolve: {
            locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
              return $translatePartialLoader
                .addPart('account')
                .addPart('checkout')
                .addPart('order_status')
            } ]
          }
        }
      })
      .state('root.account.my_reviews', {
        url: '/my-reviews',
        views: {
          'content@root.account': {
            templateUrl: 'views/partials/account/my_reviews.html',
            controller: 'AccountReviewsController'
          },
          resolve: {
            locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
              return $translatePartialLoader
              .addPart('account')
              .addPart('checkout')
              .addPart('order_status')
            } ]
          }
        }
      })
      .state('root.account.customer_orders', {
        url: '/customer-orders',
        views: {
          'content@root.account': {
            templateUrl: 'views/partials/account/social_marketer/customers_orders.html',
            controller: 'AccountController',
          },
          resolve: {
            locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
              return $translatePartialLoader
                .addPart('account')
                .addPart('checkout')
                .addPart('order_status')
            } ]
          }
        }
      })
      .state('root.account.commissions', {
        url: '/commissions',
        views: {
          'content@root.account': {
            templateUrl: 'views/partials/account/social_marketer/index_commissions.html',
            controller: 'AccountController'
          },
          resolve: {
          }
        }
      })
      .state('root.account.order', {
        url: '/order/:order_id',
        views: {
          'content@root.account': {
            templateUrl: 'views/partials/account/order.html',
            controller: 'CheckoutController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader
              .addPart('account')
              .addPart('checkout')
              .addPart('order_status')
          } ]
        }
      })
      // .state('root.account.business_center', {
      //   url: '/business-center',
      //   views: {
      //     'content@root.account': {
      //       templateUrl: 'views/partials/account/business_center/index.html',
      //       controller: 'AccountBusinessCenterController',
      //       resolve: {
      //         business_center: [ 'storeService', function (storeService) {
      //           return storeService.get_business_center()
      //         } ]
      //       }
      //     },
      //     resolve: {
      //       locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
      //         return $translatePartialLoader
      //                 .addPart('account')
      //                 .addPart('filter')
      //       } ]
      //     }
      //   }
      // })
      // .state('root.account.business_center.manage_brand', {
      //   url: '/manage-brand/:brand_id',
      //   views: {
      //     'content@root.account': {
      //       templateUrl: 'views/partials/account/business_center/manage_brand.html',
      //       controller: 'AccountBusinessCenterController',
      //       resolve: {
      //         business_center: [ 'storeService', function (storeService) {
      //           return storeService.get_business_center()
      //         } ]
      //       }
      //     },
      //     resolve: {
      //       locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
      //         return $translatePartialLoader
      //                 .addPart('account')
      //                 .addPart('filter')
      //       } ]
      //     }
      //   }
      // })
      .state('root.account.replicated_site', {
        url: '/replicated-site',
        views: {
          'content@root.account': {
            templateUrl: 'views/partials/account/social_marketer/replicated_site/summary.html',
            controller: 'ReplicatedSiteBannerController'
          }
        },
        resolve: {
          // locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
          //   return $translatePartialLoader.addPart('filter')
          // } ]
        }
      })
      .state('root.account.replicated_site.customize_banners', {
        url: '/customize-banners',
        views: {
          'content@root.account': {
            templateUrl: 'views/partials/account/social_marketer/replicated_site/customize_banners.html',
            controller: 'ReplicatedSiteBannerController'
          }
        },
        resolve: {
          // locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
          //   return $translatePartialLoader.addPart('filter')
          // } ]
        }
      })
      .state('root.marketer', {
        url: '/account/my-social-marketer',
        views: {
          '@': {
            templateUrl: 'views/partials/socialMarketer.html',
            controller: 'MarketerController'
          },
        }
      })
      .state('root.brand', {
        url: '/brand/:brand_id/:brand_name',
        views: {
          '@': {
            templateUrl: 'views/partials/brand/index.html',
            controller: 'BrandController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader.addPart('other')
          } ]
        }
      })
      .state('root.all_products', {
        url: '/all-products',
        views: {
          '@': {
            templateUrl: 'views/partials/other/all_products.html',
            controller: 'AllProductsController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ($translatePartialLoader) {
            return $translatePartialLoader.addPart('other')
          } ]
        }
      })
      .state( 'root.commissions_table', {
        url: '/commissions-table',
        views: {
          '@': {
            templateUrl: 'views/partials/other/commissions_table.html',
            controller: 'CommissionsController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ( $translatePartialLoader ) {
            return $translatePartialLoader.addPart( 'commissions_table' );
          } ]
        }
      })
      .state('root.toc', {
        url: '/terms-and-conditions',
        views: {
          '@': {
            templateUrl: 'views/partials/other/toc/index.html'
          }
        }
      })

      .state('root.relations', {
        url: '/relations',
        abstract: true
      })

      .state('root.relations.assets', {
        url: '/assets',
        views: {
          '@': {
            templateUrl: 'views/partials/relations/assets.html',
            controller: 'RelationsController'
          }
        }
      })
      .state('root.contact', {
        url: '/contact/:name',
        views: {
          '@': {
            templateUrl: 'views/partials/contact/index.html',
            controller: 'ContactController'
          }
        },
        resolve: {
          locale: [ '$translatePartialLoader', function ( $translatePartialLoader ) {
            return $translatePartialLoader.addPart( 'contact' );
          } ]
        }
      })

    $urlRouterProvider.otherwise('/')
}]);
