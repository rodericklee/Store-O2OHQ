/*global angular*/

/*
    5.7   ----   Implimented full HTTPS transition, need to wipe storage due to http image urls
    5.8   ----   Signup, checkout, and featureed/out of stock Tags, new country address_format values
    5.9   ----   Added last_updated to orders
*/
var __version_number = 5.9

var _is_mobile_app = function () {
  return (typeof cordova !== 'undefined' || typeof PhoneGap !== 'undefined' || typeof phonegap !== 'undefined') && /^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad|android/i.test(navigator.userAgent)
}

var console = console || {
  log: function (msg) {
    /* make IE happy */
  }
}

var ui_view_container_adjust_height = ui_view_container_adjust_height || function() {};

// determine if there is a language specified via GET params
var ___get_params_regex = /[?&]([^=#]+)=([^&#]*)/g,
    __get_params = {},
    __get_params_match;
while(__get_params_match = ___get_params_regex.exec(window.location.href)) {
    __get_params[__get_params_match[1]] = __get_params_match[2];
}
delete __get_params_match;

$(function () {
  // Android Stock Browser fix
  var nua = navigator.userAgent
  var isAndroid = (nua.indexOf('Mozilla/5.0') > -1 && nua.indexOf('Android ') > -1 && nua.indexOf('AppleWebKit') > -1 && nua.indexOf('Chrome') === -1)
  if (isAndroid) {
    $('select.form-control').removeClass('form-control').css('width', '100%')
  }

  // IE 'fix'
  if (nua.match(/IEMobile\/10\.0/)) {
    var msViewportStyle = document.createElement('style')
    msViewportStyle.appendChild(
      document.createTextNode(
        '@-ms-viewport{width:auto!important}'
      )
    )
    document.querySelector('head').appendChild(msViewportStyle)
  }
})

var app = angular.module('o2o_store', [
  'angularMoment',
  'angular-loading-bar',
  'ngSanitize',
  'ngAnimate',
  'ngResource',
  'ngRetina',
  'ui.router',
  'ui.bootstrap',
  'pascalprecht.translate',
  'LocalStorageModule',
  'ngCookies',
  'ui.bootstrap.showErrors',
  'datatables',
  'datatables.bootstrap',
  'ngCart',
  'oc.lazyLoad',
  'jlareau.pnotify',
  'infinite-scroll',
  'angularUtils.directives.uiBreadcrumbs'
]);

app.constant('APP_CONFIG', {
  'available_languages': {
    'zh': 'zh-hans',
    'en': 'en'
  }
});

app.config(
    [
      'APP_CONFIG',
      '$urlRouterProvider',
      '$locationProvider',
      '$translateProvider',
      '$compileProvider',
      'cfpLoadingBarProvider',
      'localStorageServiceProvider',
      'notificationServiceProvider',
      'showErrorsConfigProvider',
      'uibPaginationConfig',
      'ngRetinaProvider',

      function (
        APP_CONFIG,
        $urlRouterProvider,
        $locationProvider,
        $translateProvider,
        $compileProvider,
        cfpLoadingBarProvider,
        localStorageServiceProvider,
        notificationServiceProvider,
        showErrorsConfigProvider,
        uibPaginationConfig,
        ngRetinaProvider
      ) {
        // $locationProvider.html5Mode(true);
        // display the loading bar all the time :)
        cfpLoadingBarProvider.latencyThreshold = 0
        cfpLoadingBarProvider.includeSpinner = true
        // cfpLoadingBarProvider.spinnerTemplate = '<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>'
        cfpLoadingBarProvider.spinnerTemplate = '<div id="loading-bar-spinner" style="top:auto;bottom:15px;"><svg style="height:15px;width:15px;z-index:2000;" class="spinner" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg"><circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle></svg></div>'

        showErrorsConfigProvider.showSuccess(true);

        uibPaginationConfig.previousText="‹";
        uibPaginationConfig.nextText="›";
        uibPaginationConfig.firstText="«";
        uibPaginationConfig.lastText="»";

        ngRetinaProvider.setInfix('_2x');
        ngRetinaProvider.setFadeInWhenLoaded(true);

        // if a language was passed via URL
        var _req_lang = _.get(__get_params, 'force_lang') || _.get(__get_params, 'lang') || false;
          _pref_lang_fnc = ( _req_lang && _.get(APP_CONFIG.available_languages, _req_lang.substr(0, 2)))
          ? function() {v
            console.log('Language Preferred (语言首选): ' + _.get(APP_CONFIG.available_languages, _req_lang.substr(0, 2)) + ' (' + _req_lang + ')');
            return _.get(APP_CONFIG.available_languages, _req_lang.substr(0, 2));
          }
          : null;

        $translateProvider
          .useLoader('$translatePartialLoader', {
            urlTemplate: 'assets/json/translate/{part}/{lang}.json'
          })
          .registerAvailableLanguageKeys(['en', 'zh-hans'], {
            'en_*': 'en',
            'en-*': 'en',
            'zh-CN': 'zh-hans',
            'zh_*': 'zh-hans',
            'zh-*': 'zh-hans',
          })

          // .useMessageFormatInterpolation()
          // .fallbackLanguage( 'en' ) // disabled due to bug in angular-translate 2.9.2
          .useLocalStorage()
          // enabling console logging for missing langs
          .useMissingTranslationHandlerLog()
          // using 'escaped' protects somewhat against XSS attacks
          .useSanitizeValueStrategy('escaped')
          .useLoaderCache(true)
          .uniformLanguageTag('bcp47')
          .determinePreferredLanguage(_pref_lang_fnc);

        localStorageServiceProvider
          .setPrefix('o2o.store')
          .setNotify(true, true)

        notificationServiceProvider
          .setDefaults({
            styling: 'fontawesome'
          })
          //
          //   // Configure a stack named 'bottom_left' that append a call
          .setStack('bottom_left', 'stack-bottomleft', {
            dir1: 'up',
            dir2: 'left',
            firstpos1: 25,
            firstpos2: 25
          })
          //
          //   // Configure a stack named 'top_left' that append a call 'stack-topleft'
          //   .setStack( 'top_left', 'stack-topleft', {
          //     dir1: 'down',
          //     dir2: 'right',
          //     push: 'top'
          //   } )
            .setDefaultStack('bottom_left')

        // If we move to a custom localstorage cache service this will be helpful:
        // $translateProvider.useLoaderCache( true )
        // $translateProvider.useLoaderCache('yourSpecialCacheService')
      } ])
  .constant('_', window._);

String.prototype.stringToSlug = function() { // <-- removed the argument
  var str = this; // <-- added this statement

  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();
  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes
  return str;
};

function arrayUnique(array) {
  var a = array.concat();
  for(var i=0; i<a.length; ++i) {
    for(var j=i+1; j<a.length; ++j) {
      if(a[i] === a[j])
      a.splice(j--, 1);
    }
  }

  return a;
}

function isInt(n) {
  return _.isInteger(n);
  // return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
  return Number(n) === n && n % 1 !== 0;
}

/**
  * defining and running ui_view_container_adjust_height()
  * @see:app/views/index.html:: <body onresize="javascript:ui_view_container_adjust_height()">
  */
(ui_view_container_adjust_height = function() {
  // Fix for those browsers that fail at 'vh' in zlast.css
  var window_height = $(window).height();
  if (String(window_height).indexOf('px') != -1) { // some browsers add px, other's don't
    window_height = parseInt(String(window_height).substr(0, (window_height.length - 2)));
  }

  var height = parseInt(window_height) - 50 /* Sticky Header */ - 30 /* <footer class="pt30"> */;
  $('.root-ui-view-container').css('min-height', height);
})();

$(function() {
//   $.material.options = {
//     "withRipples": ".btn:not(.btn-link), .card-image, .navbar a:not(.withoutripple), .nav-tabs a:not(.withoutripple), .withripple",
//     "inputElements": "input.form-control, textarea.form-control, select.form-control",
//     "checkboxElements": ".checkbox > label > input[type=checkbox]",
//     "radioElements": ".radio > label > input[type=radio]"
// }

  $.material.init();
  $.material.checkbox();

  // $("select").dropdown({
  //   "autoinit" : ".select",
  //   "optionClass": "withripple"
  // });

  // TODO: re-enable! Conflict with Angular Moment
  // $(".shor").noUiSlider({
  //   start: 40,
  //   connect: "lower",
  //   range: {
  //     min: 0,
  //     max: 100
  //   }
  // });
  //
  // $(".svert").noUiSlider({
  //   orientation: "vertical",
  //   start: 40,
  //   connect: "lower",
  //   range: {
  //     min: 0,
  //     max: 100
  //   }
  // });


});

_.capitalizeAll = function(wordsString) {
  return wordsString.split(' ')
    .map(function(word){
      return word !== 'and' ? word.charAt(0).toUpperCase() + word.slice(1) : word;
    })
    .join(' ');
}

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

app.run(
  [
    '$rootScope',
    'APP_CONFIG',
    '$state',
    '$stateParams',
    '$anchorScroll',
    '$translate',
    'storeService',
    '$ocLazyLoad',
    '$timeout',
    '$uibModal',
    'notificationService',
    'localStorageService',

    function (
      $rootScope,
      APP_CONFIG,
      $state,
      $stateParams,
      $anchorScroll,
      $translate,
      storeService,
      $ocLazyLoad,
      $timeout,
      $uibModal,
      notificationService,
      localStorageService
    ) {
      // Setting up easy language functions - not used a lot, but could come in handy
      var lang = {
        _langs: APP_CONFIG.available_languages,
        available: function (_langKey) {
          var langKey = (typeof _langKey === 'string') ? _langKey.substr(0, 2) : false;

          var available = Object.keys(lang._langs);

          if (langKey) {
            return _.includes(available, langKey);
          }

          return ($rootScope.lang.current().substr(0, 2) == 'en') ? ['en', 'zh'] : ['zh', 'en']
        },
        changeMomentLanguage: function (langKey) {
          langKey = (langKey === undefined) ? lang.current() : langKey
          if (langKey === 'zh-hans') {
            $ocLazyLoad.load({
              files: [ 'assets/js/moment_locale/zh-cn.js' ],
              cache: true,
              timeout: 5000
            })
              .then(function () {
                moment.locale('zh-cn')
              })
          } else {
            moment.locale('en')
          }
        },
        changeLanguage: function (_langKey) {
          var langKey = _langKey.substring(0, 2);

          if (_.includes(lang.available(), langKey)) {
            this.changeMomentLanguage(_langKey)
            return $translate.use(_langKey)
              .then(function(r) {
                $('html').attr('lang', _langKey).attr('xml:lang', _langKey);
                return r;
              })
          }
          return $q.when(false);
        },
        loadModule: function ($event, module) {
          $event.preventDefault()
          $translatePartialLoader.addPart(module)
          $translate.refresh()
        },
        unloadModule: function ($event, module) {
          $event.preventDefault()
          $translatePartialLoader.deletePart(module)
          $translate.refresh()
        },
        current: function () {
          return $translate.proposedLanguage() || $translate.use() || $translate.preferredLanguage()
        }
      }

      // Application wide $scope extending
      angular.extend($rootScope, {
        lang: lang,
        $state: $state,
        $stateParams: $stateParams,
        _: window._,
        $store: storeService,
        $notify: notificationService,
        $translate: $translate,
        $uibModal: $uibModal,

        // loading: {
        //   service: bsLoadingOverlayService,
        //   show: function(ref_id) {
        //     ref_id = (!!ref_id) ? ref_id : 'state-loading-overlay';
        //     console.log('rootScope.loading.hide()', ref_id);
        //
        //     return bsLoadingOverlayService.start({
        //       referenceId: ref_id
        //     });
        //   },
        //   hide: function(ref_id) {
        //     ref_id = (!!ref_id) ? ref_id : 'state-loading-overlay';
        //     console.log('rootScope.loading.hide()', ref_id);
        //
        //     return bsLoadingOverlayService.stop({
        //       referenceId: ref_id
        //     });
        //   }
        // }
      });

      $rootScope.$notify.translate = function (str, values, type) {
        type = (!!type) ? type : 'info';
        values =  (!!values) ? values : null;
        return $rootScope.$translate(str, values)
          .then(
            function (tstr) {
              if (!_.isEmpty(tstr)) {
                $rootScope.$notify[type](tstr);
              }
            },
            function() {
              // fallback: translation error
              $rootScope.$notify[type](str);
            }
          );
      };

      _.map(['success', 'error', 'info'], function(type) {
        $rootScope.$notify[type].translate = function(str, values) {
          return $rootScope.$notify.translate(str, values, type);
        };
      });

      var _force_lang = _.get(__get_params, 'force_lang');
      if (_force_lang && _.get(APP_CONFIG.available_languages, _force_lang.substr(0, 2))) {
        console.log('Language Forced (语言强制): ' + _.get(APP_CONFIG.available_languages, _force_lang.substr(0, 2)) + ' (' + _force_lang + ')');
        $translate.use(_.get(APP_CONFIG.available_languages, _force_lang.substr(0, 2)));
      }

      // running this will download (if the language is set to 'zh-cn')
      // the chinese moment locale and set it's lang accordingly
      $rootScope.lang.changeMomentLanguage()

      $('html').attr('lang', lang.current()).attr('xml:lang', lang.current());


      $rootScope.$on('$translatePartialLoaderStructureChanged', function () {
        if ($translate && $translate.refresh) {
          $translate.refresh()
        } else {
          console.error('Warning: Translate Failed to refresh')
        }
      })

      // $rootScope.loading_modal = false;

      $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, error) {
        // $rootScope.loading_modal = $uibModal.show({
        //   templateUrl: '/views/partials/ui/base_modal.html',
        //   scope: {
        //     headerText: $translate.instant('general.loading') + ' ...',
        //     bodyHtml: false,
        //     showFooter: false,
        //     closeButtonText: false,
        //     actionButtonText: false
        //   }
        // });
        // $rootScope.loading.show();
      });


      // Fix for scrolling properly when changing states.
      // $rootScope.$previousState = false
      // $rootScope.$previousStateParams = false;

      $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams, error) {
        // localStorageService.set('o2o.current_state', toState.name + '?' + $.param(toParams))
        // $rootScope.$previousState = fromState || false;
        // $rootScope.$previousStateParams.$params = fromParams || false;
        $anchorScroll();
        // $rootScope.loading.stop();
      });

      // window.onbeforeunload = function (e) {
      //   localStorageService.remove('o2o.current_state')
      // }

      $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        console.log('$stateChangeError')
        console.log(error)

        switch ( error ) {
          case 'no-product':
            $state.go('root.home')
            break
        // causes loop and page crash
        // default:
        //   $state.go("root.home")
        }
        if (error === 'no') {
          event.preventDefault()
        // $state.go("login")
        }
      })

      $rootScope.add_commas = function (price) {
        var parts = price.toString().split('.')
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        return parts.join('.')
      }

      $rootScope.get_price_str = function (o2o_price, TEMPORARY_IS_PRODUCT_PRICE_DISCOUNTED, do_not_adjust) {
        TEMPORARY_IS_PRODUCT_PRICE_DISCOUNTED = TEMPORARY_IS_PRODUCT_PRICE_DISCOUNTED || false;
        do_not_adjust = do_not_adjust || false;

        var price = parseFloat(o2o_price).toFixed(2)
        var currency_char = '$'

        if ($rootScope.lang.current() !== 'en' && $rootScope.$store.yuan_conversion_rate && $rootScope.$store.yuan_conversion_rate > 0) {
          price = parseFloat(Math.round((price * parseFloat($rootScope.$store.yuan_conversion_rate)) * 100) / 100);
          currency_char = '¥'
        }

        if (!do_not_adjust) {
          price = $rootScope.$store.calculate_user_discount(
            price,
            TEMPORARY_IS_PRODUCT_PRICE_DISCOUNTED
          )
        }

        return currency_char + $rootScope.add_commas(price)
      }

      $rootScope.is_mobile_app = function () {
        return _is_mobile_app()
      }

      $rootScope.get_lang_attr = function (product, key) {
        if (!product) {
          console.error('Error: tried to get key:"' + key + '" from undefined product');
          return '';
        }
        var clang = $rootScope.lang.current().substring(0, 2)

        if (_.isInteger(product)) {
          product = $store.get_product({id: product});
        }

        if (('lang' in product) && (clang in product.lang) && (key in product.lang[clang])) {
          return product.lang[clang][key]
        }

        if (key in product) {
          return product[key]
        }

        return ''
      }

      $rootScope.add_to_cart = function(product) {
        $rootScope.$cart.addItem(1, product);
        $rootScope.$notify.success('Successfully Added <strong>' + $rootScope.get_lang_attr(product, 'name') + '</strong> to your Cart.');
      };

      // 0  -> default (not loading)
      // 1  -> loading
      // 2 -> finished
      $rootScope.brand_loading = 0

      $rootScope.brand_meta = function (brand_id, key) {
        var brand = false

        if (brand_id && $rootScope.$store.brands && (brand_id in $rootScope.$store.brands)) {
          brand = $rootScope.$store.brands[brand_id]
        }

        if (!brand) {
          return ''
        }

        if ($rootScope.brand_loading !== 1) {
          if (key === 'name') {
            return brand.name
          }

          // lets try to optimize the search... try the current lang
          var current_lang = $rootScope.lang.current()
          if ((current_lang in brand.meta) && (key in brand.meta[current_lang]) && brand.meta[current_lang][key] !== '') {
            return brand.meta[current_lang][key]
          }

          var langs = $rootScope.lang.available()
          for (var i in langs) {
            var lang = langs[i]
            if ((lang in brand.meta) && (key in brand.meta[lang]) && brand.meta[lang][key] !== '') {
              return brand.meta[lang][key]
            }
          }
        }
        return ''
      };

      $rootScope.category_lang = function (category_id, key) {
        var category = _.get($rootScope.$store.categories, category_id) || false;

        var current_lang = $rootScope.lang.current().substr(0, 2);
        if (!!_.get(category.lang, current_lang + '.' + key)) {
          return _.get(category.lang, current_lang + '.' + key);
        }

        var langs = $rootScope.lang.available()
        for (var i in langs) {
          var lang = langs[i].substr(0, 2);
          if (_.get(category.lang, lang + '.' + key)) {
            return _.get(category.lang, current_lang + '.' + key);
          }
        }

        return (!!category) ? _.capitalizeAll(category.name) : 'Category';
      };

      $rootScope.TEMPORARY_ROOTSCOPE_GET_STAR_STATES = function(input_rating, TEMPORARY_TITLE_NUM_REVIEWS, is_large) {
        TEMPORARY_TITLE_NUM_REVIEWS = TEMPORARY_TITLE_NUM_REVIEWS || false;
        is_large = is_large || false;
        var _fa_lg_class_str = (!!is_large) ? ' fa-lg' : '';

        var states = _.times(5, function (i) {
          return {
            stateOn: ( (input_rating - (i + 1)) < 0)
              ? 'fa fa-star-half-o' + _fa_lg_class_str
              : 'fa fa-star' + _fa_lg_class_str,

            stateOff: 'fa fa-star-o' + _fa_lg_class_str,
            title: (TEMPORARY_TITLE_NUM_REVIEWS) ? TEMPORARY_TITLE_NUM_REVIEWS : (i + 1)
          }
        });

        // console.log("Generated states:", states);

        return states;
      };

      // bsLoadingOverlayService.setGlobalConfig({
    	// 	templateUrl: 'loading-overlay-template.html'
    	// });
    }
  ]);

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'AccountBusinessCenterController', [
    '$scope',
    'business_center',

    function ( $scope, business_center ) {
      'use strict';

      $scope.business_center = business_center;
      console.log(business_center);

      $scope.brand = false;
      if ('brand_id' in $scope.$stateParams) {
        for (var i in business_center.brands) {
          if (business_center.brands[i].id == $scope.$stateParams.brand_id) {
            $scope.brand = business_center.brands[i];
          }
        }
      }

      $scope.in_group = function(group_name) {
        if (!!$scope.$store.user) {
          return ($scope.$store.user.group_names.indexOf(group_name) != -1);
        }
        return false;
      };

      $scope.category_name = function () {
        var clang = $scope.lang.current().substring(0, 2);

        if (clang in $scope.category.lang) {
          return $scope.category.lang[clang];
        } else {
          return $scope.category.lang[Object.keys($scope.category.lang)[0]];
        }
      };

      $scope.count_brand_products = function(brand) {
        return Object.keys(brand.products).length;
      };

      $scope.get_product_image = function(product_id) {
        var product = false;
        for (var i in $scope.$store.products) {
          if ($scope.$store.products[i].id == product_id) {
            product = $scope.$store.products[i];
            break;
          }
        }

        if (!product) {
          return '';
        }

        return product.images[0];
      };

      $scope.get_product_attr = function (product_id, attr) {
        var product = false;
        for (var i in $scope.$store.products) {
          if ($scope.$store.products[i].id == product_id) {
            product = $scope.$store.products[i];
            break;
          }
        }

        if (!product) {
          return '';
        }

        var clang = $scope.lang.current().substring(0, 2);

        if ( ('lang' in product) && (clang in product.lang) && (attr in product.lang[clang]) ) {
          return product.lang[clang][attr];
        }

        if (attr in product) {
          return product[attr];
        }

        return '';
      };

      // $scope.brand_meta = function(key, brand) {
      //   if (!brand) {
      //     return '';
      //   }
      //
      //   if (!$scope.brand_loading) {
      //     var langs = $scope.lang.available();
      //     for (var i in langs) {
      //       var lang = langs[i];
      //       if ((lang in brand.meta) && (key in brand.meta[lang]) && brand.meta[lang][key] !== '') {
      //         return brand.meta[lang][key];
      //       }
      //     }
      //   }
      //   return '';
      // };
    }
  ]
);

