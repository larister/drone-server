'use strict';

var path = require('path');
var fs = require('fs');
var multiparty = require('multiparty');
var string = require('string');
var async = require('async');

var PART_NAMES = ['brain', 'body', 'turret'];
var ROBOTS_DIR = './robots';

function movePart(files, roboDirectory, partName, done){
    var extension;
    var destination;
    var part = Array.isArray(files[partName]) ? files[partName][0] : undefined;

    if(part && part.originalFilename){
        extension = path.extname(part.originalFilename);
        destination = roboDirectory + '/' + partName + extension;

        console.log("Moving " + part.path + " to " + destination);

        return fs.rename(part.path, destination, done);
    }

    console.warn('no file found for ' + partName);

    done();
}

function writeRobot(files, roboDirectory, res){
    async.each(PART_NAMES, movePart.bind(null, files, roboDirectory), function movingFinished(err){
        if(err){
            console.error(err);
            return res.end(500, 'Error moving robot parts');
        }
        res.writeHead(200, {'content-type': 'text/plain'});
        res.end('Robot uploaded!\n\nRobo ID = ' + roboDirectory);
    });
}

function upload(req, res){
    var form = new multiparty.Form();

    form.uploadDir = './uploads';

    form.parse(req, function(err, fields, files){
        var robotName = fields['Robot Name'][0];
        var id = string(robotName).slugify().s;
        var roboDirectory = path.join(ROBOTS_DIR, id);

        fs.mkdir(roboDirectory, function(err){
            if(err){
                if(err.code !== 'EEXIST'){
                    console.error(err);
                    res.end(500, 'Error saving robot');
                }
                console.warn(roboDirectory + ' already exists, overwriting...');
            }

            writeRobot(files, roboDirectory, res);

        });
    });
}

module.exports = {
    upload: upload
};
