/**
 *  Testing FlatObject
 * 
 */



import { expect } from "chai"
import mainLib from "../src/mainLib.js"
import flatObject from '../src/flatObject/index.js'
import convert from '../src/convertors/index.js'
import dtbox from "../src/main.js";
import ex from "../src/flatObject/export.js";



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
     expect ( res instanceof Array )
     expect ( res.length ).to.be.equal ( 7 )
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
    expect ( k/i ).to.be.equal ( 2 )   // Imported object is the same. So expectation is that rows will be doubled. 
}) // it flatObject.insert




it ( 'flatObject:: insert a non dt-object', () => {
    flat.insertSegment ( 'base', a ) // Insert a non dt-object -> auto convert from std to dt-object
    const res = flat.export ();
    let i = 0;
    res.forEach ( line => {
                const [ name,, breadcrumbs ] = line;
                if ( name === breadcrumbs ) i++
            })  // forEach line
    expect ( i ).to.be.equal ( 2 ) // 'root' and 'base' segments
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
    expect ( i ).to.be.equal ( 2 ) // 'root' and 'base' segments
}) // it dt model



it ( 'flatObject: copy', () => {
    let res = flat.copy ( 'root' );
    expect ( res.personal.eyes ).to.be.equal ( 'blue' )
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
                                    expect ( extra.nn ).to.be.equal ( 'nn' )   // It's possible to provide external data to query fn
                        }, 
                            { nn : 'nn'}   // Extra data used in query function
                        )

    const res = t.export ();
    res.forEach ( line => {
                const [ name, data, breadcrumbs, edges ] = line;

                if ( name === 'root' ) {
                        expect ( edges[0]).to.be.equal ( 'root/check' )
                    } // if 'root'

                if ( name === 'music' ) {
                        expect ( data ).to.include ( 'punk' )
                    } // if music

                if ( name === 'check' ) {
                    expect ( breadcrumbs ).to.be.equal ( 'root/check' )
                    expect ( data ).to.have.property ( 'test' )
                    expect ( data.test ).to.be.equal ( true )
                }
        })  // for each 'res'    
}) // it flatObject.query



it ( 'flatObject: model, extra data', () => {
    flat.model ( ( store, extra ) => {
                            expect ( extra.nn ).to.be.equal ( 'nn' )
                    },
                    { nn : "nn" } // It's possible to provide extra data to model fn
                    )
}) // it flatObject.model, extra data



it ( 'flatObject: model, full data with data-model', () => {
    const res = flat.model ( () => ({ 
                                    as: 'std'  // If there is a need to provide the result in specific predefined data-model. Convertors.
                                })
                        )
    expect ( res.name ).to.be.equal ( 'Peter' )
    expect ( res?.personal?.hobbies?.music ).to.have.length ( 4 )
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
                    
    expect ( res ).to.not.have.property ( 'name' )
    expect ( res.collection ).to.be.equal ( 'hobbies' )
    expect ( res ).to.have.property ( 'music')
    expect ( res ).to.have.property ( 'sport' )

    expect ( res.sport ).to.have.length ( 3 )
    expect ( res.music ).to.have.length ( 4 )
}) // it flatObject.model - Generate new structure with data-model




it ( 'flatObject: setupFilter', () => {
    flat.setupFilter ( 'test', ({name}) => {
                        if ( name == 'music' )   return true
                        return false
                })

    let i = 0;
    flat.query ( store =>  store.use ( 'test' ).look ( () => i++ )   )
    expect ( i ).to.be.equal ( 4 )
}) // flatObject.setupFilter


it ( 'flatObject. Index', () => {
    let 
          br = 'root/friends'
        , friends = flat.index ( br )
        , [ name, fd, breadcrumbs, edges ] = friends
        ;

    expect ( name ).to.be.equal ( 'friends' )
    expect ( fd ).to.contains ( 'Ivan') 
    expect ( fd ).to.contains ( 'Dobroslav') 
    expect ( fd ).to.contains ( 'Stefan') 
    expect ( breadcrumbs ).to.be.equal ( br )
}) // it flatObject.index



it ( 'ExtractList with options', () => {
     const 
        sample1 = {
                      name: 'Peter'
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

    expect ( storage.listSegments() ).to.contains ( 'root' )
    expect ( storage.listSegments() ).to.contains ( 'sports' )
    expect ( storage.listSegments() ).to.contains ( 'music' )

    const [ theName, missing, res1, res2 ] = storage.extractList ( [ 'name', 'aloha', 'sports' , 'music'], {as:'std'} );  // as standard data-model

    expect ( theName ).to.be.equal ( 'Peter' )   
    expect ( missing ).to.be.equal ( null    )   // Request for missing segment or flatData-property in first dt-line of root segment - will return null.

    expect ( res1 ).to.have.property ( 'sportnames' )
    expect ( res1.sportnames ).to.have.length ( 3 )
    expect ( res2 ).to.have.length ( 4 )
    expect ( res2 ).to.contains ( 'punk' )



    const [ res3, res4, nameAgain ] = storage.extractList ( [ 'sports' , 'music', 'name' ], {as:'files'} );  // as files
    
    expect ( nameAgain ).to.be.equal ( 'Peter' )   // Options works only on segments. So, if response is not a segment will skip a conversion.
    expect ( res3 ).to.have.length ( 7 )
    expect ( res3 ).to.contains ( 'gear/ski' )
    expect ( res3 ).to.contains ( 'sportnames/fencing' )

    expect ( res4 ).to.have.length ( 4 )
    expect ( res4 ).to.contains ( 'punk' )
    expect ( res4 ).to.contains ( 'ska' )
    expect ( res4 ).to.contains ( 'metal' )
    expect ( res4 ).to.contains ( 'guitar' )

}) // it extractList




}) // describe flatObject


