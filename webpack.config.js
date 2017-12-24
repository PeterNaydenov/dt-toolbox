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
              filename: "dt-toolbox.js"
            , path: __dirname + "/dist"
            , library: 'dt-toolbox'
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