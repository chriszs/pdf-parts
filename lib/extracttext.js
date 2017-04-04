var _ = require('highland'),
    extractPages = require('./extractpages');

// to do: OCR pages without text
// clean OCR garbage using textcleaner.js
// return individual pages/text boxes

// maybe just shell out to node-tika?

module.exports = (file) => {
    return extractPages(file)
        .flatMap(page => _(page.getTextContent()))
        .flatMap(content => _(content.items))
        .map(item => item.str);
};
