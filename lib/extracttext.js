var highland = require('highland'),
    extractPages = require('./extractpages');

// to do: OCR pages without text
// clean OCR garbage using textcleaner.js
// return individual pages/text boxes

// maybe just shell out to node-tika?

module.exports = (file) => {
    return extractPages(file)
        .flatMap(page => highland(page.getTextContent()))
        .flatMap(content => highland(content.items))
        .map(item => item.str);
};
