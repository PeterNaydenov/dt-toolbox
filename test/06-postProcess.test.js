'use strict'

const		 
      dtbox  = require ( '../src/main'        )
    , sample = require ( '../test-data/index' )
    , chai   = require ( 'chai'               )
    , expect = chai.expect
    ;



describe ( 'Post Processes', () => {

it ( 'withData', () => {
      const test = {
                        name : 'Peter'
                      , arr  : [ 1, 15, ['one', 'two'], {'joy': 'music', 'style': 'metal'} ]
                };
      let dt = dtbox
                .init ( test )
                .withData ();

      expect ( dt._select.result['root'] ).to.have.property ( 'name' )
      expect ( dt._select.result['root/arr'][1]).to.be.equal ( 15 )
  }) // it withData



it ( 'withSelection', () => {
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
                        expect ( x['1']).is.equal ( '15;two' ) // Flatten will combine values 
                        expect ( x['1']).is.not.equal ( '15' )
                        expect ( x ).has.property ( 'name' )
                        expect ( x ).has.property ( 'joy'  )
                        expect ( x ).has.property ( 'style' )
                })
    }) // it modifier -> flatten



it ( 'Modifier -> mix', () => {
        const test = {
                    x : 'someX'
                  , person : {
                              name: 'Peter'
                        }
                  , extendedData : {
                              age : 46
                        }
                  , other : {
                              sport : 'fencing'
                        }
            };
      dtbox
          .init ( test )
          .select ()
          .all ()
          .withSelection ()
          .mix ( 'root/person', [ 'root/extendedData', 'root/other'] )
          .spread ( 'std', x => {
                          expect ( x ).to.have.property ( 'x' )
                          expect ( x ).to.have.property ( 'person' )

                          expect ( x ).to.not.have.property ( 'extendedData' )
                          expect ( x ).to.not.have.property ( 'other'        )

                          expect ( x.person ).to.have.property ( 'name'  )
                          expect ( x.person ).to.have.property ( 'age'   )
                          expect ( x.person ).to.have.property ( 'sport' )
                })
    }) // it modifier -> mix



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



it ( 'Modifier -> reverse without arguments', () => {
      // *** Should reverse only 'root' namespace
            const test = {
                    name : 'Peter'
                  , arr  : [ 1, 15, ['one', 'two'], {'joy': 'music', 'style': 'metal'} ]
                };
            const x = dtbox
                           .init ( test )
                           .withData ()
                           .reverse ()
            const 
                    result  = x._select.result['root']
                  , check   = x._select.result['root/arr/3']
                  ;

            expect ( result ).to.have.property ( 'Peter' )
            expect ( result['Peter']).to.be.equal ( 'name' )
            
            expect ( check ).to.have.property ( 'joy'   )
            expect ( check ).to.have.property ( 'style' )
      }) // it modifier -> reverse without arguments



it ( 'Modifier -> reverse with arguments', () => {
// *** Should reverse only 'root/arr/3' namespace
            const test = {
                    name : 'Peter'
                  , arr  : [ 1, 15, ['one', 'two'], {'joy': 'music', 'style': 'metal'} ]
                };
            const x = dtbox
                           .init ( test )
                           .withData ()
                           .reverse (['root/arr/3'])
            const 
                    result  = x._select.result['root']
                  , check   = x._select.result['root/arr/3']
                  ;

            expect ( result ).to.have.property ( 'name' )
            expect ( result['name']).to.be.equal ( 'Peter' )
            
            expect ( check ).to.have.property ( 'music'   )
            expect ( check ).to.have.property ( 'metal' )
      }) // it modifier -> reverse with arguments



}) // describe


