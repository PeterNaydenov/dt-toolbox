'use strict'

const		 
		  dtbox  = require ( '../src/main'   )
		, sample = require ( '../test-data/sample' )
    , chai   = require ( 'chai'                )
		, expect = chai.expect
		;






describe ( 'Compare Operations', () => {


  
 it ( 'Identical', () => {
    const test = {
                      name: 'Peter'
                    , array : [ 1, 15 ]
                 }

    dtbox.init ( sample.test_0 )
         .identical ( dtbox.init(test), dt => {   // NOTE: Compare methods expect DT!
                        let 
                            structure = dt.structure
                          , val       = dt.value
                          ;

                        expect ( val ).to.have.property ( 'root/0/name' )
                        expect (val['root/0/name']).to.be.equal ( 'Peter' )

                        expect ( val ).to.have.property ( 'root/1/0' )
                        expect ( val['root/1/0']).to.be.equal ( 1 )

                        expect ( val ).to.not.have.property ( 'root/array/1' )

                        expect ( structure.length ).to.be.equal ( 2 )
                        expect ( structure[1][0] ).to.be.equal ( 'array' )
                  }) // identical
 }) // it same
 




 it ( 'Change', () => {
    const
          a =  { 
                   name : 'Peter'
                 , age  : 42
               }
         , b = {
                   name : 'Peter'
                 , age  : 43
               }
         , sampleDT = dtbox.init ( b )
         ;
    dtbox
       .init ( a )
       .change ( sampleDT, dt => {   // Compare objects with single change
                         const val = dt.value
                         expect ( val ).to.have.property ( 'root/0/age' )
                         expect ( val['root/0/age']).to.be.equal(43)
                         expect ( val ).to.not.have.property ( 'root/name' )
                    })
       .change ( dtbox.init(a), dt => {   // Compare identical objects
                         const val = dt.value
                         expect ( val ).to.be.empty
                    })
 }) // it change





 it ( 'Same' , () => {
     const
          a =  { 
                   name : 'Peter'
                 , age  : 42
               }
         , b = {
                   name   : 'Ivan'
                 , age    : 41
                 , gender : 'male'
               }
         , c = { check : 'yes' }
         , sampleDT = dtbox.init ( b )
         ;
    dtbox.init ( a )
            .same ( sampleDT, dt => {
                              const val = dt.value;
                              expect ( val['root/0/age'] ).to.be.equal ( 41 )
                              expect ( val['root/0/name']).to.be.equal ( 'Ivan' )
                              expect ( val ).to.not.have.property ( 'gender' )
                      })
            .same ( dtbox.init(c), dt => {
                              const val = dt.value;
                              expect ( val ).to.be.empty
                              expect ( val ).to.be.an ( 'object' )
                      })
 }) // it same





 it ( 'Different', () => {
   const 
           testDT = { 
                      'name'   : 'Ivan'
                    , 'age'    : 33
                    , 'gender' : 'male'
                  }
         ;
    dtbox
         .init ( sample.test_0 )
         .different ( dtbox.init(testDT), dt => {
                          const val = dt.value
                          expect ( val ).to.have.property     ( 'root/0/gender' )
                          expect ( val ).to.not.have.property ( 'root/0/name'   )
                          expect ( val ).to.not.have.property ( 'root/0/age'    )
                })
 }) // it different





//  it ( 'Missing', () => {
//    let result;
//    const 
//            testDT = { 
//                       'root/name'   : 'Ivan'
//                     , 'root/age'    : 33
//                     , 'root/gender' : 'male'
//                   }
//          ;

//     dtbox
//         .init ( sample.test_0 )
//         .missing ( testDT, dt => result = dt   )

//    expect ( result ).to.have.property     ( 'root/eyes' )
//    expect ( result ).to.not.have.property ( 'root/name' )
//    expect ( result ).to.not.have.property ( 'root/age'  )
//  }) // it missing



}) // describe




