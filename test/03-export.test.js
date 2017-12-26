'use strict'

const		 
		  dtbox = require  ( '../src/dt-toolbox'   )
		, sample = require ( '../test-data/sample' )
		, chai = require   ( 'chai'                )
		, expect = chai.expect
		;






describe ( 'Export from DT', () => {





 it ( 'Spread: ST object', () => {
 	   let result;

 	   dtbox
 	      .init ( sample.test_0 )
 	      .select ()
 	      .folder ()
 	      .spread ( 'st', st => result = JSON.stringify(st)   )

 	  expect ( result ).is.equal (JSON.stringify(sample.test_0)   )

      // test with complex object structure
      dtbox
 	      .init ( sample.test_8 )
 	      .select ()
 	      .folder ()
 	      .spread ( 'st', st => result = JSON.stringify(st)   )

 	  expect ( result ).is.equal (JSON.stringify(sample.test_8)   )
 }) // it ST
 




 it ( 'Spread: asJSON', () => {
 	// * Returns DT.value as JSON
 	let 
 		 st
 		,result
 		;

 	   dtbox
 	      .init ( sample.test_0 )
 	      .select ()
 	      .all ()
 	      .spread ( 'dt'    , value => st     = JSON.stringify(value)   )
 	      .spread ( 'asJSON', json  => result = json                    )

 	  expect ( result ).is.equal ( st )
 }) // it asJSON





 it ( 'Spread: toJSON', () => {
 	// * Converts DT.value to ST object and returns JSON
 	let result;
	 
	 dtbox
 	      .init ( sample.test_0 )
 	      .select ()
 	      .all ()
 	      .spread ( 'toJSON', json  => result = json )

 	  expect ( result ).is.equal ( JSON.stringify(sample.test_0)   )
 }) // it toJSON





it ( 'SpreadAll = select().all().spread()', () => {
  let result;
  let st = { name : 'Peter' }

  dtbox.init(st).spreadAll ( 'dt', dt => result = dt.build() )

  expect ( result['name'] ).to.be.equal ( st['name'] )
}) // it spreadAll





it ( 'Spread value', () => {
	let result;

	dtbox
	 .init ( sample.test_0 )
	 .select ()
	 .all ()
	 .spread ( 'value', v => result = v.build() )

	 expect ( result ).to.be.an ( 'array' )
	 expect ( result ).to.have.length ( 7 )
	 expect ( result ).to.contains ( 'Peter' )
	 expect ( result ).to.contains ( '42' )
	 expect ( result ).to.contains (  3   )
}) // it spread value


}) // describe














