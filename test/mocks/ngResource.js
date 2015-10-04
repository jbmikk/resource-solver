'use-strict';
angular.module('ngResource', [])
.provider('$resource', function() {

  function action() {
    var data = _data || {};

    data.$promise = {
      then: function(callback) {
        return callback(data);
      }
    };

    return data;
  }

  this.$get = function() {
    return function(url, params, actions) {
      return {
        get: action
      }
    };
  };

  var _data;
  this.setData = function(data) {
    _data = data;
  };
});
