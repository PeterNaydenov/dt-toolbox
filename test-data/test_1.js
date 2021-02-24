module.exports = {
    a : 'test-value-1'
  , b : 'test-value-2'
  , c : [
              'inArray-1'
            , 'inArray-2'
         ]
  , d : function () { console.log('ale') }
  , set : {
                deep    : 0
              , more    : false
              , ah      : 'abra-cadabra'
              , grind   : function () { console.log ( 'GRINDAAA') }
              , options : {
                                select  : 'all'
                              , more    : [ 12, 55, 128 ] 
                              , deep    : '9999'
                              , options : { select : 33 }
                              , title   : 'harizma'
                              , ah      : [44,66]
                          }
           }
}