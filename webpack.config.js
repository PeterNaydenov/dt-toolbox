'use strict';

const 
      webpack = require ( 'webpack' )
    , uglifyOptions = {
                          minimize : true
                        , mangle   : true
                    }
    ;

module.exports = {
      entry: "./src/dt-toolbox.js"
    , output: {
              filename: "dt-toolbox.min.js"
            , path: __dirname + "/dist"
            , library: 'dtbox'
            , libraryTarget: "umd"
            , umdNamedDefine : true
       }
    , module: {
          loaders: [
              {test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/, query: { presets: ['env'] }   }
          ]
        }
    , plugins: [
                    new webpack.optimize.UglifyJsPlugin ( uglifyOptions )
                ]
}