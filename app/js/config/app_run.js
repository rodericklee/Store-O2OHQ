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
