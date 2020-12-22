# Upgrade to version 3

- инструкцията при конверсия също


## NEW IDEAS
- New internal data-models (main)
      - flat - use 2 object to describe - structure and value;
      - shortFlat - tuples of of structure and value objects: [structure, value];
      - midFlat - single description object. Key is breadcrumb, value is an object with simple key:value;
      - breadcrumbs - single description object. Describes only data. Structure could vary;
      - standard - standard JS object;
      - file - Array of breadcrumb/value;
- Генератор за празни дата структури
- Old internal data should be used only as import/export model. Model name will be named 'breadcrumbs'
- Secondary internal data-model: midFlat. Created to facilitate some operations.
- Write own convertors ( possible use: as data-bridge (data-model to data-model), data-modifier, filter, etc...)
- Method 'loadFast' was removed. Use 'load' instead. Now all loads are fast.
- Method 'spread' has a lot of changes. Instruction 'st' now is available as 'standard' or 'std'. Instruction 'dt' doesn't exists anymore. Instruction 'flat' will return selection in 'shortFlat' data-model;
- Rename method 'folder' to 'find';
- Rename method 'namespace' to 'folder'. Namespace could be depricated;


- Method 'replace'. Do changes and return them as main object;
- Method 'attach'. Attach result to specific place in original data;
- Method 'withSelection'. Prepare selection for modifiers. Before call `spread`
- Method 'flatten'. Mix all objects structures together. Use 'insert' to not loose information;
- Method 'keyPrefix'. Mix object name with keys in a way to not miss data origin;





```js
const st = {
              a: 'something'
            , b : 'ala-bala'
            , c : [
                        { el: 'name' , name: 'Peter'  }
                        { el: 'check', name: 'Ivan'   }
                        { el: 'name' , name: 'Georgi' }
                        { el: 'check', name: 'Stefan' }
                    ]
            , d : {
                          properties : { u: 64, um: 11, properties:{ u:66, um:77}}
                        , yo : 'message text'
                    }
        }

// structure is like DB. Can collect data but also can build relations. 
// Can keep data separated. Depends of request.
// During selection we should create new structure. Spread only purposes. Official structure should stay immutable.
// i - index of description in flatData
let structure = [
            //   type        i   object descriptors
              [ 'object',    0,  [1, c], [2, d]                 ]   // index 0! Data in pureMeta [root/0]
            , [ 'array' ,    1,  [3, 0], [4, 1], [5, 2], [6, 3] ]   // index 1 Array of objects
            , [ 'object',    2,  [7, 'properties']              ]   // index 2 Related to altMeta[0]
            // array 'c' members
            , [ 'object',    3  ] // no more data-structures.
            , [ 'object',    4  ] // no more data-structures.
            , [ 'object',    5  ]
            , [ 'object',    6  ]
            // object 'd'
            , [ 'object',    7, [8, 'properties'] ]
            , [ 'object',    8  ] // no more data-structures.
        ]
// Here is the flat data. Combination of the structure and data will rebuild the object        
let flatData = {
              'root/0/a'  : 'something'
            , 'root/0/b'  : 'ala-bala'
            , 'root/2/yo' : 'message text'
            , 'root/7/u'  : 64
            , 'root/7/um' : 11
            , 'root/8/u'  : 66
            , 'root/8/um' : 77
        }

```








## SELECTION CHANGES

Обектът за `_selection` ще трябва да се промени доста:
1. Трябва да съдържа структура
      стуктурата може да се базира на оригиналната или да е въведена 
      експлицитно от ползващия библиотеката по време на селекцията. 
      Тя е задължителна за процеса на конвертиране
2. Данните в нова селекция трябва да има два елемента. Единия ще пази оригиналното име на ключа. Него ще       
      използваме по време на spread процеса, за да извлечем данните от value. 
      Върху втория елемент може да правим модификации. По време на spread, той ще се използва за формиране
      името на ключа, съответно и местоположението му. Ако първият елемент е `root/2/name`, а втория е `root/0/updatedName`, означава че сме взели пропъртито `name` от обект `2` и сме прекръстили на `updatedName` и сме го сложили в основния обект `0`.
 За данните може да използваме следната транформация
Selection object
```js
// Use this during working with selections
a = new Set ([1,2,3])
[...a.entries()]  // returns -> [ [1,1], [2,2], [3,3] ]
```





## Midflat model

Той е обект от флат обекти. Изглежда така:

```js
const midFlat = {

            'root': {
                        id      : 234
                    }

            , 'root/profile' : {
                                  'name'   : 'Peter'
                                , 'age'    : 46 
                                , 'gender' : 'male'
                              }
          }

```


## Post Modifers
`Assemble` може да се осъщестестви непосредствено преди spread.
Въвеждаме функция withSelection(), която идва без параметри. Тя превръща селекцията в midFlat и го записва в `_select.result`. Върху него могат да бъдат изпълнени модификаторите на резултата. Функцията **spread** ще използва по подразбиране `_select.result`. Ако го няма(null), ще работи стандартно със `_select.structure` и `_select.value`.

