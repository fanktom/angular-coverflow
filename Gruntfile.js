'use strict';

module.exports = function(grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({
        concat : {
            dist : {
                files : {
                    'dist/coverflow.js' : [
                      'src/coverflow.js',
                      'src/covers.js'
                    ]
                }
            }
        },
        clean : {
            dist : {
                files : [ {
                    dot : true,
                    src : [ 'dist/**' ]
                } ]
            },
            server : '.tmp'
        },
        uglify: {
            dist: {
                files: { 'dist/coverflow.min.js': [ 'dist/coverflow.js' ] }
            }
        },
        jshint : {
            options : {
                jshintrc : '.jshintrc'
            },
            all : [ 'Gruntfile.js', 'src/*.js' ]
        },
        copy: {
            main: {
                files: [
                    {expand: true, src: ['./*.json'], dest: 'dist/', filter: 'isFile'}, //copy *.json
                    {expand: true, src: ['./*.md'], dest: 'dist/', filter: 'isFile'}, // copy *.md
                    {expand: true, src: ['./*.css'], dest: 'dist/', filter: 'isFile'}, // copy *.css
                    {expand: true, src: ['./src/covers/**'], dest: 'dist/covers', filter: 'isFile', flatten:true} // copy covers
                ]
            }
        }
    });

    grunt.registerTask('build', [
        'clean:dist',
        'jshint',
        'concat',
        'uglify',
        'copy'
    ]);

    grunt.registerTask('default', [ 'build' ]);
};
