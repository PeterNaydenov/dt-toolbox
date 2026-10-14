/**
 *   Skill examples test
 *
 *   Runs every ```js code block from the bundled skill (skills/dt-toolbox)
 *   and checks the expected results written as `// → value` or `// name → value`.
 *   Keeps the skill documentation in sync with the library behaviour.
 *
 */



import { expect } from "vitest"
import fs     from "node:fs"
import path   from "node:path"
import assert from "node:assert/strict"
import dtbox  from "../src/main.js"



const
      skillDir = path.resolve ( import.meta.dirname, '../skills/dt-toolbox' )
    , files = [ 'SKILL.md', 'references/api.md', 'references/data-models.md', 'references/recipes.md' ]
    , AsyncFunction = Object.getPrototypeOf ( async function () {} ).constructor
    // Shared data for short snippets that use `dt` or `x` without defining them
    , preamble = `
        const dt = dtbox.init ({ name: 'Peter', friends: [ 'Ivan', 'Stefan' ], personal: { age: 49, eyes: 'blue', hobbies: { music: [ 'punk', 'ska' ] } } })
        const x = { a: 1, b: { c: 2 }, l: [ 'p', 'q' ] }
    `
    ;



/**
 * Convert a markdown code block into executable code.
 * Expectation comments become assertions:
 *   `// name → value`  checks variable `name`;
 *   `// → value`       checks the expression on the previous line.
 * Comment lines that follow and start with `//` plus 2+ spaces continue a multi-line value.
 */
function toTestCode ( raw ) {
        const
              lines = raw.split ( '\n' ).filter ( l => !/^import dtbox/.test ( l ) )
            , out = []
            ;
        let checks = 0;
        for ( let k = 0; k < lines.length; k++ ) {
                const
                      named = lines[k].match ( /^\s*\/\/ (\w+) → (.*)$/ )
                    , anon  = lines[k].match ( /^\s*\/\/ → (.*)$/ )
                    ;
                if ( !named && !anon ) {
                        out.push ( lines[k] )
                        continue
                    }
                let value = named ? named[2] : anon[1];
                while ( k + 1 < lines.length && /^\s*\/\/\s{2,}/.test ( lines[k+1] ) ) {
                        k++
                        value += ' ' + lines[k].replace ( /^\s*\/\//, '' )
                    }
                if ( named )   out.push ( `assert.deepStrictEqual ( ${named[1]}, ( ${value} ), ${JSON.stringify ( named[1] + ' → ' + value )} )` )
                else {
                        let j = out.length - 1;
                        while ( j >= 0 && out[j].trim () === '' )   j--
                        out[j] = `const __v${checks} = ${out[j]}`
                        out.push ( `assert.deepStrictEqual ( __v${checks}, ( ${value} ), ${JSON.stringify ( '→ ' + value )} )` )
                    }
                checks++
            }
        const usesOwnData = /const (dt|x) = /.test ( raw );
        return { code: ( usesOwnData ? '' : preamble ) + out.join ( '\n' ), checks }
    } // toTestCode func.



describe ( 'Skill examples (skills/dt-toolbox)', () => {
    files.forEach ( file => {
            const
                  md = fs.readFileSync ( path.join ( skillDir, file ), 'utf8' )
                , blocks = [ ...md.matchAll ( /```js\n([\s\S]*?)```/g ) ].map ( m => m[1] )
                ;
            blocks.forEach ( ( raw, i ) => {
                    // Signature illustrations (`...args`) and the CommonJS import line are not runnable programs
                    const isIllustration = /\.\.\.args \)/.test ( raw ) || /require \( 'dt-toolbox' \)/.test ( raw );
                    it.skipIf ( isIllustration ) ( `${file} block #${i+1}`, async () => {
                            const { code } = toTestCode ( raw );
                            const origWarn = console.warn, origError = console.error;
                            console.warn = () => {}
                            console.error = () => {}
                            try {
                                    await new AsyncFunction ( 'dtbox', 'assert', code ) ( dtbox, assert )
                                }
                            finally {
                                    console.warn  = origWarn
                                    console.error = origError
                                }
                        })
                })
        })

    it ( 'has expectations to check', () => {
            const total = files.reduce ( ( sum, file ) => {
                        const md = fs.readFileSync ( path.join ( skillDir, file ), 'utf8' );
                        return sum + [ ...md.matchAll ( /```js\n([\s\S]*?)```/g ) ].reduce ( ( s, m ) => s + toTestCode ( m[1] ).checks, 0 )
                    }, 0 );
            expect ( total ).toBeGreaterThan ( 20 )
        })
}) // describe
