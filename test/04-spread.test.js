'use strict'

const		 
		  dtbox  = require ( '../src/main'        )
		, sample = require ( '../test-data/index' )
    , chai   = require ( 'chai'               )
		, expect = chai.expect
		;






describe ( 'Spread and SpreadAll', () => {


  
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
      // Format 'flat' in spread always mean 'shortFlat'
      // Real flat format is internal only format.
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



 it ( 'Assemble', () => {
   // TODO: Move this test on the right place
        const test = {
                        name : 'Peter'
                      , arr  : [ 1, 15 ]
              };
        dtbox
          .init ( test )
          .select ()
          .find ( 'arr' )
          .assemble ()
          .spread ( 'std', x => {
                    expect ( x ).to.have.length ( 2 )
                    expect ( x[0]).to.be.equal ( 1 )
                    expect ( x[1]).to.be.equal ( 15 )
              })
  }) // it assemble



  it ( 'withSelection', () => {
    // TODO: Move this test on the right place;
      const test = {
                        name : 'Peter'
                      , arr  : [ 1, 15, ['one', 'two'], {'joy': 'music', 'style': 'metal'} ]
                };
      let dt = dtbox
                .init ( test )
                .select ()
                .all ()
                .withSelection ();

      expect ( dt._select.result['root'] ).to.have.property ( 'name' )
      expect ( dt._select.result['root/arr'][1]).to.be.equal ( 15 )
  }) // it withSelection




  it ( 'Modifier -> flatten', () => {
    // TODO: Move this test on the right place;
      const test = {
                      name : 'Peter'
                    , arr  : [ 1, 15, ['one', 'two'], {'joy': 'music', 'style': 'metal'} ]
                };
      dtbox
        .init ( test )
        .select ()
        .all ()
        .withSelection ()
        .flatten ()
        .spread ( 'std', x => {
                    expect ( x ).has.property ( '1' )
                    expect ( x['1']).is.equal ( 15 )  // external ones will overwrite internal ones
                    expect ( x['1']).is.not.equal ( 'two' )
                    expect ( x ).has.property ( 'name' )
                    expect ( x ).has.property ( 'joy'  )
                    expect ( x ).has.property ( 'style' )
              })
  }) // it modifier -> flatten



  it ( 'modifier -> keyPrefix', () => {
        const test = {
                      name : 'Peter'
                    , arr  : [ 1, 15, ['one', 'two'], {'joy': 'music', 'style': 'metal'} ]
                };
        dtbox
           .init ( test )
           .select ()
           .all ()
           .withSelection ()
           .keyPrefix ('-')
           .flatten ()
           .spread ( 'std', x => {
                      expect ( x ).to.have.property ( 'arr-3-joy')
                      expect ( x ).to.have.property ( 'arr-2-0'  )
                      expect ( x ).to.have.property ( 'arr-0'    )
                      expect ( x ).to.have.property ( 'name'     )
                })
  }) // it modifier -> keyPrefix




  it ( 'replace', () => {
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





 // Tuples sould more like a modifier?! 
 it ( 'Spread -> tuples'      )



}) // describe




