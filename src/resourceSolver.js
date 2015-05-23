function ResourceSolver(res) {

  function Solver($resource, resourceSolver, $state) {
    var baseUrl = resourceSolver.getBaseUrl();
    var action = res.action || 'get';

    var stateParams = $state.nextParams? $state.nextParams: $state.params;
    var params = angular.extend({}, stateParams, res.params || {});

    var resource = $resource(baseUrl+res.url, params, {
      'update': {method: 'PUT'},
      'bulkUpdate': {method: 'PUT', isArray: true},
      'bulkSave': {method: 'POST', isArray: true}
    });

    if(res.data) {
      return resource[action](res.data).$promise;
    } else {
      return resource[action]().$promise;
    }
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
  var _headers = {};

  this.setBaseUrl = function(url) {
    baseUrl = url;
  };

  this.setHeaders = function(headers) {
    _headers = headers;
  };

  this.$get = function() {

    return {
      getBaseUrl: function() {
        return baseUrl;
      },
      getHeaders: function() {
        return _headers;
      },
      setHeaders: function(headers) {
        _headers = headers;
      }
    };
  };
})
.factory('authorizationInterceptor', ['resourceSolver', function (resourceSolver) {
  return {
    request: function (config) {
      angular.extend(config.headers, resourceSolver.getHeaders());
      return config;
    }
  };
}])
.config(['$provide', '$httpProvider', function($provide, $httpProvider) {

  $httpProvider.interceptors.push('authorizationInterceptor');

  $provide.decorator("$state", function($delegate, $rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
      $delegate.next = toState;
      $delegate.nextParams = toParams;
    });
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams) {
      $delegate.next = null;
      $delegate.nextParams = null;
    });
    $rootScope.$on('$stateChangeError', function(event, toState, toParams) {
      $delegate.next = null;
      $delegate.nextParams = null;
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

}])
.directive('rsUrl', ['$parse', 'rs', function($parse, rs) {
  return {
    restrict: 'A',
    require: 'rsUrl',
    link: function(scope, elem, attrs, controller) {
      controller.setAttributes(attrs);
    },
    controller: ['$scope', function($scope) {
      var _attrs;

      this.setAttributes = function(attrs) {
        _attrs = attrs;
      };

      this.submit = function() {
        var params, data;

        if(_attrs.rsParams) {
          params = $parse(_attrs.rsParams)($scope);
        } else {
          params = {};
        }

        if(_attrs.ngModel) {
          data = $parse(_attrs.ngModel)($scope);
        }
        return rs({
          url: _attrs.rsUrl,
          params: params,
          action: _attrs.rsAction || 'post',
          data: data
        }).fetch();
      };
    }]
  };
}])
.directive('rsNotifySuccess', ['$rootScope', '$timeout', function($rootScope, $timeout) {
  return {
    scope: {
      'rsNotifySuccess': '='
    },
    link: function(scope, elem, attrs, controllers) {
      elem.hide();
      var formSuccess = $rootScope.$on('formSuccess', function(event, form) {
        if(form === scope.rsNotifySuccess) {
          elem.slideDown();
          $timeout(function() {
            elem.slideUp();
          }, 5000);
        }
      });

      scope.$on('$destroy', formSuccess);
    }
  };
}])
.directive('rsOnSuccess', ['$parse', function($parse) {
  return {
    require: 'rsOnSuccess',
    link: function(scope, elem, attrs, controller) {
      controller.setAttributes(attrs);
    },
    controller: function() {
      var _attrs;

      this.setAttributes = function(attrs) {
        _attrs = attrs;
      };

      this.success = function(data) {
        $parse(_attrs.rsOnSuccess)(scope, {
          value: data
        });
      };
    }
  };
}])
.directive('rsOnError', ['$parse', function($parse) {
  return {
    require: 'rsOnError',
    link: function(scope, elem, attrs, controller) {
      controller.setAttributes(attrs);
    },
    controller: function() {
      var _attrs;

      this.setAttributes = function(attrs) {
        _attrs = attrs;
      };

      this.error = function(error) {
        $parse(_attrs.rsOnSuccess)(scope, {
          error: error
        });
      };
    }
  };
}])
.directive('rsThen', ['$compile', function($compile) {
  return {
    restrict: 'A',
    require: 'rsThen',
    link: function(scope, elem, attrs, controller) {
      var proxyElem = $compile('<a style="display:none" ui-sref="'+attrs.rsThen+'" ui-sref-opts="{reload: true}"></a>')(scope);
      proxyElem.insertAfter(elem);

      controller.setProxy(proxyElem);
    },
    controller: function() {
      var proxyElem;

      this.setProxy = function(elem) {
        proxyElem = elem;
      };

      this.success = function() {
        proxyElem.trigger('click');
      };
    }
  };
}])
.directive('rsSubmit', function() {
  return {
    require: ['^form', '^rsUrl', '?rsThen', '?rsOnSuccess', '?rsOnError'],
    link: function(scope, elem, attrs, controllers) {
      var form = controllers[0];
      var resource = controllers[1];
      var rsThen = controllers[2];
      var rsOnSuccess = controllers[3];
      var rsOnError = controllers[4];

      elem.on('click', function() {
        scope.$apply(function() {
          form.$setSubmitted(true);
        });
        if(form.$valid) {
          resource.submit().then(function(data) {
            scope.$emit('formSuccess', form);
            if(rsThen) {
              rsThen.success();
            }
            if(rsOnSuccess) {
              rsOnSuccess.success(data);
            }
          }, function(error) {
            //TODO: add errors to form?
            if(rsOnError) {
              rsOnError.error(error);
            }
            console.error("Could not submit form", error);
          });
        }
      });
    }
  };
});
