## Release History



### 8.0.0 ( 2026-10-14)
- [x] Breaking: Dependency update. `@peter.naydenov/walk` to version 7.0.1. `dtbox.getWalk()` returns walk v7 as is: in callbacks, `return IGNORE` must become `return IGNORE()`. Walk v7 also adds `PASS`, `FINISH`, `settings` and `parentPath`. See `Migration.guide.md`;
- [x] Breaking: `dtbox.init(data, {model})` with an unsupported model name now throws an error with the list of supported models, like `flat` and `convert` (was: `console.error` + return `null`). Omitting `model` still defaults to `'std'`;
- [x] Breaking: dt-objects no longer keep a second full copy of the original data in memory. `dt.copy()` rebuilds the data from the dt-lines, so object keys come in the same order as `dt.model(() => ({as:'std'}))` output: primitive values first, then nested objects. Values are the same;
- [x] Performance: Compared with 7.5.1, `load` is 79-84% faster, DT-model output (`as:'dt-model'`) 90-94%, `init`/`flat` 17-53%, and `model` with `as:'std'` 88% on deep data. A dt-object keeps 13-27% less memory (created with `load`: 49-63% less), and calls allocate up to 83% less temporary memory (`init` 33-39% less, `load` 75-80% less). `dt.copy()` allocates 15-56% more, because it rebuilds the data. Full tables in `benchmarks/README.md`, reproducible with `node benchmarks/compare.mjs`. How: walk v7 settings (`copy:false`, `detectCycles:false`, `parentPath:false`); no stored copy of the original data; a shape-aware copy for DT-models instead of walk (`src/copyDtModel.js`); and paths handled with `slice` instead of a RegExp per value;
- [x] Feature: TypeScript type declarations. `types/dtbox.d.mts` for ES modules (`import`) and `types/dtbox.d.cts` for CommonJS/UMD (`require`). Wired through the `types` field and the `exports` conditions in `package.json`. Editors autocomplete data-model names (`model`, `as`) and show a short description with an example for each model. Verified with `@arethetypeswrong/cli` for node10, node16 (CJS and ESM) and bundler resolution;
- [x] Feature: Agent skill at `skills/dt-toolbox/`, shipped with the package. A `SKILL.md` covers the workflow and decisions, and `references/` holds the full API, the data-models and runnable recipes. It replaces `.agents/skills/git-dt-toolbox/`, which had incorrect API examples (e.g. `as` passed as an argument to `dt.model`, wrong `connect`/`set` signatures);
- [x] Fix: `dtbox.flat(data, {model})` and `dtbox.convert(data, {model, as})` now respect `options.model`. Before the fix, the source data was always treated as `std`;
- [x] Fix: Options that are explicitly `undefined` now fall back to their defaults. `init`, `flat` and `convert` with `{ model: undefined }` use `'std'`, and `convert` with `{ as: undefined }` uses `'std'`. The same applies when options are `null`. Before the fix, `init` returned `null`, and `flat`/`convert` threw;
- [x] Fix: `as: 'file'` (in `dt.model`, `dt.extractList` and `dtbox.convert`) now works like `as: 'files'` (was: returned `undefined`);
- [x] Fix: `dtbox.init(data, {model:'midflat'})` (lowercase alias) now works like `'midFlat'` (was: produced a broken dt-object);
- [x] Fix: `store.push` now ignores objects and arrays as documented. Primitives and `null` are still accepted. The guard was checking an undefined variable and never worked;
- [x] Fix: `store.connect` no longer crashes when the child dt-line already has children (e.g. `connect(['mid/leaf'])` followed by `connect(['root/mid'])`). Breadcrumbs and edges of all descendants are updated;
- [x] Fix: Date and RegExp values are now regular leaf values in every data-model. Before the fix, they were stored as internal `{ __dtSentinel__ }` objects that leaked into `export`, `flat`, `index`, `extractList`, `look`, and the `tuples`/`breadcrumbs`/`midFlat`/`files` outputs. Only `std` output decoded them. DT-models exported by versions 7.4.7 - 7.5.1 still decode correctly;
- [x] Fix: `store.look` - returning `finish()` now stops the whole `look`, as documented. Before the fix, it only ended the current dt-line, the same as `next()`. `finish()` returned from an empty dt-line also works now. The scan-list now also resets after a `look` on an empty selection (e.g. `from('missing')`);
- [x] Fix: `dt.model(() => ({as:'std'}))` keeps the nested structure of inserted segments. Before the fix, nested objects of a segment were placed at the top level of the result (e.g. `{ a, y, extra: { x } }` instead of `{ a, extra: { x, y } }`);
- [x] Fix: `dtbox.init` accepts shared references (e.g. `{ a: shared, b: shared }`). Before the fix, any object that appeared twice was reported as a circular reference. Only real cycles throw;
- [x] Fix: `dtbox.flat`, `dtbox.convert` and `dt.insertSegment` (with plain data) now throw a clear error on circular data, like `init` (was: out-of-memory crash with walk 6). The check is iterative, so very deep data no longer risks a stack overflow;
- [x] Fix: `dtbox.init(dtModel, {model:'dt-model'})` and `{model:'flat'}` now create a dt-object (was: threw "d is not iterable");
- [x] Fix: `dtbox.load(dtModel)` keeps its own copy of the DT-model. Before the fix, it used the caller's arrays as its data, so changing the DT-model after `load` also changed the dt-object;
- [x] Fix: `dt.copy()` returns the data for dt-objects created from a DT-model (`load`, `init` with `'dt-model'`, `query` results). Before the fix, it returned `null`. A loaded dt-object inserted with `insertSegment` now also keeps its data;
- [x] Performance: `query` results and `model` with `as:'dt-object'` skip an unneeded copy of the arrays dt-toolbox has just built (`model` with `as:'dt-object'` is about 3x faster on large data);
- [x] Fix: Keys and names with RegExp special characters work. Before the fix, `init`/`flat`/`convert` threw on keys like `'a(b'`, `'x+'`, `'k$'` or `'['`; `dt.export(name)`/`dt.copy(name)` with a segment name like `'a.b'` also matched other segments (`'aXb'`); `store.connect` had the same problem with drafted names;
- [x] Fix: `dt.insertSegment(name, dtModel)` - `dt.copy(name)` returns the data (was: the DT-model itself), and changing the DT-model afterwards no longer changes the dt-object;
- [x] Fix: `dt.copy()` returns the full data when the dt-object was created from `midFlat` input (was: only the root values, e.g. `{ a: 1 }` without the nested `b`);
- [x] Fix: `breadcrumbs` output keeps array indexes. Before the fix, a one-item array lost its index (`{ k: [1] }` gave `{ k: 1 }`, and `[ 'only' ]` gave `{ root: 'only' }`), so it came back as a plain value. Arrays with objects between values got wrong indexes, and values were lost on the way back (`{ m: [ 'first', { a: 1 }, 'third' ] }` lost `'third'`);
- [x] Fix: `midFlat` input without plain values at the top level (e.g. `{ k: ['only'] }` or `{ b: { c: 2 } }` as midFlat) keeps its data. In 7.5.1 the result was an empty `{}`;
- [x] Chore: Removed unused `src/flatData/connect.js` (an unreferenced duplicate of `src/draft/connect.js`);
- [x] Chore: Repository cleanup. Removed the old documentation snapshots `README_v.2.x.x.md`, `README_v.4.x.x.md` and `README_v.6.x.x.md` (README links now point to the `v7.5.1` tag, where they are kept), the `.npmignore` file (the `files` list in `package.json` decides what is published), the no-op `start` script, and the unused dev dependencies `@rollup/plugin-node-resolve` and `@rollup/plugin-commonjs` (the build output is identical without them);
- [x] Tests: 54 new regression and coverage tests. Line coverage is up from 92.9% to 98.5%, function coverage is 100%;
- [x] Tests: `test/07_skill.test.js` runs every code example in the skill and checks its documented result, so the skill stays in sync with the library;



