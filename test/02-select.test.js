'use strict'

const		 
		  dtbox  = require ( '../src/main'          )
		, sample = require ( '../test-data/index'   )
    , walk   = require ( '@peter.naydenov/walk' )
		, chai   = require ( 'chai'                 )
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

        let count = 0;
        expect ( result ).to.be.an ( 'object' )   // Expect result to be a 'shortFlat' data-type
        walk ( result, (v,k) => {
                        let num = k.split ( '/' )[1];
                        expect ( num ).to.satisfy ( num => {
                                                    if ( num == 9  )   return true
                                                    if ( num == 10 )   return true
                                                    return false 
                                            })
                        count++
                })
        expect ( count ).to.be.equal ( 6 )
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
           
  // Expect 'flat' data-type:
	expect ( result.value ).to.have.property ( 'root/1/0' )
	expect ( result.value ).to.have.property ( 'root/1/1' )
	// Manipulations on export
	expect ( updateObject['root/1/0'] ).to.be.equal ( 'Ivan'   )
	expect ( updateObject['root/1/1'] ).to.be.equal ( 'Stefan' )
}) // it parent with array



it ( 'Find', () => {
  let result;
  dtbox
      .init   ( sample.test_0 )
      .select ()
      .find ( 'profile' ) // no params == select all
      .spread ( 'flat', flat => result = flat[1]   )

  let list = Object.keys ( result );
  expect ( list.length ).to.be.equal ( 1 )
  expect ( result ).has.property ( 'root/1/active' )
  expect ( result['root/1/active'] ).is.equal ( true )
}) // it find



it ( 'Find with deep', () => {
  let x = dtbox
        .init   ( sample.test_1 )
        .select ()
        .find ('set', 1 ) 
  // Note: deep is absolute, starting from 'root' - 0.
  let result = x._select.value
  expect ( result ).to.have.length ( 4 )
}) // it find with deep



it ( 'Find with regular expression', () => {
    let x = dtbox
              .init   ( sample.test_0 )
              .select ()
              .find ('.*/[0-9]$') 
    let result = x._select.value;

    expect ( result ).contains ( 'root/2/0' )
    expect ( result ).has.length(3)
}) // it find with regexp.



it ( 'Space', () => {
    let x = dtbox
            .init ( sample.test_0 )
            .select ()
            .space  ( 'profile' )
      let result = x._select.value;

      expect ( result.length ).to.be.equal ( 1 )
      expect ( result ).to.include ( 'root/1/active' )
}) // it namespace




it ( 'Space with no arguments', () => {
    let x = dtbox
              .init ( sample.test_0 )
              .select ()
              .space  ( )
    let result = x._select.value;

    expect ( result ).to.have.length ( 3 )
    expect ( result ).to.contain ( 'root/0/name' )
    expect ( result ).to.contain ( 'root/0/age'  )
    expect ( result ).to.contain ( 'root/0/eyes' )
}) // it namespace with no arguments



it ( 'Space with fake name', () => {
    let x = dtbox
              .init ( sample.test_0 )
              .select ()
              .space  ( 'fake' );
    let result = x._select.value;

    expect ( result ).to.be.empty
}) // it namespace with fake name



it ( 'Limit', () => {
    const x = dtbox
                    .init ( sample.test_0 )
                    .select ()
                    .find ()
                    .limit (4);
    let result = x._select.value;
    expect ( result ).has.length(4)
}) // it limit



it ( 'Keep: No arguments' , () => {
  const result = dtbox
                  .init ( sample.test_0 )
                  .select ()
                  .all ()
                  .keep ()

  expect( result._select.value ).has.length(7)
}) // it keep



it ( 'Keep: Value check' , () => {
    const x = dtbox
                .init ( sample.test_0 )
                .select ()
                .all ()
                .keep ( el => typeof el === 'boolean' )
    const result = x._select.value;
    expect( result ).has.length(1)
}) // it keep



it ( 'Keep: Key check' , () => {
    const x = dtbox
                .init ( sample.test_0 )
                .select ()
                .all ()
                .keep ( (el,id) => id.includes ('name') )
    const result = x._select.value
    expect( result ).has.length ( 1 )
    expect( result ).contains ( 'root/0/name' )
}) // it keep: key check



it( 'Remove: No arguments' , () => {
    const x = dtbox
                .init ( sample.test_0 )
                .select ()
                .find ('array')
                .remove ();
    const result = x._select.value;
    expect ( result ).to.have.length ( 3 )
}) // it remove