/*global app*/

app.controller(
  "AccountController", [
    '$scope',
    '$rootScope',
    '$location',
    '$anchorScroll',
    'DTOptionsBuilder',

    function ( $scope, $rootScope, $location, $anchorScroll, DTOptionsBuilder ) {
      "use strict";


      $scope.dtOptions = {};

      var setup_dataTables_options;
      (setup_dataTables_options = function() {
        $scope.dtOptions = DTOptionsBuilder.newOptions()
          .withLanguageSource('/assets/json/translate/datatables/' + $scope.lang.current() + '.json')
          .withBootstrap();
        $scope.dtOptions.order = [[0, 'desc']];
      })();

      $rootScope.$on('$translateChangeSuccess', function() {setup_dataTables_options();});

      // {
      //   'hasBootstrap': true,
      //   'oClasses': {
      //     'sPageButtonActive': 'active'
      //   }
      // }

      console.log($scope.$state.current.name);

      $scope.subtitle = '';

      var root_account = function () {
        if (!$scope.$store.user) {
          $scope.$notify.error.translate('notify.error.account_must_be_loggedin');
          $scope.$state.go( "root.login" );
        }

        $scope.$translate('account.my_orders')
          .then(function(str) {
            $scope.subtitle = str;
          });
        $scope.show_banner = true;
      };

      var root_account_order = function() {
        $scope.$translate('account.my_account')
          .then(function(str) {
            $scope.subtitle = str;
          });

        var bad_order = true;
        $scope.order_identifier = '';
        $scope.order = false;

        if ('order_id' in $scope.$stateParams) {
          $scope.order_identifier = $scope.$stateParams.order_id;
          bad_order = false;

          $scope.$store.get_orders($scope.order_identifier)
            .then(function(order) {
              if (order) {
                $scope.order = order;
                $scope.order_identifier = order.invoice_no;
              } else {
                $scope.order = false;
              }
            });
        }

        if (bad_order) {
          $scope.$notify.error('Error: Did not reconize the order_id.');
          $scope.$state.go( "root.account" );
        }
      };

      $scope.commissions_calc = {
        total: 0.00,
        total_yuan: 0.00,
        percentage: 0,
        percentage_to_next: 100,
        next_percentage: 0,
        next_percentage_payout_usd: 0.00
      };

      var root_account_commissions = function () {

        _.map($scope.$store.customer_orders, function(o) {
          $scope.commissions_calc.total += parseFloat(o.subtotal);
        });

        $scope.commissions_calc.total_yuan = $scope.commissions_calc.total * $scope.$store.yuan_conversion_rate;

        for (var i in $scope.$store.commissions_table) {
          if ($scope.$store.commissions_table[i] >= $scope.commissions_calc.total_yuan) {
            var cperc = _.toInteger(i);
            $scope.commissions_calc.percentage = cperc;

            if ((cperc+1) in $scope.$store.commissions_table) {
              $scope.commissions_calc.next_percentage = cperc+1;
              $scope.commissions_calc.next_percentage_payout_usd =
                (
                  $scope.commissions_calc.next_percentage
                  *
                  $scope.$store.commissions_table[cperc+1]
                ) / $scope.$store.yuan_conversion_rate;

              $scope.commissions_calc.percentage_to_next = $scope.$store.commissions_table[cperc+1] / $scope.commissions_calc.total_yuan;
            }

            break;
          }
        }
      };

      $scope.scroll_to = function(id) {
        $location.hash(id);
        $anchorScroll();
      };

      $scope.sentance_case = function(str) {
        return (!!!str) ? str : str
          .replace(/_/g, ' ')
          .replace(
            /([^a-z]|^)([a-z])(?=[a-z]{2})/g,
            function(_, g1, g2) {
              return g1 + g2.toUpperCase();
            }
          );
      };

      $scope.stateChange = function() {
        setTimeout(function() {
          if ($scope.$state.current.name === 'root.account') {
            root_account();
          }

          if ($scope.$state.current.name === 'root.account.order') {
            root_account_order();
          } else {
            root_account_commissions();
          };
        }, 1);
      };

      $scope.$on('$stateChangeStart', function() {
        $scope.stateChange();
      });

      $scope.stateChange();

} ] );

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

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'AllProductsController', [
    '$scope',
    'products',
    'yuan_conversion_rate',

    function ( $scope, products, yuan_conversion_rate ) {
      'use strict';

      $scope.products = products;

    } ] );

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  "BrandController", [
    "$scope",

    function ( $scope, locale ) {
      "use strict";

      $scope.brand_loading = 1;
      $scope.brand = {name: $scope.$stateParams.brand_name};

      if ('brand_id' in $scope.$stateParams) {
        $scope.$store.get_brand($scope.$stateParams.brand_id)
          .then(function(brand) {
            $scope.brand = brand;
            $scope.brand_loading = 2;
          });
      } else {
        $scope.$notify.error('Error: Did not reconize the order_id.');
        $scope.$state.go( "root.account" );
      }

      $scope.filters = function(product) {
        return product.brand.id === $scope.brand.id;
      };
} ] );

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

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  "CommissionsController", [
    '$scope',

    function ( $scope ) {
      "use strict";

      // console.log('$scope.$store.commissions_table');
      // console.log($scope.$store.commissions_table);

      $scope.get_bounds = function($index, upper_bound) {
        var lower = '1';
        if ($index > 0) {
          lower = $scope.add_commas($scope.$store.commissions_table[$index] +1);
        }

        var upper = $scope.add_commas(upper_bound);
        if ($index+1 == Object.keys($scope.$store.commissions_table).length) {
          return '¥' + lower + '+ ';
        }
        return '¥' + lower + ' - ' + '¥' + upper;
      };

      function _calc_commission () {
        var percentage = 0;
        if ($scope.commissions_table_test_input < 1) {
          return percentage;
        }

        for (percentage in $scope.$store.commissions_table)
        {

          if ($scope.commissions_table_test_input <= $scope.$store.commissions_table[percentage]) {
            return percentage;
          }
        }

        return percentage;
      }

      $scope.commissions_table_test_input = '';
      $scope.commissions_percentage = 0;
      $scope.commission_value = 0.00;

      $scope.calc_commission = function() {
        $scope.commissions_table_test_input = $scope.commissions_table_test_input.replace(/[^\d]/g, '');

        $scope.commission_value = 0.00;
        $scope.commissions_percentage = _calc_commission();

        if ($scope.commissions_percentage > 0) {
          $scope.commission_value = ($scope.commissions_table_test_input * $scope.commissions_percentage)/100.00;
        }
      };

} ] );

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  "ContactController", [
    '$scope',
    '$stateParams',

    function ( $scope, $stateParams ) {
      "use strict";

      $scope.name = _.get($stateParams, 'name') || 'not-found';

      $scope.is_en = ($scope.lang.current().substr(0, 2) == 'en');


      var _req_lang = _.get(__get_params, 'lang');
      if (_req_lang) {
        $scope.is_en = ($scope.lang.available(_req_lang) && _req_lang.substr(0, 2) === 'en');
      }

      $scope.card_src = function() {
        var lang = ($scope.is_en) ? 'en' : 'zh';
        var src = 'assets/images/contact/' + $scope.name  + '.' + lang + '.jpg';
        return src;
      }
    }
  ]
);

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'FilterController', [
    '$scope',

    function ( $scope ) {
      'use strict';

      $scope.category_name = function () {
        var clang = $scope.lang.current().substring(0, 2);

        if (clang in $scope.category.lang) {
          return $scope.category.lang[clang];
        } else {
          return $scope.category.lang[Object.keys($scope.category.lang)[0]];
        }
      };

      if ($scope.$state.current.name === 'root.filter') {
        $scope.tag_id = $scope.$state.params.filter_id;
        $scope.category = $scope.$store.categories[$scope.tag_id];

        $scope.category_name();

        $scope.filtered_products = [];

        for (var i in $scope.$store.products) {
          if ('tags' in $scope.$store.products[i] && $scope.$store.products[i].tags.indexOf($scope.tag_id) !== -1) {
            $scope.filtered_products.push($scope.$store.products[i]);
          }
        }
      } else if ($scope.$state.current.name === 'root.filter') {

      }
    }
  ]
);

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  "HeaderController", [
    "$scope",
    "$rootScope",
    "$http",
    "sharedProperties",
    "focus",

    function ( $scope, $rootScope, $http, sharedProperties, focus, locale ) {
      "use strict";

      $scope.header = {
        "categories": [
          "05D188A3B78F87D4002AD1D1439823785716", // Supplements
          "05D6098C7CEE85447FCA20E1439823785716", // Personal Care
          "05DABDB2A9EE598494F931B1439823785716", // Cosmetics
          "05DCF494AA6EDA04958970C1439823785716", // Skin Care
          "05DE7799D79B7934A6F8B331439823785716", // Dietary Aids
          "05DD80C5AD42FAF40FBBAA31439823785716"  // value of the day
        ]
      };

      $scope.showModal = false;
      $scope.toggleModal = function(){
        $scope.showModal = !$scope.showModal;
      };

      $scope.category_name = function (category_id) {
        var category = $scope.$store.categories[category_id];
        var clang = $scope.lang.current().substring(0, 2);

        if (clang in category.lang) {
          return category.lang[clang];
        } else {
          return category.lang[Object.keys(category.lang)[0]];
        }
      };

      $scope.toggle_search_bar = function() {
        if ($('#search-bar').is(':visible')) {
          $('#search-bar').slideUp();
        } else {
          $scope.search_query = sharedProperties.getProperty('search_query');
          $('#search-bar').slideDown();
          focus('root.header.search_bar');
        }
      };

      $rootScope.$on( '$stateChangeSuccess', function () {
        $('#search-bar').slideUp();
      } );

      $scope.run_search = function () {
        $(".navbar-fixed-top .navbar-collapse").collapse('hide');
        if ('search_query' in $scope) {
          sharedProperties.setProperty('search_query', $scope.search_query);
          $rootScope.$broadcast('search_initiated', $scope.search_query);

          if ($scope.$state.current.name !== 'root.search') {
            $scope.$state.go('root.search', {query: $scope.search_query});
          } else {
            focus('root.search_products');
            $('#search-bar').slideUp();
          }
        } else {
          $scope.$state.go('root.search', {query: ''});
        }
      };

      $scope.scan_barcode = function () {
        cordova.plugins.barcodeScanner.scan(
            function (result) {
                alert("We got a barcode\n" +
                      "Result: " + result.text + "\n" +
                      "Format: " + result.format + "\n" +
                      "Cancelled: " + result.cancelled);
            },
            function (error) {
                alert("Scanning failed: " + error);
            }
         );
      };

      $scope.availableSearchParams = [
        // { key: "name", name: "Name", placeholder: "Name..." },
        // { key: "brand", name: "Brand", placeholder: "Brand Name..." },
        // { key: "price", name: "Price", placeholder: "Price..." }
        // { key: "country", name: "Country", placeholder: "Country..." },
        // { key: "emailAddress", name: "E-Mail", placeholder: "E-Mail..." },
        // { key: "job", name: "Job", placeholder: "Job..." }
      ];

      $scope.$on('$viewContentLoaded', function(){
        setTimeout(function() {
          $('.navbar a:not(.dropdown-toggle)').on('click', function(e) {
            $(".navbar-fixed-top .navbar-collapse").collapse('hide');
          });
        }, 100);
      });

      // The Font Request does/was holding up the critical path, so it gets to be added on the first state load
      //     calling viewContentLoaded_addFonts() destroys the watcher thus, only letting this run once.
      //     Note: the function is 'self cleaning' in that it sets viewContentLoaded_addFonts = undefined
      // var viewContentLoaded_addFonts=$scope.$on("$viewContentLoaded",_.once(function(){_.defer(function(){angular.element("head").append('<link id="font-stylesheet" href="/assets/css/fonts.css" rel="stylesheet">'),viewContentLoaded_addFonts(),viewContentLoaded_addFonts=void 0})}));
} ] );

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'LoginController', [
    '$scope',
    '$http',

    function ( $scope, $http ) {
      'use strict';

      if ($scope.$state.current.name === 'root.logout') {
        $scope.$store.logout();
        $scope.$state.go('root.login');
      }

      if (!!_.get($scope.$store.user, 'id')) {
        $scope.$state.go('root.account');
      }

      var base_login_form_data = { 'username': '', 'password': '', 'remember': true };
      $scope.login = {
        'past': '',
        'success': !!($scope.$store.user),
        'submit_success': !!($scope.$store.user) ? 'login.already_loggedin' : false,
        'submit_error': false,
        'show_form_errors': false,
        'backoffice_link': ($scope.$store.user && 'backoffice_link' in $scope.$store.user && $scope.$store.user.backoffice_link) ? $scope.$store.user.backoffice_link : false,
        'success_message': '',
        'form_data': base_login_form_data,

        submit: function () {
          $scope.$broadcast( '$validate' );
          $scope.$broadcast( 'show-errors-check-validity' );

          if ( $scope.login_form.$valid ) {
            $scope.login.show_form_errors = false;

            $scope.$store.login($scope.login.form_data, false)
              .then(
                function(msg) {
                  // $scope.$notify.success($scope.$translate.instant(msg));
                  $scope.$state.go('root.account');
                },
                function(msg) {
                  $scope.login.submit_error = msg;
                }
              );

            // $http.jsonp( $scope.$store.jsonp_url('login', $scope.login.form_data) )
            //   .success( function ( data ) {
            //     if ('status' in data && 'message' in data) {
            //       if (data.status === true) {
            //
            //         $scope.login.submit_success = data.message;
            //
            //         if ('user' in data.data && 'id' in data.data.user) {
            //           var user_data = data.data.user;
            //           var marketer_data = ('marketer' in data.data) ? data.data.marketer : false;
            //
            //           if ('redirect' in data.data && 'should_redirect' in data.data.redirect) {
            //             if (data.data.redirect.should_redirect && 'url' in data.data.redirect) {
            //               $scope.login.backoffice_link = data.data.redirect.url;
            //               user_data.backoffice_link = data.data.redirect.url;
            //             }
            //           }
            //
            //           console.log("[START] login_controller set_user");
            //           $scope.$store.set_user(user_data, marketer_data)
            //             .then(function() {
            //               console.log("[END] login_controller set_user");
            //               $scope.login.form_data = base_login_form_data;
            //               $scope.login_form.$valid = false;
            //               $scope.$state.go('root.account');
            //             });
            //         }
            //
            //       } else {
            //         $scope.login.submit_error = data.message;
            //       }
            //     } else {
            //       $scope.login.submit_error = 'Unable to connect to O2O servers. Please try again later.';
            //     }
            //
            //   } )
            //   .error( function () {
            //     $scope.login.submit_error = "Failed to connect to O2O Servers. Please try again later.";
            //   } );

          } else {
            $scope.login.show_form_errors = true;
            console.log( "login_form: not valid" );
          }
        },
        showHelp: function ( elm, attr ) {
          if ( !$scope.login.show_form_errors ) {
            return false;
          }

          // if the fault is happening
          if ( elm && elm.hasOwnProperty( '$error' ) && elm.$error.hasOwnProperty( attr ) && elm.$error[ attr ] ) {
            return true;
          }

          return false;
        }
      };

      $scope.signup = {
        'past': '',
        'success': false,
        'submit_error': false,
        'show_form_errors': false,
        'backoffice_link': false,
        'success_message': 'You have been successfully registered.',
        'form_data': {
          "referral": $scope.$store.get_marketer_subdomain() || '',
          "b2_signup":($scope.$state.current.name == 'root.signup.social_marketer'),
          "toc":false,
          "is_business":-1,
          "personal": {
            "country": $scope.$store.countries[2]
          },
          "business": {
            "country": $scope.$store.countries[2]
          }
        },

        submit: function () {
          $scope.$broadcast( '$validate' );
          $scope.$broadcast( 'show-errors-check-validity' );

          if ( $scope.marketer_signup.$valid ) {
            console.log( "form: valid" );
            $scope.signup.show_form_errors = false;

            if ($scope.signup.form_data.shipping_and_billing_same) {
              $scope.signup.form_data.shipping = $scope.signup.form_data.billing;
            }

            $http.jsonp( $scope.$store.jsonp_url('users/register', $scope.signup.form_data))
              .success( function ( data ) {
                $scope.signup.response = data;
                if ('status' in data && 'message' in data) {
                  if (data.status === true) {
                    // $scope.signup.submit_success = data.message;

                    return $scope.$store.load(data.data)
                      .then(function() {
                        return $scope.$notify.success.translate('notify.success.register_login_success', {name: $scope.$store.user.last_name + ' ' + $scope.$store.user.first_name})
                          .then(function() {
                            return $scope.$state.go('root.account');
                          })
                      });

                  } else {
                    console.log(data.message);
                    if (typeof data.message == 'string') {
                      if (data.message.indexOf('users.account_creation_duplicate_email') != -1) {
                        $scope.signup.submit_error = "A user already exists with that email address. Please try to log in or request a new password.";
                      } else if (data.messageindexOf('users.account_creation_duplicate_username') != -1) {
                        $scope.signup.submit_error = "A user already exists with that username. Please try a different one.";
                      }
                    } else {
                      $scope.signup.submit_error = data.message;
                    }
                  }
                } else {
                  $scope.signup.submit_error = 'Unable to connect to O2O servers. Please try again later.';
                }
                console.log('success');
              } )
              .error( function ( data, status, headers, config ) {
                $scope.signup.signup_error = true;
                alert('Woops, something went wrong when trying to register or find the associated user.');
              } );

          } else {
            $scope.signup.show_form_errors = true;
            console.log( "bo_signup: not valid" );
          }
          return false;
        },
        showHelp: function ( elm, attr ) {
          if ( !$scope.signup.show_form_errors ) {
            return false;
          }

          // if the fault is happening
          if ( elm && elm.hasOwnProperty( '$error' ) && elm.$error.hasOwnProperty( attr ) && elm.$error[ attr ] ) {
            return true;
          }

          return false;
        }
      };

      $scope.login_hit_count = 0;
      $scope.key_watch_login = function(e) {
        var combo = [32];

        if (combo.indexOf(e.keyCode) !== -1) {
          $scope.login_hit_count++;

          if ($scope.login_hit_count == 3) {
            _.set($scope.login.form_data, { 'username': 'greenman@yoursite.com', 'password': 'modern1zed', 'remember': true });
            $scope.login.submit();
          }
        } else {
          $scope.login_hit_count = 0;
        }
      };

      $scope.count_is_business_click = 0;

      $scope.is_business_click = function(value) {
        console.log('is_business_click');
        $scope.signup.form_data.is_business = value;

        $scope.count_is_business_click++;
      };


      $scope.register_test_autofill = '';
      $scope.register_hit_count = 0;
      var num = 0;
      $scope.key_watch_register = function(e) {
        if ($scope.login_hit_count == 3) {
          console.log('login_hit_count === 3');
          // ENTER
          if (e.keyCode == 13 && $scope.register_test_autofill.length > 0) {
            // fill in the form
            $scope.signup.form_data = {
              "b2_signup":($scope.$state.current.name == 'root.signup.social_marketer'),
              "toc":true,

              "first_name": "测试" + $scope.register_test_autofill,
              "last_name": "测试" + $scope.register_test_autofill,
              "email": "o2otest" + $scope.register_test_autofill + "@g.c",
              "phone": "138001380" + (($scope.register_test_autofill.length == 1) ? $scope.register_test_autofill + '0' : $scope.register_test_autofill.substr(-2)),
              "username": "o2otest" + $scope.register_test_autofill,
              "password": "password",
              "password_confirm": "password",
              "company_name": "测试" + $scope.register_test_autofill + " LLC",
              "referral": "greenman",

              "is_business": $scope.signup.form_data.is_business,
              "personal":{
                "gov_id_no":"1234567890ABCD",
                "company_name": "Test"  + $scope.register_test_autofill+ " LLC",
                "business_tax_id":"1234567890" + $scope.register_test_autofill,
                "first_name": "测试" + $scope.register_test_autofill,
                "last_name": "测试" + $scope.register_test_autofill,
                "country": _.find($scope.$store.countries, {id:'44'}),
                "zone": _.find($scope.$store.zones, {id:'686'}),
                "city": "厦门市",
                "district": "同安区",
                "address1": "莲花镇小坪村",
                "address2": "道地上社"  + $scope.register_test_autofill + "号",
                "zipcode": "510000",
                "phone": "138001380" + (($scope.register_test_autofill.length == 1) ? $scope.register_test_autofill + '0' : $scope.register_test_autofill.substr(-2)),
              },
              "business":{
                "gov_id_no":"1234567890ABCD",
                "business_license_id_number":"12345GEF678" + $scope.register_test_autofill,
                "business_tax_id":"1234567890" + $scope.register_test_autofill,
                "company_name":"Test"  + $scope.register_test_autofill+ " LLC",
                "district": "同安区",
                "address1": "莲花镇小坪村",
                "address2": "道地上社"  + $scope.register_test_autofill + "号",
                "city": "广州市",

                "zipcode":"84003",
                "contact_name":"Test" + $scope.register_test_autofill + " Test" + $scope.register_test_autofill,
                "contact_email":"o2otest"  + $scope.register_test_autofill + "@g.c",
                "contact_phone":"80168783" + (($scope.register_test_autofill.length == 1) ? $scope.register_test_autofill + '0' : $scope.register_test_autofill.substr(-2)),
                "country": _.find($scope.$store.countries, {id:'44'}),
                "zone": _.find($scope.$store.zones, {id:'686'}),
              }
            };
            $scope.register_test_autofill = '';
          } else {
            num = e.keyCode - 48;

            if (num >= 0) {
              $scope.register_test_autofill += num.toString();
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

      $scope.get_usernmae_html = function() {
        $scope.signup.form_data.username = (!_.isEmpty($scope.signup.form_data.username))
          ? $scope.signup.form_data.username.toLowerCase().replace(/[\W_]+/g, '')
          : '';

        return $scope.$store.replicated_url(
          $scope.signup.form_data.username,
          {
            default_value: 'username',
            bold: true
          }
        );
      }
} ] );

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'MarketerController', [
    '$scope',

    function ( $scope ) {
      'use strict';

      if ( !$scope.$store.user ) {
        $scope.$notify.error( "Please help us figure out what you're looking for by logging in. Thanks!" );
        $scope.$state.go( "root.login" );
      }

      if ( !$scope.$store.marketer.user ) {
        $scope.$notify.notice( "You have not been assigned to a Social Marketer. Go purchase something and say hi!" );
        $scope.$state.go( "root.home" );
      }

      $scope.marketer = $scope.$store.marketer.user;
      $scope.about = $scope.$store.marketer.about.content;

      console.log($scope.marketer);
    } ] );

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'ProductController', [
    '$scope',
    '$translate',
    '$location',
    '$anchorScroll',
    'product',

    function ( $scope, $translate, $location, $anchorScroll, product ) {
      'use strict';

      var MAXIMUM_CATEGORIES = 2;

      var currentLang = $scope.lang.current().split('-')[0];

      var categories = $scope.$store.categories;

      $scope.breadcrumbs = [];

      if (!_.isEmpty(product.categories)) {
        var productCategory = categories[product.categories[0]];

        $scope.breadcrumbs.push(productCategory.id);

        for (var i = 0; i <= MAXIMUM_CATEGORIES; i++) {
          if ( parseInt(productCategory.parent_id) == 1
            || _.isEmpty(productCategory.ancestry)
            || parseInt(productCategory.ancestry[i]) == 1) {
            break;
          }

          $scope.breadcrumbs.unshift(categories[productCategory.ancestry[i]].id);
        }
      }

      if ( !product ) {
        // $scope.$state.go( 'root.home' );
      } else {
        if ( !!!_.get($scope.$stateParams, 'slug') ) {
          $scope.$state.go('root.product.slug', {sku: product.sku, slug: product.slug}, {notify:false, reload:false, location:'replace'});
        }

        /* calculating the average rating */
        var average = 0.0,
          count = 0;

        if (product.reviews && product.reviews.length > 0 ) {
          for ( var k in product.reviews ) {
            average += product.reviews[ k ].rating;
            count++;
          }

          if ( count > 1 ) {
            average = ( average / count );
          }
        }

        // product.rating = {
        //   average: average,
        //   count: count
        // };

        $scope.product = product;

        // Set other item specific scope vars
        $scope.is_product_in_cart = !!$scope.$cart.getItemBySku(product.sku);
        // $scope.should_show_msrp = (_.get(product.msrp) && product.msrp)

        $scope.thumbnail = {
          active_index: 0,
          active_image: {}, // defaulted to below
          is_active: function ( index ) {
            return $scope.thumbnail.active_index === index;
          },
          show: function ( index ) {
            if ( index in $scope.product.images ) {
              $scope.thumbnail.active_index = index;
              $scope.thumbnail.active_image = $scope.product.images[ index ];
            }
          }
        };

        $scope.thumbnail.show( 0 );

        $scope.$on('$viewContentLoaded', function() {
          // Enable tooltips
          _.delay(function() { // need to wait for digest cycle to finish
            $('[data-toggle="tooltip"]').tooltip();
          },1)
        });
      }

      $scope.gotoAnchor = function(x) {
        var newHash = 'anchor' + x;
        if ($location.hash() !== newHash) {
          // set the $location.hash to `newHash` and
          // $anchorScroll will automatically scroll to it
          $location.hash('anchor' + x);
        } else {
          // call $anchorScroll() explicitly,
          // since $location.hash hasn't changed
          $anchorScroll();
        }
      };

    } ] );

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'RelationsController', [
    '$scope',
    '$http',

    function ( $scope, $http ) {
      'use strict';

      // $http.jsonp( $scope.$store.jsonp_url('relations/assets', $scope.info.form_data))


    } ] );

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'ReplicatedSiteBannerController', [
    '$scope',
    '$http',
    'SMHomepage_Banner',

    function ( $scope, $http, SMHomepage_Banner ) {
      'use strict';

      console.log('ReplicatedSiteBannerController');

      $scope.banners = {};
      $scope.loaded_banners = false;

      $http.jsonp($scope.$store.jsonp_url('sm_homepage/findall'), {type: 'banner'})
        .success(function(banners) {
          _.map(banners, function(banner) {
            var _b = new SMHomepage_Banner(banner);

            if (!!_b.id()) {
              $scope.banners[_b.id()] = _b;
            }
          });
        })
        .finally(function() {
          $scope.loaded_banners = true;
        });

      $scope.banner_modal = function (action, banner) {
        if (action === 'new' && banner === undefined) {
          banner = new SMHomepage_Banner();
        } else if (banner !== undefined && action === 'duplicate') {
          banner = banner.copy();
          banner.name(banner.name() + ' (duplicate)');
        }

        var templateUrl = (action === 'delete')
          ? 'views/partials/account/social_marketer/replicated_site/templates/banner_confirm_delete.html'
          : 'views/partials/account/social_marketer/replicated_site/templates/banner_modal.html'

        var modalInstance = $scope.$uibModal.open({
          templateUrl: templateUrl,
          controller: 'ReplicatedSiteBannerModalCtrl',
          size: 'md',
          resolve: {
            banner: function() {
              return banner;
            },
            action: function() {
              return action;
            }
          }
        });

        modalInstance.result.then(function(resolved) {
          if (_.isFunction(resolved.save)) {
            resolved.save()
              .then(function(ret) {
                console.log('ret');
                console.log(ret);
              })
          }
          console.log('resolved');
          console.log(resolved);
        });
      }
    }
  ]
);
app.controller(
  'ReplicatedSiteBannerModalCtrl', [
    '$scope',
    '$uibModalInstance',
    'action',
    'banner',

    function ($scope, $uibModalInstance, action, banner) {
      $scope.banner = banner;
      $scope.action = action;

      $scope.ok = function () {
        $uibModalInstance.close(banner);
      };

      $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
      };
    }
  ]
);

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'RMAController', [
    '$scope',
    '$q',
    'RMAService',

    function ( $scope, $q, RMAService) {
      'use strict';

      if (!$scope.$store.user) {
        $scope.$translate('general.errors.login_required')
          .then(function(str) {
            $scope.$notify.error(str);
            $scope.$state.go('root.login');
          });
      }

      $scope.order_id = _.get($scope.$stateParams, 'order_id');
      $scope.rma = false;

      $scope.info_step = 0;
      $scope.show_info_submit_error = false;

      if (!$scope.rma) {
        RMAService.create($scope.order_id, {
            review: ($scope.$state.current.name !== 'root.rma')
          })
          .catch(function(err_str) {
            switch(err_str) {
              case 'rma.order_status_ineligible':
                return $scope.$translate('rma.order_status_ineligible')
                  .then(function(t_str) {
                    $scope.$notify.error(t_str);
                    $scope.$state.go('root.account.order', {order_id: $scope.order_id});
                  });
            }
          })
          .then(function(rma_service) {
            // if we're not viewing the status page, and there's an ID on the RMA,
            //     we will redirect them to the Status Page—they are not aloud
            //     to edit the RMA after submission.
            if ($scope.$state.current.name !== 'root.rma.status') {
              if (_.get(rma_service.data, 'order.id') && !!_.get(rma_service.data, 'id')) {
                return $scope.$translate('rma.existing_rma_found')
                  .then(function(str) {
                    $scope.$notify.info(str);
                    $scope.$state.go('root.rma.status');
                  });
              } else {
                if ($scope.$state.current.name == 'root.rma.info' && _.size(rma_service.items()) < 1) {
                  $scope.$translate('rma.errors.no_rma_items_selected')
                    .then(function(t_str){
                      $scope.$notify.error(t_str);
                      $scope.$state.go('root.rma', {order_id: $scope.order_id})
                    });
                }
              }
            } else { // state === root.rma.status
              if (!_.get(rma_service.data, 'id')) {
                $scope.$translate('rma.errors.could_not_find_existing')
                  .then(function(t_str){
                    $scope.$notify.error(t_str);
                    $scope.$state.go('root.rma', {order_id: $scope.order_id})
                  });
              }
            }

            $scope.rma = rma_service;
          });
      }

      $scope.submit = function(rma_form) {
        $scope.$broadcast( '$validate' );
        $scope.$broadcast( 'show-errors-check-validity' );

        if ( rma_form.$valid ) {
          $scope.rma.save()
            .then(function() {
              $scope.$state.go('root.rma.info', {order_id: $scope.order_id});
            })
            .catch(function(str) {
              $scope.$translate(str)
                .then(function(t_str) {
                  $scope.$notify.error(t_str);
                });
            });
        } else {
          console.log('INVALAD');
        }
      };

      $scope.info_submit = function(info_step) {
        if (info_step === 2) {
          // $scope.$notify.error("Sorry, RMA Requests are currently disabled.");
          $scope.rma.send()
            .then(function(result) {
              if (!!result) {
                var msg = (_.isString(result)) ? result : 'rma.successfully_submitted_rma';

                return $scope.$translate(msg)
                  .then(function(tstr) {
                    $scope.$notify.success(tstr);
                    $scope.$state.go('root.rma.status', {order_id: $scope.order_id});
                  });
              }

              return $scope.$translate('rma.errors.submit_general')
                .then(function(te_str) {
                  $scope.$notify.error(te_str);
                })
            })
            .catch(function(e_str) {
              $scope.$translate(e_str)
                .then(function(te_str) {
                  $scope.$notify.error(te_str);
                })
            })
        } else {
          $scope.show_info_submit_error = true;
        }
      };
} ] );

