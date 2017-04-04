var _ = require('highland'),
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

require('./domstubs.js');

module.exports = (file) => {
    return extractPages(file)
        .flatMap(page => {
            const scale = 2;
            const viewport = page.getViewport(scale);

            const canvas = new Canvas(viewport.width, viewport.height);
            const ctx = canvas.getContext('2d');

            return _(page.render({
                canvasContext: ctx,
                viewport
            }).then(() => canvas));
        })
        .map(canvas => canvas.pngStream());
};
