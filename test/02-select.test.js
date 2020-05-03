'use strict'

const		 
		  dtbox  = require ( '../src/main'         )
		, sample = require ( '../test-data/sample' )
		, chai   = require ( 'chai'                )
		, expect = chai.expect
		;



describe ( 'Select in DT', () => {


it ( 'Parent', () => {
        let result;
        dtbox
            .init ( sample.test_8 )
            .select ()
            .parent ( 'title', item => item.id.includes('222') ) // 222 is ID pattern for drama
            .spread ( 'flat', flat => result = flat[1]   )
  
        let keyList = Object.keys ( result );
        // Expect result to be a shortFlat format:
        expect ( result ).to.be.an ( 'object' )
        expect ( keyList.length ).to.be.equal ( 6 )
        keyList.forEach ( key => {
                        let 
                              arr = key.split ( '/' )
                            , num = arr[1]
                            ;
                        expect ( num ).to.satisfy ( num => {
                                                    if ( num == 9  )   return true
                                                    if ( num == 10 )   return true
                                                    return false 
                                            })
                })
}) // it select parent



it ( 'Parent with array', () => {
	let updateObject;
	const testData = {
						    name : [ 'Ivan', 'Stefan' ]
					  };
	const result = dtbox
				   .init ( testData )
				   .select ()
				   .parent ( 'name', item => true  )
           .spread ( 'flat', flat => updateObject = flat[1] )
           
  // Expect DT format:
	expect ( result.value ).to.have.property ( 'root/1/0' )
	expect ( result.value ).to.have.property ( 'root/1/1' )
	// Manipulations on export
	expect ( updateObject['root/1/0'] ).to.be.equal ( 'Ivan'   )
	expect ( updateObject['root/1/1'] ).to.be.equal ( 'Stefan' )
}) // it parent with array



it ( 'Folder', () => {
  let result;
  dtbox
      .init   ( sample.test_0 )
      .select ()
      .folder ( 'profile' ) // no params == select all
      .spread ( 'flat', flat => result = flat[1]   )

  let list = Object.keys ( result );
  expect ( list.length ).to.be.equal ( 1 )
  expect ( result ).has.property ( 'root/1/active' )
  expect ( result['root/1/active'] ).is.equal ( true )
}) // it folder



it ( 'Folder with deep', () => {
  let x = dtbox
        .init   ( sample.test_1 )
        .select ()
        .folder ('set', 1 ) 
  // Note: deep is absolute, starting from 'root' - 0.
  let result = x._select.value
  expect ( result ).to.have.length ( 4 )
}) // it folder with deep



}) // describe


