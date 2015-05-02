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

    function searchState(state, scope) {
      for(var i in state.locals) {
        if(state.locals.hasOwnProperty(i) && i.indexOf('@') > -1 && state.locals[i].$scope === scope) {
          console.log("Matched scope", i, state.self.name, state, scope);
          return state;
        }
      }
      if(state.parent) {
        return searchState(state.parent, scope);
      } else {
        return null;
      }
    }

    $rootScope.$on('$viewContentLoaded', function(event) {

      var state = searchState($delegate.$current, event.targetScope);
      if(state) {
        var data = {}; 
        var foundData = false;
        for(var i in state.locals.globals) {
          if(i.indexOf('$') != 0) {
            foundData = true;
            data[i] = state.locals.globals[i];
          }
        }
        if(foundData) {
          //event.targetScope.$apply(function() {
          console.log("Autoinject into scope", data);
          angular.extend(event.targetScope, data);
          //});
        }
      }

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