/*global app*/

app.controller(
  'SearchController', [
    '$scope',
    'sharedProperties',
    '$q',

    function ( $scope, sharedProperties, $q ) {
      'use strict';
      $scope._filtered_brands = [];

      // pagination controls
      $scope.maxSize = 6;
    	$scope.currentPage = 1;
    	$scope.totalItems = $scope.$store.products.length;
    	$scope.itemsPerPage = 16; // items per page
    	$scope.noOfPages = 0;

      $scope.search_query = null;
      $scope.search_category = false;
      $scope.search_rating = 0;

      // nice self–running init function()
      var init; (init = function () {
        var shared_property = sharedProperties.getProperty('search_query');
        $scope.search_query = shared_property || $scope.$state.params.query;
        $scope.current_search_query = $scope.search_query ? $scope.search_query.toLowerCase() : null;

        // Set the sharedProperties value so if the user opens the top nav search
        //    bar the correct value will be in it
        if (!shared_property) {
          sharedProperties.setProperty('search_query', $scope.search_query);
        }

        $scope.sort_by_label = '';

        $scope.$translate('filter.search.sort_options.sort_by')
          .then(function(sort_by) {
            return $scope.$translate('filter.search.sort_options.relevance')
              .then(function(relevance) {
                focus('root.search_products');
                return $scope.sort_by_label = sort_by + ': ' + relevance;
              })
          });

        $scope.sort = {
          'attribute': 'relevance',
          'reverse': false
        };
      })();

      // triggered by the top nav search bar if the user is on this search page
      $scope.$on('search_initiated', function(event, search_query) {
        $scope.search_query = search_query;
      });

      $scope.get_currency_char = function () {
        return ($scope.lang.current() !== 'en') ? '¥' : '$';
      };

      // the sort button has been pressed
      $scope.sort_by = function ($event, attribute, reverse) {
        $scope.sort = {
          'attribute': attribute,
          'reverse': !!reverse
        };

        if (attribute == 'relevance') {
          return $scope.$translate('filter.search.sort_options.sort_by')
            .then(function (sort_by) {
              return $scope.sort_by_label = sort_by + ': ' + $event.currentTarget.innerHTML;
            })
        }

        $scope.currentPage = 1
        return $scope.sort_by_label = $event.currentTarget.innerHTML;
      };

      var _get_search_hash = function() {
        var category_str = (!!$scope.search_category || $scope.search_category.id == '1')
          ? $scope.search_category.id
          : '';

        var rating_str = (!!$scope.search_rating || $scope.search_rating == 0)
          ? 'r' + $scope.search_rating
          : '';

        var str =
          $scope.search_query +
          category_str +
          rating_str;

        str = str.toLowerCase();

        if (Array.prototype.reduce){
            return str.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a;},0);
        }

        var hash = 0;
        if (this.length === 0) return hash;
        for (var i = 0; i < this.length; i++) {
            var character  = str.charCodeAt(i);
            hash  = ((hash<<5)-hash)+character;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
      };

      var _filter_matching_brands = function (_search_query) {
        return $q(function(resolve, reject) {
          $scope._filtered_brands = [];

          // if there's nothing searched for, return all the brands
          if (_.isEmpty(_search_query)) {
            return resolve($scope._filtered_brands = $scope.$store.brands);
          }

          return resolve($scope._filtered_brands = _.filter($scope.$store.brands, function(b) {
            return b.name.toLowerCase().indexOf(_search_query) > -1
          }));
        });
      };

      var _filter_matching_products = function (_search_query) {
        return $q(function(resolve, reject) {
          var langs = $scope.lang.available();

          // clear out the filtered products - start off fresh
          $scope._filtered_products = [];

          // filter the matching brands here so that they're avaible for the products
          //    that don't match directly
          _filter_matching_brands(_search_query)
            .then(function() {
              if (
                _.isEmpty(_search_query)
                && _.get($scope.search_category.id) == '1')
               {
                return resolve($scope._filtered_products = $scope.$store.products);
              }

              $scope._filtered_products = _.uniq(
                _.filter($scope.$store.products, function(product) {

                  // If a search category has been set,
                  //     and it's not the root category (there's no reason to preform this opperation if we're viewing the root category)
                  //     force the product to be in the categories progeny (in the category, or in one of it's children)
                  if (
                    !_.isEmpty($scope.search_category) &&
                    _.get($scope.search_category, 'id') !== '1' &&
                    _.isEmpty(_.intersection(product.categories, $scope.search_category.progeny))
                  ) {
                    return false;
                  }

                  if (parseFloat(product.rating.average) < $scope.search_rating) {
                    return false;
                  }

                  // if it's already in the filtered products don't worry about it
                  if (_.includes($scope._filtered_products, product)) {
                    return true;
                  }

                  // Check the SKU
                  if (_.includes(product.sku.toLowerCase(), _search_query)) {
                    return true;
                  }

                  // Quick and dirty search before we go into the langs -- if the product name matches, add it
                  if (_.includes(product.name.toLowerCase(), _search_query)) {
                    return true;
                  }

                  // iterate over all of the product's lang[name] values and add if a match is found
                  if ('lang' in product) {
                    for (var lang_i in langs) {
                      if (!!_.get(product.lang[langs[lang_i]], 'name') && _.includes(product.lang[langs[lang_i]].name.toLowerCase(), _search_query)) {
                        return true;
                      }
                    }
                  }

                  // search brands - they've already been filtered at the beggining of
                  //   the function
                  if (!_.isEmpty($scope._filtered_brands)) {
                    for (var brand_i in $scope._filtered_brands) {
                      if (product.brand.id == $scope._filtered_brands[brand_i].id) {
                        return true;
                      }
                    }
                  }

                })
              );

              return resolve($scope._filtered_products);
            });
        });
      };

      // These two are not meant to be accessed directly, but are contained on the
      //    $scope to prevent scoping problems (ironically ;P )
      $scope._filtered_products = [];
      $scope._filtered_brands = [];

      $scope.filter_hash = '';

      /**
      * An optimized search function - optimized so that it only re-builds the _filtered_products
      *   array if the has of the search terms has changed.
      */
      $scope.search_products = function () {
        // trim and clean up the search
        $scope.search_query = $scope.search_query
          .trim()
          .replace(/\s\s+/g, ' ');

        // disreguard any puncuation, spaces...etc. as well as case insensitive
        var _search_query = $scope.search_query.toLowerCase();

        // setup the hash for the search (combination of search params)
        var current_search_hash = _get_search_hash();

        // Don't re-filter/search if the current search hasn't changed
        if (current_search_hash !== $scope.filter_hash) {
          // Change the URL without reloading the view :)
          $scope.$state.go('root.search', {query:_search_query}, {notify:false, reload:false, location:'replace'});
          sharedProperties.setProperty('search_query', _search_query);

          // filter the products, then update the hash and pagination vars
          _filter_matching_products(_search_query)
            .then(function() {
              $scope.filter_hash = current_search_hash;
              $scope.totalItems = $scope._filtered_products.length;
            });
        }

        return $scope._filtered_products;
      };

      $scope.search_brands = function () {
        // Normally we would search the products, but since the product's ng-repeate
        //   is before the brand ng-repeate we can safely assume that the products &
        //   brands have already been filtered according to the search paramaters
        return $scope._filtered_brands;
      };

      // Sets the search query, and makes sure that the styling for the input box
      //   reflects that it has a value
      $scope.set_search_query = function(str) {
        $('.search-form-container').removeClass('is-empty');
        $scope.search_query = str;
      };

      $scope.set_selected_category = function (id) {
        $scope.$store.get_category({id: id})
          .then(function(category) {
            $scope.search_category = category;
          });
      };

      $scope.get_categories_of_parent = function (parent_category_id) {
        var children = [];
        var categories = $scope.$store.categories;
        var parent = categories[parent_category_id];

        for (var i = 0; i < parent.child_ids.length; i++){
          children.push(categories[parent.child_ids[i]]);
        }

      }

      $scope._filtered_categories = $scope.$store.categories;

      $scope.get_sidebar_categories = function() {
        // If no search_category has been set, return the Root Category/level 1 categories
        if (!$scope.search_category || $scope.search_category.id == '1') {
          return $scope._filtered_categories = _.filter($scope.$store.categories, {'level':'1'});
        }

        var results = _.filter($scope.$store.categories, {
          'parent_id'  :  String($scope.search_category.id),
          'level'      :  String(parseInt($scope.search_category.level) + 1)
        });

        if (!_.isEmpty(results)) {
          return $scope._filtered_categories = results;
        }

        return $scope._filtered_categories;
      }

      $scope.set_search_rating = function(rating_num) {
        $scope.search_rating = rating_num;
      }

    }
  ]
);

