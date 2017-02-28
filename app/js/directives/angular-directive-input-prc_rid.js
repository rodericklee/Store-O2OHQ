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
