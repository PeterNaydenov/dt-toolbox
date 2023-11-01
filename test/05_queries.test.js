/**
 *   Testing the dt-toolbox library
 * 
 */



import { expect } from "chai"
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

    expect ( r1 ).to.have.property ( 'port' )
    expect ( r1 ).to.have.property ( 'airport' )
    expect ( r1.nearTo ).to.be.an('array').that.includes ( 'Burgas' )
    
    expect ( r2 ).to.have.property ( 'continent' )
    expect ( r2 ).to.have.property ( 'country' )
    
}) // it Mulitple queries

}) // describe dt-toolbox