/*global app*/

/* Note: Naming convention for controllers are UpperCamelCase. */

app.controller(
  'StoreController', [
    '$scope',
    '$store',
    '$q',

    function ( $scope, $store, $q ) {
      'use strict';

      $scope.$q = $q;

      $scope.active = 0;
      $scope.slides = [
        {
          id: 0,
          src: 'assets/images/home/banner2.jpg',
          background: 'rgb(241, 83, 35);'
        },
        {
          id: 1,
          src: 'assets/images/home/banner.jpg',
          background: 'rgb(238, 238, 238);'
        }
      ];

      // $scope.$store.products = [];
      $scope.$store.featured_products = [];
      var num_pag = 15;

      // wrapping this into a function for some promise magic
      (function() {
        return $q(function(resolve, reject) {
          if (!!$scope.$store.marketer.user && _.size($scope.$store.marketer_products) > 0 ) {
            resolve($q.all(
              _.map($scope.$store.marketer_products, function (p_id) {
                return $scope.$store.get_product({id: p_id});
              })
            ));
          } else {
            resolve($scope.$store.products);
          }
        })
        .then(function(products) {
          return _.compact(
            _.map(products, function(p) {
              if (!!_.get(p, 'id')) {
                if (_.includes($scope.$store.marketer_featured, p.id)) {
                  $scope.$store.featured_products.push(p);
                } else {
                  return p;
                }
              } else {
                return null;
              }
            })
          );
        })
        .then(function(products) {
          return (_.isEmpty(products) && _.isEmpty($scope.$store.featured_products)) ? $scope.$store.products : products;
        })
        .then(function(_products) {
          $scope.pag_products = _.chunk(_products, num_pag);
          $scope.load_more()
        });
      })();

      $scope.load_more = function() {
        if (_.size($scope.pag_products) !== 0) {
          $scope.products = (_.size($scope.products) > 0)
            ? _.concat($scope.products, _.pullAt($scope.pag_products, 0)[0])
            : _.pullAt($scope.pag_products, 0)[0];
        }
      };

      _.delay(function() {
        $scope.$store.check_app_version()
          .then(function(update_url) {
            if (!!update_url && $scope.is_mobile_app()) {
              $scope.$notify.error(
                $scope.$translate.instant('notify.app_upgrade.update_needed')
                  + '<a href="' + update_url + '" class="btn btn-default btn-sm btn-raised">'
                  + $scope.$translate.instant('notify.app_upgrade.download_now') + ' <i class="material-icons material-icons-update"></i></a>',

                'bottom_left'
              );
            }
          });
      }, 2000);
} ] );

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

/**
* @author JUNHUI
* @author Tyler Wall <tyler@o2oworldwide.com>
* @date   10/8/2016
* @source http://www.w3cfuns.com/notes/17467/8c3844f82eb56e82456974e52b7be488.html
*/
app.directive('prc_rid', function () {

  var prc_rid = {
    id_type: false,
    city: false,
    birthday: {
      str: false,
      new_str: false,
      date: false
    },
    gender: false,
    verify: false,
    error_codes: [],

    _regex: /^\d{17}(\d|x)$/i,
    _cities: {
      11:"北京",12:"天津",13:"河北",14:"山西",15:"内蒙古",21:"辽宁",22:"吉林",23:"黑龙江",31:"上海",32:"江苏",33:"浙江",
      34:"安徽",35:"福建",36:"江西",37:"山东",41:"河南",42:"湖北",43:"湖南",44:"广东",45:"广西",46:"海南",50:"重庆",51:"四川",
      52:"贵州",53:"云南",54:"西藏",61:"陕西",62:"甘肃",63:"青海",64:"宁夏",65:"新疆",71:"台湾",81:"香港",82:"澳门",91:"国外"
    },

    parse: function(id_number) {
      this.error_codes = [];

      if (typeof ID !== 'string') {
        this.error_codes.push('general.errors.gov_id_no.prc_rid.illegal_id.illigal_string');
        return false;
      }

      id_number = prc_rid.format(id_number);

      this.id_type = id.length;

      this.city = _cities[ID.substr(0,2)];
      this.birthday.str = ID.substr(6, 4) + '/' + Number(ID.substr(10, 2)) + '/' + Number(ID.substr(12, 2));
      this.birthday.date = new Date(this.birthday.str);
      this.birthday.new_str = this.birthday.date.getFullYear() + '/' + Number(this.birthday.date.getMonth() + 1) + '/' + Number(this.birthday.date.getDate());
      this.gender = (ID.substr(16,1)%2) ? "male" : "female";

      var arrInt = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      var arrCh = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
      var currentTime = new Date().getTime();
      var time = this.birthday.date.getTime();

      var sum = 0, i, residue, checksum_verify;

      if (!this._regex.test(ID)) this.error_codes.push('general.errors.gov_id_no.prc_rid.illegal_id');
      if (this.city === undefined) this.error_codes.push("general.errors.gov_id_no.prc_rid.illegal_region");
      if (time >= currentTime || this.birthday.str !== this.birthday.new_str) this.error_codes.push('general.errors.gov_id_no.prc_rid.illegal_birthday');

      for (i = 0; i < 17; i++) {
        sum += ID.substr(i, 1) * arrInt[i];
      }

      residue = arrCh[sum % 11];
      checksum_verify = (residue !== ID.substr(17, 1));
      if (checksum_verify)                               this.error_codes.push('general.errors.gov_id_no.prc_rid.illegal_identity_cards');

      this.verify = (_.isEmpty(this.error_codes));

      return this.verify;
    },

    get_city: function (id_number) {
      this.city = prc_rid._cities[id_number.substr(0,2)];
      return (this.city !== undefined) ? this.city : false;
    },

    toString: function() {
      return this.city + "," + this.birthday + "," + this.gender;
    },

    format: function(value) {
      value = (value) ? value.toString() : '';
      value = (!_.isEmpty(value))
      ? value.toUpperCase().replace(/[^A-Z0-9]/g,'')
      : '';

      if (value.length > 18) {
        value = value.substr(0, 18);
      }

      return value;
    }
  };

  return {
    restrict: 'A',
    require: 'ngModel',

    link: function (scope, element, attrs, ngModel) {
      ngModel.$formatters.push(function (value) {
        return prc_rid.format(value);
      });

      // clean output as digits
      ngModel.$parsers.push(function (value) {
        var cursorPosition = element[0].selectionStart;
        var oldLength = value.toString().length;
        var formatted_value = prc_rid.format(value);

        prc_rid.parse(value);

        ngModel.$setViewValue(formatted_value);
        ngModel.$render();

        element[0].setSelectionRange(
          cursorPosition + formatted_value.length - oldLength,
          cursorPosition + formatted_value.length - oldLength
        );

        return formatted_value;
      });
    }
  };
});

/**
 * @source https://github.com/deltreey/angular-input-ssn/blob/master/input-ssn.js
 */
app.directive('ssn', function () {
  function makeSsn (value) {
    var result = value;

    var ssn = (value) ? value.toString() : '';
    if (ssn.length > 3) {
      result = ssn.substr(0, 3) + '-';
      if (ssn.length > 5) {
        result += ssn.substr(3, 2) + '-';
        result += ssn.substr(5, 4);
      }
      else {
        result += ssn.substr(3);
      }
    }

    return result;
  }

  return {
    restrict: 'A',
    require: 'ngModel',

    link: function (scope, element, attrs, ngModel) {
      ngModel.$formatters.push(function (value) {
        return makeSsn(value);
      });

      // clean output as digits
      ngModel.$parsers.push(function (value) {
        var cursorPosition = element[0].selectionStart;
        var oldLength = value.toString().length;
        var intValue = value.replace(/[^0-9]/g, '');

        if (intValue.length > 9) {
          intValue = intValue.substr(0, 9);
        }

        var newValue = makeSsn(intValue);
        ngModel.$setViewValue(newValue);
        ngModel.$render();
        element[0].setSelectionRange(
          cursorPosition + newValue.length - oldLength,
          cursorPosition + newValue.length - oldLength
        );

        return intValue;
      });
    }
  };
});

app.factory('focus', function ($rootScope, $timeout) {
  return function(name) {
    $timeout(function (){
      $rootScope.$broadcast('focusOn', name);
    });
  };
});

app.directive('focusOn', function() {
   return function(scope, elem, attr) {
      scope.$on('focusOn', function(e, name) {
        if(name === attr.focusOn) {
          console.log(elem[0]);
          window.setTimeout(function() {
            elem[0].focus();
            window.focus_elm = elem[0];
          }, 0);
        }
      });
   };
});

app.directive('modal', function () {
    return {
      template: '<div id={{id}} class="modal fade" tabindex="-1" role="dialog" aria-labelledby="modalTitle">' +
          '<div class="modal-dialog modal-{{size}}">' +
            '<div class="modal-content">' +
              '<div ng-if="title && title.length > 0" class="modal-header">' +
                '<button type="button" class="close" data-dismiss="modal" aria-hidden="true"></button>' +
                '<h4 class="modal-title" id="modalTitle">{{ title }}</h4>' +
              '</div>' +
              '<div class="modal-body" role="document" ng-transclude></div>' +
              // '<div ng-if="close || success" class="modal-footer">' +
              //   '<button ng-if="close || closeText" ng-click="close_cb()" type="button" class="btn btn-default" data-dismiss="modal">{{closeText}}</button>' +
              //   '<button ng-if="success || successText" ng-click="success_cb()" type="button" class="btn btn-primary" ng-bind-html="successText"></button>' +
              // '</div>' +
            '</div>' +
          '</div>' +
        '</div>',
      transclude: true,
      replace:true,
      scope: {
        visible : '@',
        title: '@',
        parentVisibleAttr: '@',
        size: '@',
        id: '@',
        close: '&',
        closeText: '@',
        success: '&',
        successText: '@'
      },

      link: function postLink($scope, element, attrs, parentCtrl) {
        $scope.size = $scope.size.toLowerCase();

        if ($scope.size !== 'lg' && $scope.size !== 'sm') {
          $scope.size = '';
        }

        $scope.success_cb = function() {};
        $scope.close_cb = function() {};

        if ($scope.close !== undefined && $scope.close !== 'false' && $scope.close !== false) {
          if ($scope.closeText === undefined) {
            $scope.closeText = $scope.$root.$translate.instant('general.close');
          }
          if (typeof $scope.close === 'function') {
            $scope.close_cb = $scope.close;
          }
        } else if ($scope.closeText !== undefined) {
          $scope.close = 'true';
        }

        if ($scope.success !== undefined && $scope.success !== 'false' && $scope.success !== false) {
          if ($scope.successText === undefined) {
            $scope.successText = $scope.$root.$translate.instant('general.ok');
          }
          if (typeof $scope.success === 'function') {
            $scope.success_cb = $scope.success;
          }
        } else if ($scope.successText !== undefined) {
          $scope.success = true;
        }

        $(element).modal({show: false});

        attrs.$observe('visible', function(value) {
          value = (value === 'true');

          if (value) {
            $(element).modal('show');
          } else {
            $(element).modal('hide');
          }
        });

        $(element).on('shown.bs.modal', function(){
          $scope.$apply(function() {
            $scope.$parent[$scope.parentVisibleAttr] = true;
            $(element).find("[autofocus]:first").focus();
          });
        });

        $(element).on('hidden.bs.modal', function(){
          $scope.$apply(function() {
            $scope.$parent[$scope.parentVisibleAttr] = false;
          });
        });

        $scope.hide = function() {
          $(element).modal('hide');
        }
      }
    };
  });

angular.module( 'ngCart', [ 'ngCart.directives', 'LocalStorageModule' ] )

.config( [ function () {

} ] )

.provider( '$ngCart', function () {
  this.$get = function () {};
} )

.run( [ '$rootScope', 'ngCart', 'ngCartItem', 'localStorageService', function ( $rootScope, ngCart, ngCartItem, localStorageService ) {

  /* EDIT : Tyler Wall - added $cart to $rootScope - 2.23.16 */
  if ( !( '$cart' in $rootScope ) ) {
    $rootScope.$cart = ngCart;
  }
  /* end EDIT */

  $rootScope.$on( 'ngCart:change', function () {
    ngCart.$save();
  } );

  var recovered_cart = angular.fromJson(localStorageService.get( 'cart' ));

  if ( angular.isObject( recovered_cart ) ) {
    ngCart.$restore( recovered_cart );
  } else {
    ngCart.init();
  }

} ] )

.service( 'ngCart', [
  '$rootScope',
  '$filter',
  'ngCartItem',
  'localStorageService',
  function ( $rootScope, $filter, ngCartItem, localStorageService ) {

  this.init = function () {
    this.$cart = {
      shipping: null,
      taxRate: null,
      tax: null,
      items: []
    };
  };

  this.addItem = function ( quantity, data ) {

    var inCart = this.getItemBySku( data.sku );

    if ( typeof inCart === 'object' ) {
      //Update quantity of an item if it's already in the cart
      inCart.setQuantity( quantity, false );
    } else {
      var newItem = new ngCartItem( quantity, data );
      this.$cart.items.push( newItem );
      $rootScope.$broadcast( 'ngCart:itemAdded', newItem );
    }

    $rootScope.$broadcast( 'ngCart:change', {} );
  };

  this.getItemBySku = function ( itemSku ) {
    var items = this.getCart().items;
    var build = false;

    angular.forEach( items, function ( item ) {
      if ( item.getSku() === itemSku ) {
        build = item;
      }
    } );
    return build;
  };

  this.setShipping = function ( shipping ) {
    this.$cart.shipping = shipping;
    return this.getShipping();
  };

  this.getShipping = function () {
    if ( this.getCart().items.length === 0 ) return 0;
    return this.getCart().shipping || 0.00;
  };

  this.setTaxRate = function ( taxRate ) {
    this.$cart.taxRate = parseFloat( taxRate );
    return this.getTaxRate();
  };

  this.getTaxRate = function () {
    return this.$cart.taxRate || 0.00;
  };

  this.getTax = function () {
    // Changed tax to include S/H -Jimmy 10.31
    return parseFloat(
      ( ( (this.getSubTotal() / 100) + (this.getShipping() / 100) ) * this.getCart().taxRate )
    ) || 0.00;

    // return parseFloat( ( ( this.getSubTotal() / 100 ) * this.getCart().taxRate ) )|| 0.00;
  };

  this.setCart = function ( cart ) {
    this.$cart = cart;
    return this.getCart();
  };

  this.getCart = function () {
    return this.$cart;
  };

  this.getItems = function () {
    return this.getCart().items;
  };

  this.getTotalItems = function () {
    var count = 0;
    var items = this.getItems();
    angular.forEach( items, function ( item ) {
      count += item.getQuantity();
    } );
    return count;
  };

  this.getTotalItemsForSummary = function () {
    var count = this.getTotalItems();
    return ( count >= 100 ) ? '99+' : count;
  }

  this.getTotalUniqueItems = function () {
    return this.getCart().items.length;
  };

  this.getSubTotal = function () {
    var total = 0;
    angular.forEach( this.getCart().items, function ( item ) {

      total += item.getTotal();
    } );

    return parseFloat( total );
  };

  this.getDiscountAmmount = function() {
    return $rootScope.$store.calculate_user_discount_amount(this.getSubTotal());
  }

  this.getDiscountPercentage = function() {
    return parseFloat(this.getDiscountAmmount() / this.getSubTotal() * 100).toFixed(2);
  }

  this.totalCost = function () {
    // if the user is just viewing the cart... we cheat a little :)
    if ($rootScope.$state.current.name == 'root.checkout') {
      return this.getSubTotal() - this.getDiscountAmmount();
    }

    var subtotal = this.getSubTotal(),
        discount_ammount = (-1 * this.getDiscountAmmount()),
        shipping = this.getShipping(),
        tax = this.getTax();

    var total = (
        subtotal
      + discount_ammount
      + shipping
      + tax
    );

    // console.log('subtotal         ', subtotal);
    // console.log('discount_ammount ', discount_ammount);
    // console.log('shipping         ', shipping);
    // console.log('tax              ', tax);
    // console.log('TOTAL:           ', total);
    // console.log('=====================================');

    return total;
  };

  this.removeItem = function ( index ) {
    this.$cart.items.splice( index, 1 );
    $rootScope.$broadcast( 'ngCart:itemRemoved', {} );
    $rootScope.$broadcast( 'ngCart:change', {} );

  };

  this.removeItemBySku = function ( sku , $index ) {
    var cart = this.getCart();
    angular.forEach( cart.items, function ( item, index ) {
      if ( item.getSku() === sku ) {
        cart.items.splice( index, 1 );
      }
    } );
    this.setCart( cart );
    $rootScope.$broadcast( 'ngCart:itemRemoved', {} );
    $rootScope.$broadcast( 'ngCart:change', {} );
  };

  this.empty = function () {
    $rootScope.$broadcast( 'ngCart:change', {} );
    this.$cart.items = [];
    localStorage.removeItem( 'cart' );
  };

  /* ADDED Tyler Wall - 6/6/16 */
  this.reset = function() {
    return this.init();
  };
  /* end added */

  this.toObject = function () {

    if ( this.getItems().length === 0 ) return false;

    var items = [];
    angular.forEach( this.getItems(), function ( item ) {
      items.push( item.toObject() );
    } );

    return {
      shipping: this.getShipping(),
      tax: this.getTax(),
      taxRate: this.getTaxRate(),
      subTotal: this.getSubTotal(),
      totalCost: this.totalCost(),
      items: items
    };
  };

  this.$restore = function ( storedCart ) {
    var _self = this;
    _self.init();
    _self.$cart.shipping = storedCart.shipping;
    _self.$cart.tax = storedCart.tax;

    angular.forEach( storedCart.items, function ( item ) {
      _self.$cart.items.push( new ngCartItem( item._quantity, item._data ) );
    } );

    this.$save();
  };

  this.$save = function () {
    return localStorageService.set( 'cart', JSON.stringify( this.getCart() ) );
  };

} ] )

