/**
 *  Benchmark data sets. Built fresh for every run, so all versions get the same data.
 */



export const datasets = {
          // 20,000 small objects with an array each: many dt-lines, shallow
          'wide (20k objects)' : () => {
                        const o = {};
                        for ( let i = 0; i < 20000; i++ )   o[ 'k' + i ] = { id: i, name: 'n' + i, tags: [ 'a', 'b' ] }
                        return o
                }
          // A chain 2,000 levels deep: long breadcrumbs
        , 'deep (2k levels)' : () => {
                        const root = { v: 0 };
                        let cur = root;
                        for ( let i = 1; i < 2000; i++ ) {
                                cur.child = { v: i }
                                cur = cur.child
                            }
                        return root
                }
          // 3,000 records with nested objects and arrays: typical application data
        , 'mixed (3k records)' : () => ({
                        users : Array.from ( { length: 3000 }, ( _, i ) => ({
                                      id      : i
                                    , profile : { age: i % 90, city: 'c' + ( i % 50 ), address: { zip: String ( 10000 + i ), geo: [ i, i + 1 ] } }
                                    , roles   : [ 'r1', 'r2' ]
                                }))
                })
    };


