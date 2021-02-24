'use strict'

const		 
		  dtbox  = require ( '../src/main'        )
		, sample = require ( '../test-data/index' )
        , chai   = require ( 'chai'               )
		, expect = chai.expect
		;



describe ( 'Purify', () => {

it ( 'Purify', () => {
        const test = {
                          name : 'Peter'
                        , arr  : [ 1, 15 ]
                        , de   : { me: ['eho', 'ha'] }
                        , se   : { le: {} }
                        , ze   : []
                };
    dtbox
        .init ( test )
        .select ()
        .all ()
        .purify ()
        .spread ( 'flat', x => {
                        let result = x[0];
                        expect ( result.length ).to.be.equal ( 4 )
                        expect ( result[0].length ).to.be.equal ( 4 )
                        expect ( result[0][1] ).to.be.equal ( 0 )
                        expect ( result[1][1] ).to.be.equal ( 1 )
                        expect ( result[2][1] ).to.be.equal ( 2 )
                        expect ( result[3][1] ).to.be.equal ( 5 )
                    })
    }) // it purify
}) // describe