// Started as a PDF.js example file, originally licensed public domain

global.DOMParser = require('../lib/domparsermock').DOMParserMock;

var fs = require('fs'),
    pdfjsLib = require('pdfjs-dist'),
    highland = require('highland');

pdfjsLib.disableWorker = true; // is this needed?

module.exports = function (file) {
    return highland([file])
        .map(function (file) {
            return new Uint8Array(fs.readFileSync(file));
        })
        .flatMap(function (data) {
            return highland(pdfjsLib.getDocument(data));
        })
        .flatMap(function (doc) {
            var numPages = doc.numPages;
            var pages = [];

            for (var i = 1; i <= numPages; i++) {
                pages.push(i);
            }

            return highland(pages).map(function (page) {
                return highland(doc.getPage(page));
            });
        })
        .flatten();
};
