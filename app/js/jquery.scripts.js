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
