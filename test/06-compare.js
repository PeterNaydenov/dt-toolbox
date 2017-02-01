'use strict'

const		 
		  dtbox = require  ( '../dt-toolbox' )
		, sample = require ( '../test-data/sample' )
		, chai = require   ( 'chai'          )
		, expect = require ( 'chai'   ).expect
		;






describe ( 'Compare Operations', () => {


 it ( 'identical', () => {
    let 
          identResult
        , result_ST
        ;

    const sampleDT = dtbox.init(sample.test_0).value;

    dtbox
      .init ( sample.test_0 )
      .identical ( sampleDT, dt => identResult = dt )
      .identical ( sample.test_0, dt => result_ST = dt)
    
    // NOTE: Compare methods expect DT!
    expect ( identResult ).to.have.property ( 'root/profile/active' )
    expect ( result_ST ).to.be.empty.object
 }) // it same
 




 it ( 'change', () => {
     let 
           result
         , result_ST
         ;
     
     const
          a =  { 
                   name : 'Peter'
                 , age  : 42
               }
         , b = {
                   name : 'Peter'
                 , age  : 43
               }
         ;

    const sampleDT = dtbox.init(b).value

    dtbox
       .init ( a )
       .change ( sampleDT, dt => result    = dt )
       .change ( b,        dt => result_ST = dt )

     expect ( result ).to.have.property ( 'root/age' )
     expect ( result['root/age']).to.be.equal(43)
     expect ( result ).to.not.have.property ( 'root/name' )

     expect ( result_ST ).to.be.empty.object
 }) // it change





 it ('same' , () => {
     let 
           result
         , result_ST
         ;
     
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
         ;

    const sampleDT = dtbox.init(b).value

    dtbox
       .init ( a )
       .same ( sampleDT, dt => result    = dt )
       .same ( b,        dt => result_ST = dt )

     expect ( result['root/age'] ).to.be.equal(41)
     expect ( result['root/name']).to.be.equal('Ivan')
     expect ( result).to.not.have.property ( 'gender' )

     expect ( result_ST ).to.be.empty.object
 }) // it same





 it ( 'different', () => {
   let result;
   const 
           testDT = { 
                      'root/name'   : 'Ivan'
                    , 'root/age'    : 33
                    , 'root/gender' : 'male'
                  }
         ;

    dtbox
        .init ( sample.test_0 )
        .different ( testDT, dt => result = dt   )

    expect ( result ).to.have.property     ( 'root/gender' )
    expect ( result ).to.not.have.property ( 'root/name'   )
    expect ( result ).to.not.have.property ( 'root/age'    )
 }) // it different





 it ( 'missing', () => {
   let result;
   const 
           testDT = { 
                      'root/name'   : 'Ivan'
                    , 'root/age'    : 33
                    , 'root/gender' : 'male'
                  }
         ;

    dtbox
        .init ( sample.test_0 )
        .missing ( testDT, dt => result = dt   )

   expect ( result ).to.have.property     ( 'root/eyes' )
   expect ( result ).to.not.have.property ( 'root/name' )
   expect ( result ).to.not.have.property ( 'root/age'  )
 }) // it missing



}) // describe