### 7.5.1 ( 2026-09-24)
- [x] Dependency update. @peter.naydenov/walk to version 6.1.0;



### 7.5.0 ( 2026-09-01)
- [x] Feature: Added a skill at `.agents/skills/git-dt-toolbox/SKILL.md`;
- [x] Chore: Added a `"files"` allow-list to `package.json` so the skill at `.agents/skills/git-dt-toolbox/SKILL.md` is **explicitly included** in the published npm package. 
- [x] Side benefit: the old `README_v.*.x.md` snapshots, `rollup.config.js`, and `vitest.config.js` are no longer shipped. Resolves the previous "Stale" note about `.npmignore`;



### 7.4.9 ( 2026-07-21)
- Dependency update. @peter.naydenov/walk to version 6.0.0;



### 7.4.8 ( 2026-07-20)
- Dependency update. @peter.naydenov/walk to version 5.0.7;



### 7.4.7 ( 2026-07-15)
- [x] Fix: circular reference in data no longer crashes Node with OOM — `init` now throws a clear error;
- [x] Fix: Date and RegExp instances are now preserved when round-tripping through `init`/`model` (they were silently collapsed to `{}` by the walk library);
- [x] Fix: NaN and Infinity values are now preserved through `init`/`model` round-trips;
- [x] Fix: `model({as:'std'})` no longer drops data from extra segments — extra segments are now merged into the result;
- [x] Fix: `store.set` with a non-root breadcrumbs or a primitive value (string/number/boolean/null) now returns the value correctly through `model` (was: char-indexed string, missing data, or `undefined`);
- [x] Fix: `dt.index('root/a')` and other scalar-property breadcrumbs now return the property value (was: `null` for any scalar);
- [x] Fix: `dt.export(name)` now throws a clear error for non-string argument types (was: silently returned the whole model for some, `[]` for others);
- [x] Fix: `dt.copy(name)` now throws a clear error for non-string argument types (was: inconsistent `null` vs root-copy behavior);
- [x] Fix: `dt.extractList(['c/d'])` now resolves nested property paths via the dt-model (was: always returned `null` for any nested path);
- [x] Fix: `dt.insertSegment` now throws clear errors for missing/invalid `name` and for `data` that is `null`/`undefined`/a primitive (was: cryptic `Cannot read properties of ...reading '0'`);
- [x] Fix: `init(42)` / `init('hello')` / `init(true)` / `init(null)` now work — primitive values are wrapped in `{ value: <primitive> }` and preserved through the round-trip;
- [x] Fix: `dt.model(() => ({as: 42}))` / `({as: {}})` / unknown model names now throw clear errors (was: `console.error` + return `null`);
- [x] Fix: `dtbox.flat(null)` / `flat(undefined)` / `flat(42)` / `flat('hello')` now throw clear errors (was: silently returned `[]`);
- [x] Fix: `dtbox.flat(data, {model:'unknown'})` and `dtbox.convert(data, {as:'unknown'})` now throw clear errors (was: silently returned `null`);
- [x] New regression test file `test/06_bugfixes.test.js` covering all of the above with 51 new tests;
- [x] Two existing test cases updated to match the new throw-on-invalid-model behaviour for `flat` and `convert`;
- [x] Fix: `insertSegment` no longer accepts a segment name that already exists — it now throws a clear error. Before the fix, the second insert created a duplicate dt-line at the same breadcrumbs, and `model({as:'std'})` / `extractList` silently kept the first segment and dropped the second;
- [x] Fix: `insertSegment` no longer accepts segment names containing `/` — it now throws a clear error. The `/` is the breadcrumbs separator in the dt-model, so a name like `'a/b'` would create ambiguous dt-lines that silently broke `index()`, `extractList()`, and `model()` lookups;



