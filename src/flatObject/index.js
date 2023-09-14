'use strict'



import insert      from './insert.js'
import ex          from './export.js'
import copy        from './copy.js'
import model       from './model.js'
import query       from './query.js'
import setupFilter from './setupFilter.js'
import extractList from './extractList.js'





function flatObject ( dependencies, d ) {
        const 
              { flatData } = dependencies ()
            , [ flatIO, flatStore ]   = flatData ( dependencies, d )
            , objectAPI = {
                    // I/O Operations
                      insertSegment : insert ( dependencies, flatIO )         // Extends available data with new data segment;
                    , export : ex     ( dependencies, flatIO )                // Returns flat data;
                    , copy   : copy   ( dependencies, flatIO )                // Creates deep copy of original data
                    , model  : model  ( dependencies, flatIO, flatStore )      // Arrange data according specific data-model. Model should come as a function;
                    , query  : query  ( dependencies, flatIO, flatStore )      // Request, and evaluate data. Returns a new flat object;
                    , setupFilter : setupFilter ( flatIO )                    // Functions should filter content according some criteria. Generated indexes will help for data search in
                    , listSegments  : () =>  {
                                    const ix = Object.keys ( flatIO.getIndexes() );
                                    return ix.reduce ( (res,item) => {
                                                              if ( item.includes('/') )   return res
                                                              res.push ( item )
                                                              return res
                                                        }, [] )
                                }
                    , index
                }
            ;

        function index ( n ) {
                        if ( n == null )   return null
                        let r  = flatIO.getLine ( n )
                        if ( r ) {
                              let [ name, d, breadcrumbs, links ] = r;
                              let copy;
                              if ( d instanceof Array )   copy = [...d ]
                              else                        copy = {...d }
                              return [ name, copy, breadcrumbs, [...links] ]
                          }
                        else return null
            } // index func.
            
        objectAPI [ 'extractList' ] = extractList ( dependencies, flatIO, index )
        return objectAPI
    } // flatObject func.



export default flatObject


