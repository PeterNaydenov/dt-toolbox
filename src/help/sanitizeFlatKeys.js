function sanitizeFlatKeys ( list ) {   // fn(string[]) -> string[]
    // *** Sanitize 'file' and 'breadcrumb' data-type keys. Adds 'root/' and indexes where it is needed
            let keys = list.map ( x => {  // Keys should start with 'root/'
                            let key = x.split ( '/' )
                            if ( key[0] != 'root' )   return [ 'root', ...key].join('/')
                            else                      return key.join ( '/' )
                    })
            let 
                  usedKeys = []
                , duplicatedKeys = new Set()
                ;
            keys.forEach ( k => {
                            if ( usedKeys.includes(k) )    duplicatedKeys.add(k)
                            else                           usedKeys.push ( k )
                    })
            for (const marker of duplicatedKeys ) {
                            let counter = 0;
                            keys = keys.map ( k => {
                                                if ( k == marker )   return `${k}/${counter++}`
                                                else                 return k
                                        })
                    }
            return keys
} // sanitizeFlatKeys func.



module.exports = sanitizeFlatKeys


