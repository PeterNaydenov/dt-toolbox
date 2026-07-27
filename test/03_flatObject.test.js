/**
 *  Testing FlatObject
 * 
 */



import { expect } from "vitest"
import mainLib from "../src/mainLib.js"
import flatObject from '../src/flatObject/index.js'
import convert from '../src/convertors/index.js'
import dtbox from "../src/main.js";



const 
        a = {
              name: 'Peter'
            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
            , personal : {
                                age     : 49
                            , eyes    : 'blue'
                            , sizes   : [ 10, 44, 'm', 'mid' ]
                            , hobbies : { 
                                               music : [ 'punk', 'ska', 'metal', 'guitar' ]
                                            , sport  : [ 'fencing', 'skating', 'ski' ]
                                        }
                        }
            }
        , dependencies = mainLib.dependencies                        
        ;




describe ( 'Flat Object module', () => {


let flat;



beforeEach ( () => {
        const d = convert.from ( 'std' ).toFlat ( dependencies, a );
        flat = flatObject ( dependencies, d )
    }) // beforeEach



it ( 'Create flat object', () => {
     const res = flat.export ();
     expect ( res ).toBeInstanceOf ( Array )
     expect ( res.length ).toBe ( 7 )
}) // it



it ( 'flatObject: insert a dt-object', () => { 
    let i = 0, k = 0;
    flat.insertSegment ( 'base', mainLib.init (a, {type:'std'}) )
    const res = flat.export ();

    res.forEach ( line => {
                        const breadcrumbs = line[2];
                        k++
                        if ( breadcrumbs.includes('base') )   i++
                })
    expect ( k/i ).toBe ( 2 )   // Imported object is the same. So expectation is that rows will be doubled. 
}) // it flatObject.insert




it ( 'flatObject:: insert a non dt-object', () => {
    flat.insertSegment ( 'base', a ) // Insert a non dt-object -> auto convert from std to dt-object
    const res = flat.export ();
    let i = 0;
    res.forEach ( line => {
                const [ name,, breadcrumbs ] = line;
                if ( name === breadcrumbs ) i++
            })  // forEach line
    expect ( i ).toBe ( 2 ) // 'root' and 'base' segments
}) // it non dt-object



it ( 'flatObject:: insert a dt model', () => {
    const dtModel = dtbox.init ( a, { type : 'std' }).export ()
    flat.insertSegment ( 'base', dtModel ) // Insert a dt model
    const res = flat.export ();
    let i = 0;
    res.forEach ( line => {
                const [ name,, breadcrumbs ] = line;
                if ( name === breadcrumbs ) i++
            })  // forEach line
    expect ( i ).toBe ( 2 ) // 'root' and 'base' segments
}) // it dt model



it ( 'flatObject: copy', () => {
    let res = flat.copy ( 'root' );
    expect ( res.personal.eyes ).toBe ( 'blue' )
}) // flatObject.copy



it ( 'flatObject: query', () => {
    const t = flat.query ( ( store, extra ) => {
                                    store.set ( 'root', {} )
                                    store.set ( 'check', {} )
                                    store.set ( 'music', [])

                                    store.use ('list').look ( ({ value, breadcrumbs }) => {
                                            if ( breadcrumbs.includes('music'))   store.push ( 'music', value )
                                        })
                                     
                                    store.save ( 'root', 'owner', 'Peter' )
                                    store.save ( 'check', 'test', true )
                                    store.connect (['root/check', 'root/music'])
                                    expect ( extra.nn ).toBe ( 'nn' )   // It's possible to provide external data to query fn
                        }, 
                            { nn : 'nn'}   // Extra data used in query function
                        )

    const res = t.export ();
    res.forEach ( line => {
                const [ name, data, breadcrumbs, edges ] = line;

                if ( name === 'root' ) {
                        expect ( edges[0]).toBe ( 'root/check' )
                    } // if 'root'

                if ( name === 'music' ) {
                        expect ( data ).toContain ( 'punk' )
                    } // if music

                if ( name === 'check' ) {
                    expect ( breadcrumbs ).toBe ( 'root/check' )
                    expect ( data ).toHaveProperty ( 'test' )
                    expect ( data.test ).toBe ( true )
                }
        })  // for each 'res'    
}) // it flatObject.query



it ( 'flatObject: model, extra data', () => {
    flat.model ( ( store, extra ) => {
                            expect ( extra.nn ).toBe ( 'nn' )
                    },
                    { nn : "nn" } // It's possible to provide extra data to model fn
                    )
}) // it flatObject.model, extra data



it ( 'flatObject: model, full data with data-model', () => {
    const res = flat.model ( () => ({ 
                                    as: 'std'  // If there is a need to provide the result in specific predefined data-model. Convertors.
                                })
                        )
    expect ( res.name ).toBe ( 'Peter' )
    expect ( res?.personal?.hobbies?.music ).toHaveLength ( 4 )
}) // it flatObject.model



it ( 'flatObject: model, Generate new structure with data-model', () => {
    const res = flat.model ( store => {
                            store.set ( 'root', {}  )
                            store.save ( 'root', 'collection', 'hobbies' )
                            store.set ( 'music', [] )
                            store.set ( 'sport', [] )
                            store.connect ([ 'root/music', 'root/sport' ])
                            store.use ( 'list').look ( ({ value, breadcrumbs }) => {
                                                    if ( breadcrumbs.includes ( `/music` ))  store.push ( 'music', value )
                                                    if ( breadcrumbs.includes ( `/sport` ))  store.push ( 'sport', value )
                                            })
                                            
                            return { as: 'std' }
                    })
                    
    expect ( res ).not.toHaveProperty ( 'name' )
    expect ( res.collection ).toBe ( 'hobbies' )
    expect ( res ).toHaveProperty ( 'music')
    expect ( res ).toHaveProperty ( 'sport' )

    expect ( res.sport ).toHaveLength ( 3 )
    expect ( res.music ).toHaveLength ( 4 )
}) // it flatObject.model - Generate new structure with data-model




it ( 'flatObject: setupFilter', () => {
    flat.setupFilter ( 'test', ({name}) => {
                        if ( name == 'music' )   return true
                        return false
                })

    let i = 0;
    flat.query ( store =>  store.use ( 'test' ).look ( () => i++ )   )
    expect ( i ).toBe ( 4 )
}) // flatObject.setupFilter


it ( 'flatObject. Index', () => {
    let 
          br = 'root/friends'
        , friends = flat.index ( br )
        , [ name, fd, breadcrumbs, edges ] = friends
        ;

    expect ( name ).toBe ( 'friends' )
    expect ( fd ).toContain ( 'Ivan') 
    expect ( fd ).toContain ( 'Dobroslav') 
    expect ( fd ).toContain ( 'Stefan') 
    expect ( breadcrumbs ).toBe ( br )
}) // it flatObject.index



it ( 'ExtractList, no options', () => {
            const 
                sample1 = {
                              name: 'Peter'
                            , bad : false
                            , topFn : () => 24
                            , pretendHTML : { nodeType : 1, tagName : 'DIV' }
                            , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
                        }
                , sample2 = {
                                user : 'Peter'
                                , sportnames : [ 'fencing', 'skating', 'ski' ]
                                , gear : [ 'fencing sabre', 'skating shoes', 'ski' ]
                            }
                , sample3 = [ 'punk', 'ska', 'metal', 'guitar' ]
                , fn = () => 12
                ;
            const storage = dtbox.init ( sample1, { type : 'std' })
            storage.insertSegment ( 'sports', dtbox.init ( sample2))
            storage.insertSegment ( 'music', dtbox.init ( sample3))    
            storage.insertSegment ( 'extra', dtbox.init ({fn}))

            const [ 
                      theName
                    , topFn
                    , pretendHTML
                    , bad
                    , missing
                    , res1
                    , res2
                    , funObject 
                ] = storage.extractList ([ 
                                          'name'
                                        , 'topFn'
                                        , 'pretendHTML'
                                        , 'bad'
                                        , 'aloha'
                                        , 'sports' 
                                        , 'music'
                                        , 'extra'
                                    ]);  
            
            expect ( theName ).toBe ( 'Peter' )
            expect ( topFn() ).toBe ( 24 )                                          // Function are copied by reference
            expect ( pretendHTML ).toEqual ( { nodeType : 1, tagName : 'DIV' } )  // DOM elements are copied by reference
            expect ( bad ).toBe ( false )
            expect ( missing ).toBe ( null )   // Request for missing segment or flatData-property in first dt-line of root segment - will return null.
            expect ( res1 ).toHaveProperty ( 'insertSegment' )
            expect ( res2 ).toHaveProperty ( 'insertSegment' )
            expect ( funObject ).toHaveProperty ( 'insertSegment' )

            let [ fRes ] = funObject.extractList ( ['fn'])
            expect ( fRes() ).toBe ( 12 )
    }) // it extractList, no options



it ( 'ExtractList with options', () => {
     const 
        sample1 = {
                      name: 'Peter'
                    , bad : false
                    , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
                }
        , sample2 = {
                          user : 'Peter'
                        , sportnames : [ 'fencing', 'skating', 'ski' ]
                        , gear : [ 'fencing sabre', 'skating shoes', 'ski' ]
                    }
        , sample3 = [ 'punk', 'ska', 'metal', 'guitar' ]
        ;
    const storage = dtbox.init ( sample1, { type : 'std' })
    storage.insertSegment ( 'sports', dtbox.init ( sample2))
    storage.insertSegment ( 'music', dtbox.init ( sample3))

    expect ( storage.listSegments() ).toContain ( 'root' )
    expect ( storage.listSegments() ).toContain ( 'sports' )
    expect ( storage.listSegments() ).toContain ( 'music' )

    const [ theName, bad, missing, res1, res2 ] = storage.extractList ( [ 'name', 'bad', 'aloha', 'sports' , 'music'], {as:'std'} );  // as standard data-model

    expect ( theName ).toBe ( 'Peter' )   
    expect ( missing ).toBe ( null    )   // Request for missing segment or flatData-property in first dt-line of root segment - will return null.
    expect ( bad ).toBe ( false )                   // Negative value should be returned as is. Only missing property should return null.

    expect ( res1 ).toHaveProperty ( 'sportnames' )
    expect ( res1.sportnames ).toHaveLength ( 3 )
    expect ( res2 ).toHaveLength ( 4 )
    expect ( res2 ).toContain ( 'punk' )



    const [ res3, res4, nameAgain ] = storage.extractList ( [ 'sports' , 'music', 'name' ], {as:'files'} );  // as files
    
    expect ( nameAgain ).toBe ( 'Peter' )   // Options works only on segments. So, if response is not a segment will skip a conversion.
    expect ( res3 ).toHaveLength ( 7 )
    expect ( res3 ).toContain ( 'gear/ski' )
    expect ( res3 ).toContain ( 'sportnames/fencing' )

    expect ( res4 ).toHaveLength ( 4 )
    expect ( res4 ).toContain ( 'punk' )
    expect ( res4 ).toContain ( 'ska' )
    expect ( res4 ).toContain ( 'metal' )
    expect ( res4 ).toContain ( 'guitar' )

}) // it extractList


it ('ExtractList dt-object', () => {
    const 
        sample1 = {
                      name: 'Peter'
                    , bad : false
                    , friends : [ 'Ivan', 'Dobroslav', 'Stefan' ]
                }
        , sample2 = {
                          user : 'Peter'
                        , sportnames : [ 'fencing', 'skating', 'ski' ]
                        , gear : [ 'fencing sabre', 'skating shoes', 'ski' ]
                    }
        , sample3 = [ 'punk', 'ska', 'metal', 'guitar' ]
        ;
    const storage = dtbox.init ( sample1, { type : 'std' })
    storage.insertSegment ( 'sports', dtbox.init ( sample2))
    storage.insertSegment ( 'music', dtbox.init ( sample3))

    const [ res1, res2, name ] = storage.extractList ( [ 'sports' , 'music', 'name' ], {as:'dt-object'} );
    expect ( res1 ).toHaveProperty ( 'query' )
    expect ( res2 ).toHaveProperty ( 'query' )
    expect ( name ).toBe ( 'Peter' )   // Options works only on segments. So, if response is not a segment will skip a conversion.
}) // it extractList dt-object




}) // describe flatObject


