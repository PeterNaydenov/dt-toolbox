'use strict';

const webpack = require ( 'webpack' );

module.exports = {
      entry: "./src/dt-toolbox.js"
    , mode: 'production'
    , output: {
              filename: "dt-toolbox.min.js"
            , path: __dirname + "/dist"
            , library: 'dtbox'
            , libraryTarget: "umd"
            , umdNamedDefine : true
       }
    , optimization: {}
    , module: {
          rules: [
                  {
                        test: /\.js$/
                      , exclude: /node_modules/
                      , use : { 
                            loader: 'babel-loader'
                          , options : { presets: ['@babel/preset-env']}
                        }
                    }
                ]
        }
}