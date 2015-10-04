'use-strict';
angular.module('ngResource', [])
.provider('$resource', function() {

  function action() {
    var data = {};

    data.$promise = {
      then: function(callback) {
        return callback({});
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
});
