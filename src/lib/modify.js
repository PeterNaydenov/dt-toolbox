function modify ( dependencies, main, addData ) {
    // ***   Modify add | update | overwrite | insert | append | prepend | combine
            const
                  { action, convert, help, modifier } = dependencies 
                , mainData = convert.to ( 'midFlat', dependencies, [main.structure, main.value])
                , update   = convert.to ( 'midFlat', dependencies, [addData.structure, addData.value] )
                ;
                
            let result;
            main._error = main._error.concat ( addData._error )
            result = modifier[action] ( mainData, update )

            let [structure, value ] = convert.from ( 'midFlat').toFlat ( dependencies, result )
            main.structure = help.copyStructure ( structure )
            main.value = value
            return main
} // modify func.



module.exports = modify


