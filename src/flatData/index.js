'use strict'

import insert      from './insert.js'
import ex          from './export.js'
import setupFilter from './setupFilter.js'

import fr   from './from.js'
import use  from './use.js'
import find  from './find.js'
import like from './like.js'
import look from './look.js'
import get  from './get.js'

// Default filters
import list       from './filters/list.js'
import listObject from './filters/listObject.js'
import object     from './filters/object.js'
import root       from './filters/root.js'



function flatData ( dependencies, d ) {
          const 
              [ indexes, flatData ] = d
            , flatStorage = [ indexes, flatData ]
            , filters =  {} // { filterName : [selected flat items] }
            , filterFn = { list, listObject, object, root } // { filter functions}
            ;

        let 
              scanList  = flatData   // Where 'look' function will be executed;
            , unique    = true       // All breadcrumbs are unique, so the index holds every dt-line
            , names     = null       // Index by name: Map name → dt-lines in flatData order
            , nameRequests = 0
            ;
            
        const  
                getFilterNames = () => Object.keys ( filterFn )
              , filtering = ( filterName, line ) => {
                            if ( filterFn[filterName] ) {
                                                  const [ name, flatData, breadcrumbs, edges ] = line;
                                                  if ( !filters[filterName]   )   filters[filterName] = []
                                                  if ( filterFn[filterName]({name, flatData, breadcrumbs, edges}) ) {
                                                            const item = indexes[breadcrumbs];
                                                            filters[filterName].push ( item )
                                                      }
                                }
                      }
              ;
  
        // Apply default filters
        const filterNames = getFilterNames ();
        filterNames.forEach ( name => flatData.forEach ( line => filtering(name, line)   ))
        // Repeated breadcrumbs (a hand-made DT-model, drafts with a repeated name, keys with '/'):
        // the index keeps only the last dt-line, so an earlier one is not its index entry
        unique = flatData.every ( line => indexes[line[2]] === line )

        const 
              insertLines = insert ( flatStorage, filtering, getFilterNames )
            , flatIO_API = {
                          insert  : lines => {                                                           // Insert a new rows to existing flatData;
                                    if ( lines.some ( line => Object.hasOwn ( indexes, line[2] ) ) )   unique = false
                                    names = null   // Rebuilt on the next request
                                    insertLines ( lines )
                                    if ( !lines.every ( line => indexes[line[2]] === line ) )   unique = false
                                }
                        , export  : ex ( flatStorage )                                                   // Exports a copy of flatData;
                        , getIndexes    : () => indexes
                        , getLine       : k => Object.hasOwn ( indexes, k ) ? indexes[k] : null   // Own keys only: 'constructor' is not a dt-line
                        , getFilters    : () => filters
                        , getScanList   : () => scanList
                        , setupScanList : l =>  scanList = l
                        , setupFilter : setupFilter ( flatStorage, filterFn, filtering, getFilterNames )   // Add and apply a new filter function to flatData;
                        , resetScan     : () => { scanList = flatData }                                  // Reset the scanList to use all flatData;
                        , isFullScan    : () => scanList === flatData                                    // The scan-list contains all dt-lines;
                        , hasUniqueBreadcrumbs : () => unique                                            // When false, the index doesn't hold every dt-line;
                        , getNameIndex  : () => {                                                        // Built on the second request: a single `find` stays a plain scan;
                                    if ( names )   return names
                                    if ( ++nameRequests < 2 )   return null
                                    names = new Map ()
                                    flatData.forEach ( line => {
                                                const list = names.get ( line[0] );
                                                if ( list )   list.push ( line )
                                                else          names.set ( line[0], [ line ] )
                                        })
                                    return names
                                }
                    }
            
            , flatStore_API = {
                          // Query and Model functions will add methods related to new structure: set, connect, save, push;
                          from : fr ( flatIO_API )     // Scan: Scan deeper from object;
                        , use  : use ( flatIO_API )    // Scan: Use filter to select objects to scan;
                        , get  : get ( flatIO_API )    // Scan: Take a single object with specific breadcrumbs;
                        , find  : find ( flatIO_API  )   // Scan: String search for exact object name;
                        , like : like ( flatIO_API )   // Scan: String search in object name;
                        , look : look ( flatIO_API )   // Scan: Executes on each object property in the selection list;
                    }
            ;
        return [ flatIO_API , flatStore_API ]
  } // flatData func.



export default flatData


