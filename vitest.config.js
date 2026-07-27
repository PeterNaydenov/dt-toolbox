import { defineConfig } from 'vitest/config'

export default defineConfig ( {
    test: {
        globals : true
    ,   include : [ 'test/**/*.test.js' ]
    ,   coverage : {
                provider : 'v8'
            ,   include  : [ 'src/**/*.js' ]
            ,   exclude  : [ 'node_modules', 'test', 'test-data' ]
            ,   reporter : [ 'lcov', 'text-summary' ]
            }
        }
    })
