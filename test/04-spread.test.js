'use strict'

const		 
		  dtbox  = require ( '../src/main'   )
		, sample = require ( '../test-data/sample' )
        , chai   = require ( 'chai'                )
		, expect = chai.expect
		;






describe ( 'Spread and SpreadAll', () => {


  
 it ( 'Spread -> standard', () => {
    const test = {
                      name: 'Peter'
                    , array : [ 1, 15 ]
                 };
    dtbox.init ( test )
         .select ()
         .all ()
         .spread ('std', x => expect ( x ).to.be.eql ( test )   )
 }) // it spread->standard



 it ( 'SpreadAll', () => {
    const test = {
                      name: 'Peter'
                    , array : [ 1, 15 ]
                 };
    dtbox.init ( test )
         .spreadAll ( 'std', x => expect ( x ).to.be.eql ( test )   )
 }) // it 
 
}) // describe




