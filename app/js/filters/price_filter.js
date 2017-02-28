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
