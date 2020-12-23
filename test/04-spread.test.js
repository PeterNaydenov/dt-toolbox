'use strict'

const		 
		  dtbox  = require ( '../src/main'        )
		, sample = require ( '../test-data/index' )
    , chai   = require ( 'chai'               )
		, expect = chai.expect
		;






describe ( 'Provide results', () => {


  
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
 }) // it sreadAll
 


 it ( 'Spread -> flat', () => {
      const test = {
                        name : 'Peter'
                      , arr : [ 1,15 ]
                };
      // Data-model 'flat' in spread always mean 'shortFlat'
      // Real flat data-model is internal only model.
      const dt = dtbox.init ( test );
      dt.select ()
        .all ()
        .spread ( 'flat', x => {
                  expect ( dt.value['root/0/name'] ).to.be.equal ( x[1]['root/0/name'] )
                  expect ( dt.structure[0][0]      ).to.be.equal ( x[0][0][0] )
              })
 }) // it spread -> flat



 it ( 'Spread -> breadcrumbs', () => {
      const test = {
                        name : 'Peter'
                      , arr  : [ 1, 15 ]
              };
      dtbox
       .init ( test )
       .all ()
       .spread ( 'breadcrumbs', x => {
                    expect ( x ).to.contain.property ( 'root/name' )
                    expect ( x['root/name']).to.be.equal ( 'Peter' )
                    expect ( x ).to.have.property ( 'root/arr/1' )
                    expect ( x['root/arr/1']).to.be.be.equal ( 15 )
            })
 }) // it spread -> breadcrumbs



 it ( 'Spread -> file' , () => {
      const test = {
                        name : 'Peter'
                      , arr  : [ 1, 15 ]
              };
      dtbox
        .init ( test )
        .all ()
        .spread ( 'file', x => {
                  expect (x.length).to.be.equal ( 3 )
                  expect ( x[0]).to.be.equal ( 'root/name/Peter' )
                  expect ( x[2]).to.be.equal ( 'root/arr/1/15'   )
            })
 }) // it spread -> file



 it ( 'Spread -> midFlat', () => {
      const test = {
                        name : 'Peter'
                      , arr  : [ 1, 15 ]
              };
      dtbox
        .init ( test )
        .all ()
        .spread ( 'midFlat', x => {
                  expect ( x ).to.have.property ( 'root' )
                  expect ( x ).to.have.property ( 'root/arr' )
                  expect ( x['root'] ).has.property ( 'name' )
            })
 }) // it spread -> midFlat



it ( 'Spread -> midFlat with selection', () => {
      const test = {
                        name : 'Peter'
                      , arr  : [ 1, 15 ]
              };
      dtbox
        .init ( test )
        .select ()
        .all ()
        .withSelection ()
        .spread ( 'midFlat', x => {
                  expect ( x ).to.have.property ( 'root' )
                  expect ( x ).to.have.property ( 'root/arr' )
                  expect ( x['root'] ).has.property ( 'name' )
            })
 }) // it spread -> midFlat with selection



it ( 'Spread -> values', () => {
  dtbox
      .init ( sample.test_0 )
      .spread ( 'values', x => {
                    expect ( x.length ).to.be.equal ( 5 )
                    expect ( x[3][0]).to.be.true
                    expect ( x[4].length).to.be.equal ( 3 )
              })
}) // it spread -> values



it ( 'Spread -> values with selection', () => {
  dtbox
      .init ( sample.test_0 )
      .select ()
      .all ()
      .withSelection ()
      .flatten ()
      .spread ( 'values', x => {
                    expect ( x.length ).to.be.equal ( 7 )
                    expect (x).to.contain ( 'Peter' )
                    expect (x).to.contain ( '42' )
                    expect (x).to.contain ( 'blue' )
                    expect (x).to.contain ( true )
              })
}) // it spread -> values



it ( 'Spread -> keys', () => {
dtbox
  .init ( sample.test_0 )
  .spread ( 'keys', x => {
                expect ( x      ).to.have.property ( 'name' )
                expect ( x.name ).to.be.equal ( 'name' )
                expect ( x      ).to.have.property ( 'age' )
                expect ( x      ).to.have.property ( 'eyes' )
                expect ( x.age  ).to.be.equal ( 'age' )
                expect ( x.eyes ).to.be.equal ( 'eyes' )
                expect ( x.array.length ).to.be.equal ( 3 )
          })
}) // it spread -> keys



it ( 'Spread -> keys with selection', () => {
  dtbox
      .init ( sample.test_0 )
      .select ()
      .all ()
      .withSelection ()
      .flatten ()
      .spread ( 'keys', x => {
                    expect ( x.length ).to.be.equal ( 7 )
                    expect ( x      ).to.contain ( 'name' )
                    expect ( x      ).to.contain ( 'age' )
                    expect ( x      ).to.contain ( 'eyes' )
                    expect ( x      ).to.contain ( 0 )
                    expect ( x      ).to.contain ( 2 )
                    expect ( x      ).to.contain ( 'active' )
              })
}) // it spread -> keys



it ( 'Spread -> tuples'      )


  
it ( 'Replace', () => {
        const test = {
                      name : 'Peter'
                    , arr  : [ 1, 15, ['one', 'two'], {'joy': 'music', 'style': 'metal'} ]
                };
        let res = dtbox
                    .init ( test )
                    .select ()
                    .all ()
                    .withSelection ()
                    .keyPrefix ('-')
                    .flatten ()
                    .replace ()
        expect ( res._select.result ).to.be.equal ( null )
        expect ( res.structure ).to.have.length ( 1 )
  }) // it replace



 it ( 'Attach', () => {
        const test = {
                      name : 'Peter'
                    , arr  : [ 1, 15, ['one', 'two'], {'joy': 'music', 'style': 'metal'} ]
                };
        let res = dtbox
                      .init ( test )
                      .select ()
                      .parent ( 'joy')
                      .withSelection ()
                      .flatten ()
                      .attach ( 'root/pleasure' )
           expect ( res.structure[0][3][1] ).to.be.equal ( 'pleasure' )

           let 
                id = res.structure[0][3][0]
              , keys = Object.keys ( res.value )
              , keyList = keys.reduce ( (res, item) => {
                                      if ( item.includes(id) )   res.push(item)
                                      return res
                                  },[])
              ;
              expect ( keyList.length ).to.be.equal ( 2 )
          //  expect () 
 }) // it attach

}) // describe




