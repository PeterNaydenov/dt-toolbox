function zipObject ( keys, values ) {   // (string[], string[] ) -> object
    // *** Conect two arrays in a single object
        return keys.reduce ( (res,k,i)  => {
                                let  val = Number (values[i]) ? parseInt(values[i]) : values[i];
                                res[k] = val
                                return res
                    }, {} )
} // zipObject func.



module.exports = zipObject