- Върху резултата може да се нанасят множество корекции, без това да влияе върху същинската данна, заложена при инициализация.

- Модификаторите работят с `_select.result` и няма да бъдат изпълнявани, ако данната е празна.

- Изчистването на информацията става с метода select (), който се извиква при нова селекция.

- Всяка промяна (прилагане на филтри и селектори), трябва да изчиства информацията в `select.result`, ако има такава.







Модифициране на информацията при spread

- какъв да е формата ( data-model )
- как да постъпваме при повтарящи се имена на пропъртита
- налагане на модифайъри (  )


Пример: Как да миксирам два спейса


```js
let structure = [
        //   type        i   object descriptors
          [ 'object',    0,  [1, c], [2, d]                 ]   // index 0! Data in pureMe   [root/0]
        , [ 'array' ,    1,  [3, 0], [4, 1], [5, 2], [6, 3] ]   // index 1 Array of objects
        , [ 'object',    2,  [7, 'properties']              ]   // index 2 Related to altMeta[0]
        // array 'c' members
        , [ 'object',    3  ] // no more data-structures.
        , [ 'object',    4  ] // no more data-structures.
        , [ 'object',    5  ]
        , [ 'object',    6  ]
        // object 'd'
        , [ 'object',    7, [8, 'properties'] ]
        , [ 'object',    8  ] // no more data-structures.
        ]
let flatData = {
          'root/0/a'  : 'something'
        , 'root/0/b'  : 'ala-bala'
        , 'root/2/yo' : 'message text'
        , 'root/7/u'  : 64
        , 'root/7/um' : 11
        , 'root/8/u'  : 66
        , 'root/8/um' : 77
      }
```



```js
dtbox.init ( test )
     .spreadAll ( 'std', x => expect ( x ).to.be.eql ( test )   )


/**
 * x assemble
 * flatten - Result a single object
 * mix ( host, guests[], )
 * keyPrefix ('-') - Name of the object will come as prefix to the key. Argument is a separator-symbol. By default is empty string (''). Example: If original data is like:
 *   {
 *        name : 'Peter'
 *      , birth : {
 *                   day: 18
 *                , year : 1974
 *              }
 *    }
 *  then keyPrefix+flatten modifiers will result this:
 *  {
 *        name: 'Peter'
 *      , birthday : 18
 *      , birthyear : 1974
 *  }
 *  Remember that 'keyPrefix' modifier should be executed before 'flatten'. Props from root level has no prefix.
 *  !Note: if separator-symbol is '/' should be changes with something else before conversion.
 *  For example with string '_$_'. Return the symbol after conversions.
 **/
 

dtbox.init ( test )
     .spreadAll ( 
                   [
                      flattenI                                 
                   ],
       
       
       'std', x => expect ( x ).to.be.eql ( test )   )

```



## Experiment with modifiers


```js
// Data
let myFrineds = [
  {
      name: 'Peter'
    , age : 46
  }
  , {
      name: 'Ivan'
    , age : 45
  }
  , {
      name : 'Kris
    , age : 24
  }
];

let other = {
        name : 'Peter'
      , myDetails : {
                    eyes : 'blue'
                  , hair : 'curly'
                  , hairColor : 'brown'
              }
      , birthday : {
                  day : 18
                , year: 1974
                , month : 'March'
              }
    }

 let result;
 let data = dtbox.init ( myFriends )
                 . select ()
                 . all ()
                 . withSelection ()
                 . flatten ( 'insert' )
                 . spread ( 'std', x => reuslt = x )


/**
 *  Result for 'flatten ( 'insert' ):
 *   {
 *       name : [ 'Peter', 'Ivan', 'Kris' ]
 *     , age  : [ 46, 45, 24 ]
 *   }
 * 
 * 
 *   Append and prepend are just a single operation after flatten ( 'insert' ) so, there is
 *   no need of additional code...?!
 *  if .flatten ( 'append', ', ' )
 *  {
 *     name : 'Peter, Ivan, Kris'
 *   , age  : '46, 45, 24'
 * }
 *  if .flatten ( prepend, '-' ) 
 *   {
 *      name: 'Kris-Ivan-Peter'
 *      age: '24-45-46'
 * }
 * 
 * 
 * 
 *  with 'other' data
 *  {
 *       name : 'Peter'
 *     , eyes : 'blue'
 *     , hair : 'curly'
 *     , hairColor : 'brown'
 *     , day : 18
 *     , year : 1974
 *     , month : 'March'
 *  }
 * /
```



## List of modifiers

           
- add         +
- append      +
- combine     +
- flatten      -
- insert      +
- keyPrefix    -
- mix         - 
- overwrite   +
- prepend     +
- update      +