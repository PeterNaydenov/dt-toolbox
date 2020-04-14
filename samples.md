# Board 

Place to play with technology interface:

```js







let search1 = {  // desire structure 1 - flat structure
                      a : 'something'
                    , b : 'ala-bala'
                    , u : 64
                    , um : 11
                    , u2 : 66
                    , um2 : 77
                }

//  --> how to achive it?
dtbox
  .select ()
  .debug () // use during development. Will  show data/structure/both
  .data ( 8 )
  .rename ( x => (`${x}2`))
  .data ( 7 )
  .data ( 0 )
  .flat ()  // call for flat structure
  // flat == .structure ( [[ 'object'], 0 ] )
  .spread ( 'standard', x=> result = x )
  .spread ( '')

  


  /**
   *  flat () -> Macros. Will create a new structure for 'spread' purposes and will rename properties to 
   *            object-holder to '0'.
   *  Field '_select' will be much more complex:
   *    _select = {
   *                      structure : [ 'object', 0 ]
   *                    , data: [
   *                                ['root/8/um', 'root/0/um2' ] - where index '0' original data placeholder. 
   *                                                              Index '1' is the new name
   *                                ['root/8/u, 'root/0/u2']
   *                            ]
   *                }
   * 
   * 
   * 
   *  other predefined structure function:
   *  - startwith ( 7 ) - start with object 7 and follow the original structure
   *            _select.structure : [
   *                                   [ 'object',    7, [8, 'properties'] ]
   *                                 , [ 'object',    8  ] // no more data-structures.
   *                               ] 
   *            Param 'i' doesn't matter for structure execution.  Evaluation always starts from first row.
   * 
  */



 dtbox
     .select () // Starts a new selection
     .debug ('data') // use it during development process. Will console log data/structure/both
     .prop ('7/u')   // Add to selection prop '7u'
     .object ( 8 )  // Add object 8 to selection
     .rename ( x => {
                        if ( x.includes(8) ) {
                                    let data = x.split ( '/' )
                                    return `root/0/data[2]`
                                }
                        return x
                    })
     
 

rename (8/u -> 8/u2)
rename (8/um -> 8/um2)
move (8 to 7)
move (7 to 0)
build(0) // where to start building the object
/*
    Library will break all objects into flat data and 
    Structure provides 
*/





```