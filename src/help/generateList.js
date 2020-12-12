function* generateList ( id, value) {
    // *** Generates array description for every property of object 'value'.
                for ( let key in value ) {
                        yield [ id, key, value[key] ]
                    }
} // generateList func*.



module.exports = generateList


    