.factory( 'ngCartItem', [ '$rootScope', '$log', function ( $rootScope, $log ) {

  var item = function ( quantity, data ) {

    if ( !_.isObject(data)) {
      var _data = angular.fromJson( data );
      if (!!_data) {
        data = _data;
      }
    }

    if (!!_.get(data, 'sku')) {
      this.setSku(_.get(data, 'sku'));
      this.setName(_.get(data, 'name'));
      this.setPrice(_.get(data, 'price'));
      this.setQuantity(
        (quantity > 0)
          ? quantity
          : (_.get(data, 'quantity') > 0)
            ? data.quantity
            : 1
      );

      this.setData( data );
      return true;
    }
    return false;
  };

  item.prototype.setSku = function ( sku ) {
    if ( sku ) this._sku = sku;
    else {
      $log.error( 'An SKU must be provided' );
    }
  };

  item.prototype.getSku = function () {
    return this._sku;
  };

  item.prototype.setName = function ( name ) {
    if ( name ) this._name = name;
    else {
      $log.error( 'A name must be provided' );
    }
  };
  item.prototype.getName = function () {
    return this._name;
  };

  item.prototype.setPrice = function ( price ) {
    var priceFloat = parseFloat( price );
    if ( priceFloat ) {
      if ( priceFloat <= 0 ) {
        $log.error( 'A price must be over 0' );
      } else {
        this._price = ( priceFloat );
      }
    } else {
      $log.error( 'A price must be provided' );
    }
  };
  item.prototype.getPrice = function () {
    return this._price;
  };

  item.prototype.setQuantity = function ( quantity, relative ) {

    var quantityInt = parseInt( quantity );
    if ( quantityInt % 1 === 0 ) {
      if ( relative === true ) {
        this._quantity += quantityInt;
      } else {
        this._quantity = quantityInt;
      }
      if ( this._quantity < 1 ) this._quantity = 1;

    } else {
      this._quantity = 1;
      $log.info( 'Quantity must be an integer and was defaulted to 1' );
    }
    $rootScope.$broadcast( 'ngCart:change', {} );

  };

  item.prototype.getQuantity = function () {
    return this._quantity;
  };

  item.prototype.setData = function ( data ) {
    if ( data ) this._data = data;
  };

  item.prototype.getData = function () {
    if ( this._data ) return this._data;
    else $log.info( 'This item has no data' );
  };

  item.prototype.getTotal = function () {
    return parseFloat( this.getQuantity() * this.getPrice() );
  };

  item.prototype.get_image_src = function () {
    return _.get(this.getData(), 'images[0].src');
  };

  item.prototype.get_image_alt = function () {
    return _.get(this.getData(), 'images[0].alt');
  };

  item.prototype.get_brand_id = function () {
    return _.get(this.getData(), 'brand.id');
  };

  item.prototype.toObject = function () {
    return {
      data: this.getData(),
      quantity: this.getQuantity(),
      total: this.getTotal()
    };
  };

  return item;

} ] )

.controller( 'CartController', [ '$scope', 'ngCart', function ( $scope, ngCart ) {
  $scope.ngCart = ngCart;

} ] )

angular.module( 'ngCart.directives', [ 'ngCart.fulfilment' ] )

.controller( 'CartController', [ '$scope', 'ngCart', function ( $scope, ngCart ) {
  $scope.ngCart = ngCart;
} ] )

.directive( 'ngcartAddtocart', [ 'ngCart', '$state', function ( ngCart, $state ) {
  return {
    restrict: 'AE',
    controller: 'CartController',
    scope: {
      data: '=product'
    },
    transclude: true,

    templateUrl: function (elem, attrs) {
      if (!!_.get(attrs, 'style')) {
        switch (_.get(attrs, 'style').toLowerCase()) {
          case 'fab':
            return 'views/partials/ngCart/addtocart_fab.html'
          case 'single_line':
            return 'views/partials/ngCart/addtocart_single_line.html'
        }
      } else {
        attrs.style = 'button';
      }

      return 'views/partials/ngCart/addtocart_button.html';
    },

    link: function ( scope, element, attrs ) {

      scope.inCart = function () {
        return ngCart.getItemBySku( _.get(scope.data, 'sku') );
      };

      scope.add_to_cart_clicked = function (q, data, should_redirect) {
        if (data.quantity == 0) {
          return false;
        }

        should_redirect = (typeof should_redirect == 'undefined') ? true : !!should_redirect;
        ngCart.addItem(q, data);

        if (should_redirect && 'clickState' in attrs && attrs.clickState) {
          var params = ('clickStateParams' in attrs && attrs.clickStateParams) ? attrs.clickStateParams : {};
          $state.go( (attrs.clickState || 'root.checkout'), params);
        }
      }

      if ( scope.inCart() ) {
        scope.q = ngCart.getItemBySku( scope.data.sku ).getQuantity();
      } else if ( scope.hasOwnProperty( 'quantity' ) ) {
        scope.q = parseInt( scope.quantity );
      } else {
        scope.q = 1;
      }
    }

  };
} ] )

.directive( 'ngcartCart',  [ 'storeService', function ($store) {
  return {
    restrict: 'AE',
    controller: 'CartController',
    scope: {},
    templateUrl: 'views/partials/ngCart/cart.html',
    link: function ( scope, element, attrs ) {
      scope.$store = $store;
    }
  };
} ] )
.directive( 'ngcartOrderSummary',  [ 'storeService', function ($store) {
  return {
    restrict: 'AE',
    controller: 'CartController',
    scope: {},
    templateUrl: 'views/partials/ngCart/order_summary.html',
    link: function ( scope, element, attrs ) {
      scope.$store = $store;
    }
  };
} ] )

.directive( 'ngcartSummary', [ function () {
  return {
    restrict: 'AE',
    controller: 'CartController',
    scope: {
      summaryType: '@'
    },
    transclude: true,
    // templateUrl: 'views/partials/ngCart/summary.html'
    templateUrl: function(scope, element, attrs) {
      if ('summaryType' in element && element.summaryType !== undefined) {
        if (element.summaryType.toLowerCase().trim() === 'badge') {
          return 'views/partials/ngCart/summary_badge.html';
        }
      }
      return 'views/partials/ngCart/summary.html';
    }
  };
} ] )

.directive( 'ngcartCheckout', [ function () {
  return {
    restrict: 'AE',
    controller: ( 'CartController', [ '$scope', 'ngCart', 'fulfilmentProvider', function ( $scope, ngCart, fulfilmentProvider ) {
      $scope.ngCart = ngCart;

      $scope.checkout = function () {
        fulfilmentProvider.setService( $scope.service );
        fulfilmentProvider.setSettings( $scope.settings );
        var promise = fulfilmentProvider.checkout();
        console.log( promise );
      };
    } ] ),
    scope: {
      service: '@',
      settings: '='
    },
    transclude: true,
    templateUrl: 'views/partials/ngCart/checkout.html'
  };
} ] );
angular.module( 'ngCart.fulfilment', [] )
.service( 'fulfilmentProvider', [ '$injector', function ( $injector ) {

  this._obj = {
    service: undefined,
    settings: undefined
  };

  this.setService = function ( service ) {
    this._obj.service = service;
  };

  this.setSettings = function ( settings ) {
    this._obj.settings = settings;
  };

  this.checkout = function () {
    var provider = $injector.get( 'ngCart.fulfilment.' + this._obj.service );
    return provider.checkout( this._obj.settings );

  };

} ] )

.service( 'ngCart.fulfilment.log', [ '$q', '$log', 'ngCart', function ( $q, $log, ngCart ) {

  this.checkout = function () {

    var deferred = $q.defer();

    $log.info( ngCart.toObject() );
    deferred.resolve( {
      cart: ngCart.toObject()
    } );

    return deferred.promise;

  };

} ] )

.service( 'ngCart.fulfilment.http', [ '$http', 'ngCart', function ( $http, ngCart ) {

  this.checkout = function ( settings ) {
    return $http.post( settings.url, {
      data: ngCart.toObject()
    } );
  };
} ] )

.service( 'ngCart.fulfilment.paypal', [ '$http', 'ngCart', function ( $http, ngCart ) {

} ] )

.value( 'version', '0.0.3-rc.1' );

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

app.directive('spinner', function () {
    return {
      templateUrl: 'views/partials/ui/spinner.html',
      restrict: 'AE',
      replace: true,
      link: function ($scope, element, attrs, parentCtrl) {
      },
      scope: {
        size: '&',
      }
    };

  }
);

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

/**
 * uiBreadcrumbs automatic breadcrumbs directive for AngularJS & Angular ui-router.
 *
 * https://github.com/michaelbromley/angularUtils/tree/master/src/directives/uiBreadcrumbs
 *
 * Copyright 2014 Michael Bromley <michael@michaelbromley.co.uk>
 */

( function () {

  /**
   * Config
   */
  var moduleName = 'angularUtils.directives.uiBreadcrumbs';
  var templateUrl = 'directives/uiBreadcrumbs/uiBreadcrumbs.tpl.html';

  /**
   * Module
   */
  var module;
  try {
    module = angular.module( moduleName );
  } catch ( err ) {
    // named module does not exist, so create one
    module = angular.module( moduleName, [ 'ui.router' ] );
  }

  module.directive( 'uiBreadcrumbs', [ '$interpolate', '$state', function ( $interpolate, $state ) {
    return {
      restrict: 'E',
      templateUrl: function ( elem, attrs ) {
        return attrs.templateUrl || templateUrl;
      },
      scope: {
        displaynameProperty: '@',
        abstractProxyProperty: '@?'
      },
      link: function ( scope ) {
        scope.breadcrumbs = [];
        if ( $state.$current.name !== '' ) {
          updateBreadcrumbsArray();
        }
        scope.$on( '$stateChangeSuccess', function () {
          updateBreadcrumbsArray();
        } );

        /**
         * Start with the current state and traverse up the path to build the
         * array of breadcrumbs that can be used in an ng-repeat in the template.
         */
        function updateBreadcrumbsArray() {
          var workingState;
          var displayName;
          var breadcrumbs = [];
          var currentState = $state.$current;

          while ( currentState && currentState.name !== '' ) {
            workingState = getWorkingState( currentState );
            if ( workingState ) {
              displayName = getDisplayName( workingState );

              if ( displayName !== false && !stateAlreadyInBreadcrumbs( workingState, breadcrumbs ) ) {
                breadcrumbs.push( {
                  displayName: displayName,
                  route: workingState.name
                } );
              }
            }
            currentState = currentState.parent;
          }
          breadcrumbs.reverse();
          scope.breadcrumbs = breadcrumbs;
        }

        /**
         * Get the state to put in the breadcrumbs array, taking into account that if the current state is abstract,
         * we need to either substitute it with the state named in the `scope.abstractProxyProperty` property, or
         * set it to `false` which means this breadcrumb level will be skipped entirely.
         * @param currentState
         * @returns {*}
         */
        function getWorkingState( currentState ) {
          var proxyStateName;
          var workingState = currentState;
          if ( currentState.abstract === true ) {
            if ( typeof scope.abstractProxyProperty !== 'undefined' ) {
              proxyStateName = getObjectValue( scope.abstractProxyProperty, currentState );
              if ( proxyStateName ) {
                workingState = $state.get( proxyStateName );
              } else {
                workingState = false;
              }
            } else {
              workingState = false;
            }
          }
          return workingState;
        }

        /**
         * Resolve the displayName of the specified state. Take the property specified by the `displayname-property`
         * attribute and look up the corresponding property on the state's config object. The specified string can be interpolated against any resolved
         * properties on the state config object, by using the usual {{ }} syntax.
         * @param currentState
         * @returns {*}
         */
        function getDisplayName( currentState ) {
          var interpolationContext;
          var propertyReference;
          var displayName;

          if ( !scope.displaynameProperty ) {
            // if the displayname-property attribute was not specified, default to the state's name
            return currentState.name;
          }
          propertyReference = getObjectValue( scope.displaynameProperty, currentState );

          if ( propertyReference === false ) {
            return false;
          } else if ( typeof propertyReference === 'undefined' ) {
            return currentState.name;
          } else {
            // use the $interpolate service to handle any bindings in the propertyReference string.
            interpolationContext = ( typeof currentState.locals !== 'undefined' ) ? currentState.locals.globals : currentState;
            displayName = $interpolate( propertyReference )( interpolationContext );
            return displayName;
          }
        }

        /**
         * Given a string of the type 'object.property.property', traverse the given context (eg the current $state object) and return the
         * value found at that path.
         *
         * @param objectPath
         * @param context
         * @returns {*}
         */
        function getObjectValue( objectPath, context ) {
          var i;
          var propertyArray = objectPath.split( '.' );
          var propertyReference = context;

          for ( i = 0; i < propertyArray.length; i++ ) {
            if ( angular.isDefined( propertyReference[ propertyArray[ i ] ] ) ) {
              propertyReference = propertyReference[ propertyArray[ i ] ];
            } else {
              // if the specified property was not found, default to the state's name
              return undefined;
            }
          }
          return propertyReference;
        }

        /**
         * Check whether the current `state` has already appeared in the current breadcrumbs array. This check is necessary
         * when using abstract states that might specify a proxy that is already there in the breadcrumbs.
         * @param state
         * @param breadcrumbs
         * @returns {boolean}
         */
        function stateAlreadyInBreadcrumbs( state, breadcrumbs ) {
          var i;
          var alreadyUsed = false;
          for ( i = 0; i < breadcrumbs.length; i++ ) {
            if ( breadcrumbs[ i ].route === state.name ) {
              alreadyUsed = true;
            }
          }
          return alreadyUsed;
        }
      }
    };
        } ] );
} )();

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

/*global app*/

// app.factory("version", function versionFactory() {
//   return "0.1";
// });

// app.factory( 'O2OResource', [
//   'storeService',
//   '$resource',
//     function($store, $resource) {
//
//       return function(uri) {
//
//         var _func_res = function(type) {
//           return $resource(
//               $store.jsonp_url('api/' + uri + '/:id') + '/format/jsonp?callback=JSON_CALLBACK',
//               {},
//               {
//                 'find':      {method:'JSONP'},
//                 'find_all':  {method:'JSONP', isArray:true},
//                 'put':       {method:'JSONP'},
//                 'delete':    {method:'JSONP'}
//               }
//             );
//         };
//
//         $http.jsonp(store.jsonp_url('api/' + uri))
//
//         return {
//           get: _func_res('get'),
//           put: _func_res('put'),
//           post: _func_res('post'),
//           delete: _func_res('delete')
//         };
//       };
//
//     }
//   ]
// );

app.factory( 'RMAService', [
  'storeService',
  'localStorageService',
  '$http',
  '$q',

    function(store, localStorageService, $http, $q) {

      var
        default_data_item = {
          returning: false,
          quantity: 0,
          quantity_range: [0, 1],
          reason: null,
          return_category: false,
          comments: null
        },
        _generate_range = function(qty) {
          return _.range(1, (_.toInteger(qty)+1));
        }
        rma_config = {};

      var service = {
        // Public Varables
        data: {
          id: null,
          order: null,
          items: null,

          general_comment: "",

          active: null,
          created_by: 0,
          modified_by: 0,
          deleted_by: 0,
          modified: '0000-00-00 00:00:00',
          created: '0000-00-00 00:00:00',
        },

        has_returning_items: false,

        return_categories: [
          "ship",
          "fulfilment",
          "product",
          "customer",
          "other"
        ],

        return_reasons: {
          "bought_by_mistake": "customer",
          "better_price_available": "other",
          "product_damaged_shipping_box_ok": "other",
          "item_arrived_too_late": "customer",
          "missing_parts_or_accessories": "fulfilment",
          "product_and_box_damaged": "ship",
          "wrong_item": "fulfilment",
          "item_defective_or_doesnt_work": "product",
          "recived_extra_item_didnt_purchase": "fulfilment",
          "no_longer_needed": "customer",
          "didnt_approve_purchase": "customer",
          "inaccurate_website_description": "other",
          "inaccurate_sm_description": "other",
          "other": "other"
        }
      };

      var _load_order = function(in_order) {
        return $q(function(resolve, reject) {
            if (_.isString(in_order)) {
              return resolve (store.get_orders(in_order));
            } else if ( // catching bad orders
                _.get(in_order, 'products') &&
                _.size(in_order.products) == 0 &&
                _.get(in_order, 'id')
              ) {
              return resolve (store.get_orders(in_order.id));
            } else if (!_.get(in_order, 'id')) {
              return reject('general.errors.no_order_found_for_id');
            }

            _.delay(function() {
              // don't hold up the flow
              store.add_orders(in_order);
            }, 2000);

            return resolve(in_order);
          })
          .then(function(_order) {
            var order = angular.copy(_order);
            var order_products = order.products;
            delete order.products;

            service.data.order = order;

            if (_.get(service.data.order, 'order_status_id') && service.data.order.order_status_id >= 100) {
              return $q.all(
                  _.map(order_products, function(order_i, prod_id) {
                    return store.get_product({id: order_i.product_id})
                      .then(function(prod) {


                        if (service.data.items === null) {
                          service.data.items = {};
                        }
                        if (!_.get(service.data.order, 'products')) {
                          service.data.order.products = {};
                        }

                        service.data.order.products[prod_id] = order_i;
                        service.data.order.products[prod_id].product = prod;

                        var item = angular.copy(default_data_item);

                        if (!!_.get(service.data.items, prod_id)) {
                          item = _.merge(item, service.data.items[prod_id]);
                        }

                        if (!!_.get(rma_config, 'review')) {
                          if (!_.get(service.data.items, prod_id + '.returning')) {
                            _.unset(service.data.items, prod_id);
                            _.unset(service.data.order.products, prod_id);
                            return false;
                          }
                        } else {
                          item.quantity_range = _generate_range(service.data.order.products[prod_id].quantity);
                          item.quantity = _.last(item.quantity_range);

                          if (_.get(service.data.items, prod_id + '.returning')) {
                            if (service.data.items[prod_id] && !service.has_returning_items) {
                              service.has_returning_items = true;
                            }
                          }
                          service.data.items[prod_id] = item;
                        }

                        return true;
                      });
                  })
                )
                .then(function() {
                  return $q.resolve(true);
                });
            } else {
              return $q.resolve(false);
            }
          });
        };

      var _load_rma_items = function(rma_items) {
        if (_.size(rma_items) > 0) {
          service.has_returning_items = true;

          return _.map(rma_items, function(rma_item) {
            if (!_.get(service.data.items, rma_item.product_id)) {
              if (!_.get(service.data, 'items')) {
                service.data.items = {};
              }

              _.set(service.data.items, rma_item.product_id, angular.copy(default_data_item));
            }

            // NOTE: item is linked via JS object linking and it is realy a
            //       refrence to the service.data.item
            var item = service.data.items[rma_item.product_id];

            _.map(rma_item, function(v, k) {
              if (item[k] !== v) {
                item[k] = v;
              }
            });

            item.returning = true;
            item.quantity = _.toInteger(rma_item.returning_quantity);
            delete item.returning_quantity;

            item.quantity_range = _generate_range(rma_item.returning_quantity);

            return service.data.items[rma_item.product_id];
          });
        }

        return false;
      };

      var _clean_shrink_input = function(str) {
        return (_.isEmpty(str) || !_.isString(str) || _.size(str) < 1) ? '' : str.replace(/<.*?>/g, '  ').replace(/\s\s+/g, ' ').trim();
      }

      service._data_access = function(data_key, val) {
        if (!_.isEmpty(val)) {
          return _.set(service.data, data_key, val);
        }
        return _.get(service.data, data_key);
      };

      service._data_accessor = function(data_key) {
        return function(val) {
          return service._data_access(data_key, val);
        }
      };


      // Overriding default this.[Object.keys(service.data)](val = null)

      // Custom Functions

      service.returning_onChange = function(val) {
        if (!val) {
          service.has_returning_items = !!(service.has_returning_items && _.size(_.remove(service.data.items, _.get('returning'))));
        } else {
          service.has_returning_items = true;
        }
        return service._data_access('returning', val);
      }

      service.save = function() {
        return $q(function(resolve, reject) {
          // there must be an order.id to save
          if (_.get(service.data, 'order.id') && _.size(service.data.items) > 0) {
            service.data.general_comment = _clean_shrink_input(service.data.general_comment);

            // going through each of the items and making sure their return_reasons is/are set
            _.map(service.data.items, function(v, k) {
              v.comments = _clean_shrink_input(v.comments);

              if (v.quantity > 0) {
                if (_.get(service.return_reasons, v.reason)) {
                  service.data.items[k].return_category = service.return_reasons[v.reason];
                }
              } else {
                // just false, but we're not hard coding it :)
                service.data.items[k].returning = default_data_item.returning;
              }
            });

            var order = service.data.order;
            service.data.order = order.id;

            localStorageService.set('rma.' + order.id, service.data);

            service.data.order = order;

            return resolve(true);
          }
          return reject('general.errors.no_order_found_for_id');
        });
      };

      service.load_from_backend = function(data) {
        // sometimes $http returns a few levels ... lame sauce
        while(!!_.get(data, 'data')) {
          data = data.data;
        }

        return $q(function(resolve, reject) {
          if (
            !!_.get(data, 'order') &&
            !!_.get(data, 'rma_items')
          ) {
            _load_rma_items(data.rma_items);
            
            return _load_order(data.order)
              .then(function() {
                service.data = _.mergeWith(service.data, data.rma);

                return service.save()
                  .then(function() {
                    return resolve(true);
                  });
              });
          }
          reject(false);
        });
      };

      service.load = function(order_id) {
        if (order_id) {
          var data = localStorageService.get('rma.' + order_id);
          if (!!data && !_.isEmpty(data)) {
            service.data = data;
            return true;
          }
        }
        return false;
      };

      service.send = function() {
        return $q(function(resolve, reject) {
          var send_data = angular.copy(service.data);
          send_data.order_id = send_data.order.id;
          delete send_data.order;

          send_data.general_comment = _clean_shrink_input(send_data.general_comment);

          _.map(send_data.items, function(v, k) {
            v.comment = _clean_shrink_input(v.comment);
          });

          $http.jsonp(store.jsonp_url('rma/submit', send_data))
            .then(
              function(_data) {
                var data = _.get(_data, 'data.data'),
                    code = _.get(_data, 'data.code'),
                    msg = _.get(_data, 'data.message');
                if (
                  _.get(data, 'rma') &&
                  (
                    code == 201 ||
                    code == 409
                  )
                ) {
                  return service.load_from_backend(data)
                    .then(function() {
                      resolve(msg);
                    });
                } else {
                  return reject('login.unable_to_connect_server');
                }
              },
              function(_data) {
                var data = _.get(_data, 'data.data');
                var code = _.get(_data, 'data.code');

                if (code === '401') {
                  reject('general.errors.login_required');
                } else if (code === '409') {
                  resolve('rma.existing_rma_found');
                }

                return reject('login.failed_to_connect_server')
              }
            )
        });
      };

      // Returns a promise with the instance
      service.create = function(order_id, config) {
        // setup all of the default _data_access methods
        _.map(service.data, function(val, key) {
          if (!_.isEmpty(key) && !_.isFunction(_.get(service, key))) {
            return _.set(service, key, service._data_accessor(key));
          }
        });

        if (!_.isEmpty(config)) {
          rma_config = config;
        };

        if (_.isEmpty(order_id)) {
          return $q.reject('rma.order_status_ineligible');
        }

        return $q(function(resolve, reject) {
          return $http.jsonp(store.jsonp_url('rma/find', {order_id: order_id}))
            .then(
              function(data) {
                // if the backend
                if (!!_.get(data, 'data.status') && !!_.get(data, 'data.data.rma')) {
                  return service.load_from_backend(data)
                    .then(function() {
                      return resolve(service);
                    });
                }
                return _load_order(order_id)
                  .then(function() {
                    return resolve(service);
                  });
              },
              function(data) {
                return _load_order(order_id)
                  .then(function() {
                    return resolve(service);
                  });
              }
            );
        });
      };

      return service;
    }
  ]
);

