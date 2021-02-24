function reduceTuples ( dependencies, breadcrumbData ) {
    const { help } = dependencies;
    let  tupleKeys = Object.keys ( breadcrumbData );

    return tupleKeys.reduce ( (res,k) => {
                                let 
                                      arr = k.substr(5).split('/')
                                    , ln = arr.length
                                    , lastEl = arr[ln-1]
                                    ;
                                if ( help.hasNumbers([lastEl]) )   arr.pop ()    
                                res.push ( [ arr.join('/'), breadcrumbData[k]])
                                return res
                        },[])
} // reduceTuples func.



module.exports = reduceTuples


