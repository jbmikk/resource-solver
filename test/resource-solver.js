describe( 'resource-solver', function() {

  beforeEach(module('resourceSolver'));

  it( 'fetch basic resource should return data', function() {

    module('ngResource', function($resourceProvider) {
      $resourceProvider.setData({
        test: 'value'
      });
    });

    inject(function(rs) {

      //Define resource
      var resource = rs({
        url: 'test'
      });
      expect(rs).not.toBeUndefined();

      //Fetch resource
      var promise = resource.fetch();
      expect(promise).not.toBeUndefined();
      expect(promise.then).not.toBeUndefined();

      //Wait data
      var data;
      promise.then(function(_data) {
        data = _data;
      });
      expect(data).not.toBeUndefined();
      expect(data.test).toBe('value');
    });

  });

  it( 'submit rsUrl without data should log error', function() {

    inject(function($rootScope, $compile, $http) {

      var elem = angular.element('<form rs-url="test"></form>');
      $compile(elem)($rootScope);

      var controller = elem.controller('rsUrl');
      expect(controller).not.toBeUndefined();

      var message;
      var spyCall = spyOn(console, 'error').and.callFake(function(m) {
        message = m;
        spyCall.and.callThrough();
      });
      var promise = controller.submit();

      expect(promise).toBeUndefined();
      expect(message).toBe("No ngModel or data defined");

    });
  });
});