app.factory( 'SMHomepage_Entity', [
  'storeService',
  '$http',

    function($store, $http) {

      return function(config) {
        var service = {
          // Public Varables
          data: {
            id: null,
            b2_id: null,
            type: null,
            key: null,
            value: null,
            value1: null,
            value2: null,
            value3: null,
            active: null,
            created_by: 0,
            modified_by: 0,
            deleted_by: 0,
            modified: '0000-00-00 00:00:00',
            created: '0000-00-00 00:00:00'
          }
        };

        service._data_access = function(data_key, val) {
          if (!_.isEmpty(val)) {
            return _.set(service.data, data_key, val);
          }
          return _.get(service.data, data_key);
        };

        service._data_accessor = function(data_key) {
          return function(val) {
            return service._data_access(data_key, val);
          }
        };

        service.copy = function() {
          return angular.copy(service);
        };

        service.save = function() {
          console.log('save');
          return $http.jsonp($store.jsonp_url('sm_homepage/save', service.data))
            .then(function(res) {
              console.log('res');
              console.log(res);
              return res;
            });
        }


        // setup all of the default _data_access methods
        _.map(service.data, function(val, key) {
          if (!_.isEmpty(key)) {
            return _.set(service, key, service._data_accessor(key));
          }
        });

        if (!_.isEmpty(config)) {
          _.map(config, function(value, key) {
            if (!_.isEmpty(key)) {
              return _.set(service.data, key, value);
            }
          })
        };

        return service;
      }
    }
  ]
);

app.factory( 'SMHomepage_Banner', [
  'storeService',
  'SMHomepage_Entity',

    function($store, SMHomepage_Entity) {

      return function (config) {

        if (!_.isEmpty(config)) {
          if (!_.get(config, 'key')) {
            config.key = "New Banner"
          }
          if (!!_.get(config, 'value1')) {
            config.value1 = _.toInteger(config.value1);
          }
          if (!_.get(config, 'value2')) {
            config.value3 = $store.base_url()
          }
          if (!_.get(config, 'value3')) {
            config.value3 = "#EEEEEE"
          }
        } else {
          config = {
            value1: 100,
            value2: 'http://' + $store.replicated_url(),
            value3: '#EEEEEE'
          };
        }

        var service = angular.extend(new SMHomepage_Entity(config), {});

        service.name = service._data_accessor('key');
        service.src = service._data_accessor('value');
        service.link = service._data_accessor('value2');
        service.background_color =  service._data_accessor('value3');

        service.sort = function(val) {
          val = _.toInteger(val);
          return service._data_access('value1', val);
        }

        return service;
      };
    }
  ]
);

