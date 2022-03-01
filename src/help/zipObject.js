function zipObject ( keys, values ) {   // (string[], string[] ) -> object
    // *** Conect two arrays in a single object
        return keys.reduce ( (res,k,i)  => {
                                let 
                                      income = values[i]
                                    , val
                                    ;
                                switch ( typeof income ) {
                                            case 'string' :
                                                    val = Number(income) || income
                                                    break
                                            default:
                                                    val = income
                                    }
                                res[k] = val
                                return res
                    }, {} )
} // zipObject func.



module.exports = zipObject


