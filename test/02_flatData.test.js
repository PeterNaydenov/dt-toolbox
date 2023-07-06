/**
 *  FlatData testing:
 *      - flatIO API
 *      - flatStore API
 * 
 */



import { expect } from "chai"
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
        expect ( res ).to.have.length ( 7 )           // flatStore rows;
        expect ( res[0]).to.have.length ( 4 )         // flatStore row - [ name, data, path, edges ]
        expect ( res[0][0]).to.be.equal ( res[0][2] ) // in a starting of data-structure name==path 
        expect ( res[0][0]).to.be.equal ( 'root' )
        expect ( res[0][1]).to.have.a.property ( 'name' )
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

        expect ( ix ).to.have.property ( 'b' )
        expect ( res ).to.have.length ( 8 )
        expect ( res[7][0]).to.be.equal ( 'b' )
}) // it flatIO.insert



it ( 'flatStore: set', () => {
        flatStore.set ( 'pr', { name: 'Peter', age:49 })
        flatStore.set ( 'more', [ 'Yordan', 'Zdravko', 'Momchil' ] )
        const 
              res = flatIO.getSelection ()
            , ex = flatIO.export ()
            ;

        // 'set' works on selection only
        expect ( res ).to.have.length ( 2 ) 
        expect ( res[0][0] ).to.be.equal ( 'pr' )
        expect ( res[1][0]).to.be.equal ( 'more' )

        // 'set' is not changing data itself
        ex.forEach ( line => {
                expect ( line[0]).is.not.equal('pr')   
                expect ( line[0]).is.not.equal('more')   
            })
}) // it flatStore.set



it ( 'flatStore: save', () => {
        flatStore.set ( 'pr', { name: 'Peter', age:49 })
        flatStore.save ( 'pr', 'eyes', 'blue' )

        const res = flatIO.getSelection ();
        expect ( res[0][1]).to.have.property ( 'eyes' )
        expect ( res[0][1]['eyes'] ).to.be.equal( 'blue')

}) // it flatStore



it ( 'flatStore: push', () => {
        flatStore.set ( 'more', [ 'Yordan', 'Zdravko', 'Momchil' ] )
        flatStore.push ( 'more', 'Martin' )

        const res = flatIO.getSelection ();
        expect ( res[0][1] ).to.includes ( 'Martin' )
}) // it push



it ( 'flatStore: connect', () => {
        flatStore.set ( 'pr', { name: 'Peter', age:49 })
        flatStore.set ( 'more', [ 'Yordan', 'Zdravko', 'Momchil' ] )
        flatStore.connect (['pr/more'])

        const 
              res = flatIO.getSelection ()
            , linePR = res[0]
            , lineMORE = res[1]
            ;

        expect ( linePR[2] ).to.be.equal ( 'pr' )
        expect ( linePR[3] ).contains ( 'pr/more' )
        expect ( lineMORE[2]).to.be.equal ( 'pr/more' )
}) // it connect



it ( 'flatStore: connect. Duplicate relation information', () => {
        // Setup all flatRows first
        flatStore.look ( ({ name, flatData, breadcrumbs, next }) => { 
                        flatStore.set ( name, flatData )   // Copy the data
                        if ( breadcrumbs.includes('/') )  flatStore.connect ([breadcrumbs])   // Connect object only when they are available. If parent or child object is missing - linking operation will be refused;
                        return next ()   // Call 'look' fn once per flatRow
                })        
        const result = flatIO.getSelection ();
        result.forEach ( line => {
                        const [ name, data, breadcrumbs, edges ] = line;

                        if ( name === 'root' ) { 
                                expect ( edges ).to.have.length ( 2 )
                                expect ( data ).to.have.property ( 'name' )
                                expect ( data.name ).to.be.equal ( 'Peter' )
                            }

                        if ( name === 'personal' ) {
                                expect ( breadcrumbs ).to.be.equal ( 'root/personal' )
                                expect ( edges ).to.contains ( 'root/personal/hobbies' )
                            }
                        if ( name === 'sport' ) {
                                expect ( breadcrumbs ).to.be.equal ( 'root/personal/hobbies/sport' )
                            }
                })
}) // it flatStore.connect Duplicate relation information



