/**
 *     Convertors testing
 * 
 */



import { expect } from "chai"
import convert from '../src/convertors/index.js'
import walk from "@peter.naydenov/walk"



const a = {
    name: 'Peter'
  , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
  , personal : {
                    age     : 49
                  , eyes    : 'blue'
                  , sizes   : [ 10, 44, 'm', 'mid' ]
                  , hobbies : { 
                                    music: [ 'punk', 'ska', 'metal', 'guitar' ]
                                  , sport : [ 'fencing', 'skating', 'ski' ]
                              }
                  , collections: [ {type:'music', items:24}, {type:'cars', items:3} ]
              }
}
, dependencies = () => ({ walk })
;


describe ( 'Convertors', () => {



it ( 'Standard -> DT', () => {
            const [ copy, indexes, dt ] = convert.from('std').toFlat ( dependencies, a )
            let i = 0;
            expect ( dt ).to.have.length ( 10 )
            dt.forEach ( line => {
                      const [ name ] = line; 
                      if ( name === 'root' ) i++
                      if ( name === 'sport') i++
                })
            expect ( i ).to.be.equal ( 2 )
    }) // it std -> flatRows



it ( 'DT -> Standard', () => {
            const flRows = [
                              [ 'root', { name: 'Peter' }, 'root', ['root/personal']]
                            , [ 'personal', { age:49, eyes: 'blue'}, 'root/personal', ['root/personal/hobbies']]
                            , [ 'hobbies', ['music', 'sport', 'photography'], 'root/personal/hobbies', [] ]
                        ]
            const res = convert.to ( 'std', dependencies, flRows )
            expect ( res.name ).to.be.equal ( 'Peter' )
            expect ( res?.personal?.hobbies ).to.have.length ( 3 )
    }) // it flatRows->std



it ( 'Tuples -> DT', () => {
    const tuples = [
                          ['name', 'Peter' ]

                        , [ 'private/hair', 'brown']
                        , [ 'private/eyes', 'blue' ]

                        , ['familyMembers', 'Veselina']
                        , ['familyMembers', 'Iskra']
                        , ['familyMembers', 'Maria']
                        , ['familyMembers', 'Vasil']
                        , ['familyMembers', 'Vladimir']
                        , ['familyMembers', 'Petya']

                        , ['shoes/winter' , 'Keen']
                        , ['shoes/winter' , 'Head']

                        , ['shoes/summer' , 'Lotto']
                        , ['shoes/summer' , 'Asics']

                        , ['collections/0/type', 'music']
                        , ['collections/0/items', 24 ]

                        , ['collections/1/type', 'cars']
                        , ['collections/1/items', 3 ]

                        , ['check/out/this/prop/deep', 'yo' ]
                        , ['check/out/this/prop/deep', 'mo' ]
                  ];

    const [ copy, index, flatRows ] = convert.from ( 'tuples' ).toFlat ( dependencies, tuples );
    let i = 0;
    flatRows.forEach ( line => {
                const [ name, data, breadcrumbs, edges ] = line;
                if ( name === 'root' ) {
                          expect ( data ).to.have.property ( 'name' )
                          expect ( edges ).to.contains ( 'root/shoes' )
                          expect ( edges ).to.contains ( 'root/private' )
                          expect ( edges ).to.contains ( 'root/familyMembers' )
                          i++
                    }
                if ( name === 'shoes' ) {
                          expect ( breadcrumbs ).to.be.equal ( 'root/shoes' )
                          expect ( edges ).to.contains ( 'root/shoes/summer' )
                          expect ( edges ).to.contains ( 'root/shoes/winter' )
                          i++
                    }
                if ( name === 'winter' ) {
                          expect ( edges ).to.have.length ( 0 )
                          i++
                    }
                if ( name === 'collections') {
                          expect (data).to.have.length(0)
                          expect ( edges).to.contains ( 'root/collections/0')
                          expect ( edges).to.contains ( 'root/collections/1')
                          i++
                    }
                if ( name === 'deep' ) {
                          expect ( data ).to.contains ( 'yo')
                          expect ( data ).to.contains ( 'mo' )
                          expect ( breadcrumbs ).to.be.equal ( 'root/check/out/this/prop/deep' )
                          i++
                    }
          }) // forEach flatRow
    expect ( i ).to.be.equal ( 5 )
}) // it tuples-> DT





it ( 'DT -> Tuples', () => {
    const 
        [ copy, indexes, dt ] = convert.from('std').toFlat ( dependencies, a )
      , res = convert.to ( 'tuples', dependencies, dt )
      ;
    let i = 0;

    res.forEach ( tupleRow => {
                  const [ k, v ] = tupleRow;
                  if ( k === 'name') { // count: 1
                          expect ( v ).to.be.equal ( 'Peter' )
                          i++
                      }
                  if ( k === 'friends' ) { // count:3
                          const vals = [ 'Ivan', 'Dobroslav', 'Stefan', 'Malin' ];
                          i++
                          expect ( vals ).to.contains ( v )
                      }
                  if ( k === 'personal/hobbies/sport' ) { // count: 3
                          i++
                      }
            }) // forEach res
    expect ( i ).to.be.equal ( 7 )
}) // it DT -> Tuples





it ( 'Midflat -> DT', () => {
const data = {
  'root' : { name: 'Peter' }
, 'familyMembers' : [   // Key description could miss the 'root' element
                              'Veselina'
                            , 'Iskra'
                            , 'Maria'
                            , 'Vasil'
                            , 'Vladimir'
                            , 'Petya' 
                    ]
, 'root/shoes/winter' : ['Keen', 'Head']   // Flat object can be described as an array or object 
, 'shoes/summer' : {   
                        '0' : 'Lotto'    // Describe array as an object
                      , '1' : 'Asics'    // Just use numbers for keys
                }
}

 const [,,dt] = convert.from ( 'midFlat' ).toFlat ( dependencies, data );
 let i = 0;
 dt.forEach ( line => {
              const [ name, data, breadcrumbs, edges ] = line;

              if ( name === 'root' ) {
                      expect ( data ).to.have.property ( 'name' )
                      expect ( data.name ).to.be.equal ( 'Peter' )
                      expect ( breadcrumbs ).to.be.equal ( 'root' )
                      expect ( edges ).to.contains ( 'root/familyMembers' )
                      expect ( edges ).to.contains ( 'root/shoes' )
                      expect ( edges ).to.not.contains ( 'root' )
                      i++
                  }
              if ( name === 'shoes' ) {
                      expect ( edges ).to.contains ( 'root/shoes/summer' )
                      expect ( edges ).to.contains ( 'root/shoes/winter' )
                      i++
                }
              if ( name === 'summer' ) {
                      expect ( data instanceof Array )
                      expect ( breadcrumbs ).to.be.equal ( 'root/shoes/summer' )
                      expect ( data ).to.have.length ( 2 )
                      i++
                }
    })
  expect ( i ).to.be.equal ( 3 )
}) // it Midflat -> DT





it ( 'DT -> Midflat', () => {
    const 
          [,,dt] = convert.from ('std').toFlat ( dependencies, a )
        , res = convert.to ('midFlat', dependencies, dt )
        , entries = Object.entries ( res )
        ;
    let i = 0, j = 0;

    entries.forEach ( ([crumbs, v]) => {
                if ( crumbs === 'root' ) {
                          expect ( v ).to.have.property ( 'name' )
                          i++
                    }
                if ( crumbs === 'personal/collections' ) {
                          // expect to not enter here because structure is empty
                          j++
                    }
                if ( crumbs === 'personal/hobbies' ) {
                          // expect to not enter here because structure is empty
                          j++
                    }
                if ( crumbs === 'personal/collections/1' ) {
                          expect ( v ).to.have.property ( 'type' )
                          expect ( v ).to.have.property ( 'items' )
                          expect ( v.type ).to.be.equal ( 'cars' )
                          expect ( v.items ).to.be.equal ( 3 )
                          i++
                    }
        }) // entries forEach
    expect ( i ).to.be.equal ( 2 )
    expect ( j ).to.be.equal ( 0 )
}) // it DT -> Midflat



it ( 'Files -> DT', () => {
    const data = [
                      'name/Peter'
                    , 'familyMembers/Veselina'
                    , 'familyMembers/Iskra'
                    , 'familyMembers/Maria'
                    , 'familyMembers/Vasil'
                    , 'familyMembers/Vladimir'
                    , 'familyMembers/Petya'
                    , 'shoes/winter/Keen'
                    , 'shoes/winter/Head'
                    , 'shoes/summer/Lotto'
                    , 'shoes/summer/Asics'
                ]
          , [ , , dt ] = convert.from ( 'files').toFlat ( dependencies, data )
          ;
    let i = 0;
    dt.forEach ( line => {
              const [ name, d, breadcrumbs, edges ] = line;

              if ( name === 'root' ) {
                          expect ( d ).to.have.property ( 'name' )
                          expect ( breadcrumbs ).to.be.equal ( 'root' )
                          expect ( edges ).to.have.length ( 2 )
                          i++
                  }
              if ( name === 'familyMembers' ) {
                        expect ( d instanceof Array )
                        expect ( d ).to.have.length ( 6 )
                        i++
                  }

        })
    expect ( i ).to.be.equal ( 2 )
    expect ( dt ).to.have.length ( 5 )
}) // it files -> DT



it ( 'DT -> Files', () => {
    const 
          [ , , dt ] = convert.from('std').toFlat ( dependencies, a )
        , res = convert.to ( 'files', dependencies, dt )
        ;    
    expect ( res ).to.have.length ( 21 )
    expect ( res ).to.contains ( 'name/Peter' )
    expect ( res ).to.contains ( 'personal/hobbies/sport/ski' )
    expect ( res ).to.contains ( 'personal/collections/0/type/music' )
}) // it DT to files



it ( 'Breadcrumbs -> DT', () => {
    const data = {
                      'name'            : 'Peter'
                    , 'familyMembers/0' : 'Veselina'
                    , 'familyMembers/1' : 'Iskra'
                    , 'familyMembers/2' : 'Maria'
                    , 'familyMembers/3' : 'Vasil'
                    , 'familyMembers/4' : 'Vladimir'
                    , 'familyMembers/5' : 'Petya'
                    , 'shoes/winter/0'  : 'Keen'
                    , 'shoes/winter/1'  : 'Head'
                    , 'shoes/summer/0'  : 'Lotto'
                    , 'shoes/summer/1'  : 'Asics'
                }
        , [ , , dt ] = convert.from ( 'breadcrumbs' ).toFlat ( dependencies, data )
        ;
    let i = 0;
    dt.forEach ( line => {
              const [ name, d, breadcrumbs, edges ] = line;
              if ( name === 'root' ) {
                          expect ( d ).to.have.property ( 'name' )
                          expect ( breadcrumbs ).to.be.equal ( 'root' )
                          expect ( edges ).to.have.length ( 2 )
                          i++
                  }
              if ( name === 'familyMembers' ) {
                        expect ( d ).to.have.length ( 6 )
                        i++
                  }

        })
    expect ( i ).to.be.equal ( 2 )
    expect ( dt ).to.have.length ( 5 )  
}) // it breadcrumbs -> dt




it ( 'DT -> Breadcrumbs', () => {
    const 
          [ , , dt ] = convert.from('std').toFlat ( dependencies, a )
        , res = convert.to ( 'breadcrumbs', dependencies, dt )
        ;    

    expect ( res ).to.have.property ( 'personal/hobbies/sport/2' )
    expect ( res['personal/hobbies/sport/2'] ).to.be.equal ( 'ski' )

    expect ( res ).to.have.property ( 'personal/sizes/3' )
    expect ( res['personal/sizes/3']).to.be.equal ( 'mid' )

    expect ( res ).to.have.property ( 'personal/hobbies/music/3' )
    expect ( res['personal/hobbies/music/3']).to.be.equal ( 'guitar' )
}) // it DT -> breadcrumbs

}) // describe convertors


