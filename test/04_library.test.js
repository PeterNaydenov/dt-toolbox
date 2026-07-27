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


describe ( 'DT-Toolbox', () => {



it ( 'Init', () => {

    const store = dtbox.init ( a );

    // Store should have these methods:
    expect ( store ).toHaveProperty ( 'insertSegment' )
    expect ( store ).toHaveProperty ( 'export' )
    expect ( store ).toHaveProperty ( 'copy' )
    expect ( store ).toHaveProperty ( 'model' )
    expect ( store ).toHaveProperty ( 'query' )
    expect ( store ).toHaveProperty ( 'setupFilter' )
}) // it init 



it ( 'Init with non-existing model', () => {
    // Bug fix: unknown models used to silently return null. init() still
    // returns null (per existing API) because the user's data wasn't valid
    // for any model. flat() and convert() throw instead.
    const store = dtbox.init ( a , { model: 'halo' });
    expect ( store ).toBeNull ()
})



it ( 'Export', () => {
    const 
          store = dtbox.init ( a )
        , b = { shoes : [ 'Puma', 'UA'] }
        ;
    let i = 0;

    store.insertSegment ( 'extra', dtbox.init(b) )
    const res = store.export ();

    expect ( res ).toHaveLength ( 6 )
    res.forEach ( line => {
                    const [ name, d, breadcrumbs, edges ] = line;

                    if ( name === 'extra' && breadcrumbs!='extra' ) {
                            expect ( d ).toHaveProperty ( 'port' )
                            expect ( d ).toHaveProperty ( 'airport' )
                            expect ( edges ).toHaveLength ( 1 )
                            expect ( edges[0]).toBe ( 'root/extra/nearTo' )
                            i++
                        }
                    if ( name === 'nearTo' ) {
                            expect ( d ).toHaveLength ( 3 )
                            i++
                        }
                    if ( name == 'extra' && name === breadcrumbs ) {
                            expect ( edges ).toContain ( 'extra/shoes' )
                            i++
                        }
        })
    expect ( i ).toBe ( 3 )
}) // it Export



it ( 'Export. Single data segment', () => {
    const 
          store = dtbox.init ( a )
        , b = { shoes : [ 'Puma', 'UA'] }
        ;
    let i = 0;

    store.insertSegment ( 'extra', dtbox.init(b) )
    const res = store.export ('extra');

    expect ( res ).toHaveLength ( 2 )
    res.forEach ( line => {
                const [name, d, breadcrumbs, edges ] = line;

                if ( name === 'root' ) {
                            expect ( breadcrumbs ).toBe ( 'root' )
                            expect ( edges ).toContain ( 'root/shoes' )
                            i++
                    }
                if ( name === 'shoes' ) {
                            expect ( breadcrumbs ).toBe ( 'root/shoes' )
                            expect ( d ).toHaveLength ( 2 )
                            i++
                    }
            }) // forEach res
    expect ( i ).toBe ( 2 )
}) // it. Export. Single data segment



it ( 'Export a non existing data segment', () => {
    const 
          store = dtbox.init ( a )
        , b = { shoes : [ 'Puma', 'UA'] }
        ;
    store.insertSegment ( 'extra', dtbox.init(b) )
    const res = store.export ('extraData');

    expect ( res ).toHaveLength ( 0 )
}) // it. Export a non existing data segment



it ( 'Copy. Extra data segment', () => {
    const 
          store = dtbox.init ( a )
        , b = { shoes : [ 'Puma', 'UA'] }
        ;
    let i = 0;

    store.insertSegment ( 'extra', dtbox.init(b) )
    const res = store.copy ( 'extra' );

    expect ( res ).toHaveProperty ( 'shoes' )
    expect ( res.shoes ).toContain ( 'UA')
    expect ( res.shoes ).toContain ( 'Puma')
}) // it. Copy. Extra data segment



it ( 'Flat. No options', () => {
    let res = dtbox.flat ( a );
    let i = 0;

    expect ( res ).toHaveLength ( 4 )
    res.forEach ( line => {
                    const [ name, d, breadcrumbs, edges ] = line;

                    if ( name === 'extra' ) {
                            expect ( d ).toHaveProperty ( 'port' )
                            expect ( d ).toHaveProperty ( 'airport' )
                            expect ( edges ).toHaveLength ( 1 )
                            expect ( edges[0]).toBe ( 'root/extra/nearTo' )
                            i++
                        }
                    if ( name === 'nearTo' ) {
                            expect ( d ).toHaveLength ( 3 )
                            i++
                        }
        })
    expect ( i ).toBe ( 2 )
}) // it flat



it ( 'Flat with options -> wrong model name', () => {
    // Bug fix: unknown models used to silently return null. They now throw.
    expect ( () => dtbox.flat ( a, { model:'extra'} ) ).toThrow ( /data-model/ )
}) // it flat with wrong model name



it ( 'Flat with options -> missing model parameter', () => {
    let res = dtbox.flat ( a, { nn:'extra'} );
    // Should be treated as 'std' model
    expect ( res ).toHaveLength ( 4 )
}) // it flat with wrong options



it ( 'Convert. Single option "as"', () => {
    // Using convert without options is an unefficient way to create copy of the provided object
    // Default settings for options 'model' and 'as' -> 'std';
    // Option 'model' -> incomming model
    // Option 'as'    -> outgoing model
    let res = dtbox.convert ( a, {as:'breadcrumbs'});   // set the outgoing model
    
    expect ( res ).toHaveProperty ( 'extra/airport' )
    expect ( res ).toHaveProperty ( 'extra/nearTo/2' )
    expect ( res ).toHaveProperty ( 'location/country' )
}) // it convert, option 'as'



it ( 'Convert. Options: "model" and "as"', () => {
    // Using convert without options is an unefficient way to create copy of the provided object
    // Default settings for options 'model' and 'as' -> 'std';
    // Option 'model' -> incomming model
    // Option 'as'    -> outgoing model
    let res = dtbox.convert ( a, { model:'std', as:'breadcrumbs'});   // set the outgoing model
    
    expect ( res ).toHaveProperty ( 'extra/airport' )
    expect ( res ).toHaveProperty ( 'extra/nearTo/2' )
    expect ( res ).toHaveProperty ( 'location/country' )
}) // it convert, option 'as'


it ( 'Convert. Wrong outgoing model', () => {
    // Bug fix: wrong models used to silently return null. They now throw.
    expect ( () => dtbox.convert ( a, { as:'none'}) ).toThrow ( /data-model/ )
}) // it convert, wrong outgoing model



it ( 'Convert. Wrong outgoing model', () => {
    // Bug fix: wrong models used to silently return null. They now throw.
    expect ( () => dtbox.convert ( a, { model:'none'}) ).toThrow ( /data-model/ )
}) // it convert, wrong outgoing model


it ( 'Segment list', () => {
    let res = dtbox.init ( a );
    res.insertSegment ( 'extraData', dtbox.init({ port: 1234, airport: 'JFK' }) )
    const list = res.listSegments ();
    expect ( list ).toHaveLength ( 2 )
    expect ( list ).toContain ( 'extraData' )
}) // it load



}) // describe dt-toolbox


