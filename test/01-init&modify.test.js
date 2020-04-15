'use strict'

const		 
		  dtbox  = require ( '../src/main'         )
		, sample = require ( '../test-data/sample' )
		, chai   = require ( 'chai'                )
		, expect = chai.expect
		;






describe ( 'Initialize and modify DT', () => {



it  ( 'Init: Set empty DT object' , () => {
            let result = dtbox.init ();
 			expect ( result ).to.have.property  ( 'structure' )
            expect ( result ).to.have.property  ( 'value'     )
            expect ( result.value.hi()  ).to.be.equal ( 'hi' )
 			expect ( result ).to.have.property  ( '_select'   )
 			expect ( result ).to.have.property  ( '_error'    )
    }) // it Set empty DT



it ( 'Init: ST(standard) object' , () => {
            let dt, result ;

            dt = dtbox.init ({name:'Ivan'})
            result = dtbox.load ( dt )   //   result === dt.value

            expect ( result.value.hi()  ).to.be.equal ( 'hi' )
 			expect ( result.value       ).to.have.property ('root/0/name' )
 }) // it ST object



it ( 'Init: Reverse keys and values', () => {
    // * Create object where values will become keys and keys become values
    let result = dtbox.init ( sample.test_0, 'reverse' );
    expect ( result.value ).to.have.deep.property ( 'root/1/true'  )
    expect ( result.value['root/2/1'] ).to.be.equal ( 0 )
}) // it reverse keys and values



it ( 'Init: Keys only', () => {
    // * Create key replacement map
    const result = dtbox.init ( sample.test_0, 'keys');
    expect ( result.value                ).to.have.property ( 'root/0/name'  )
    expect ( result.value['root/0/name'] ).to.be.equal ( 'name' )
    expect ( result.value['root/2/0']    ).to.be.equal ( 0 )
}) // it keys only





}) // describe