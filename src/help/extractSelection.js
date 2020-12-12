function extractSelection ( data ) {
    let selectionKeys = data._select.value;
    return selectionKeys.reduce ( (res,key) => {
                            res[key] = data.value[key]
                            return res     
                },{})
} // extractSelection func.


module.exports = extractSelection


