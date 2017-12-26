"use strict";

const		 
		  simple = require ( '../src/simple'       )
		, sample = require ( '../test-data/sample' )
		, chai   = require ( 'chai'                )
		, expect = chai.expect
		;

describe ( 'module Simple', () => {

    it ( 'isOjbect true', () => {
        const
                a = { a:22, b:12 }
              , result = simple.isObject ( a )
              ;
        expect ( result ).to.be.true
    }) // it isObject true



    it ( 'isOjbect false', () => {
        const a = 12;
        expect ( simple.isObject(a) ).to.be.false
    }) // it isObject false



    it ( '.notObject with undefined or null', () => {
        expect ( simple.notObject(undefined) ).to.be.true
        expect ( simple.notObject(null)      ).to.be.true
    }) // it .notObject with undefined or null



    it ( '.notObject with function', () => {
        const fx = () => 'something';
        expect ( simple.notObject(fx) ).to.be.true
    })


}) // describe