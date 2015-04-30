angular.module('resourceSolver', [])
.provider('resourceSolver', function ResourceSolver() {
  var baseUrl = '';

  this.setBaseUrl = function(url) {
    baseUrl = url;
  };

  this.$get = function() {
    return {
      getBaseUrl: function() {
        return baseUrl;
      }
    };
  };
})
.constant('rs', function(res) {

  function Solver($resource, $resourceSolver, $state) {
    var baseUrl = $resourceSolver.getBaseUrl();
    var action = res.action || 'get';

    return $resource(baseUrl+res.url, $state.params)[action]().$promise;
  };

  return ['$resource', '$resourceSolver', '$state', Solver];
});
