angular.module('resourceSolver', [])
.provider('resourceSolver', function ResourceSolver() {
  var baseUrl = '';

  this.setBaseUrl = function(url) {
    baseUrl = url;
  };

  this.$get = function($rootScope, $state) {

    $rootScope.$on('$stateChangeStart', function(event, state, params) {
      $state.next = state;
      $state.nextParams = params;
    });

    return {
      getBaseUrl: function() {
        return baseUrl;
      }
    };
  };
})
.constant('rs', function(res) {

  function Solver($resource, resourceSolver, $state) {
    var baseUrl = resourceSolver.getBaseUrl();
    var action = res.action || 'get';

    return $resource(baseUrl+res.url, $state.nextParams)[action]().$promise;
  };

  return ['$resource', 'resourceSolver', '$state', Solver];
});
