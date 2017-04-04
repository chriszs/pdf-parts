var chai = require('chai'),
    extractPages = require('../lib/extractpages');

var should = chai.should();

describe('lib/extractpages.js', function() {
    it('should retrieve the correct number of pages', function(done) {
        extractPages(__dirname + '/data/Trump-for-America-Inc-Presidential-Transition.pdf')
            .toArray((pages) => {
                pages.length.should.equal(56);

                done();
            });
    });
});
