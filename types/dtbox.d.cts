/**
 * Type declarations for dt-toolbox.
 * Used for CommonJS (`require`) and UMD consumers.
 * ES module consumers get the same types via `dtbox.d.mts`.
 */

import walk = require ( '@peter.naydenov/walk' );

declare namespace dtbox {

    /**
     * Names of data-models accepted by `init`, `flat` and `convert`.
     * - `'std'` | `'standard'` - regular JS object or array (default). `{ a: 1, b: { c: 2 } }`
     * - `'breadcrumbs'` | `'breadcrumb'` - flat object with path keys. `{ a: 1, 'b/c': 2 }`
     * - `'tuples'` | `'tuple'` - list of `[ path, value ]`. `[ ['a', 1], ['b/c', 2] ]`
     * - `'files'` | `'file'` - list of path strings ending with the value. `[ 'a/1', 'b/c/2' ]`
     * - `'midFlat'` | `'midflat'` - object of flat objects keyed by path. `{ root: { a: 1 }, b: { c: 2 } }`
     * - `'flat'` | `'dt-model'` - DT-model: list of dt-lines `[ name, flatData, breadcrumbs, edges ]`
     */
    type ModelName =
          'std'        | 'standard'
        | 'tuple'      | 'tuples'
        | 'breadcrumb' | 'breadcrumbs'
        | 'file'       | 'files'
        | 'midFlat'    | 'midflat'
        | 'flat'       | 'dt-model'
        ;

    /**
     * Names of output representations accepted by `dt.model()` and `dt.extractList()` (`as`).
     * - `'std'` | `'standard'` - regular JS object or array (default). `{ a: 1, b: { c: 2 } }`
     * - `'breadcrumbs'` | `'breadcrumb'` - flat object with path keys. `{ a: 1, 'b/c': 2 }`
     * - `'tuples'` | `'tuple'` - list of `[ path, value ]`. `[ ['a', 1], ['b/c', 2] ]`
     * - `'files'` | `'file'` - list of path strings ending with the value. `[ 'a/1', 'b/c/2' ]`
     * - `'midFlat'` | `'midflat'` - object of flat objects keyed by path. `{ root: { a: 1 }, b: { c: 2 } }`
     * - `'flat'` | `'dt-model'` - DT-model: list of dt-lines `[ name, flatData, breadcrumbs, edges ]`
     * - `'dt-object'` - a new dt-object
     */
    type AsName = ModelName | 'dt-object';

    /** Data stored in a single dt-line: object or array of primitive values. */
    type FlatData = any[] | Record<string, any>;

    /**
     * A single dt-line: `[ name, flatData, breadcrumbs, edges ]`.
     * - `name`        - name of the dt-line;
     * - `flatData`    - object or array with primitive values;
     * - `breadcrumbs` - location of the dt-line (e.g. `'root/extra'`);
     * - `edges`       - breadcrumbs of the children dt-lines.
     */
    type DtLine = [ name: string, flatData: FlatData, breadcrumbs: string, edges: string[] ];

    /** A DT-model: list of dt-lines. First dt-line is always `'root'`. */
    type DtModel = DtLine[];

    /** Tuple representation of a value: `[ breadcrumbs, value ]`. */
    type Tuple = [ breadcrumbs: string, value: any ];

    /** Maps an `as` name to the type of the produced result. */
    type ConvertResult<A> =
          A extends 'dt-object'                   ? DTObject
        : A extends 'flat'       | 'dt-model'     ? DtModel
        : A extends 'tuple'      | 'tuples'       ? Tuple[]
        : A extends 'files'                       ? string[]
        : A extends 'breadcrumb' | 'breadcrumbs'  ? Record<string, any>
        : any
        ;

    /** Result of `dt.model(fn)`. Without `as`, the result is a new dt-object. */
    type ModelResult<R> = R extends { as: infer A } ? ConvertResult<A> : DTObject;

    interface InitOptions {
        /**
         * Data-model of the source data. Default: `'std'`.
         * - `'std'` | `'standard'` - regular JS object or array (default). `{ a: 1, b: { c: 2 } }`
         * - `'breadcrumbs'` | `'breadcrumb'` - flat object with path keys. `{ a: 1, 'b/c': 2 }`
         * - `'tuples'` | `'tuple'` - list of `[ path, value ]`. `[ ['a', 1], ['b/c', 2] ]`
         * - `'files'` | `'file'` - list of path strings ending with the value. `[ 'a/1', 'b/c/2' ]`
         * - `'midFlat'` | `'midflat'` - object of flat objects keyed by path. `{ root: { a: 1 }, b: { c: 2 } }`
         * - `'flat'` | `'dt-model'` - DT-model: list of dt-lines `[ name, flatData, breadcrumbs, edges ]`
         */
        model?: ModelName;
    }

