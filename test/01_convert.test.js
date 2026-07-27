/**
 *     Convertors testing
 * 
 */



import { expect } from "vitest"
import convert from '../src/convertors/index.js'
import walk from "@peter.naydenov/walk"



const a = {
    name: 'Peter'
  , pretendHTML: { nodeType: 1, tagName: 'DIV' }
  , fun : () => 12
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
            expect ( dt ).toHaveLength ( 10 )
            expect ( dt[0][1] ).toHaveProperty ( 'pretendHTML' )   // HTML DOM nodes - copy by reference
            expect ( dt[0][1].fun() ).toBe ( 12 )             // functions - copy by reference
            dt.forEach ( line => {
                      const [ name ] = line; 
                      if ( name === 'root' ) i++
                      if ( name === 'sport') i++
                })
            expect ( i ).toBe ( 2 )
    }) // it std -> flatRows



it ( 'DT -> Standard', () => {
            const flRows = [
                              [ 'root', { name: 'Peter', fun: () => 12 }, 'root', ['root/personal']]
                            , [ 'personal', { age:49, eyes: 'blue', pretendHTML:{nodeType:1}}, 'root/personal', ['root/personal/hobbies']]
                            , [ 'hobbies', ['music', 'sport', 'photography'], 'root/personal/hobbies', [] ]
                        ]
            const res = convert.to ( 'std', dependencies, flRows )

            expect ( res.personal ).toHaveProperty ( 'pretendHTML' )
            expect ( res.fun() ).toBe ( 12 )
            expect ( res ).toHaveProperty ( 'name' )
            expect ( res.name ).toBe ( 'Peter' )
            expect ( res?.personal?.hobbies ).toHaveLength ( 3 )
    }) // it flatRows->std



it ( 'Tuples -> DT', () => {
    const tuples = [
                          ['name', 'Peter' ]

                        , [ 'private/hair', 'brown']
                        , [ 'private/eyes', 'blue' ]
                        , [ 'private/pretendHTML', { nodeType: 1 } ]
                        , [ 'private/fun', () => 12 ]

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
                          expect ( data ).toHaveProperty ( 'name' )
                          expect ( edges ).toContain ( 'root/shoes' )
                          expect ( edges ).toContain ( 'root/private' )
                          expect ( edges ).toContain ( 'root/familyMembers' )
                          i++
                    }
                if ( name === 'private' ) { 
                            expect ( data.fun() ).toBe ( 12 )
                            expect ( data ).toHaveProperty ( 'pretendHTML' )
                    }
                if ( name === 'shoes' ) {
                          expect ( breadcrumbs ).toBe ( 'root/shoes' )
                          expect ( edges ).toContain ( 'root/shoes/summer' )
                          expect ( edges ).toContain ( 'root/shoes/winter' )
                          i++
                    }
                if ( name === 'winter' ) {
                          expect ( edges ).toHaveLength ( 0 )
                          i++
                    }
                if ( name === 'collections') {
                          expect (data).toHaveLength(0)
                          expect ( edges).toContain ( 'root/collections/0')
                          expect ( edges).toContain ( 'root/collections/1')
                          i++
                    }
                if ( name === 'deep' ) {
                          expect ( data ).toContain ( 'yo')
                          expect ( data ).toContain ( 'mo' )
                          expect ( breadcrumbs ).toBe ( 'root/check/out/this/prop/deep' )
                          i++
                    }
          }) // forEach flatRow
    expect ( i ).toBe ( 5 )
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
                          expect ( v ).toBe ( 'Peter' )
                          i++
                      }
                  if ( k === 'friends' ) { // count:3
                          const vals = [ 'Ivan', 'Dobroslav', 'Stefan', 'Malin' ];
                          i++
                          expect ( vals ).toContain ( v )
                      }
                  if ( k === 'personal/hobbies/sport' ) { // count: 3
                          i++
                      }
            }) // forEach res
    expect ( i ).toBe ( 7 )
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
                      expect ( data ).toHaveProperty ( 'name' )
                      expect ( data.name ).toBe ( 'Peter' )
                      expect ( breadcrumbs ).toBe ( 'root' )
                      expect ( edges ).toContain ( 'root/familyMembers' )
                      expect ( edges ).toContain ( 'root/shoes' )
                      expect ( edges ).not.toContain ( 'root' )
                      i++
                  }
              if ( name === 'shoes' ) {
                      expect ( edges ).toContain ( 'root/shoes/summer' )
                      expect ( edges ).toContain ( 'root/shoes/winter' )
                      i++
                }
              if ( name === 'summer' ) {
                      expect ( data ).toBeInstanceOf ( Array )
                      expect ( breadcrumbs ).toBe ( 'root/shoes/summer' )
                      expect ( data ).toHaveLength ( 2 )
                      i++
                }
    })
  expect ( i ).toBe ( 3 )
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
                          expect ( v ).toHaveProperty ( 'name' )
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
                          expect ( v ).toHaveProperty ( 'type' )
                          expect ( v ).toHaveProperty ( 'items' )
                          expect ( v.type ).toBe ( 'cars' )
                          expect ( v.items ).toBe ( 3 )
                          i++
                    }
        }) // entries forEach
    expect ( i ).toBe ( 2 )
    expect ( j ).toBe ( 0 )
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
                          expect ( d ).toHaveProperty ( 'name' )
                          expect ( breadcrumbs ).toBe ( 'root' )
                          expect ( edges ).toHaveLength ( 2 )
                          i++
                  }
              if ( name === 'familyMembers' ) {
                        expect ( d ).toBeInstanceOf ( Array )
                        expect ( d ).toHaveLength ( 6 )
                        i++
                  }

        })
    expect ( i ).toBe ( 2 )
    expect ( dt ).toHaveLength ( 5 )
}) // it files -> DT



it ( 'DT -> Files', () => {
    const 
          [ , , dt ] = convert.from('std').toFlat ( dependencies, a )
        , res = convert.to ( 'files', dependencies, dt )
        ;    
    expect ( res ).toHaveLength ( 23 )
    expect ( res ).toContain ( 'fun/function:fun' )
    expect ( res ).toContain ( 'pretendHTML/HtmlElement:div' )
    expect ( res ).toContain ( 'name/Peter' )
    expect ( res ).toContain ( 'personal/hobbies/sport/ski' )
    expect ( res ).toContain ( 'personal/collections/0/type/music' )
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
                          expect ( d ).toHaveProperty ( 'name' )
                          expect ( breadcrumbs ).toBe ( 'root' )
                          expect ( edges ).toHaveLength ( 2 )
                          i++
                  }
              if ( name === 'familyMembers' ) {
                        expect ( d ).toHaveLength ( 6 )
                        i++
                  }

        })
    expect ( i ).toBe ( 2 )
    expect ( dt ).toHaveLength ( 5 )  
}) // it breadcrumbs -> dt




it ( 'DT -> Breadcrumbs', () => {
    const 
          [ , , dt ] = convert.from('std').toFlat ( dependencies, a )
        , res = convert.to ( 'breadcrumbs', dependencies, dt )
        ;    

    expect ( res ).toHaveProperty ( 'personal/hobbies/sport/2' )
    expect ( res['personal/hobbies/sport/2'] ).toBe ( 'ski' )

    expect ( res ).toHaveProperty ( 'personal/sizes/3' )
    expect ( res['personal/sizes/3']).toBe ( 'mid' )

    expect ( res ).toHaveProperty ( 'personal/hobbies/music/3' )
    expect ( res['personal/hobbies/music/3']).toBe ( 'guitar' )
}) // it DT -> breadcrumbs

}) // describe convertors


