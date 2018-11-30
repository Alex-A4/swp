define('Lib/Cache/test/test-cache', [ 'Lib/Cache/Cache', 'Core/Deferred' ], function(Cache, Deferred) {

   describe('Lib/Cache/Cache', function(){

      var cache;

      afterEach(function(){
         if (cache) {
            cache.destroy();
         }
      })

      it('getItem calls factory', function(done){

         cache = Cache.getByName('testCache', 100, function(key) {

            var d = new Deferred();
            setTimeout(function(){
               d.callback(key + 'data');
            }, 5);
            return d;
         });

         cache.getItem('key1').addCallback(function(res){
            expect(res).toEqual('key1data');
            done();
         });

      });


      /**
       * Проверяем, что для одного и того же ключа повторно не вызывается конструирующая функуция
       * @param queue
       */
      it('For the same key factory is not called twice', function() {

         var o = {
            factory: function(key) {

               var d = new Deferred();
               setTimeout(function(){
                  d.callback(key + 'data');
               }, 5);
               return d;
            }
         }

         spyOn(o, 'factory').and.callThrough();

         cache = Cache.getByName('testCache', 100, o.factory);

         cache.getItem('key1');
         cache.getItem('key1');
         expect(o.factory.calls.count()).toEqual(1);
      });

      /**
       * Проверяем, что для одного и того же ключа повторно не вызывается конструирующая функуция
       * @param queue
       */
      it('For the same key factory is not called twice unless data is expired', function(done) {

         var o = {
            factory: function(key) {

               var d = new Deferred();
               setTimeout(function(){
                  d.callback(key + 'data');
               }, 5);
               return d;
            }
         }

         spyOn(o, 'factory').and.callThrough();

         cache = Cache.getByName('testCache', 100, o.factory);

         cache.getItem('key1');

         setTimeout(function(){
            cache.getItem('key1');
            expect(o.factory.calls.count()).toEqual(2);
            done();
         }, 1000);

      });


      it('Error results is not cached', function() {

         var timesFactoryCalled = 0;

         var o = {
            factory: function(key) {
               if (timesFactoryCalled++ === 0) {
                  return new Deferred().errback('xxx');
               }

               var d = new Deferred();
               setTimeout(function(){
                  d.callback(key + 'data');
               }, 5);
               return d;
            }
         }

         spyOn(o, 'factory').and.callThrough();

         cache = Cache.getByName('testCache', 100, o.factory);

         // returs error, not cached
         cache.getItem('key1');

         // return correct result, cached
         cache.getItem('key1');

         // return the same result as previous one
         cache.getItem('key1');

         expect(o.factory.calls.count()).toEqual(2);

      });

      it('Error result can store data', function(done) {

         var timesFactoryCalled = 0;

         var o = {
            factory: function(key) {
               if (timesFactoryCalled++ === 0) {
                  var result = new Error('xxx');
                  result.data = 'key1error';
                  return new Deferred().errback(result);
               }

               var d = new Deferred();
               setTimeout(function(){
                  d.callback(key + 'data');
               }, 5);
               return d;
            }
         }

         spyOn(o, 'factory').and.callThrough();

         cache = Cache.getByName('testCache', 100, o.factory);

         cache.getItem('key1').addCallback(function(res){
            expect(res).toEqual('key1error');

            cache.getItem('key1').addCallback(function(res){
               expect(res).toEqual('key1data');
               expect(o.factory.calls.count()).toEqual(2);
               done();
            });

         });

      });

      it('If expire==-1 data is never expired', function(done) {

         var o = {
            factory: function(key) {

               var d = new Deferred();
               setTimeout(function(){
                  d.callback(key + 'data');
               }, 5);
               return d;
            }
         }

         spyOn(o, 'factory').and.callThrough();

         cache = Cache.getByName('testCache', -1, o.factory);

         cache.getItem('key1');

         setTimeout(function(){
            cache.getItem('key1');
            expect(o.factory.calls.count()).toEqual(1);
            done();
         }, 1000);

      });

      it('If expire==0 data is instantly expired', function() {

         var o = {
            factory: function(key) {

               var d = new Deferred();
               setTimeout(function(){
                  d.callback(key + 'data');
               }, 5);
               return d;
            }
         }

         spyOn(o, 'factory').and.callThrough();

         cache = Cache.getByName('testCache', 0, o.factory);

         cache.getItem('key1');
         cache.getItem('key1');

         expect(o.factory.calls.count()).toEqual(2);

      });

      it('if purge()\'ed, every key is removed', function() {

         var o = {
            factory: function(key) {
               var d = new Deferred();
               setTimeout(function(){
                  d.callback(key + 'data');
               }, 5);
               return d;
            }
         }

         spyOn(o, 'factory').and.callThrough();

         cache = Cache.getByName('testCache', 1000, o.factory);

         cache.getItem('key1');
         cache.getItem('key2');
         cache.purge()
         cache.getItem('key1');
         cache.getItem('key2');

         expect(o.factory.calls.count()).toEqual(4);

      });

      it('if purge("keyName")\'ed, only specified key is removed', function() {

         var o = {
            factory: function(key) {
               var d = new Deferred();
               setTimeout(function(){
                  d.callback(key + 'data');
               }, 5);
               return d;
            }
         }

         spyOn(o, 'factory').and.callThrough();

         cache = Cache.getByName('testCache', 1000, o.factory);

         cache.getItem('key1');
         cache.getItem('key2');
         cache.purge('key1')
         cache.getItem('key1');
         cache.getItem('key2');

         expect(o.factory.calls.count()).toEqual(3);

      });

   });


});