it ( 'flatStore: connect. Short list of links', () => {
        // Setup all flatRows first
        flatStore.look ( ({ name, flatData, breadcrumbs, next }) => {
                        const testList = [ 'root', 'personal', 'hobbies', 'music' ];
                        if ( !testList.includes(name) )   return next ()    // Ignore part of the data 
                        flatStore.set ( name, flatData )  // copy a not filtered flatData
                        if ( breadcrumbs.includes('/') )   flatStore.connect ([ breadcrumbs ]) // copy the connection
                        return next ()   // Call 'look' fn once per flatRow
                })
        
        const result = flatIO.getSelection ();
        result.forEach ( line => {
                        const [ name, data, breadcrumbs, edges ] = line;

                        if ( name === 'root' ) { 
                                expect ( edges ).to.have.length ( 1 )  // Some of the objects are missing. Operation 'connect' to missing objects should be ignored;
                                expect ( data ).to.have.property ( 'name' )
                                expect ( data.name ).to.be.equal ( 'Peter' )
                            }

                        if ( name === 'personal' ) {
                                expect ( breadcrumbs ).to.be.equal ( 'root/personal' )
                                expect ( edges ).to.contains ( 'root/personal/hobbies' )
                            }
                        if ( name === 'hobbies' ) {
                                expect ( edges ).to.have.length ( 1 )
                                expect ( edges[0]).to.be.equal ( 'root/personal/hobbies/music' )
                            }
                })
}) // it flatStore.connect short list of links



it ( 'flatStore: look ', () => {
    let i = 0;
    flatStore.look ( ({empty}) => empty ? null : i++ ) // Count of the object properties. Some objects don't have own properties. Such objects will provide 'empty' property to 'look' fn
    expect ( i ).to.be.equal ( 17 )  // Number of properties in the data 
}) // it flatStore.look



it ( 'flatStore: look with next()', () => {
    let i = 0;
    flatStore.look ( ({empty, next }) => { 
                            if ( !empty )   i++   // Count of the object properties. Some objects don't have own properties. Such objects will provide 'empty' property to 'look' fn;
                            return next ()        // Call 'look' fn once per flatRow;
                })
    expect ( i ).to.be.equal ( 6 )  // Number of flatRows in the data 
}) // it flatStore.look with next()



it ( 'flatStore: get', () => {
    let list = [];
    flatStore
        .get ( 'root/personal/sizes' )
        .look ( ({value}) => list.push(value)   )

    expect ( list ).to.have.length ( 4 )
    expect ( list ).to.contains ( 10 )
    expect ( list ).to.contains ( 44 )
    expect ( list ).to.contains ( 'm' )
}) // it flatStore.get



it ( 'flatStore: get. Breadcrumbs does not exist', () => {
    let list = [];
    
    flatStore
        .get ( 'root/personal/size' )
        .look ( ({value}) => list.push(value)   )

    expect ( list ).to.have.length ( 0 )
}) // it flatStore.get, no such breadcrumbs



it ( 'flatStore: find', () => {
    let i = 0;
    flatStore
        .find ( 'personal' )
        .look (({empty}) => empty ? null : i++ )   // Function 'find' will search for objects with name 'personal' and will start 'look' fn against 'personal' properties only;
    expect ( i ).to.be.equal ( 2 )                 // In our case properties are 'age' and 'eyes'.

    // after call of 'look', scanList should be reset to default
    i = 0
    flatStore.look ( ({key}) => { if (key!=null) i++ })   // Count of the object properties. Some objects don't have own properties. Such objects will provide 'empty' property to 'look' fn
    expect ( i ).to.be.equal ( 17 )
}) // it flatStore.find



it ( 'flatStore: from', () => {
    let i = 0;
    flatStore
       .from ( 'root/personal' )
       .look (({empty}) => empty ? null : i++ )   // Function 'from' will start to search for object and properties from 'root/personal' location and going deeper; 
    expect ( i ).to.be.equal ( 13 )
}) // it flatStore.from



it ( 'flatStore: like. Single word.', () => {
    let i = 0;
    flatStore
       .like ('sic')
       .look ( () => i++ )
    expect ( i ).to.be.equal ( 4 )
}) // it flatStore.like single



it ( 'flatStore: like. Multiple words.', () => {
    let i = 0;
    flatStore
        .like (['sic', 'sp'])
        .look ( () => i++ )
    expect ( i ).to.be.equal ( 7 )
}) // it flatStore.like multiple




it ( 'flatIO: setup a filter, flatStore: use', () => {
    let i = 0;
    flatIO.setupFilter ( 'custom', ({name}) => { 
                                if ( name === 'music' )   return true
                                return false
                            })

    flatStore.use ( 'custom' ).look ( () => i++ )
    expect ( i ).to.be.equal ( 4 )
}) // it flatIO.setupFilter, flatStore.use



it ( 'flatStore: try to use a non-existing filter', () => {
    let i = 0;
    flatStore
        .use ( 'some' )
        .look ( ({next}) => {
                    i++ 
                    return next ()
                })
    expect ( i ).to.be.equal ( 7 ) // will be executed on each dt-line
}) // it flatStore.use a non-existing filter

}) // describe
