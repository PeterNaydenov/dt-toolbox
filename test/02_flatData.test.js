/**
 *  FlatData testing:
 *      - flatIO API
 *      - flatStore API
 * 
 */



import { expect } from "vitest"
import flatData from '../src/flatData/index.js'
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
                        }
        }
    , dependencies = () => ({ walk })
    ;

describe ( 'Flat Data module', () => {

let flatIO, flatStore



beforeEach ( () => {
            const d = convert.from ( 'std' ).toFlat ( dependencies, a );
            [ flatIO, flatStore ] = flatData ( dependencies, d )
    }) // beforeEach



it ( 'flatIO: export', () => {
        const res =  flatIO.export ( 'root' );
        expect ( res ).toHaveLength ( 7 )           // flatStore rows;
        expect ( res[0]).toHaveLength ( 4 )         // flatStore row - [ name, data, path, edges ]
        expect ( res[0][0]).toBe ( res[0][2] ) // in a starting of data-structure name==path 
        expect ( res[0][0]).toBe ( 'root' )
        expect ( res[0][1]).toHaveProperty ( 'name' )
}) // it export



it ( 'flatIO: insert', () => {
        const 
             d = convert.from ( 'std' ).toFlat ( dependencies, [ 'here', 'we', 'are'] )
            ,[ , , flatStore ] = d
            ;

        // Change import name - made originally by flatObject API
        flatStore[0][0] = 'b'
        flatStore[0][2] = 'b'

        flatIO.insert ( d )
        const 
              res = flatIO.export ()  // res should contain copy of a an
            , ix = flatIO.getIndexes ()
            ;

        expect ( ix ).toHaveProperty ( 'b' )
        expect ( res ).toHaveLength ( 8 )
        expect ( res[7][0]).toBe ( 'b' )
}) // it flatIO.insert



it ( 'flatStore: look ', () => {
    let i = 0;
    flatStore.look ( ({empty}) => empty ? null : i++ ) // Count of the object properties. Some objects don't have own properties. Such objects will provide 'empty' property to 'look' fn
    expect ( i ).toBe ( 17 )  // Number of properties in the data 
}) // it flatStore.look



it ( 'flatStore: look with next()', () => {
    let i = 0;
    flatStore.look ( ({empty, next }) => { 
                            if ( !empty )   i++   // Count of the object properties. Some objects don't have own properties. Such objects will provide 'empty' property to 'look' fn;
                            return next ()        // Call 'look' fn once per flatRow;
                })
    expect ( i ).toBe ( 6 )  // Number of flatRows in the data 
}) // it flatStore.look with next()



it ( 'flatStore: get', () => {
    let list = [];
    flatStore
        .get ( 'root/personal/sizes' )
        .look ( ({value}) => list.push(value)   )

    expect ( list ).toHaveLength ( 4 )
    expect ( list ).toContain ( 10 )
    expect ( list ).toContain ( 44 )
    expect ( list ).toContain ( 'm' )
}) // it flatStore.get



it ( 'flatStore: get. Breadcrumbs does not exist', () => {
    let list = [];
    
    flatStore
        .get ( 'root/personal/size' )
        .look ( ({value}) => list.push(value)   )

    expect ( list ).toHaveLength ( 0 )
}) // it flatStore.get, no such breadcrumbs



it ( 'flatStore: find', () => {
    let i = 0;
    flatStore
        .find ( 'personal' )
        .look (({empty}) => empty ? null : i++ )   // Function 'find' will search for objects with name 'personal' and will start 'look' fn against 'personal' properties only;
    expect ( i ).toBe ( 2 )                 // In our case properties are 'age' and 'eyes'.

    // after call of 'look', scanList should be reset to default
    i = 0
    flatStore.look ( ({key}) => { if (key!=null) i++ })   // Count of the object properties. Some objects don't have own properties. Such objects will provide 'empty' property to 'look' fn
    expect ( i ).toBe ( 17 )
}) // it flatStore.find



it ( 'flatStore: from', () => {
    let i = 0;
    flatStore
       .from ( 'root/personal' )
       .look (({empty}) => empty ? null : i++ )   // Function 'from' will start to search for object and properties from 'root/personal' location and going deeper; 
    expect ( i ).toBe ( 13 )
}) // it flatStore.from



it ( 'flatStore: from not available location', () => {
    let i = 0;
    flatStore
         .from ( 'root/personal/none' )
         .look ( ({ name }) => i++ )
    expect ( i ).toBe ( 0 )
}) // it from not available location



it ( 'flatStore: like. Single word.', () => {
    let i = 0;
    flatStore
       .like ('sic')
       .look ( () => i++ )
    expect ( i ).toBe ( 4 )
}) // it flatStore.like single



it ( 'flatStore: like. Multiple words.', () => {
    let i = 0;
    flatStore
        .like (['sic', 'sp'])
        .look ( () => i++ )
    expect ( i ).toBe ( 7 )
}) // it flatStore.like multiple




it ( 'flatIO: setup a filter, flatStore: use', () => {
    let i = 0;
    flatIO.setupFilter ( 'custom', ({name}) => { 
                                if ( name === 'music' )   return true
                                return false
                            })

    flatStore.use ( 'custom' ).look ( () => i++ )
    expect ( i ).toBe ( 4 )
}) // it flatIO.setupFilter, flatStore.use



it ( 'flatStore: try to use a non-existing filter', () => {
    let i = 0;
    flatStore
        .use ( 'some' )
        .look ( ({next}) => {
                    i++ 
                    return next ()
                })
    expect ( i ).toBe ( 7 ) // will be executed on each dt-line
}) // it flatStore.use a non-existing filter

}) // describe
