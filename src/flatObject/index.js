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
                    , export : ex     ( dependencies, flatIO )                // Returns a flat data;
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
                        // 1) Try the exact dt-line first
                        let r  = flatIO.getLine ( n )
                        if ( r ) {
                              let [ name, d, breadcrumbs, links ] = r;
                              let copy;
                              if ( d === null || d === undefined )   copy = d
                              else if ( typeof d !== 'object' )      copy = d
                              else if ( d instanceof Array )        copy = [...d]
                              else                                   copy = {...d}
                              return [ name, copy, breadcrumbs, [...links] ]
                          }
                        // 2) Try a scalar property on a parent dt-line.
                        // E.g. 'root/a' for the 'a' property of the 'root' dt-line,
                        // which lives in root flatData, not as its own dt-line.
                        const lastSlash = n.lastIndexOf ( '/' )
                        if ( lastSlash > 0 ) {
                                const parentBr  = n.slice ( 0, lastSlash )
                                const propName  = n.slice ( lastSlash + 1 )
                                const parent    = flatIO.getLine ( parentBr )
                                if ( parent ) {
                                        const [ , parentData ] = parent
                                        if ( parentData && typeof parentData === 'object' && !Array.isArray(parentData)
                                                && Object.prototype.hasOwnProperty.call ( parentData, propName ) ) {
                                                const value = parentData[ propName ]
                                                let copy
                                                if ( value === null || value === undefined )  copy = value
                                                else if ( typeof value !== 'object' )           copy = value
                                                else if ( value instanceof Array )             copy = [...value]
                                                else if ( value instanceof Date )              copy = new Date ( value.getTime () )
                                                else if ( value instanceof RegExp )             copy = new RegExp ( value.source, value.flags )
                                                else                                            copy = { ...value }
                                                return [ propName, copy, n, [] ]
                                            }
                                    }
                            }
                        return null
                    } // index func.

        objectAPI [ 'extractList' ] = extractList ( dependencies, flatIO, index )
        return objectAPI
    } // flatObject func.



export default flatObject