### 7.4.6 ( 2026-07-14)
- [x] Dependencies updates. @peter.naydenov/walk to version 5.0.6;


### 7.4.5 ( 2026-10-25)
- [x] Update a 'walk' library to version 5.0.2;
- [x] Dev dependencies updates;



### 7.4.4 ( 2025-01-05)
- [x] Update a 'walk' library to version 5.0.1;
- [x] Dev dependencies updates;



### 7.4.3 ( 2024-12-07)
- [x] Update a 'walk' library to version 5.x.x;
- [x] Dev dependencies updates;



### 7.4.2 ( 2024-01-30)
- [x] Dependencies updates. @peter.naydenov/walk to version 4.2.3;
- [x] Dev dependencies updates. Chai to version 5.0.3;
- [x] Dev dependencies updates. C8 to version 9.1.0;
- [x] Folder 'dist' was added to the project. Includes commonjs, umd and esm versions of the library;
- [x] Package.json: "exports" section was added. Allows you to use package as commonjs or es6 module without additional configuration;
- [x] Rollup was added to the project. Used to build the library versions;



### 7.4.1 ( 2024-01-10)
- [x] Dependencies updates. @peter.naydenov/walk to version 4.2.1;
- [x] Dev dependencies updates. Chai to version 5.0.0;
- [x] Dev dependencies updates. C8 to version 9.0.0;



### 7.4.0 ( 2023-11-3)
- [x] Types were added to the project;




### 7.3.0 ( 2023-10-19 )
- [x] Model function recognize a `dt-model` model. Result is equal to result of `export`;
- [x] Model function recognize a `dt-object` model. Returns a new dt-object;
- [x] Method `extractList` recognize a `dt-model` and `dt-object` models;
- [x] Method `init` recognize a `dt-model` model. Result is equal to result of `load`;
- [x] Update of @peter.naydenov/walk to version 4.2.0;



