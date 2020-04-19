# Upgrade to version 3

- При празна структура (масив или обект) може да се сгреши, защото не се знае какво би трябвало да съдържа.



- трябва отделна функция, която да генерира структура и неймспейс само при нужда.
- инструкцията при конверсия също


## NEW IDEAS
- New internal data-structure
- Генератор за празни дата структури
- Old internal data should be used only as import/export format. Format name will be named 'breadcrumbsData'
- Write own convertors ( possible use: as data-bridge (data-model to data-model), data-modifier, filter, etc...)




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

Обектът за селекция ще трябва да се промени доста:
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