'use strict'

var		 
		  dtbox = require  ( '../dt-toolbox' )
		, sample = require ( '../test-data/sample' )
		, chai = require   ( 'chai'          )
		, expect = require ( 'chai'   ).expect
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



}) // describe