    interface FlatOptions {
        /**
         * Data-model of the source data. Default: `'std'`.
         * - `'std'` | `'standard'` - regular JS object or array (default). `{ a: 1, b: { c: 2 } }`
         * - `'breadcrumbs'` | `'breadcrumb'` - flat object with path keys. `{ a: 1, 'b/c': 2 }`
         * - `'tuples'` | `'tuple'` - list of `[ path, value ]`. `[ ['a', 1], ['b/c', 2] ]`
         * - `'files'` | `'file'` - list of path strings ending with the value. `[ 'a/1', 'b/c/2' ]`
         * - `'midFlat'` | `'midflat'` - object of flat objects keyed by path. `{ root: { a: 1 }, b: { c: 2 } }`
         * - `'flat'` | `'dt-model'` - DT-model: list of dt-lines `[ name, flatData, breadcrumbs, edges ]`
         */
        model?: ModelName;
    }

    interface ConvertOptions {
        /**
         * Data-model of the source data. Default: `'std'`.
         * - `'std'` | `'standard'` - regular JS object or array (default). `{ a: 1, b: { c: 2 } }`
         * - `'breadcrumbs'` | `'breadcrumb'` - flat object with path keys. `{ a: 1, 'b/c': 2 }`
         * - `'tuples'` | `'tuple'` - list of `[ path, value ]`. `[ ['a', 1], ['b/c', 2] ]`
         * - `'files'` | `'file'` - list of path strings ending with the value. `[ 'a/1', 'b/c/2' ]`
         * - `'midFlat'` | `'midflat'` - object of flat objects keyed by path. `{ root: { a: 1 }, b: { c: 2 } }`
         * - `'flat'` | `'dt-model'` - DT-model: list of dt-lines `[ name, flatData, breadcrumbs, edges ]`
         */
        model?: ModelName;
        /**
         * Data-model of the result. Default: `'std'`.
         * - `'std'` | `'standard'` - regular JS object or array (default). `{ a: 1, b: { c: 2 } }`
         * - `'breadcrumbs'` | `'breadcrumb'` - flat object with path keys. `{ a: 1, 'b/c': 2 }`
         * - `'tuples'` | `'tuple'` - list of `[ path, value ]`. `[ ['a', 1], ['b/c', 2] ]`
         * - `'files'` | `'file'` - list of path strings ending with the value. `[ 'a/1', 'b/c/2' ]`
         * - `'midFlat'` | `'midflat'` - object of flat objects keyed by path. `{ root: { a: 1 }, b: { c: 2 } }`
         * - `'flat'` | `'dt-model'` - DT-model: list of dt-lines `[ name, flatData, breadcrumbs, edges ]`
         */
        as?: ModelName;
    }

    interface ExtractListOptions {
        /**
         * Representation of the extracted segments.
         * - `'std'` | `'standard'` - regular JS object or array (default). `{ a: 1, b: { c: 2 } }`
         * - `'breadcrumbs'` | `'breadcrumb'` - flat object with path keys. `{ a: 1, 'b/c': 2 }`
         * - `'tuples'` | `'tuple'` - list of `[ path, value ]`. `[ ['a', 1], ['b/c', 2] ]`
         * - `'files'` | `'file'` - list of path strings ending with the value. `[ 'a/1', 'b/c/2' ]`
         * - `'midFlat'` | `'midflat'` - object of flat objects keyed by path. `{ root: { a: 1 }, b: { c: 2 } }`
         * - `'flat'` | `'dt-model'` - DT-model: list of dt-lines `[ name, flatData, breadcrumbs, edges ]`
         * - `'dt-object'` - a new dt-object
         */
        as: AsName;
    }

    /** Value returned from a model function to choose the output representation. */
    interface ModelFnReturn {
        /**
         * Output representation of the model result. Default: a new dt-object.
         * - `'std'` | `'standard'` - regular JS object or array (default). `{ a: 1, b: { c: 2 } }`
         * - `'breadcrumbs'` | `'breadcrumb'` - flat object with path keys. `{ a: 1, 'b/c': 2 }`
         * - `'tuples'` | `'tuple'` - list of `[ path, value ]`. `[ ['a', 1], ['b/c', 2] ]`
         * - `'files'` | `'file'` - list of path strings ending with the value. `[ 'a/1', 'b/c/2' ]`
         * - `'midFlat'` | `'midflat'` - object of flat objects keyed by path. `{ root: { a: 1 }, b: { c: 2 } }`
         * - `'flat'` | `'dt-model'` - DT-model: list of dt-lines `[ name, flatData, breadcrumbs, edges ]`
         * - `'dt-object'` - a new dt-object
         */
        as?: AsName;
    }

    /** Arguments received by a filter function (`dt.setupFilter`). */
    interface FilterArgs {
        name: string;
        flatData: FlatData;
        breadcrumbs: string;
        edges: string[];
    }

    /** Filter function. Return `true` to include the dt-line in the filter scan-list. */
    type FilterFn = ( args: FilterArgs ) => boolean;