### 7.2.0 (2023-09-18)
- [x] Convertors recognize HTML DOM nodes. Makes a copy by reference;
- [x] Convertors recognize functions. Makes a copy by reference;
- [x] Model 'files' is not possible for functions and DOM nodes, so the value in the result will be string. For functions will be `function:functionName` and for DOM nodes will be `htmlElement:elementName`;



### 7.1.3 (2023-09-14)
- [x] Fix: extractList: Negative value is treated as property does not exist and returns null instead of real value;



### 7.1.2 (2023-09-12)
- [x] Fix: Dt-Storage method 'from' is not filtering the list if requested 'breadcrumbs' does not exist;
- [ ] Bug: extractList: Negative value is treated as property does not exist and returns null instead of real value;



### 7.1.1 (2023-09-05 )
- [x] Fix: Multiple queries in same programming scope;
- [ ] Bug: Dt-Storage method 'from' is not filtering the list if requested 'breadcrumbs' does not exist;
- [ ] Bug: extractList: Negative value is treated as property does not exist and returns null instead of real value;



### 7.1.0 (2023-08-28)
- [x] Method `extractList` was added;
- [x] Fix: Method `model` recognizes '**files**' as a model;
- [x] Fix: Tuple model if data is just an array is wrong;
- [x] Fix: Convertor to files shows 'root' in the beginning of the path;
- [x] Fix: Convertor to breadcrumbs shows 'root' in the beginning of the path;
- [ ] Bug: Multiple queries in same programming scope;
- [ ] Bug: Dt-Storage method 'from' is not filtering the list if requested 'breadcrumbs' does not exist;



### 7.0.0 (2023-07-15)
- [x] Method `look` has new arguments: functions `next` and `finish`;
- [x] To stop iteration on current dt-line `return next()`;
- [x] To stop iteration on all dt-lines `return finish()`;
- [x] Method `insert` was renamed to `insertSegment`;
- [x] Method `listSegments` was added to show list of all segments in dt-object;
- [x] Method `insertSegment` expect the incoming data as dt-object, but if is not - will assume it as a standard javascript object and will convert it to dt-object automatically;
- [ ] Method `insertSegment` can recognize a dt model object.
- [ ] Bug: Method `model` doesn't recognize '**files**' as a model;
- [ ] Bug: Tuple model if data is just an array is wrong;
- [ ] Bug: Convertor to files shows 'root' in the beginning of the path;
- [ ] Bug: Convertor to breadcrumbs shows 'root' in the beginning of the path;
- [ ] Bug: Multiple queries in same programming scope;
- [ ] Bug: Dt-Storage method 'from' is not filtering the list if requested 'breadcrumbs' does not exist;



### 6.0.0 (2023-05-12)
- [x] Version 5 is full rethinking of the idea and rewrite from scratch;
- [x] Simplified API interface;
- [x] New internal data-model;
- [x] Multiple data inserts;
- [x] Predefined and custom filters for faster data scan;
- [x] Model and query functions to shape the results;



### 4.0.7 (2022-03-03)
- [x] Library '@peter.naydenov/walk' was included as a dependency;
- [x] Cleaning: Method 'help.generateObject' was removed. Not in use anymore;
- [x] Cleaning: Method 'help.generateList' was removed. Not in use anymore;
- [x] Cleaning: Old convertor file 'convertors_oldVersion.js' was removed;
- [x] Refactoring: Convertor 'standard' is using 'walk'; 
- [x] Fix: Initialization with 'tuples' doesn't work;



### 4.0.6 (2022-03-03)
- [x] Fix: Sometimes empty array structures are converted to empty objects;
- [ ] Bug: Initialization with 'tuples' doesn't work;



### 4.0.5 (2022-03-01)
- [x] Fix: Arrays are recognized as objects. Object members of arrays are recognized as arrays;
- [ ] Bug: Sometimes empty array structures are converted to empty objects;
- [ ] Bug: Initialization with 'tuples' doesn't work;



### 4.0.4 (2022-03-01)
- [x] Fix: Convertor for 'midFlat' is loosing empty data-structures;
- [x] Fix: Boolean values "true" are converted to 1(number);
- [x] Fix: Operation "add" treats numbers as string;
- [x] Fix: Convertor from 'breadcrumbs' breaks;
- [ ] Bug: Arrays are recognized as objects. Object members of arrays are recognized as arrays;
- [ ] Bug: Initialization with 'tuples' doesn't work;




