global.DOMParser = require('../lib/domparsermock').DOMParserMock;

var fs = require('fs'),
    pdfjs = require('pdfjs-dist'),
    _ = require('highland');

pdfjs.disableWorker = true; // is this needed?

module.exports = (file) => {
    return _([file])
        .map(file => new Uint8Array(fs.readFileSync(file)))
        .flatMap(data => _(pdfjs.getDocument(data)))
        .flatMap(doc => {
            const numPages = doc.numPages;
            const pages = [];

            for (let i = 1; i <= numPages; i++) {
                pages.push(i);
            }

            return _(pages).map(page => _(doc.getPage(page)));
        })
        .flatten();
};