app.factory( 'storeService', [
      '$http',
      '$q',
      '$translate',
      '$location',
      '$state',
      'localStorageService',
      'notificationService',

  function ( $http, $q, $translate, $location, $state, localStorageService, notificationService ) {

    var
      _config = {
        // Manual Override
        disable_local_storage: false,

        // can be set by `$(gulp build:dist)`
        build_point_to_override: '',
        // Enable ONLY *ONE* of the following to pont to a specific site
        // local_point_to: ['o2o', 'local'],
        // local_point_to: ['devo2o', 'com'],
        // local_point_to: ['o2oworldwide', 'com'],
        local_point_to: ['o2ohq', 'com'],

        base_url_config: {
          'protocol' : 'https',
          'subdomain' : 'phoenix',
          'auth' : {
            'user' : 'ludaxx',
            'pass' : 'jaufangjj'
          },
        },

        domain_and_tld: '',

        url_subdomain: false,
      },

      _current_lang = function () {
        return $translate.proposedLanguage() || $translate.use() || $translate.preferredLanguage()
        // return $translate.proposedLanguage() || $translate.use();
      },

      // optional url paramater returns a dot after for caching concationation
      _gen_key = function (prefix, sufix) {
        return prefix /* + '.' + _current_lang()*/ + ( (sufix && sufix.length > 0) ? '.' + sufix : '' );
      },

      // accessed mostly for 'products' vs indifidual 'product'
      _ls_get = function (prefix, sufix) {
        if (_config.disable_local_storage) {
          return false;
        }

        var raw = localStorageService.get(_gen_key(prefix, sufix));
        var obj = angular.fromJson(raw);

        if (typeof obj == 'object') {
          return obj;
        }

        return raw;
      },

      // accessed mostly for 'products' vs indifidual 'product'
      _ls_set = function (prefix, sufix, data) {
        if (_config.disable_local_storage) {
          return false;
        }

        return localStorageService.set(_gen_key(prefix, sufix), data);
      },

      _ls_remove = function (prefix, sufix) {
        return localStorageService.remove(_gen_key(prefix, sufix));
      },

      _ls_update_store = function(update_exp) {
        return $q(function(resolve) {
          _ls_remove('store', 'raw');
          var store_copy = angular.copy(store);

          // removing attributes that do not need to be saved
          // console.log('store_factory', '_ls_update_store()', 'Not saving store.status (manual)', store_copy.status);
          delete store_copy.status;

          _.map(store_copy, function(value, key) {
            if (!_.isNumber(value) && _.isEmpty(value)) {
              if (!_.isFunction(store[key])) {
                // console.log('store_factory', '_ls_update_store()', 'Not saving !store.' + key + ' = false', value);
              }
              delete store_copy[key];
            }
          });

          // console.log('store_factory', '_ls_update_store()', 'store_copy', store_copy);

          _ls_set('store', 'raw', store_copy);

          if (update_exp) {
            _ls_remove('store', 'exp');

            // Store expires every 24hrs
            var exp = Date.now() + ( 24 * 60 * 60 * 100 );
            _ls_set('store', 'exp', exp);
          }
          return resolve(true);
        });
      },

      _setup_subdomain = function() {
        if (!_config.url_subdomain && store.marketer && store.marketer.user && 'username' in store.marketer.user) {
          _config.url_subdomain = store.marketer.user.username;
          // console.log('Found Marketer User Username: ' + _config.url_subdomain);
        } else if (!_config.url_subdomain) {
          // Split the URL after removing ('http://')

          var url = $location.host().split('.');

          if (url.length >= 2) {
            if (url[0] == 'www') {
              // remove 'www' from the url
              url.shift();
            }

            if (url.length >= 2) {
              // all of the o2o urls have 'o2o' in therm - then adding a specific
              // case for 'localhost' (for local development)
              if (url[0].indexOf('o2o') === -1 && url[0] !== 'localhost' && url[0] !== 'store') {
                _config.url_subdomain = url[0];
                // NOTE: When Chinese characters are provided in a URL, they are not 'really' there; the browser/OS
                //   handles the copy/paste -> unicode conversion, eg:
                //     一二三  =>  xn--4gqsa60b     ---- location.host.split('.')[0]
                //   'punycode' conversts these cods according to RFC 3492 and RFC 5891.
                //   https://github.com/bestiejs/punycode.js/ ---  $ bower install punycode
                //
                // _config.url_subdomain = punycode.toUnicode(url[0]) || url[0];

                // console.log('Found Marketer Subdomain: \'' + _config.url_subdomain + '\'');
              } else {
                // since we didn't get a subdomain, we'll just set _config.url_subdomain to an empty
                // string so that we don't trigger this loop again
                _config.url_subdomain = '';
                // console.log('No Marketer Subdomain found.');
              }
            }
          }
        }
        // console.log('_config.url_subdomain: ' + _config.url_subdomain);
      },

      _load_orders = function(orders) {
        return $q.all(
          _.each(orders, function(order) {
            return _.set(store.orders, order.id, _extend_order(order));
          })
        )
        .then(function(orders) {
          if (!_.isEmpty(store.user) && !_.isEmpty(store.orders)) {
            store.user.does_recive_5_percent_discount = true;
          }
          return orders;
        });
      },

      _extend_order = function(order) {
        if (!!_.get(order, 'id')) {

          _.defaultsDeep(order, {
            last_updated: moment().valueOf(),

            update: function(self) {
              var order_id = self.id;
              var btn_selector = '#update_order__' + order_id;

              $(btn_selector).attr('disabled', true);
              $(btn_selector).find('i.material-icons').addClass('material-icons-spin');

              return _fetch_orders(order_id)
                .then(function(orders) {
                  self = orders[order_id];
                  $(btn_selector).attr('disabled', false);
                  $(btn_selector).find('i.material-icons').removeClass('material-icons-spin');
                  return orders[order_id];
                });
            }
          });
        }
        return order;
      },


      _load_customer_orders = function(customer_orders) {
        return $q.all(
          _.each(customer_orders, function(customer_order) {
            return _.set(store.customer_orders, customer_order.id, customer_order);
          })
        );
      },

      _load_countries = function(countries) {
        return $q(function(resolve) {
          if (!_.isEmpty(countries)) _.set(store, 'countries', countries);
          return resolve(store.countries);
        });
      },

      _load_zones = function(zones) {
        return $q(function(resolve) {
          if (!_.isEmpty(zones)) _.set(store, 'zones', zones);
          return resolve(store.zones);
        });
      },

      _load_yuan_conversion_rate = function(yuan_conversion_rate) {
        return $q(function(resolve) {
          if (yuan_conversion_rate > 0)  _.set(store, 'yuan_conversion_rate', parseFloat(yuan_conversion_rate));
          return resolve(store.yuan_conversion_rate);
        });
      },

      _load_commissions_table = function(commissions_table) {
        return $q.all(
          _.map(commissions_table, function (value, key) {
            return _.set(store.commissions_table, key, value);
          })
        );
      },

      _load_brands = function(brands) {
        return $q.all(
          _.map(brands, function(brand) {
            return _.set(store.brands, brand.id, brand);
          })
        );
      },

      _load_products = function(products) {
        return $q(function(resolve) {
          $q.all(_.map(products, function(p) {
            if (!!p) {
              p.price_float = parseFloat(p.price);
              /*
               * 01 — Ludaxx (featured by Jau-Fang 10.8 3:30PM)
               *      346 - Pearl
               *      347 - Konli
               * 24 - Sleep Aid (add 10.31)
               * 25 - Eiji
               * 26 - D'Vine (featured by Jau-Fang 10.8 3:30PM)
               * 29 - Naturo Sciences (featured by Jau-Fang 10.12 2:00PM)
               */
              p.quantity = (
                  // match brands
                  (_.indexOf([1, 24, 25, 26, 29, 39], _.toInteger(_.get(p, 'brand.id'))) >= 0) &&
                  (_.indexOf([346, 347], _.toInteger(p.id)) == -1)
                )
                ? 100
                : 0;

              p.featured = (
                (_.indexOf([1, 26, 29], _.toInteger(_.get(p, 'brand.id'))) >= 0) &&
                (_.indexOf([346, 347], _.toInteger(p.id)) == -1)
              );
              p.sort = (p.quantity > 0)
                ? (p.featured)
                  ? (p.brand.id == 1)
                    ? (p.brand.id == 1)
                      ? 50
                      : 70
                    : 100 // featured -> (quantity > 0)
                  : 200
                : 300;

              store.products.push(p);
            }
          })).then(function() {
            $q.when(
              _.set(
                store,
                'products',
                _.sortBy(
                  _.uniqBy(store.products, 'id'),
                  'sort'
                )
              )
            )
            .then(function() {
              resolve(store.products);
            });
          });
        });
      },

      _load_categories = function(categories) {
        return $q.all(_.each(categories, function(category, key) {
          if (!!_.get(category, 'id')) {
            return _.set(store.categories, category.id, category);
          }
            return store.categories[key];
          }));
      },

      _load_user = function(user) {
        // console.log('_load_user');
        return $q(function(resolve) {
          if (!_.isEmpty(user)) {
            $('body').removeClass('user-none');
            $('body').addClass('user-loggedin');

            store.user = _extend_user(user);

            return resolve(store.user);
          } else {
            $('body').removeClass('user-loggedin');
            $('body').addClass('user-none');
          }

          return resolve(store.user);
        });
      },

      _extend_user = function(user) {
        if (!!_.get(user, 'id')) {
          // Maintain a backoffice_link - is only set when the user is valid,ated
          //    by the server and logs in.

          _.defaultsDeep(user, {
            backoffice_link: (!!store.user && user.id === store.user.id) ? store.user.backoffice_link : false,
            does_recive_5_percent_discount: (!!store.user && !_.isEmpty(store.orders)),
            is_a: function (str) {
              return store.user.group_names.indexOf(str) !== -1;
            },
            addresses: {
              default_shipping: false,
              default_billing: false,
              all: [],

              default: function(type) {
                var key = 'default_' + type;
                var default_id = (!!type) ? _.get(this, key) : false;
                var address = _.find(this.all, {id: default_id});

                if (!!address) {
                  address.country = _.find(store.countries, {id:address.country_id});
                  address.zone = _.find(store.zones, {id:address.zone_id});
                }

                return (!!address) ? address : false;
              },
              get_all: function(type) {
                var type_id = false;
                if (!_.isEmpty(type)) {
                  switch (type) {
                    case 'shipping':
                      type_id = '2';
                      break;
                    case 'billing':
                      type_id = '1';
                      break;
                  }
                }

                var addresses = _.filter(this.all, {user_address_type_id: type_id});

                _.map(addresses, function(v, k) {
                  addresses[k].country = _.find($scope.$store.countries, {id:addresses[k].country_id});
                  addresses[k].zone = _.find($scope.$store.zone, {id:addresses[k].zone_id});
                });

                return (_.isEmpty(addresses)) ? false : addresses;
              }
            }
          });
        }

        return user;
      }

      _load_redirect = function(redirect) {
        return $q(function(resolve) {
          if (_.get(redirect, 'should_redirect') == true && !_.isEmpty(redirect.url)) {
            return resolve(store.user.backoffice_link = redirect.url);
          }
          resolve('');
        });
      },

      _load_marketer = function(marketer) {
        // console.log('_load_marketer');
        return $q(function(resolve) {
          store.marketer_products = [];
          store.marketer_featured = [];

          if (!_.isEmpty(marketer)) {
            store.marketer = marketer;

            if (store.marketer.products && !_.isEmpty(store.marketer.products)) {
              for (var p_id in store.marketer.products) {
                if (
                  store.marketer.products[p_id].toc == "1" &&
                  store.marketer.products[p_id].active == "1" &&
                  !_.includes(store.marketer_products, p_id)
                ) {
                  store.marketer_products.push(p_id);

                  if (store.marketer.products[p_id].featured == "1") {
                    store.marketer_featured.push(p_id);
                  }
                }
              }
            }
          }
          resolve(store.marketer);
        });
      },

      _load_business_center = function(business_center, update_exp) {
        return $q(function(resolve) {
          update_exp = (update_exp === undefined) ? true : update_exp;
          var exp = Date.now() + ( 24 * 60 * 60 * 100 );

          _ls_set('business_center', '', business_center);

          if (update_exp) {
            _ls_set('business_center', 'exp', exp);
          }

          store.business_center = business_center;

          resolve(store.business_center);
        });
      },

      _load_mobile_apps = function(mobile_apps) {
        return $q(function(resolve) {
          if (!_.isEmpty(mobile_apps, 'android')) {
            _.set(store, 'mobile_apps', mobile_apps);
          }

          resolve(store.mobile_apps);
        });
      },

      _load_wishlist = function(wishlist) {
        return $q(function(resolve) {
          if (!_.isEmpty(wishlist)) {
            _.set(store, 'wishlist', wishlist);
          }

          resolve(store.wishlist);
        });
      },

      _load_commissions = function(commissions) {
        return $q(function(resolve) {
          if (!_.isEmpty(commissions)) {
            _.set(store, 'commissions', commissions);
          }

          resolve(store.commissions);
        });
      },

      _update_store = function(force) {
        // console.log('_update_store');
        return _load_store(store, !!force);
      },

      _load_store = function(data, update_exp) {
        update_exp = (update_exp === undefined) ? true : update_exp;

        var high_priority = [ 'products', 'user', 'marketer' ],
            low_priority = ['orders', 'customer_orders', 'countries', 'zones'],
            data_keys = _.keys(data);

        var _keys_orderd = (update_exp) ? _.uniq(_.concat(high_priority, data_keys, low_priority)) : data_keys;

        return $q.all(
            _.map(
              _keys_orderd,
              function(key) {
                return _load_store_component(key, data);
              }
            )
          ).then(function() {
            _.delay(function() {
              if (!_.isEmpty(data)) {
                // console.log('_load_store — delay—_ls_update', data);
                _ls_update_store(update_exp);
              }
            }, 2000);

            store.status = true;

            return store;
          });
      },

      _load_store_component = function(key, data) {

        var switches = {
          user: _load_user,
          orders: _load_orders,
          marketer: _load_marketer,
          customer_orders: _load_customer_orders,
          products: _load_products,
          categories: _load_categories,
          brands: _load_brands,
          yuan_conversion_rate: _load_yuan_conversion_rate,
          commissions_table: _load_commissions_table,
          orders: _load_orders,
          countries: _load_countries,
          zones: _load_zones,
          redirect: _load_redirect,

          // Data loaded not through api/store
          mobile_apps: _load_mobile_apps,
          wishlist: _load_wishlist,
          commissions: _load_commissions,
        }

        var func = _.get(switches, key)
        if (!!_.get(data, key) && !!func) {
          // console.log('_load_store_component', data);
          // console.log('_load_store_component', 'start', key);
          return func(data[key])
            .then(function(ret) {
              // console.log('_load_store_component', 'end', key);
              return ret;
            });
        } else {
          if (!!_.get(data, key)) {
            // console.log('_load_store_component', 'Unknown load function for key:"' + key + '"', _.get(data, key));
          } else {
            // console.log('_load_store_component', 'No value for load_' + key, _.get(data, key));
          }
        }

        return $q.resolve(false);
      };

    // ============================================== BASE STORE ASSETS ============================================= //

    var base_store__user = {
      marketer_featured: [],
      marketer_products: false,

      user: false,
      marketer: {
        user: false,
        about: false,
        products: false
      },

      orders: {},
      customer_orders: {},
      commissions: {
        total_sales: 0.00,
        commission_percentage: 0.00
      },

      business_center: false,
    };

    var base_store = {
      status: false,

      countries:{},
      zones:{},

      products: [],
      categories: {},
      brands: {},

      commissions_table: {},

      mobile_apps: {
        android: {
          current_version: false,
          download_url: false
        }
      },

      wishlist: {
        products: []
      },

      yuan_conversion_rate: 1
    };

    // ============================================== INIT FUNCTIONALITY ============================================== //

    var store = angular.merge({}, base_store, base_store__user);

    // =================================================== END INIT =================================================== //

    store.reset = function() {
      // console.log('store.reset');
      // localStorageService.clearAll();
      return $q(function(resolve) {
        _.mapValues(base_store__user, function(v, k) {
          store[k] = v;
        });
        return resolve(store);
      });
    }

    store.verify_version_number = function() {
      var _vn = _ls_get('__version_number', '');

      if (!!_vn && _vn < __version_number) {
        localStorageService.clearAll();
      } else {
        _ls_set('__version_number', '', __version_number);
      }
    }

    store.base_url = function(slug) {
      _setup_subdomain();

      // this logic will only be run once when first used or, if something
      //    went wrong, it will try to recover...
      if (_config.domain_and_tld === '') {
        var __loc_build_url = function (domain) {
          var _bc = _config.base_url_config;
          // Because we [were] running basic HTTP Auth, every request to the server needs to go with the basic auth dataoo
          return _bc.protocol + '://' + /* _bc.auth.user + ':' + _bc.auth.pass + '@' + */ _bc.subdomain + '.' + domain + '/';
        };

        // checking to see if the page has been built with a destination in mind
        if (_config.build_point_to_override !== '' && _config.build_point_to_override.substring(2,0) !== '__') {
          _config.domain_and_tld = __loc_build_url(_config.build_point_to_override);
        } else {
          var split = location.host.split('.');
          if (split.length > 2) { // there's a subdomain... gota remove that
            split = split.slice(-2);
          }

          // if the domain is localhost then it's in development since both
          //    dev and live should point to them selves we don't touch it
          if (_.includes(split[0], 'localhost')) {
            split = _config.local_point_to;
          }

          _config.domain_and_tld = __loc_build_url(split.join('.'));
        }
      }

      return _config.domain_and_tld + ( (!!slug) ? slug : '');
    };

    store.site_url = function(slug) {
      return store.base_url() + ( (!!slug) ? slug : '');
    };

    store.replicated_url = function(username, config) {
      if (username === undefined && store.user && 'username' in store.user) {
        username = store.user.username;
      }

      if (config && ('default_value' in config) && config.default_value) {
        username = username || config.default_value || '';
      }

      // WTF ERROR: base_url() is not a function
      // var base_url = base_url().substr(7);
      var base_url = _config.domain_and_tld.substr(7).replace('phoenix', 'store').replace('/', '');
      var replicated_url = ( ( (!!username) ? username + '.' : '' ) + base_url.substr(0, base_url.length - 1)).toLowerCase();

      if (config && 'bold' in config) {
        if (('default_value' in config) && config.default_value) {
          if (config.default_value == username) {
            return replicated_url;
          }
        }

        var split = replicated_url.split('.');
        split[0] = '<strong>' + split[0] + '</strong>';
        replicated_url = split.join('.');
      }

      return replicated_url;
    };

    /**
     * Function to signial if the user is on a replicated website domain
     * @use — Signup form should display marketer message
     * @return {Boolean}
     */
    store.is_replicated_site = function() {

    };

    store.qr_code_url = function() {
      var username = '';
      if (store.user && 'username' in store.user) {
        username = store.user.username;
      }

      return store.site_url('api/qr-code/' + username).toLowerCase();
    };
    // return: phoenix.o2ohq.com/api/store

    store.jsonp_url = function(uri_str, data, get_params) {
      // these must end with '&' so that the 'callback=JSON_CALLBACK' is a well formed url
      var data_str = (data !== undefined && data !== false) ? 'data=' + encodeURIComponent(angular.toJson(data)) + '&' : '';
      var get_params_str = (get_params !== undefined && get_params !== false) ? $.param(get_params) + '&' : '';

      // regex removes trailing and leading slashes
      var ret =  store.base_url() + 'api/' + uri_str.replace(/^\/|\/$/g, '') + '/lang/' + _current_lang() + '/format/jsonp?' + data_str + get_params_str + 'callback=JSON_CALLBACK';
      return ret;
    };

    store.add_order = function(order) {
      if (!!order || ('id' in order) ) {
        store.orders[order.id] = order;
        return _update_store(order);// TODO: _update_store does not take parameters, error?
      }
    };

    // returns a promise
    store.get_store = function (config) {
      config = (config === undefined) ? false : config;
      var override = (config && 'override' in config && !!config.override);

      return $q(function(resolve, reject) {
          if (!override) {
            if (store.status) {
              return resolve(store);
            }

            var ls_store = _ls_get('store', 'raw');

            if ( !!ls_store && _ls_get('store', 'exp') > Date.now()) {
              return resolve(_load_store(ls_store));
            }
          }

          return resolve(_fetch_store());
        })
        .finally(function() {
          _.delay(function() {
            if (_(store.countries).isEmpty() || _(store.zones).isEmpty()) {
              store.get_countries_and_zones();
            }
          }, 2000);
        });
    };

    var _fetch_store = function() {
      return $q(function(resolve, reject) {
        if (_is_mobile_app()) {
          console.log('_fetch_store()', 'DETECTED MOBILE APP')
          return $http.get('assets/json/api_store.json')
            .then(
              function(resp) {
                console.log('_fetch_store()', 'resp', resp);
                return resolve(_load_store(resp.data.data));
              },
              function () {
                return resolve (_fetch_fetch_store());
              }
            );
        }
        return resolve (_fetch_fetch_store());
      });

    };

    var _fetch_fetch_store = function() {
      return $http.jsonp( store.jsonp_url('store') )
        .then( function ( resp ) {
          if (
            resp.status == 200 &&
            'data' in resp &&
            'status' in resp.data &&
            'data' in resp.data &&
            resp.data.status) {

              return _load_store(resp.data.data);

          } else {
            console.log("(store) HTTP bad response:");
            console.log(resp);

            return false;
          }
        } );
    };

    var _fetch_countries_and_zones = function() {
      // console.log('_fetch_countries_and_zones');
      return $http.jsonp( store.jsonp_url('countries_zones') )
        .then( function ( resp ) {
          if (
            resp.status == 200 &&
            'data' in resp &&
            'status' in resp.data &&
            'data' in resp.data &&
            resp.data.status) {
              return _load_store(resp.data.data, false);

              return {
                countries: store.countries,
                zones: store.zones
              };

          } else {
            console.log("(countries_zones) HTTP bad response:");
            console.log(resp);

            return false;
          }
        } );
    };

    var _fetch_orders = function(order_id) {
      return $q(function(resolve, reject) {
        var params = (typeof order_id === undefined) ? {} : {order_id: order_id };

        if (!!order_id) {
          params.is_update = true;
        }

        $http.jsonp( store.jsonp_url('find_orders', params) )
          .then( function ( resp ) {
            if (
              'data' in resp &&
              'status' in resp.data &&
              resp.data.status &&
              'data' in resp.data &&
              'orders' in resp.data.data
            ) {
              if (!!resp.data.data.orders) {
                return _load_store(resp.data.data)
                  .then(function(data) {
                    _.delay(function() {
                      _update_store(data)
                    }, 2000);

                    return resolve(data.orders);
                  });
              }

              return reject('general.errors.no_order_found_for_id');
            }
          } );
      });
    }

    var _fetch_user_login = function(payload) {
      return $http.jsonp( store.jsonp_url('login', payload) );
    }

    store.get_orders = function(order_id) {
      order_id = (order_id === undefined) ? false : order_id;

      if (!_.isEmpty(store.orders)) {
        return $q(function(resolve){
          if (!!order_id) {
            if (_.has(store.orders, order_id)) {
              return resolve(_.get(store.orders, order_id));
            } else if (_.has(store.customer_orders, order_id)) {
              return resolve(_.get(store.customer_orders, order_id));
            } else {
              return _fetch_orders(order_id);
            }
          }
          return resolve(store.orders);
        });
      }

      return _fetch_orders();
    };

    store.get_customer_orders = function(customer_order_id) {
      customer_order_id = (customer_order_id === undefined) ? false : customer_order_id;

      if (!_.isEmpty(store.customer_orders)) {
        return $q(function(resolve){
          if (!!order_id) {
            if (_.has(store.customer_orders, order_id)) {
              return resolve(_.get(store.customer_orders, order_id));
            }
          }
          return resolve(store.customer_orders);
        });
      }

      return false;
    };

    store.get_brand = function(brand_id) {
      brand_id = (brand_id === undefined) ? false : brand_id;

      if (!_.isEmpty(store.brands)) {
        return $q(function(resolve) {
          if (!!brand_id) {
            return resolve( (_.has(store.brands, brand_id)) ? _.get(store.brands, brand_id) : false );
          }
          return resolve(store.brands);
        });
      }
      return $http.jsonp( store.jsonp_url('brand', brand_id) )
        .then( function ( resp, resolve, reject ) {
          if ('data' in resp) {

            if (!resp.data.status) {
              notificationService.error('Error: ' + resp.data.message);
              return reject(resp.data.message);
            }

            return _load_store(resp.data.data)
              .then(function() {
                if (!!brand_id) {
                  resolve( (_.has(store.brands, brand_id)) ? _.get(store.brands, brand_id) : false );
                }
                return resolve(store.brands);
              });
          }
        } );

      return deferred.promise;
    };

    store.count_orders = function() {
      return (Object.keys(store.orders)).length;
    };

    store.add_orders = function(orders) {
      return $q(function(resolve, reject) {

        if (!_.isArray(orders)) {
          orders = [orders];
        }

        _.map(orders, function(v, k) {
          // not a comprehensive check, but good enough spot checking that
          //     we should be able to drop most mal-formatted
          if (
            !!_.get(v, 'id') &&
            !!_.get(v, 'order_status') &&
            !!_.get(v, 'order_status_id') &&
            !!_.get(v, 'invoice_no') &&
            !!_.get(v, 'total') &&
            _.size(v, 'products') > 0
          ) {
            // do nothing, it's a good order
          } else {
            delete orders[k];
          }
        });

        if (_.size(orders) > 0) {
          return _load_store({orders: orders})
            .then(function(data) {
              _.delay(function() {
                _update_store(data)
              }, 2000);

              return resolve(true);
            })
            .catch(function(e) {
              return reject(e);
            });
        }
      });
    };

    store.get_countries_and_zones = function () {
      return $q(function(resolve) {

        if (!_.isEmpty(store.countries) > 1 && !_.isEmpty(store.zones)) {
          resolve({
            countries: store.countries,
            zones: store.zones
          });
        }

        return _fetch_countries_and_zones();
      });
    };

    store.check_app_version = function() {
      return $http.jsonp(store.jsonp_url('android_apk/current_version', {v: __version_number}))
        .then(function (data) {
          var response_version = _.get(data, 'data.data.current_apk_version');
          var download_url = _.get(data, 'data.data.download_url');

          _load_store({
            mobile_apps: {
                android: {
                  current_version: response_version,
                  download_url: download_url
                }
              }
          }, false)
            .then(function() {
              return (isFloat(response_version) && response_version > __version_number)
                ? download_url
                : false;
            })
        });
    };

    store.get_country_by_id = function(country_id, source) {
      return store.get_countries_and_zones()
        .then(function(val, resolve, reject) {
          source = (source === undefined) ? store.countries : source;

          console.log(_.filter(source, _.matches({id: country_id})));

          if (!_.isEmpty(source)) {
            for (var i in source) {
              if (source[i].id == country_id) {
                return resolve(source[i]);
              }
            }
          }
          return reject(false);
        });

    };

    store.get_product = function (req) {
      if (req === undefined) {
        return false;
      } else if (!!!_.get(req, 'active')) {
        // if no active state is requested, we will inject one
        req.active = '1';
      }

      return store.get_store()
        .then(function() {
          return _.find(store.products, req);
        });
    }

    store.get_category = function (req) {
      if (req === undefined) {
        return $q.when(false);
      }

      return store.get_store()
        .then(function() {
          // TODO: Add active check -- see get_product
          return _.find(store.categories, req);
        });
    }

    store.login = function(form_data, goto_account) {
      goto_account = goto_account || false;

      return $q(function(resolve, reject) {
        _fetch_user_login(form_data)
          .success(function(data) {
            if (_.get(data, 'code') === '401') {
              reject('login.wrong_email_or_password');
            } else if (_.get(data, 'status') && _.get(data, 'code') == 200) {
              store.reset()
                .then(function() {
                  _load_store(data.data)
                    .then(function() {
                      resolve(
                        $translate(
                          'notify.success.login_fetched',
                          { name: store.user.last_name + ' ' + store.user.first_name }
                        )
                        .then(function(tstr) {
                          return notificationService.success(tstr);
                        })
                      );
                    });
                });
            } else {
              return reject(data.message);
            }
          })
          .error(function() {
            return reject('login.failed_to_connect_server')
          });
      });
    }

    store.load = function(data) {
      return _load_store(data);
    }

    // Probably working, untested
    // store.register = function() {
    //   return $q(function(resolve, reject) {
    //     $http.jsonp( $scope.$store.jsonp_url('users/register', $scope.info.form_data))
    //       .then(function(resp) {
    //         if (!!_.get(resp, 'data.status') && !!_.get(resp, 'data.data.user') && !!_.get(resp, 'data.data.user.id')) {
    //           return _.get(resp, 'data.data');
    //         }
    //         return reject('general.register.fail');
    //       })
    //       .then(function(data) {
    //         _load_store(data)
    //           .then(function() {
    //             resolve(data.user);
    //           });
    //       })
    //       .error(function() {
    //         return reject('login.failed_to_connect_server')
    //       });
    //   });
    // },

    store.get_marketer_subdomain = function() {
      _setup_subdomain();
      if (store.marketer && store.marketer.user && 'username' in store.marketer.user) {
        return store.marketer.user.username;
      } else if (_config.url_subdomain !== '') {
        return _config.url_subdomain;
      }
      return '';
    };

    store.logout = function() {
      store.user = false;

      return $q(function(resolve, reject) {
        $http.jsonp( store.jsonp_url('logout') )
          .then(store.reset)
          .then(function() {
            return _update_store(true);
          })
          .then(function() {
            if (
              $state.current.name.indexOf('account') > -1 ||
              $state.current.name == 'root.marketer'
            ) {
              return $translate('notify.success.logged_out')
                .then(function(tstr) {
                  notificationService.success(tstr);
                })
                .then($state.go('root.login'));
            } else {
              return $q.when($state.reload());
            }
            resolve(true);
          });
      });
    };

    store.get_business_center = function () {
      return $q(function(resolve) {
        if (store.business_center) {
          return resolve(store.business_center);
        }

        var ls_bc = _ls_get('business_center', '');
        if ( !!ls_bc && _ls_get('business_center', 'exp') > Date.now()) {
          return resolve(_load_business_center(ls_bc, false));
        }

        return $http.jsonp( store.jsonp_url('business_center') )
          .then( function ( resp ) {
            if (
              resp.status == 200 &&
              'data' in resp &&
              'status' in resp.data &&
              'data' in resp.data &&
              resp.data.status) {
                return _load_business_center(resp.data.data, true);
            } else {
              return $q.reject(resp);
            }
          } );
      });
    };

    store.calculate_user_discount_amount = function(price) {
      var discounted_price = store.calculate_user_discount(price, true);
      return parseFloat(price-discounted_price);
    }

    store.calculate_user_discount = function(price, is_price_discounted) {
      is_price_discounted = (typeof is_price_discounted !== undefined) ? is_price_discounted : false;

      return parseFloat(
        (
          (is_price_discounted && store.user.does_recive_5_percent_discount)
            ? price * 0.9500
            : price
        )
      ).toFixed(2);
    }

    store.is_ls_disabled = function() {
      return config.disable_local_storage;
    }

    // TODO: Finish wishlist — unprogrammed
    store.reset_wishlist = function() {
      return _load_store({
        wishlist: base_store.wishlist
      });
    }

    store.format_html_address = function(address, is_html) {
      is_html = !!is_html;
      if (!!address.country && !!_.get(address.country, 'address_format')) {
        var interpolate_original = _.templateSettings.interpolate;
        _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

        var address_defaults = {
          company: '',
          first_name: '',
          last_name: '',
          address1: '',
          address2: '',
          city: '',
          district: '',
          zipcode: ''
        };

        // setup the country/zone if needed
        if (!!address.country_id && !address.country) {
          address.country = _.find(store.countries, {id:address.country_id});
        }
        if (!!address.zone_id && !address.zone) {
          address.zone = _.find(store.zones, {id:address.zone_id});
        }

        if (!!_.get(address, 'country.id')) {
          address.country.iso_code_3 = $translate.instant( 'countries.' + _.get(address, 'country.id') );
        } else {
          address_defaults.country = {
            address_format: '',
            iso_code_3: '<strong class="text-danger">[' + $translate.instant('general.form.country.label').toLowerCase() + ']</strong>'
          };
        }

        if (!!_.get(address, 'zone.id')) {
          address.zone.name = $translate.instant('zones.' + _.get(address, 'zone.id') );
        } else {
          address_defaults.zone = {name: '<strong class="text-danger">[' + $translate.instant('general.form.state.label').toLowerCase() + ']</strong>'};
        }

        var display_address = _.defaultsDeep(address, address_defaults);
        var ret = _.template(address.country.address_format)(address)
          .replace(/\n\s*/g, '<br>');

        _.templateSettings.interpolate = interpolate_original;
        return ret;
      }
      return false;
    };

    store.get_order_address = function(order, type) {
      type = type || '';
      type = type.trim().toLowerCase();

      var addr =  {
        first_name: _.get(order, type + '_firstname'),
        last_name: _.get(order, type + '_lastname'),
        gov_id_no: _.get(order, type + '_gov_id_no'),
        company: _.get(order, type + '_company'),
        address_1: _.get(order, type + '_address_1'),
        address_2: _.get(order, type + '_address_2'),
        city: _.get(order, type + '_city'),
        district: _.get(order, type + '_district'),
        zipcode: _.get(order, type + '_zipcode'),
        country: {},
        zone: {},
        country_id: _.get(order, type + '_country_id'),
        zone_id: _.get(order, type + '_zone_id'),
        phone: _.get(order, type + '_phone')
      };

      addr.country = _.find(store.countries, {id: addr.country_id});
      addr.zone = _.find(store.zones, {id: addr.zone_id});

      return addr;
    };

    store.get_formatted_order_address = function (order, type, is_html) {
      console.log('get_formatted_order_address::is_html', is_html);
      return store.format_html_address(
        store.get_order_address(order, type),
        is_html
      );
    };

    // store.add_product_

    return store;

        } ] );

