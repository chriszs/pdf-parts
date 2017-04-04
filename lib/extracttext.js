var highland = require('highland'),
    extractPages = require('./extractpages');

var file = __dirname + '/../test/data/Goodmanonravel.pdf';

// to do: OCR pages without text
// clean OCR garbage using textcleaner.js
// return individual pages/text boxes

module.exports = function (file) {
    return extractPages(file)
        .flatMap(function (page) {
            return highland(page.getTextContent());
        })
        .flatMap(function (content) {
            return highland(content.items);
        })
        .map(function (item) {
            return item.str;
        });
};
