describe( 'resource-solver', function() {

  beforeEach(module('ngResource'));
  beforeEach(module('resourceSolver'));

  it( 'fetch basic resource should return data', function() {

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
    });

  });

});