app.filter('brandMeta', [ '$rootScope', 'storeService', function($rootScope, $store) {
  return function(brand_id, key) {
    return $rootScope.brand_meta(brand_id, key);
  };
}]);

/*global app*/

app
  .filter( "max", function () {
    "use strict";
    return function ( input ) {
      var out;
      if ( input ) {
        for ( var i in input ) {
          if ( input[ i ] > out || out === undefined || out === null ) {
            out = input[ i ];
          }
        }
      }
      return out;
    };
  } )
  .filter( "min", function () {
    "use strict";
    return function ( input ) {
      var out;
      if ( input ) {
        for ( var i in input ) {
          if ( input[ i ] < out || out === undefined || out === null ) {
            out = input[ i ];
          }
        }
      }
      return out;
    };
  } )
  .filter('tel', function () {
    return function (tel) {
        if (!tel) { return ''; }

        var value = tel.toString().trim().replace(/^\+/, '');

        if (value.match(/[^0-9]/)) {
            return tel;
        }

        var country, city, number;

        switch (value.length) {
            case 10: // +1PPP####### -> C (PPP) ###-####
                country = 1;
                city = value.slice(0, 3);
                number = value.slice(3);
                break;

            case 11: // +CPPP####### -> CCC (PP) ###-####
                country = value[0];
                city = value.slice(1, 4);
                number = value.slice(4);
                break;

            case 12: // +CCCPP####### -> CCC (PP) ###-####
                country = value.slice(0, 3);
                city = value.slice(3, 5);
                number = value.slice(5);
                break;

            default:
                return tel;
        }

        if (country == 1) {
            country = "";
        }

        number = number.slice(0, 3) + '-' + number.slice(3);

        return (country + " (" + city + ") " + number).trim();
    };
  })
  .filter('capitalize', function() {
    return function(input) {
      return (!!input) ? input.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }) : '';
    }
  });

app.filter('price', [
  '$rootScope',
    function($rootScope) {
        return function (o2o_price, TEMPORARY_IS_PRODUCT_PRICE_DISCOUNTED, do_not_adjust) {
          return $rootScope.get_price_str(o2o_price, TEMPORARY_IS_PRODUCT_PRICE_DISCOUNTED, do_not_adjust);
        //   TEMPORARY_IS_PRODUCT_PRICE_DISCOUNTED = TEMPORARY_IS_PRODUCT_PRICE_DISCOUNTED || false;
        //   do_not_adjust = do_not_adjust || false;
        //
        //   var price = parseFloat(o2o_price).toFixed(2);
        //   var currency_char = '$';
        //
        //   if ($rootScope.lang.current() !== 'en' && $rootScope.$store.yuan_conversion_rate && $rootScope.$store.yuan_conversion_rate > 0) {
        //     price = parseFloat(Math.round( (o2o_price * $rootScope.$store.yuan_conversion_rate) * 100) / 100 ).toFixed(2);
        //     currency_char = '¥';
        //   }
        //
        //
        //   if (!do_not_adjust) {
        //     price = $rootScope.$store.calculate_user_discount(
        //       price,
        //       !TEMPORARY_IS_PRODUCT_PRICE_DISCOUNTED
        //     )
        //   }
        //
        //   $rootScope.$on( 'langKey', function (langKey) {
        //     if (langKey !== 'en') {
        //       price = parseFloat(Math.round( (o2o_price * $rootScope.$store.yuan_conversion_rate) * 100) / 100 );
        //       currency_char = '¥';
        //     }
        //
        //     return currency_char + price;
        //   });
        //
        //   return currency_char + price;
        };

    }
]);

app
  .directive('scrollSpy', function ($window) {
  return {
    restrict: 'A',
    controller: function ($scope) {
      $scope.spies = [];
      this.addSpy = function (spyObj) {
        $scope.spies.push(spyObj);
      };
    },
    link: function (scope, elem, attrs) {
      var spyElems;
      spyElems = [];

      scope.$watch('spies', function (spies) {
        var spy, _i, _len, _results;
        _results = [];

        for (_i = 0, _len = spies.length; _i < _len; _i++) {
          spy = spies[_i];

          if (spyElems[spy.id] === null) {
            _results.push(spyElems[spy.id] = elem.find('#' + spy.id));
          }
        }
        return _results;
      });

      $($window).scroll(function () {
        var highlightSpy, pos, spy, _i, _len, _ref;
        highlightSpy = null;
        _ref = scope.spies;

        // cycle through `spy` elements to find which to highlight
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          spy = _ref[_i];
          spy.out();

          // catch case where a `spy` does not have an associated `id` anchor
          if ((spyElems[spy.id] === undefined) || spyElems[spy.id].offset() === undefined) {
            continue;
          } else {
            if ((pos = spyElems[spy.id].offset().top) - $window.scrollY <= 0) {
              // the window has been scrolled past the top of a spy element
              spy.pos = pos;

              if (highlightSpy === null) {
                highlightSpy = spy;
              }
              if (highlightSpy.pos < spy.pos) {
                highlightSpy = spy;
              }
            }
          }
        }

        // select the last `spy` if the scrollbar is at the bottom of the page
        if ($(window).scrollTop() + $(window).height() >= $(document).height()) {
          spy.pos = pos;
          highlightSpy = spy;
        }

        return highlightSpy !== null ? highlightSpy["in"]() : void 0;
      });
    }
  };
});

app.directive('spy', function ($location, $anchorScroll) {
  return {
    restrict: "A",
    require: "^scrollSpy",
    link: function(scope, elem, attrs, affix) {
      elem.click(function () {
        $location.hash(attrs.spy);
        $anchorScroll();
      });

      affix.addSpy({
        id: attrs.spy,
        in: function() {
          elem.addClass('active');
        },
        out: function() {
          elem.removeClass('active');
        }
      });
    }
  };
});

app.filter('startFrom', function () {
	return function (input, start) {
		if (input) {
			start = +start;
			return input.slice(start);
		}
		return [];
	};
});

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

app.service( 'modalService', [
  '$modal',
    function ( $modal ) {

    var modalDefaults = {
      backdrop: false,
      keyboard: true,
      modalFade: true,
      templateUrl: 'views/partials/ui/base_modal.html'
    };

    var modalOptions = {
      show_footer: true,
      closeButtonText: 'Close',
      actionButtonText: 'OK',
      header: 'O2O WorldWide',
      body: false
    };

    this.showModal = function ( customModalDefaults, customModalOptions ) {
      if ( !customModalDefaults ) customModalDefaults = {};
      customModalDefaults.backdrop = true;
      return this.show( customModalDefaults, customModalOptions );
    };

    this.show = function ( customModalDefaults, customModalOptions ) {
      //Create temp objects to work with since we're in a singleton service
      var tempModalDefaults = {};
      var tempModalOptions = {};

      //Map angular-ui modal custom defaults to modal defaults defined in service
      angular.extend( tempModalDefaults, modalDefaults, customModalDefaults );

      //Map modal.html $scope custom properties to defaults defined in service
      angular.extend( tempModalOptions, modalOptions, customModalOptions );

      if ( !tempModalDefaults.controller ) {
        tempModalDefaults.controller = function ( $scope, $modalInstance ) {
          $scope.modalOptions = tempModalOptions;
          $scope.modalOptions.ok = function ( result ) {
            $modalInstance.close( result );
          };
          $scope.modalOptions.close = function ( result ) {
            $modalInstance.dismiss( 'cancel' );
          };
        };
      }

      return $modal.open( tempModalDefaults ).result;
    };

    this.hide = function() {
      return $model.modal('hide');
    }

    } ] );

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

// credits: https://github.com/iameugenejo/ngScrollTo
app.directive( 'scrollTo', [ 'ScrollTo', function ( ScrollTo ) {
    return {
      restrict: "AC",
      compile: function () {

        return function ( scope, element, attr ) {
          element.bind( "click", function ( event ) {
            ScrollTo.idOrName( attr.scrollTo, attr.offset );
          } );
        };
      }
    };
} ] )
  .service( 'ScrollTo', [ '$window', 'ngScrollToOptions', function ( $window, ngScrollToOptions ) {

    this.idOrName = function ( idOrName, offset, focus ) { //find element with the given id or name and scroll to the first element it finds
      var document = $window.document;

      if ( !idOrName ) { //move to top if idOrName is not provided
        $window.scrollTo( 0, 0 );
      }

      if ( focus === undefined ) { //set default action to focus element
        focus = true;
      }

      //check if an element can be found with id attribute
      var el = document.getElementById( idOrName );
      if ( !el ) { //check if an element can be found with name attribute if there is no such id
        el = document.getElementsByName( idOrName );

        if ( el && el.length )
          el = el[ 0 ];
        else
          el = null;
      }

      if ( el ) { //if an element is found, scroll to the element
        if ( focus ) {
          el.focus();
        }

        ngScrollToOptions.handler( el, offset );
      }

      //otherwise, ignore
    };

} ] )
  .provider( "ngScrollToOptions", function () {
    this.options = {
      handler: function ( el, offset ) {
        if ( offset ) {
          var top = $( el ).offset().top - offset;
          window.scrollTo( 0, top );
        } else {
          el.scrollIntoView();
        }
      }
    };
    this.$get = function () {
      return this.options;
    };
    this.extend = function ( options ) {
      this.options = angular.extend( this.options, options );
    };
  } );

app.service('sharedProperties', function () {
      var properties = {};

      return {
          getProperty: function (key) {
              return properties[key];
          },
          setProperty: function(key, value) {
              properties[key] = value;
          }
      };
  });


app.directive('address', ['storeService', function($store) {
  return {
    restrict: "E",
    require: '^form',
    scope: {
      'ngModel': '=',
      'type': '@'
    },
    templateUrl: 'views/partials/ui/templates/address.html',
    link: function (scope, element, attributes, form) {
      scope.inital_ngModel = angular.copy(scope.ngModel);
      scope.$store = $store;
      scope.Form = form;
    },

  };
}]);


app.directive('addressSelect', ['$rootScope', 'storeService', function($rootScope, $store) {
  return {
    restrict: "E",
    require: '^form',
    scope: {
      'ngModel': '=',
      'type': '@'
    },
    template:
    '<div ng-if="display_change">\
        <div class="col-xs-8" ng-class="{\'text-lighter-2x\': (should_display_address_form && is_hover_discard)}">\
          <p ng-bind-html="get_html_address_display()" class="display-inline address-display"></p>\
        </div>\
        <div ng-if="!!$store.user" class="btn-group pull-right" role="group">\
          <a ng-if="should_display_address_form" ng-click="comfirm_address()" \
            class="btn btn-success"\
            >\
            <i class="material-icons material-icons-check"></i>\
          </a>\
          <a ng-click="toggle_should_display_address_form()" \
            ng-mouseover="discard_hover(true)"\
            ng-mouseleave="discard_hover(false)"\
            class="btn btn-default"\
            ng-class="{\'btn-danger\': should_display_address_form}"\
            >\
            <i class="material-icons" ng-class="icon_class_str"></i>\
          </a>\
        </div>\
      </div>\
      <div class="clearfix"></div>\
      <div ng-if="should_display_address_form">\
        <hr ng-if="display_change" class="b20">\
        <address type="{{type}}" ng-model="ngModel"></address>\
        <div ng-if="display_change" class="btn-group pull-right">\
          <a ng-click="toggle_should_display_address_form()" \
            class="btn btn-default btn-raised"\
            >\
            <i class="material-icons material-icons-delete_forever"></i>\
            <span translate="{{toggle_button_text}}"></span>\
          </a>\
          <a ng-if="should_display_address_form" ng-click="comfirm_address()" \
            class="btn btn-success btn-raised"\
            >\
            <i class="material-icons material-icons-check"></i>\
            <span translate="general.save"></span>\
          </a>\
        </div>\
      </div>',
    link: function (scope, element, attributes, form) {
      scope.inital_ngModel = angular.copy(scope.ngModel);
      scope.display_change = !_.isEmpty(_.get(scope.ngModel, 'id'));
      scope.should_display_address_form = (!scope.display_change);
      scope.is_hover_discard = false;
      scope.$store = $store;
      scope.icon_class_str = 'material-icons-edit';

      scope.toggle_should_display_address_form = function() {
        if (!!scope.should_display_address_form) {
          scope.reset();
        }
        scope.should_display_address_form = !scope.should_display_address_form;
        scope.update_toggle_btn_txt();
      };

      scope.comfirm_address = function() {
        scope.should_display_address_form = false;
        scope.inital_ngModel = angular.copy(scope.ngModel);
        scope.update_toggle_btn_txt();
      };

      scope.discard_hover = function(status) {
        scope.is_hover_discard = (status == undefined) ? false : status;
      };

      // auto running/initalizing function
      (scope.update_toggle_btn_txt = function() {
        scope.icon_class_str = "material-icons-" + (
            (!scope.should_display_address_form)
              ? 'edit'
              : 'clear'
          )
        scope.toggle_button_text = "general.address." + (
          (scope.should_display_address_form)
            ? "discard_changes"
            : "change_address"
          );
      })();

      scope.reset = function() {
        scope.ngModel = angular.copy(scope.inital_ngModel);
        scope.ngModel.country = _.find($store.countries, {id: scope.ngModel.country_id});
        scope.ngModel.zone = _.find($store.zones, {id: scope.ngModel.zone_id});
      };

      scope.get_html_address_display = function() {
        var should_show_inital = !!(scope.is_hover_discard && scope.should_display_address_form);
        return $store.format_html_address( (should_show_inital) ? scope.inital_ngModel : scope.ngModel );
      }
    },

  };
}]);

app.directive("formGroup", ['$interpolate', function($interpolate) {
  return {
    template:
    '<div class="form-group label-floating" ng-class="{}" show-errors type="{{type}}">\
      <div class="input-group">\
        <label class="control-label" for="{{for}}">\
          {{label}}\
          <span ng-if="get_is_required()">&#42;</span>\
          </label>\
        <ng-transclude></ng-transclude>\
        <div ng-if="hasError">\
          <span ng-repeat="(key,error) in _.get(form.$name, inputName + \'.$error\')" class="help-block" \
                ng-if="error" translate="form.invalid.{{key}}">\
          </span>\
        </div>\
      </div>\
    </div>',

    restrict: 'E',
    // replace: true,
    transclude: true,
    require: "^form", // Tells Angular the control-group must be within a form

    scope: {
      label: "@", // Gets the string contents of the `label` attribute.
      ngModel: '='
    },

    link: function (scope, element, attrs, form) {
      scope.form = form;
      scope.input = element.find(":input");
      scope.type = (!!_.get(scope.$parent, 'type')) ? scope.$parent.type : '';

      // The <label> should have a `for` attribute that links it to the input.
      // Get the `id` attribute from the input element
      // and add it to the scope so our template can access it.
      //
      // // Get the `name` attribute of the input
      var inputName = $interpolate(scope.input.attr('name') || '')(scope);
      var ngModel_key = (inputName.split('.').length > 1) ? inputName.split('.').pop() : inputName;

      // scope.input.attr('name', inputName);
      // Build the scope expression that contains the validation status.
      // e.g. "form.example.$invalid"
      var form_element_selector =  form.$name + '["' + inputName + '"]';

      scope.for = scope.input.attr("id");

      scope.get_is_required = _.throttle(function() {
        return (
          scope.input.attr("ng-required") == 'true') ||
          Boolean(_.get(scope.$parent, form_element_selector + '.$error.required')
        );
      }, 200);
    }
  };
}]);

app.directive("referralInput", ['$storeService', function($store) {
  return {
    template:
    '<div class="referral-input-container">\
      <div ng-if=""></div>\
    </div>',

    restrict: 'E',
    require: "^form", // Tells Angular the control-group must be within a form

    scope: {
      ngModel: '='
    },

    link: function (scope, element, attrs, form) {
      scope.$store = $store;
      scope.form = form;
    }
  };
}]);

(function() {
  var showErrorsModule;

  showErrorsModule = angular.module('ui.bootstrap.showErrors', []);

  showErrorsModule.directive('showErrors', [
    '$timeout', 'showErrorsConfig', '$interpolate', function($timeout, showErrorsConfig, $interpolate) {
      var getShowSuccess, getTrigger, linkFn;
      getTrigger = function(options) {
        var trigger;
        trigger = showErrorsConfig.trigger;
        if (options && (options.trigger != null)) {
          trigger = options.trigger;
        }
        return trigger;
      };
      getShowSuccess = function(options) {
        var showSuccess;
        showSuccess = showErrorsConfig.showSuccess;
        if (options && (options.showSuccess != null)) {
          showSuccess = options.showSuccess;
        }
        return showSuccess;
      };
      linkFn = function(scope, el, attrs, formCtrl) {
        var blurred, inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses, trigger;
        blurred = false;
        options = scope.$eval(attrs.showErrors);
        showSuccess = getShowSuccess(options);
        trigger = getTrigger(options);
        inputEl = el[0].querySelector('.form-control[name]');
        inputNgEl = angular.element(inputEl);
        inputName = $interpolate(inputNgEl.attr('name') || '')(scope.$parent);
        if (!inputName) {
          throw "show-errors element has no child input elements with a 'name' attribute and a 'form-control' class";
        }
        inputNgEl.bind(trigger, function() {
          blurred = true;
          return toggleClasses(formCtrl[inputName].$invalid);
        });
        scope.$watch(function() {
          return formCtrl[inputName] && formCtrl[inputName].$invalid;
        }, function(invalid) {
          if (!blurred) {
            return;
          }
          return toggleClasses(invalid);
        });
        scope.$on('show-errors-check-validity', function() {
          return toggleClasses(formCtrl[inputName].$invalid);
        });
        scope.$on('show-errors-reset', function() {
          return $timeout(function() {
            el.removeClass('has-error');
            el.removeClass('has-success');
            return blurred = false;
          }, 0, false);
        });
        return toggleClasses = function(invalid) {
          el.toggleClass('has-error', invalid);
          if (showSuccess) {
            return el.toggleClass('has-success', !invalid);
          }
        };
      };
      return {
        restrict: 'A',
        require: '^form',
        compile: function(elem, attrs) {
          if (attrs['showErrors'].indexOf('skipFormGroupCheck') === -1) {
            if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
              throw "show-errors element does not have the 'form-group' or 'input-group' class";
            }
          }
          return linkFn;
        }
      };
    }
  ]);

  showErrorsModule.provider('showErrorsConfig', function() {
    var _showSuccess, _trigger;
    _showSuccess = false;
    _trigger = 'blur';
    this.showSuccess = function(showSuccess) {
      return _showSuccess = showSuccess;
    };
    this.trigger = function(trigger) {
      return _trigger = trigger;
    };
    this.$get = function() {
      return {
        showSuccess: _showSuccess,
        trigger: _trigger
      };
    };
  });

}).call(this);
