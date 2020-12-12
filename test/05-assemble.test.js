'use strict'

const		 
		  dtbox  = require ( '../src/main'        )
		, sample = require ( '../test-data/index' )
        , chai   = require ( 'chai'               )
		, expect = chai.expect
		;



describe ( 'Assemble', () => {

it ( 'Assemble', () => {
        const test = {
                          name : 'Peter'
                        , arr  : [ 1, 15 ]
                };
        dtbox
            .init ( test )
            .select ()
            .find ( 'arr' )
            .assemble ()
            .spread ( 'std', x => {
                        expect ( x ).to.have.length ( 2 )
                        expect ( x[0]).to.be.equal ( 1 )
                        expect ( x[1]).to.be.equal ( 15 )
                })
    }) // it assemble

}) // describe