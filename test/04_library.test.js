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


describe ( 'DT-Toolbox', () => {



it ( 'Init', () => {

    const store = dtbox.init ( a );

    // Store should have these methods:
    expect ( store ).to.have.property ( 'insertSegment' )
    expect ( store ).to.have.property ( 'export' )
    expect ( store ).to.have.property ( 'copy' )
    expect ( store ).to.have.property ( 'model' )
    expect ( store ).to.have.property ( 'query' )
    expect ( store ).to.have.property ( 'setupFilter' )
}) // it init 



it ( 'Init with non-existing model', () => {
    const store = dtbox.init ( a , { model: 'halo' });
    expect ( store ).to.be.null
})



it ( 'Export', () => {
    const 
          store = dtbox.init ( a )
        , b = { shoes : [ 'Puma', 'UA'] }
        ;
    let i = 0;

    store.insertSegment ( 'extra', dtbox.init(b) )
    const res = store.export ();

    expect ( res ).to.have.length ( 6 )
    res.forEach ( line => {
                    const [ name, d, breadcrumbs, edges ] = line;

                    if ( name === 'extra' && breadcrumbs!='extra' ) {
                            expect ( d ).to.have.property ( 'port' )
                            expect ( d ).to.have.property ( 'airport' )
                            expect ( edges ).to.have.length ( 1 )
                            expect ( edges[0]).to.be.equal ( 'root/extra/nearTo' )
                            i++
                        }
                    if ( name === 'nearTo' ) {
                            expect ( d ).to.have.length ( 3 )
                            i++
                        }
                    if ( name == 'extra' && name === breadcrumbs ) {
                            expect ( edges ).to.contains ( 'extra/shoes' )
                            i++
                        }
        })
    expect ( i ).to.be.equal ( 3 )
}) // it Export



it ( 'Export. Single data segment', () => {
    const 
          store = dtbox.init ( a )
        , b = { shoes : [ 'Puma', 'UA'] }
        ;
    let i = 0;

    store.insertSegment ( 'extra', dtbox.init(b) )
    const res = store.export ('extra');

    expect ( res ).to.have.length ( 2 )
    res.forEach ( line => {
                const [name, d, breadcrumbs, edges ] = line;

                if ( name === 'root' ) {
                            expect ( breadcrumbs ).to.be.equal ( 'root' )
                            expect ( edges ).to.contains ( 'root/shoes' )
                            i++
                    }
                if ( name === 'shoes' ) {
                            expect ( breadcrumbs ).to.be.equal ( 'root/shoes' )
                            expect ( d ).to.have.length ( 2 )
                            i++
                    }
            }) // forEach res
    expect ( i ).to.be.equal ( 2 )
}) // it. Export. Single data segment



it ( 'Export a non existing data segment', () => {
    const 
          store = dtbox.init ( a )
        , b = { shoes : [ 'Puma', 'UA'] }
        ;
    store.insertSegment ( 'extra', dtbox.init(b) )
    const res = store.export ('extraData');

    expect ( res ).to.have.length ( 0 )
}) // it. Export a non existing data segment



it ( 'Copy. Extra data segment', () => {
    const 
          store = dtbox.init ( a )
        , b = { shoes : [ 'Puma', 'UA'] }
        ;
    let i = 0;

    store.insertSegment ( 'extra', dtbox.init(b) )
    const res = store.copy ( 'extra' );

    expect ( res ).to.have.property ( 'shoes' )
    expect ( res.shoes ).to.contains ( 'UA')
    expect ( res.shoes ).to.contains ( 'Puma')
}) // it. Copy. Extra data segment



it ( 'Flat. No options', () => {
    let res = dtbox.flat ( a );
    let i = 0;

    expect ( res ).to.have.length ( 4 )
    res.forEach ( line => {
                    const [ name, d, breadcrumbs, edges ] = line;

                    if ( name === 'extra' ) {
                            expect ( d ).to.have.property ( 'port' )
                            expect ( d ).to.have.property ( 'airport' )
                            expect ( edges ).to.have.length ( 1 )
                            expect ( edges[0]).to.be.equal ( 'root/extra/nearTo' )
                            i++
                        }
                    if ( name === 'nearTo' ) {
                            expect ( d ).to.have.length ( 3 )
                            i++
                        }
        })
    expect ( i ).to.be.equal ( 2 )
}) // it flat



it ( 'Flat with options -> wrong model name', () => {
    let res = dtbox.flat ( a, { model:'extra'} );
    expect ( res ).to.be.null
}) // it flat with wrong model name



it ( 'Flat with options -> missing model parameter', () => {
    let res = dtbox.flat ( a, { nn:'extra'} );
    // Should be treated as 'std' model
    expect ( res ).to.have.length ( 4 )
}) // it flat with wrong options



it ( 'Convert. Single option "as"', () => {
    // Using convert without options is an unefficient way to create copy of the provided object
    // Default settings for options 'model' and 'as' -> 'std';
    // Option 'model' -> incomming model
    // Option 'as'    -> outgoing model
    let res = dtbox.convert ( a, {as:'breadcrumbs'});   // set the outgoing model
    
    expect ( res ).to.have.property ( 'extra/airport' )
    expect ( res ).to.have.property ( 'extra/nearTo/2' )
    expect ( res ).to.have.property ( 'location/country' )
}) // it convert, option 'as'



it ( 'Convert. Options: "model" and "as"', () => {
    // Using convert without options is an unefficient way to create copy of the provided object
    // Default settings for options 'model' and 'as' -> 'std';
    // Option 'model' -> incomming model
    // Option 'as'    -> outgoing model
    let res = dtbox.convert ( a, { model:'std', as:'breadcrumbs'});   // set the outgoing model
    
    expect ( res ).to.have.property ( 'extra/airport' )
    expect ( res ).to.have.property ( 'extra/nearTo/2' )
    expect ( res ).to.have.property ( 'location/country' )
}) // it convert, option 'as'


it ( 'Convert. Wrong outgoing model', () => {
    let res = dtbox.convert ( a, { as:'none'});
    expect ( res ).to.be.null
}) // it convert, wrong outgoing model



it ( 'Convert. Wrong outgoing model', () => {
    let res = dtbox.convert ( a, { model:'none'});
    expect ( res ).to.be.null
}) // it convert, wrong outgoing model


it ( 'Segment list', () => {
    let res = dtbox.init ( a );
    res.insertSegment ( 'extraData', dtbox.init({ port: 1234, airport: 'JFK' }) )
    const list = res.listSegments ();
    expect ( list ).to.have.length ( 2 )
    expect ( list ).to.contains ( 'extraData' )
}) // it load



}) // describe dt-toolbox


