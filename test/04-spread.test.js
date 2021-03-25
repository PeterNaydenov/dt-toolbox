'use strict'

const { c } = require('../test-data/test_1');

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




 it ( 'Spread -> standard with deep structure', () => {
      const 
            test = [ 'name/firstName/name/Peter' ]
          , dt = dtbox.init ( test, {type:'file'})
          ;
          
      dt
         .select ()
         .all ()
         .spread ( 'std', x => {
                  expect ( x ).to.have.property ( 'name' )
                  expect ( x['name'] ).to.have.property ( 'firstName' )
                  expect ( x['name']['firstName']).to.have.property ( 'name' )
            })
 }) // it spread->standard with deep structure




 it ( 'Spread -> standard. Various structures', () => {
        const flatData = [[
                        [ 'object', 0, [ 1, 'name' ], [ 2, 'hidden' ] ]
                      , [ 'object', 1, [ 3, 'firstName' ] ]
                      , [ 'object', 2 ]
                      , [ 'object', 3 ]
                    ]
                    , {
                          'root/1/lastName': 'Dimitrov'
                          , 'root/2/age': 42
                          , 'root/3/name': 'Peter'
                      }
                  ];
        dtbox
            .load ( flatData )
            .spreadAll ( 'std', x => {
                        expect ( x ).to.have.property ( 'name' )
                        expect ( x ).to.have.property ( 'hidden' )
                        expect ( x.hidden ).to.have.property ( 'age' )
                        expect ( x.name ).to.have.property ( 'lastName' )
                        expect ( x.name ).to.have.property ( 'firstName' )
                        expect ( x.name.firstName ).to.have.property ( 'name' )                        
                });
 }) // it Spread -> standard. Various structures
 


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
      // Data-type 'flat' in spread always mean 'shortFlat'
      // Real "flat" data-type is internal only type.
      const dt = dtbox.init ( test );
      dt.select ()
        .all ()
        .spread ( 'flat', x => {
                  expect ( dt.value['root/0/name'] ).to.be.equal ( x[1]['root/0/name'] )
                  expect ( dt.structure[0][0]      ).to.be.equal ( x[0][0][0] )
              })
 }) // it spread -> flat



 it ( 'Spread -> flat with selection', () => {
      const test = {
                        name : 'Peter'
                      , arr : [ 1,15 ]
                };
      // Data-type 'flat' in spread always mean 'shortFlat'
      // Real flat data-type is internal only data-type.
      const dt = dtbox.init ( test );
      dt
        .select ()
        .folder ( 'arr' )
        .withSelection ()
        .flatten ()
        .spread ( 'flat', x => {
                  expect ( x.length ).to.be.equal ( 2 )
                  let [ struct, val ] = x;
                  expect ( struct.length ).to.be.equal ( 1 )
                  expect ( val ).to.have.property ( 'root/0/0' )
                  expect ( val ).to.have.property ( 'root/0/1' )
                  expect ( val ).to.not.have.property ( 'root/0/name' )
              })
 }) // it spread -> flat with selection



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



 it ( 'Spread -> breadcrumbs with selection', () => {
      const test = {
                        name : 'Peter'
                      , arr  : [ 1, 15 ]
              };
      dtbox
          .init ( test )
          .folder ('arr')
          .withSelection ()
          .flatten ()
          .spread ( 'breadcrumbs', x => {
                        expect ( x ).to.have.property ( 'root/1' )
                        expect ( x['root/1']).to.be.be.equal ( 15 )
                })
 }) // it spread -> breadcrumbs with selection



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
                  expect ( x[0]).to.be.equal ( 'name/Peter' )
                  expect ( x[2]).to.be.equal ( 'arr/15'   )
            })
 }) // it spread -> file



it ( 'Spread -> file with selection' , () => {
      const test = {
                        name : 'Peter'
                      , arr  : [ 1, 15 ]
              };
      dtbox
        .init ( test )
        .folder ('arr')
        .withSelection ()
        .flatten ()
        .spread ( 'file', x => {
                  expect (x.length).to.be.equal ( 2 )
                  expect ( x ).to.not.include ( 'Peter' )
                  expect ( x ).to.include ( 1  )
                  expect ( x ).to.include ( 15 )
            })
 }) // it spread -> file with selection



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
                    expect ( x.length ).to.be.equal ( 7 )
                    expect ( x instanceof Array ).to.be.true
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
                expect ( x instanceof Array ).to.be.true
                expect ( x.length ).to.be.equal ( 7 )
                expect ( x.includes('name')).to.be.true
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
                    expect ( x instanceof Array ).to.be.true
                    expect ( x.length ).to.be.equal ( 7 )
                    expect ( x      ).to.contain ( 'name' )
                    expect ( x      ).to.contain ( 'age' )
                    expect ( x      ).to.contain ( 'eyes' )
                    expect ( x      ).to.contain ( '2' )
                    expect ( x      ).to.contain ( 'active' )
              })
}) // it spread -> keys



it ( 'Spread -> tuples', () => {
  let r = dtbox
            .init ( sample.test_0 )
            .select ()
            .all ()
            .spread ( 'tuples', x => {
                      expect ( x.length ).to.be.equal ( 7 )
                      expect ( x[0][0] ).to.be.equal ( 'name' )
                      expect ( x[0][1] ).to.be.equal ( 'Peter' )
                      expect ( x[4][0] == x[5][0] )
                      expect ( x[5][0] == x[6][0] )
                })
}) // it spread -> tuples



it ( 'Spread -> tuples with selection', () => {
        dtbox
            .init ( sample.test_0 )
            .select ()
            .folder ('array')
            .withSelection ()
            .spread ( 'tuples', x => {
                      expect ( x.length ).to.be.equal ( 3 )
                      expect ( x[0][0] ).to.be.equal ( 'array' )
                      expect ( x[1][0] ).to.be.equal ( 'array' )
                      expect ( x[2][0] ).to.be.equal ( 'array' )
                })
}) // it spread -> tuples with selection



it ( 'Replace', () => {
        const test = {
                      name : 'Peter'
                    , arr  : [ 1, 15, ['one', 'two'], {'joy': 'music', 'style': 'metal'} ]
                };
        let res = dtbox
                    .init ( test )
                    .withData ()
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



it ( 'Export -> standard', () => {
  const test = {
                    name: 'Peter'
                  , array : [ 1, 15 ]
               };
  let result = dtbox.init ( test )
                    .select ()
                    .all ()
                    .export ('std');
  expect ( result ).to.be.eql ( test )
}) // it spread->standard

}) // describe