### 4.0.3 (2022-02-23)
- [x] Fix: Initialize with breadcrumbs is not working at all;
- [ ] Bug: Convertor for 'midFlat' is loosing empty data-structures;
- [ ] Bug: Boolean values "true" are converted to 1(number);
- [ ] Bug: Operation "add" treats numbers as string;
- [ ] Bug: Convertor from 'breadcrumbs' breaks;
- [ ] Bug: Initialization with 'tuples' doesn't work;






### 4.0.2 (2022-02-21)
- [x] Fix: Methods 'keep' and 'remove' received `flat keys` instead of `breadcrumbs keys`. If need a `flat key`, its still available as third argument.
```js
    .remove ( (value, breadcrumbKey, flatKey)=> {
                                // ... set your filter here...
                    })
```
- [ ] Bug: Initialize with breadcrumbs is not working at all;
- [ ] Bug: Convertor for 'midFlat' is loosing empty data-structures;
- [ ] Bug: Boolean values "true" are converted to 1(number);
- [ ] Bug: Operation "add" treats numbers as string;
- [ ] Bug: Convertor from 'breadcrumbs' breaks;
- [ ] Bug: Initialization with 'tuples' doesn't work;





### 4.0.1 (2021-04-08)
- [x] Fix: Methods "add/update/overwrite/combine/append/prepend" expect by default data-type 'standard'. Should be a 'flat' data-type. This update is coming as major release because may require some changes. Everything else is according documentation for version 3.x.x;
- [ ] Bug: Methods 'keep' and 'remove' received `flat keys` instead of `breadcrumbs keys`
- [ ] Bug: Initialize with breadcrumbs is not working at all;
- [ ] Bug: Initialization with 'tuples' doesn't work;
- [ ] Bug: Convertor for 'midFlat' is loosing empty data-structures;
- [ ] Bug: Boolean values "true" are converted to 1(number);
- [ ] Bug: Operation "add" treats numbers as string;
- [ ] Bug: Convertor from 'breadcrumbs' breaks;




### 3.1.0 ( 2021-03-25)
- [x] Methods "export" and "exportAll" were added;
- [] Bug: Methods "add/update/overwrite/combine/append/prepend" expect by default data-type 'standard'. Should be a 'flat' data-type;



### 3.0.2 ( 2021-02-28 )
- [x] Fix: Convert to 'standard' fails on some objects;
- [] Bug: Methods "add/update/overwrite/combine/append/prepend" expect by default data-type 'standard'. Should be a 'flat' data-type;





### 3.0.0 ( 2021-02-25 )
- [x] Complete rewrite of the library;
- [x] Dt-toolbox is using . Consider this for support of old browsers;
- [x] Export API was removed. Methods were moved to main API or removed;
- [x] Method that is searching for string in keys was renamed from 'folder' to 'find';
- [x] Method 'folder' works like 'space' in previous versions. That makes more sense...;
- [x] Method 'space' is deprecated;
- [x] New method 'purify'. Removes empty structures from the selection;
- [x] Method 'loadFast' was deprecated. Use 'load' instead;
- [x] Added support for different data-models: standard, tuples, flat, midFlat, breadcrumbs, files;
- [x] New method 'flatten' was added;
- [x] New method 'mix' was added;
- [x] New method 'keyPrefix' was added;
- [x] New method 'replace' was added;
- [x] New method 'combine' was added;
- [x] All methods expect data as 'flat'. Other models should be converted or provide an option/model param;
- [] Bug: Convert to 'standard' fails on some objects;
- [] Bug: Methods "add/update/overwrite/combine/append/prepend" expect by default data-type 'standard'. Should be a 'flat' data-type;





### 2.1.2 (2019-09-12)
- [x] Fix: Similar namespaces bug - Overwrite of object properties values. Ex: "s1" and "s11";
- [x] Browser version was updated;





### 2.1.1 (2019-06-06)
- [x] Fix: Build a ST object with repeating structure;
- [x] Browser version was updated;
- [ ] Bug: Similar namespaces bug - Overwrite of object properties values. Ex: "s1" and "s11";





### 2.1.0 (2019-06-02)
- [x] Modify methods ( add/update/overwrite ) can receive DT data model;
- [x] Browser version was updated;
- [ ] Bug: Build a ST object with repeating structure;
- [ ] Bug: Similar namespaces bug - Overwrite of object properties values. Ex: "s1" and "s11";





