// Started as a PDF.js example file, originally licensed public domain

global.DOMParser = require('../lib/domparsermock').DOMParserMock;

var fs = require('fs'),
    pdfjs = require('pdfjs-dist'),
    highland = require('highland');

pdfjs.disableWorker = true; // is this needed?

module.exports = (file) => {
    return highland([file])
        .map(file => new Uint8Array(fs.readFileSync(file)))
        .flatMap(data => highland(pdfjs.getDocument(data)))
        .flatMap(doc => {
            const numPages = doc.numPages;
            const pages = [];

            for (let i = 1; i <= numPages; i++) {
                pages.push(i);
            }

            return highland(pages).map(page => highland(doc.getPage(page)));
        })
        .flatten();
};
