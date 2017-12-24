'use strict'

var		 
		  dtbox = require  ( '../src/dt-toolbox' )
		, sample = require ( '../test-data/sample' )
		, chai = require   ( 'chai'          )
		, expect = require ( 'chai'   ).expect
		;






describe ( 'Assemble', () => {


it ( 'When optimization is not needed', () => {
     let result;

     dtbox
 	      .init ( sample.test_0 )
 	      .select ()
 	      .folder ()
 	      .spread ( 'dt', dt => result = dt.assemble().build()   )

 	expect ( result ).has.property ( 'name' )
 	expect ( result ).has.property ( 'age'  )
 	expect ( result ).has.property ( 'eyes' )
 	expect ( result.profile ).has.property ( 'active' )
 	expect ( result.array ).is.an ( 'array' ) 
 })  // it no optimization





it ( 'Single property result', () => {
     let result;

     dtbox
 	      .init ( sample.test_0 )
 	      .select ()
 	      .folder ('profile')
 	      .spread ( 'dt', dt => result = dt.assemble().build()   )

 	expect ( result ).to.have.property ( 'active' )
 	expect ( result.active ).to.be.true
}) // it single result




it ( 'Optimization', () => {
     let result;
     
     dtbox
 	      .init ( sample.test_7 )
 	      .select ()
 	      .folder ('profile')
 	      .spread ( 'dt', dt => result = dt.assemble()   )

 	  expect ( result ).to.have.property ( 'root/name'     )
 	  expect ( result ).to.have.property ( 'root/credit'   )
 	  expect ( result ).to.have.property ( 'root/gender'   )
 	  expect ( result ).to.have.property ( 'root/comments' )
}) // it optimization



}) // define




