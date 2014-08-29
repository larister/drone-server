'use strict';

var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');
var uploader = require('./lib/uploader');

var PORT = 8080;

function serveHtml(req, res){
    var path = url.parse(req.url).pathname;
    var htmlFileName = path === '/download' ? 'download.html' : 'upload.html';
    var responseStream = fs.createReadStream('./public/templates/' + htmlFileName);

    res.writeHead(200, {'Content-Type': 'text/html'});

    responseStream.pipe(res);
}

http.createServer(function(req, res) {
    if (req.method === 'GET') {
        serveHtml(req, res);
    } else if (req.method === 'POST') {
        uploader.upload(req, res);
    }
}).listen(PORT, function() {
    console.log('Listening for requests on port ', PORT);
});