function ResourceSolver(res) {

  function Solver($resource, resourceSolver, $state) {
    var baseUrl = resourceSolver.getBaseUrl();
    var action = res.action || 'get';

    return $resource(baseUrl+res.url, $state.nextParams)[action]().$promise;
  };

  var injectable = ['$resource', 'resourceSolver', '$state', Solver];

  injectable.fetch = function() {
    var $injector = ResourceSolver.prototype.$injector;
    if(!$injector) {
      console.error("Should not call rs.fetch before the configuration phase is over");
    } else {
      return $injector.invoke(injectable);
    }
  };

  return injectable;
}

angular.module('resourceSolver', ['ui.router'])

.constant('rs', ResourceSolver)

.provider('resourceSolver', function ResourceSolverProvider() {
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
          console.log("Matched scope", i, state.self.name);
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
          if(state.resolve && state.resolve.hasOwnProperty(i) && i.indexOf('$') != 0) {
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
.run(['$injector', function($injector) {

  //Decorate rs constant for runtime auto-injection.
  ResourceSolver.prototype.$injector = $injector;

}]);
