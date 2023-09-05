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
              [ copy, indexes, flatData ] = d
            , flatStorage = [ copy, indexes, flatData ]
            , filters =  {} // { filterName : [selected flat items] }
            , filterFn = { list, listObject, object, root } // { filter functions}
            ;

        let scanList  = flatData;   // Where 'look' function will be executed;
            
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

        const 
              flatIO_API = {
                          insert  : insert ( flatStorage, filtering, getFilterNames )                     // Insert a new rows to existing flatData;
                        , export  : ex ( flatStorage )                                                   // Exports a copy of flatData;
                        , getCopy : name => ( copy[name] ) ? copy[name] : null 
                        , getIndexes    : () => indexes
                        , getLine       : k => indexes[k] ? indexes[k] : null
                        , getFilters    : () => filters
                        , getScanList   : () => scanList
                        , setupScanList : l =>  scanList = l
                        , setupFilter : setupFilter ( flatStorage, filterFn, filtering, getFilterNames )   // Add and apply a new filter function to flatData;
                        , resetScan     : () => { scanList = flatData }                                  // Reset the scanList to use all flatData;
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


