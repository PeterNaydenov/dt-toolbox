"use strict";



const simple = {    // * Simple instruments
    
      notObject : function notObject ( str ) {
            let result = false
            if ( str == null               ) { result = true }
            if ( typeof str == 'string'    ) { result = true }
            if ( typeof str == 'number'    ) { result = true }
            if ( typeof str == 'boolean'   ) { result = true }
            if ( typeof str == 'function'  ) { result = true }
            return result
        } // notObject func.
    
    
    
    , isObject    : str  => !simple.notObject(str)
    , copy        :  obj => JSON.parse ( JSON.stringify(obj) ) 
    , folderKind  : test => test instanceof Array ? 'array' : 'object'
    , getIterator : list => Object.keys ( list )
    


    , removeLast ( path ) {
                          let list = path.split('/')
                          list.pop()
                          return list.join('/')
      }  // removeLast func.
    


    , getPenult ( path ) {
                          let list = path.split ( '/' )
                          list.pop()
                          return list.pop()
      }  // getPenult func.
    


    , getUlt ( path ) {
                          let list = path.split ( '/' )
                          return list.pop()
      }  // getUlt func.
     
    } // simple


    module.exports = simple