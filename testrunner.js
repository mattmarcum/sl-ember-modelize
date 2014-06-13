#!/usr/bin/env node
'use strict';

process.title = 'testrunner';

var fs = require( 'fs' ),
    broccoli   = require( 'broccoli' ),
    mergeTrees = require( 'broccoli-merge-trees' ),
    filterES6Modules = require( 'broccoli-es6-module-filter' ),
    pickFiles = require( 'broccoli-static-compiler' ),
    Testem  = require( 'testem' ),
    exportTree = require( 'broccoli-export-tree' ),
    broconcat = require( 'broccoli-concat' ),
    tree = broccoli.loadBrocfile(),
    builder,
    Watcher,
    watcher,
    testem;

tree =  mergeTrees(
            [
                tree,
                broconcat(
                    mergeTrees(
                        [
                            pickFiles( 'vendor/jquery/dist', {
                                srcDir : '/',
                                files : [ 'jquery.js' ],
                                destDir : '/assets'
                            } ),
                            pickFiles( 'vendor/handlebars', {
                                srcDir : '/',
                                files : [ 'handlebars.js' ],
                                destDir : '/assets'
                            } ),
                            pickFiles( 'vendor/loader.js', {
                                srcDir : '/',
                                files : [ 'loader.js' ],
                                destDir : '/assets'
                            } ),
                            pickFiles( 'vendor/ember', {
                                srcDir : '/',
                                files : [ 'ember.js' ],
                                destDir : '/assets'
                            } ),
                            pickFiles( 'vendor/ember-resolver/dist', {
                                srcDir : '/',
                                files : [ 'ember-resolver.js' ],
                                destDir : '/assets'
                            } )
                        ],
                        { overwrite : true }
                    ),
                    {
                        inputFiles : [
                            'assets/loader.js',
                            'assets/jquery.js',
                            'assets/handlebars.js',
                            'assets/ember.js',
                            '**/*.js'
                        ],
                        outputFile : '/assets/vendor.js',
                        wrapInEval : false
                    }
                ),
                broconcat(
                    filterES6Modules(
                        pickFiles( 'test', {
                            srcDir : '/',
                            inputFiles : [ '**/*.js' ],
                            destDir : '/test'
                        } ),
                        {
                            moduleType : 'amd',
                            anonymous : false,
                            compatFix : true,
                            packageName : 'interface-model-test'
                        }
                    ),
                    {
                        inputFiles : [ '**/*.js' ],
                        outputFile : '/test/tests.js',
                        wrapInEval : false
                    }
                ),
                pickFiles( 'test',{
                    srcDir : '/',
                    files : [ 'test.mustache' ],
                    destDir : '/test'
                } )
            ],
            { overwrite : true }
        );

tree = mergeTrees( [
    tree,
    exportTree( tree, {
        destDir : 'tmp/output'
    } )
],{ overwrite : true } );

builder = new broccoli.Builder( tree );
Watcher = require( 'broccoli/lib/watcher' );
watcher = new Watcher( builder );

testem  = new Testem();

testem.startDev( { 'file' : './testem.json' }, function( code ) {

    process.exit( code );
} );

watcher.on( 'change', function() {
    testem.restart();
} );

process.on( 'SIGINT', function () {
    process.exit( 1 );
} );

process.on( 'SIGTERM', function () {
    process.exit( 1 );
} );

process.addListener( 'exit', function () {
    console.log( 'exiting' );
    builder.cleanup();
    fs.rmdir( 'tmp' );
} );

console.log( 'starting...' );