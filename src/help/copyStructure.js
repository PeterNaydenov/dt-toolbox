function copyStructure ( structure ) {
    // *** Returns copy of the structure and preserve immutability
       let result = []
       structure.forEach ( (row,i) => {
                           result.push ( [] )
                           row.forEach ( item =>  result[i].push ( item )   )
               })
       return result
} // copyStructure func.



module.exports = copyStructure


