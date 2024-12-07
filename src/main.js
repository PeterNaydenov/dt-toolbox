'use strict'

/*
    DT object & DT Toolbox
    =======================
    
    Version 7.1.0

    History notes:
     - Idea was born on March 17th, 2016.
     - Completely redesigned in September/October, 2016
     - Published on GitHub for first time: January 14th, 2017
     - Compare methods were added: identical, change, same, different, missing. January 29th, 2017
     - Invert selection method was added. February 19th, 2017
     - String format support introduces. April 22th, 2017
     - Works in browsers. December 24th, 2017

     - Refactoring and version 3.0.0   April 14th, 2020 - February 24th, 2020
         * Much faster and memory efficient algorithms;
         * Multiple convertors for switching among different data-type;
         * Change of internal data-description;
         * Old internal data-type have a new name(breadcrumbs) and is fully supported(import/export);
         * Support for tuples(import and export);
         * Complete code refactoring;
         
     - Refactoring and version 6.0.0  May 12th 2023
         * Keeps only the idea, changes everything else;
         * Simplified API interface;
         * New internal data model;
         * Data inserts;
         * Filters for faster data scan;
         * Model and query functions to shape results;
    
     - Version 7.1.0 published on August 29th, 2023
            * Some fixes on version v.7.0.0;
            * New method `extractList` for multiple data extraction from dt-model;
            
     - Version 7.4.3 published on December 7th, 2024
            * Update a 'walk' library to version 5.x.x;
            * Development dependencies updates;
*/



import mainLib from './mainLib.js'
const { init, load, flating, converting, getWalk } =  mainLib;







const dtbox = {
            init,
            load, 
            flat : flating, 
            convert : converting,
            getWalk
        } // dtbox func.


    
export default dtbox    
 

