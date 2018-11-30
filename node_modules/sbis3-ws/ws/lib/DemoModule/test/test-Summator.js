define('Lib/DemoModule/test/test-Summator', ['Lib/DemoModule/Summator'], function(Summator){

   var objectWithNumbers = {

      numb: [10, 20],

      getNumber: function(numbIndex) {

         return this.numb[numbIndex];

      }

   };

   var summator;

   describe('Summator', function(){

      beforeEach(function() {

         summator = new Summator();

      });

      afterEach(function() {

         summator = null;

      });

      it('Can add two numbers', function(){

         expect(summator.add(10, 20)).toEqual(30);

      });

      it('Can add two numbers async', function(done){

         summator.addAsync(10, 20, function(err, res){
            expect(res).toEqual(30);
            done();
         });

      });

      it('Can add two numbers async. Numbers are from external "storage"', function(done){

         spyOn(objectWithNumbers, 'getNumber').and.callThrough();

         summator.addAsyncObject(objectWithNumbers, function(err, res){

            expect(res).toEqual(30);
            expect(objectWithNumbers.getNumber).toHaveBeenCalled();
            expect(objectWithNumbers.getNumber.calls.count()).toEqual(2);
            expect(objectWithNumbers.getNumber.calls.argsFor(0)[0]).toEqual(0);
            expect(objectWithNumbers.getNumber.calls.argsFor(1)[0]).toEqual(1);

            done();

         });

      });

   });

});