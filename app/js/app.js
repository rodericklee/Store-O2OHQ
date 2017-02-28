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
