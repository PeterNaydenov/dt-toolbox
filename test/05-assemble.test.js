'use strict'

const		 
		  dtbox  = require ( '../src/main'        )
		, sample = require ( '../test-data/index' )
        , chai   = require ( 'chai'               )
		, expect = chai.expect
		;



describe ( 'Assemble', () => {

it ( 'Result is a single object', () => {
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





  it ( 'Has multiple objects', () => {
        let data = {
                    'school' : [
                                    { name: 'Ivan',   age: 14 }
                                  , { name: 'Georgy', age: 15 }
                                  , { name: 'Adi',    age: 11 }
                                  , { name: 'Kati',   age: 11 }
                              ]
                  , 'sports' : [
                                    { name: 'Iva',    age: 28 }
                                  , { name: 'Stoyan', age: 36 }
                              ]
                  , 'work'   : [
                                    { name: 'Hristo',   age: 38 }
                                  , { name: 'Lachezar', age: 33 }
                                  , { name: 'Veselina', age: 35 }
                                  
                              ]
                  , 'recent' : {
                                    'classmates' : [
                                                        { name: 'Anton',     age: 42 }
                                                      , { name: 'Miroslava', age: 42 }
                                                  ]
                                  , 'social' : [
                                                      { name: 'Iliana', age: 61 }
                                                    , { name: 'Tzvetan', age: 19 }
                                                ]
                                }
                };
      dtbox
          .init ( data )
          .select ()
          .parent ( 'name', person => person.age < 40 )
          .assemble ()
          .spread ( 'std', dt => {
                          expect ( dt.length ).to.be.equal ( 10 )
                          expect ( dt[0].name ).to.be.equal ( 'Ivan' )
                          expect ( dt[0].age  ).to.be.equal ( 14 )
                })
    }) // it has multiple objects






  it ( 'Complicated: Array + props', () => {
            let data = {
                          pref : 'something'
                        , 'work'   : [
                                          { name: 'Hristo',   age: 38 }
                                        , { name: 'Lachezar', age: 33 }
                                        , { name: 'Veselina', age: 35 }
                                        
                                    ]
                        , 'recent' : {
                                          'classmates' : [
                                                              { name: 'Anton',     age: 42 }
                                                            , { name: 'Miroslava', age: 42 }
                                                        ]
                                        , 'social' : [
                                                            { name: 'Iliana', age: 61 }
                                                          , { name: 'Tzvetan', age: 19 }
                                                      ]
                                      }
                      };
              dtbox
                  .init ( data )
                  .select ()
                  .find ( 'pref' )
                  .parent ( 'name', person => person.age < 40 )
                  .assemble ()
                  .spread ( 'std', dt => {
                                 expect ( dt ).to.have.property ( 'pref' )
                                 expect ( dt.length ).to.be.equal ( 4 )
                                 expect ( dt[0].name ).to.be.equal ( 'Hristo' )
                                 expect ( dt[0].age ).to.be.equal ( 38 )
                        })

    }) // it complicated

}) // describe