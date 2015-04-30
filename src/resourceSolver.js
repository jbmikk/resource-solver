angular.module('resourceSolver', ['ui.router'])
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
}).config(['$provide', function($provide) {

  $provide.decorator("$state", function($delegate, $rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
      $delegate.next = toState;
      $delegate.nextParams = toParams;
    });
    return $delegate;
  });

}])
.constant('rs', function(res) {

  function Solver($resource, resourceSolver, $state) {
    var baseUrl = resourceSolver.getBaseUrl();
    var action = res.action || 'get';

    return $resource(baseUrl+res.url, $state.nextParams)[action]().$promise;
  };

  return ['$resource', 'resourceSolver', '$state', Solver];
});