### 2.0.2 (2019-05-30)
- [x] Fix: ST Build regression with boolean values;
- [x] Browser version was updated;
- [ ] Bug: Build a ST object with repeating structure;
- [ ] Bug: Similar namespaces bug - Overwrite of object properties values. Ex: "s1" and "s11";




### 2.0.1 (2019-05-30)
- [x] Fix: ST Build (lib._build) was refactored;
- [x] Improvment: Method 'lib._toFolderFiles' has array of counters in sync with duplications;
- [x] Browser version was updated;
- [ ] Bug: ST Build regression with boolean values;
- [ ] Bug: Build a ST object with repeating structure;
- [ ] Bug: Similar namespaces bug - Overwrite of object properties values. Ex: "s1" and "s11".;





### 2.0.0 (2017-12-28)
- [x] Breaking change: Method ‘modifyKeys’ argument should be a function;
- [x] Test cases updates;
- [x] Browser version was updated;
- [ ] Problems with building heavy ST structures;
- [ ] Build a wrong ST object when similar namespaces are available. Example: "sample1" and "sample11";



### 1.8.0 (2017-12-28)
- [x] Method 'remove' has new argument-key. Evaluate the key name;
- [x] Method 'keep' has new argument-key. Evaluate the key name;
- [x] Test coverage - 100%;



### 1.7.0 (2017-12-24)
- [x] Browser version is available;
- [x] Dependencies updates ( Mocha, chai );
- [x] Istambul coverage tool was added;
- [x] Some minor project structure changes;
- [x] Unit tests updates for Mocha v.4;



### 1.6.0 (2017-04-22)
- [x] ExportAPI method `keyValue` returns a key-value string;



### 1.5.0 (2017-04-17)
- [x] ExportAPI method 'cut' will cut out number of key elements;
- [x] ExportAPI method 'file' will convert dt data to a 'file' model;
- [x] Fix: ExportAPI method 'map' could break the app if callback function does not return a string;



### 1.4.0 (2017-03-28)
- [x] Fix: Very large files can cause 'stack overflow';
- [ ] Warning: ExportAPI method 'map' could break the app if callback function does not return a string;


### 1.3.0 (2017-02-19)
- [x] API method 'invert' - selector. Invert existing selection;
- [ ] Warning: Very large files can cause 'stack overflow';
- [ ] Warning: ExportAPI method 'map' could break the app if callback function does not return a string;



### 1.2.0 (2017-02-16)
- [x] ExportAPI method 'list'. Returns findings in an array.
- [x] API method 'deepArray'  - selector
- [x] API method 'deepObject' - selector
- [x] API method 'loadFast' - load DT data without meta information calculation. 
- [x] ExportLib method `map` is 'root/' aware. 
- [ ] Warning: Very large files can cause 'stack overflow';
- [ ] Warning: ExportAPI method 'map' could break the app if callback function does not return a string;




### 1.1.2 (2017-02-05)

 - [x] Fix: ExportAPI method `map` has `index` argument;
 - [ ] ExportAPI method `map` is not aware of 'root/'. Add 'root/' explicitly;
 - [ ] Warning: Very large files can cause 'stack overflow';
 - [ ] Warning: ExportAPI method 'map' could break the app if callback function does not return a string;




### 1.1.1 (2017-02-04)

 - [x] Fix: Method `empty` now works as it was intended;
 - [x] Method `spreadAll` was added and could be used instead the chain: .select().all().spread()
 - [ ] ExportAPI method `map` is not aware of 'root/'. Add 'root/' explicitly;
 - [ ] Error: ExportAPI method `map` has no `index` argument;
 - [ ] Warning: Very large files can cause 'stack overflow';
 - [ ] Warning: ExportAPI method 'map' could break the app if callback function does not return a string;




### 1.1.0

 - [x] Method `empty` returns empty DT object;
 - [x] Compare method were added: `identical`, `change`, `same`, `different`, `missing`
 - [ ] Error: Method `empty` is actually an object;
 - [ ] Error: ExportAPI method `map` has no `index` argument;
 - [ ] Warning: Very large files can cause 'stack overflow';
 - [ ] Warning: ExportAPI method `map` is not aware of 'root/'. Add 'root/' explicitly;
 - [ ] Warning: ExportAPI method `map` could break the app if callback function does not return a string;




### 1.0.2 (2017-01-14)
 - [x] Bug fix - init with files;



### 1.0.0 (2017-01-14)
 
 - [x] Initial code;
 - [x] Test package;
 - [x] Documentation;



