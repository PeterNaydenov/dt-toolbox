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



it ( 'Folder with regular expression', () => {
    let x = dtbox
              .init   ( sample.test_0 )
              .select ()
              .folder ('.*/[0-9]$') 
    let result = x._select.value;

    expect ( result ).contains ( 'root/2/0' )
    expect ( result ).has.length(3)
}) // it regexp.



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
                    .folder ()
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
                .folder ('array')
                .remove ();
    const result = x._select.value;
    expect ( result ).to.have.length ( 3 )
}) // it remove



it ( 'Remove: Value check' , () => {
    const x = dtbox
                .init ( sample.test_0 )
                .select ()
                .folder ()
                .remove ( el => el == 'Peter' );
    const result = x._select.value;
    expect ( result ).not.contains ( 'root/0/name' )
}) // it remove: value check



it ( 'Remove: Key check' , () => {
    const x = dtbox
                .init ( sample.test_0 )
                .select ()
                .all ()
                .remove ( (v,k) => {
                                  let 
                                      prop  = k.split ( '/' ).pop ()
                                    , check = isNaN(Number(prop)) ? false : true
                                    ;
                                  if ( check )   return true
                                  else           return false
                            });
    const result = x._select.value;
    expect ( result ).has.length ( 4 )
    expect ( result ).to.contain ( 'root/0/name' )
    expect ( result ).to.contain ( 'root/0/age' )
    expect ( result ).to.contain ( 'root/0/eyes' )
    expect ( result ).to.contain ( 'root/1/active' )
}) // it remove: Key check



it ( 'Deep', () => {
    const x = dtbox
                  .init ( sample.test_0 )
                  .select ()
                  .folder ()
                  .deep ( 0 )
    const result = x._select.value;
    expect( result ).has.length(3)
}) // it deep




it ( 'Deep with direction', () => {
	const x = dtbox
                .init ( sample.test_0 )
                .select ()
                .folder ()
                .deep ( 0, 'more' ) // read as 'level should be higher then 0'
  const result = x._select.value;
	expect ( result ).has.length(4)
	expect ( result ).contains ( 'root/1/active' )
	expect ( result ).contains ( 'root/2/0' )
	expect ( result ).contains ( 'root/2/1' )
}) // it deep with direction


}) // describe


