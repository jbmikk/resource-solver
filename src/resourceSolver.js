angular.module('resource.solver', [])
.constant('rs', function(conf) {

  function Solver($resource) {
  };

  return ['$resource', Solver];
});
