/**
 *   Testing the dt-toolbox library
 * 
 */



import { expect } from "vitest"
import dtbox from "../src/main.js"



const a = {
    city : 'Varna'
  , desc: 'Big city on the Black-sea seaside'
  , location : {
                    continent: 'Europe'
                  , country : 'Bulgaria'
      
          }
  , extra : {
                port    : 'Yes'
              , airport : 'Yes'
              , 'nearTo' : [ 'Burgas', 'Shumen', 'Dobrich' ]
          }
};


describe ( 'Queries', () => {



it ( 'Mulitple queries from a single dt-object in same', () => {

    const store = dtbox.init ( { 
                                  city: 'Varna'
                                , desc: 'Big city on the Black-sea seaside'
                            });
    store.insertSegment ( 'location', dtbox.init(a.location))
    store.insertSegment ( 'extra'   , dtbox.init(a.extra))



    function querySegment ( store, segmentName ) {
                        store
                                 .from ( segmentName )
                                 .look ( ({ name, flatData, breadcrumbs, next }) => {
                                            if ( name === segmentName ) {
                                                    store.set ( 'root', flatData )
                                                    return next ()  
                                                }
                                            store.set ( name, flatData )
                                            const splitBr = breadcrumbs.split('/')
                                            const br = breadcrumbs.replace ( `${splitBr[0]}/`, 'root/' )
                                            store.connect ([ br ])
                                            return next ()
                                    })
        } // querySegment func.

    const r1 = store.query ( querySegment, 'extra' ).model ( () => ({ as :'std' }))
    const r2 = store.query ( querySegment, 'location' ).model ( () => ({ as :'std' }))

    expect ( r1 ).toHaveProperty ( 'port' )
    expect ( r1 ).toHaveProperty ( 'airport' )
    expect ( Array.isArray ( r1.nearTo ) ).toBe ( true )
    expect ( r1.nearTo ).toContain ( 'Burgas' )
    
    expect ( r2 ).toHaveProperty ( 'continent' )
    expect ( r2 ).toHaveProperty ( 'country' )
    
}) // it Mulitple queries



it ( 'Set dt-lines by path: same names in different places', () => {
    const r = dtbox.init ({ a: 1 }).query ( store => {
                        store.set ( 'root', {} )
                        store.set ( 'root/users', [] )
                        store.set ( 'root/users/0', { id: 0 } )
                        store.set ( 'root/users/0/tags', [ 'a' ] )
                        store.set ( 'root/users/1', { id: 1 } )
                        store.set ( 'root/users/1/tags', [ 'b' ] )
                })

    expect ( r.model ( () => ({ as: 'std' }) ) ).toEqual ({ users: [ { id: 0, tags: [ 'a' ] }, { id: 1, tags: [ 'b' ] } ] })
    expect ( r.index ( 'root/users/1/tags' ) ).toEqual ([ 'tags', [ 'b' ], 'root/users/1/tags', [] ])
    expect ( r.index ( 'root/users' )[3] ).toEqual ([ 'root/users/0', 'root/users/1' ])
}) // it set by path



it ( 'Set dt-lines by path: save and push use the path', () => {
    const r = dtbox.init ({ a: 1 }).query ( store => {
                        store.set ( 'root', {} )
                        store.set ( 'root/a', {} )
                        store.set ( 'root/a/list', [] )
                        store.set ( 'root/b', {} )
                        store.set ( 'root/b/list', [] )
                        store.save ( 'root/a', 'name', 'first' )
                        store.push ( 'root/b/list', 'x' )
                })
    expect ( r.model ( () => ({ as: 'std' }) ) ).toEqual ({ a: { name: 'first', list: [] }, b: { list: [ 'x' ] } })
}) // it set by path, save and push



it ( 'Set dt-lines by path: set the same path again replaces the data, keeps the children', () => {
    const r = dtbox.init ({ a: 1 }).query ( store => {
                        store.set ( 'root', {} )
                        store.set ( 'root/user', { name: 'Peter' } )
                        store.set ( 'root/user/tags', [ 'a' ] )
                        store.set ( 'root/user', { name: 'Ivan' } )
                })
    expect ( r.model ( () => ({ as: 'std' }) ) ).toEqual ({ user: { name: 'Ivan', tags: [ 'a' ] } })
    expect ( r.export ().length ).toBe ( 3 )
}) // it set by path again



it ( 'Set dt-lines by path: mix with name and connect', () => {
    const r = dtbox.init ({ a: 1 }).query ( store => {
                        store.set ( 'root', {} )
                        store.set ( 'profile', { name: 'Peter' } )
                        store.connect ([ 'root/profile' ])
                        store.set ( 'root/profile/address', { city: 'Sofia' } )   // Parent was connected by name
                })
    expect ( r.model ( () => ({ as: 'std' }) ) ).toEqual ({ profile: { name: 'Peter', address: { city: 'Sofia' } } })
}) // it set by path mixed



it ( 'Set dt-lines by path: without parent works as before', () => {
    const r = dtbox.init ({ a: 1 }).query ( store => {
                        store.set ( 'root', {} )
                        store.set ( 'missing/data', { x: 1 } )   // No 'missing' dt-line: a name with '/', as before
                })
    expect ( r.model ( () => ({ as: 'std' }) ) ).toEqual ({ 'missing/data': { x: 1 } })
}) // it set by path without parent

}) // describe dt-toolbox


