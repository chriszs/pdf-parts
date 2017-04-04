var fs = require('fs'),
    highland = require('highland'),
    extractPages = require('./extractpages'),
    Canvas = require('canvas'),
    HTMLElement = require('html-element');

// this doesn't always render perfectly yet
// maybe just shell out to gm?

// also, this is new: https://github.com/mozilla/pdf.js/blob/master/examples/node/pdf2png/pdf2png.js
// see if they've solved this in a cleaner way
// (so far I'm hitting an error on the stable release)

global.Image = Canvas.Image;
global.HTMLElement = HTMLElement.Element;

var file = __dirname + '/../test/data/Goodmanonravel.pdf';

require('./domstubs.js');

module.exports = function (file) {
    return extractPages(file)
        .flatMap(function(page) {
            var scale = 2;
            var viewport = page.getViewport(scale);

            var canvas = new Canvas(viewport.width, viewport.height);
            var ctx = canvas.getContext('2d');

            return highland(page.render({
                canvasContext: ctx,
                viewport: viewport
            }).then(function () {
                return canvas;
            }));
        })
        .map(function(canvas) {
            return canvas.pngStream();
        });
};
