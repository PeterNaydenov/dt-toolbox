'use strict'

var		 
		  dtbox = require  ( '../dt-toolbox' )
		, sample = require ( '../test-data/sample' )
		, chai = require   ( 'chai'          )
		, expect = require ( 'chai'   ).expect
		;



describe ( 'Post Processes', () => {



it ( 'modify', () => {
    // * Modify keys on exported DT object
    const result = dtbox
                       .init ()
                       .preprocess ( sample.test_0, dt => {
                                                            const oldKeys = dt.keyList()
                                                            const newKeys = oldKeys.map ( el => el.replace ( 'array', 'counter')   )
                                                            return dt.modifyKeys( oldKeys, newKeys )
                                           })

    expect ( result.value ).to.have.property ( 'root/counter/0' )

    expect ( result.structure ).to.have.property ( 'root/counter' )
    expect ( result.structure['root/counter'] ).is.equal ( 'array' )

    expect ( result.namespace ).to.have.property ( 'counter' )
    expect ( result.namespace['counter'] ).has.length ( 3 )
}) // it setKeys





it ( 'keepKeys', () => {
    let result;

    dtbox
       .init ( sample.test_0 )
       .select()
       .all()
       .spread ( 'dt', dt => {
                result = dt.keepKeys ( k => k.length > 2 ).keyList()
       })

   expect ( result ).is.an.array
   expect ( result ).contains ( 'root/array/0' )
   expect ( result ).contains ( 'root/profile/active' )
   expect ( result ).not.contains ( 'root/name' )
    
}) // it reduceKeys





it ( 'removeKeys', () => {
    let result;

    dtbox
       .init( sample.test_0 )
       .add ( { listen : 'Spineshank' }  )
       .select()
       .all()
       .spread('dt', dt => {
                result = dt.removeKeys ( k => k.includes('array') || k.includes('listen')  )
       })

    expect ( result ).to.have.property     ( 'root/name'           )
    expect ( result ).to.have.property     ( 'root/profile/active' )
    expect ( result ).to.not.have.property ( 'root/listen'         )
    expect ( result ).to.not.have.property ( 'root/array/0'        )
}) // it removeKeys





it ( 'keepValues', () => {
    let result;

    dtbox
      .init ( sample.test_0 )
      .select()
      .all()
      .spread ( 'dt', dt => {
                    result = dt.keepValues( v => v!=1 && v!=42 )
              })

    expect ( result ).to.not.have.property ( 'root/age' )
    expect ( result ).to.not.have.property ( 'root/array/0' )
    expect ( result ).to.have.property     ( 'root/array/1' )
}) // it keepValues





it ( 'removeValues', () => {
    let result;

    dtbox
      .init ( sample.test_0 )
      .select()
      .all()
      .spread ( 'dt', dt => {
                    result = dt.removeValues( v => v==1 || v==42 )
              })

    expect ( result ).to.not.have.property ( 'root/age' )
    expect ( result ).to.not.have.property ( 'root/array/0' )
    expect ( result ).to.have.property     ( 'root/array/1' )
}) // it removeValues





it ( 'json', () => {
     let 
            result1
          , result2
          ;

     dtbox
        .init ( sample.test_0 )
        .select()
        .all()
        .spread ( 'dt', dt => {
                        result1 = dt.json()
                        result2 = JSON.parse(result1)
                })

     expect ( result1 ).to.be.a.string
     expect ( result1 ).to.contain       ('"root/age":"42"')
     expect ( result2 ).to.have.property ( 'root/age' )
}) // it json





it ( 'build', () => {
    let result;

    dtbox
        .init(['lele'])
        .select ()
        .all()
        .spread ( 'dt', dt => {
                            result = dt.build()
               })

        expect ( result ).is.an.array
        expect ( result ).contains ( 'lele' )
}) // it build





it ( 'ignoreKeys', () => {
   let result;
   
   dtbox
      .init ( sample.test_8 )
      .select()
      .folder ( 'videos' )
      .spread ( 'dt', dt => {
                              // Convert an object to array by removing keys. Argument -> level of deep.
                              result = dt.assemble().ignoreKeys(0).build()

      })
 
  expect ( result ).to.be.an.array
  expect ( result ).to.have.length (4)
}) // it ignoreKeys





it ( 'map', () => {
  let result;

  dtbox
     .init ( sample.test_5 )
     .select ()
     .parent ( 'age', value => value.age > 30   )
     .remove ( value =>  value == 'test' )
     .spread ( 'dt', dt => {
               result = dt
                          .assemble ()
                          .map ( key => key.includes('name') ? key.replace('name','firstName') : key )
                          .build ()
         })

    expect ( result ).to.be.an.array
    expect ( result ).to.have.length ( 4 )
    expect ( result[0]).to.have.property ( 'firstName' )
}) // ignoreKeys again



}) // describe