it ( 'Remove: Value check' , () => {
    const x = dtbox
                .init ( sample.test_0 )
                .select ()
                .find ()
                .remove ( el => el == 'Peter' );
    const result = x._select.value;
    expect ( result ).not.contains ( 'root/0/name' )
}) // it remove: value check



it ( 'Remove: Key check' , () => {
  
    const 
            breadcrumbKeys = []
          , x = dtbox
                .init ( sample.test_0 )
                .select ()
                .all ()
                .remove ( (v, breadcrumbK, flatK ) => {
                                  let 
                                      prop  = flatK.split ( '/' ).pop ()
                                    , check = isNaN(Number(prop)) ? false : true
                                    ;
                                  breadcrumbKeys.push ( breadcrumbK )

                                  if ( check )   return true
                                  else           return false
                            });
    const result = x._select.value;
    expect ( result ).has.length ( 4 )
    expect ( result ).to.contain ( 'root/0/name' )
    expect ( result ).to.contain ( 'root/0/age' )
    expect ( result ).to.contain ( 'root/0/eyes' )
    expect ( result ).to.contain ( 'root/1/active' )

    expect ( breadcrumbKeys ).to.have.length ( 7 )
    expect ( breadcrumbKeys ).to.contains ('root/eyes')
    expect ( breadcrumbKeys ).to.contains ( 'root/profile/active' )
    expect ( breadcrumbKeys ).to.contains ( 'root/array/2' )
}) // it remove: Key check



it ( 'Deep', () => {
    const x = dtbox
                  .init ( sample.test_0 )
                  .select ()
                  .find ()
                  .deep ( 0 )
    const result = x._select.value;
    expect( result ).has.length(3)
}) // it deep




it ( 'Deep with direction', () => {
	const x = dtbox
                .init ( sample.test_0 )
                .select ()
                .find ()
                .deep ( 1, 'more' ) // read as 'level should be higher then 0'
  const result = x._select.value;
	expect ( result ).has.length(4)
	expect ( result ).contains ( 'root/1/active' )
	expect ( result ).contains ( 'root/2/0' )
	expect ( result ).contains ( 'root/2/1' )
}) // it deep with direction



it ( 'Deep Objects', () => {
  let result;
  dtbox
      .init ( sample.test_5 )
      .select ()
      .deepObject ()
      .spread ( 'std', std => result = std )

  expect ( result ).to.have.length ( 6 )
  expect ( result[0] ).to.have.property ('name')
  expect ( result[0] ).to.have.property ('comments')
  expect ( result[0] ).to.have.property ('age')
}) // it deepObject



it ( 'Deep Array fail', () => {
  let result;
  dtbox
    .init ( sample.test_5 )
    .select()
    .deepArray ()
    .spread ( 'std', std => result = std )

  expect ( result ).to.be.an( 'array' )
  expect ( result.length ).to.be.equal ( 0 )
}) // it deepArray fail



it ( 'Deep Array', () => {
	let result

	let ttt = [
               { name: 'Peter', age:42 }
             , { name: 'Stefan', age: 41 }
             , [
                    {
                         name: 'Andrey'
                       , age : 33 
	                   , l   : [
	                               [ 13, 44, 43]
	                             , [ 66, 77, 88]
	                           ]
                    }

               ]
              , [ 22, 33, 26 ]
          ]

	dtbox
	  .init( ttt )
	  .select ()
	  .deepArray ()
    .spread ( 'std', std => result = std   )
    
	expect ( result ).to.be.an ( 'array' )
	expect ( result ).to.have.length ( 3 )

	expect ( result[0] ).to.be.an ( 'array' )
	expect ( result[0] ).to.have.length ( 3 )
	expect ( result[1] ).to.be.an ( 'array' )
	expect ( result[2] ).to.be.an ( 'array' )
})



it ( 'Invert: Empty Selection', () => {
  const result = dtbox
                    .init ( sample.test_0 )
                    .select ()
                    .invert ();
  expect ( result._select.value ).to.have.length ( 7 )
}) // it invert empty selection



it ( 'Invert: Selection', () => {
  const result = dtbox
           .init ( sample.test_0 )
           .select ()
           .find ( 'array' )
           .invert ()

 expect ( result._select.value ).to.have.length(4)
}) // it invert selected items



it ( 'Invert: Select All', () => { 
  const result = dtbox
           .init ( sample.test_0 )
           .select ()
           .all ()
           .invert ()

 expect ( result._select.value ).to.be.an.empty
}) // it invert select all



}) // describe