    /** Arguments received by the `store.look()` callback. */
    interface LookArgs {
        /** Property value. `null` when the dt-line is empty. */
        value: any;
        /** Property key: `number` for arrays, `string` for objects, `null` when the dt-line is empty. */
        key: string | number | null;
        /** Name of the dt-line. */
        name: string;
        /** Full flatData of the dt-line. */
        flatData: FlatData;
        /** Breadcrumbs of the dt-line. */
        breadcrumbs: string;
        /** List of `[ parent, child ]` dt-line name tuples. */
        links: Array<[ parent: string, child: string ]>;
        /** Present (and `true`) only when the dt-line has no properties. */
        empty?: true;
        /** Return `next()` from the callback to move to the next dt-line. */
        next: () => string;
        /** Return `finish()` from the callback to stop the `look` execution. */
        finish: () => string;
    }

    type LookFn = ( args: LookArgs ) => any;

    /**
     * dt-store API. Available as the first argument of query and model functions.
     */
    interface DtStore {
        // Scan methods
        /** Scan deeper from the dt-line with the given breadcrumbs. */
        from ( breadcrumbs: string ): DtStore;
        /** Use a filter by name to reduce the scan list. */
        use ( filterName: string ): DtStore;
        /** Take a single dt-line with specific breadcrumbs. */
        get ( breadcrumbs: string ): DtStore;
        /** Exact search by dt-line name. */
        find ( name: string ): DtStore;
        /** Substring search in dt-line names. */
        like ( name: string | string[] ): DtStore;
        /** Execute a function on each property of each dt-line in the scan list. */
        look ( fn: LookFn ): void;

        // DT-model creation methods
        /** Define a new dt-line record. */
        set ( name: string, data: any ): DtStore;
        /** Create connections between existing dt-lines. Each item is `'parent/child'`. */
        connect ( list: string[] ): void;
        /** Save a property to the flatData object of an existing dt-line. */
        save ( target: string, key: string, value: any ): DtStore;
        /** Push a value to the flatData array of an existing dt-line. */
        push ( target: string, value: any ): DtStore;
    }

    /**
     * dt-object API. Created by `dtbox.init()` and `dtbox.load()`.
     */
    interface DTObject {
        /** Insert a new data segment. Data can be a dt-object, a DT-model or a standard object/array. */
        insertSegment ( name: string, data: DTObject | DtModel | object ): void;
        /** Return the DT-model of the full dt-object or of a single segment. */
        export ( name?: string ): DtModel;
        /** Deep copy of the original data of a segment. Default segment: `'root'`. Returns `null` if the segment does not exist. */
        copy ( name?: string ): any;
        /** Execute a query function. Returns a new dt-object with the result, or the same dt-object if nothing was selected. */
        query<Args extends any[]> ( fn: ( store: DtStore, ...args: Args ) => any, ...args: Args ): DTObject;
        /** Execute a model function. The `as` property of the function result selects the output representation. */
        model<R extends ModelFnReturn | void, Args extends any[]> ( fn: ( store: DtStore, ...args: Args ) => R, ...args: Args ): ModelResult<R>;
        /** Register a named filter function. */
        setupFilter ( name: string, fn: FilterFn ): void;
        /** List of segment names. Always contains `'root'`. */
        listSegments (): string[];
        /** Copy of the dt-line with the given breadcrumbs, or `null` if not found. */
        index ( breadcrumbs: string ): DtLine | null;
        /** Extract a list of segments and/or properties. Missing items are `null`. */
        extractList ( list: string[], options?: ExtractListOptions ): any[];
    }

    /** The `walk` function from `@peter.naydenov/walk` v.7, as returned by `dtbox.getWalk()`. */
    type WalkFn = typeof walk;
    /** Options of the `walk` function. */
    type WalkOptions = walk.Options;
    /** Settings of the `walk` function (`copy`, `breadcrumbs`, `parentPath`, `detectCycles`). */
    type WalkSettings = walk.Settings;
    /** Arguments received by both `walk` callbacks. */
    type WalkCallbackArgs = walk.CallbackArgs;

    interface DtBox {
        /** Create a dt-object from a data source. Throws if the model name is not supported. */
        init ( data: any, options?: InitOptions ): DTObject;
        /** Create a dt-object from a DT-model. */
        load ( data: DtModel ): DTObject;
        /** Convert data to a DT-model without creating a dt-object. */
        flat ( data: object, options?: FlatOptions ): DtModel;
        /** Convert data from one data-model to another without creating a dt-object. */
        convert<O extends ConvertOptions = {}> ( data: object, options?: O ): ConvertResult<O extends { as: infer A } ? A : 'std'>;
        /** Returns the `walk` function (`@peter.naydenov/walk` v.7) used by dt-toolbox. */
        getWalk (): WalkFn;
    }
}

declare const dtbox: dtbox.DtBox;

export = dtbox;
export as namespace dtbox;
