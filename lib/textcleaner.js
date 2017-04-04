/*
adapted from https://github.com/documentcloud/docsplit/blob/2a63a8158579cae84dd3e3acd0e5b7e0da6c6b53/lib/docsplit/text_cleaner.rb
original by Andrew Frankel, Jeremy Ashkenas
copyright DocumentCloud, licensed MIT
*/

var StringScanner = require('StringScanner'),
    _ = require('lodash');

/*
Cleans up OCR'd text by using a series of heuristics to remove garbage
words. Algorithms taken from:
    Automatic Removal of "Garbage Strings" in OCR Text: An Implementation
    -- Taghva, Nartker, Condit, and Borsack
    Improving Search and Retrieval Performance through Shortening Documents,
  Detecting Garbage, and Throwing out Jargon
    -- Kulp */
function TextCleaner() {

    // Cached regexes we plan on using.
    var WORD = /\S+/,
        SPACE = /\s+/,
        NEWLINE = /[\r\n]/,
        ALNUM = /[a-z0-9]/i,
        PUNCT = /[[:punct:]]/i,
        REPEAT = /([^0-9])\1{2,}/,
        UPPER = /[A-Z]/,
        LOWER = /[a-z]/,
        ACRONYM = /^\(?[A-Z0-9\.-]+('?s)?\)?[.,:]?$/,
        ALL_ALPHA = /^[a-z]+$/i,
        CONSONANT = /(^y|[bcdfghjklmnpqrstvwxz])/i,
        VOWEL = /([aeiou]|y$)/i,
        CONSONANT_5 = /[bcdfghjklmnpqrstvwxyz]{5}/i,
        VOWEL_5 = /[aeiou]{5}/i,
        REPEATED = /(\b\S{1,2}\s+)(\S{1,3}\s+){5,}(\S{1,2}\s+)/,
        SINGLETONS = /^[AaIi]$/;

    this.clean = function (text) {
        var scanner = new StringScanner(text),
            cleaned = [],
            spaced = false;

        while (!scanner.eos()) {
            var space = scanner.scan(SPACE);
            if (space) {
                if (!(spaced && !space.match(NEWLINE))) {
                    cleaned.push(space);
                }
                spaced = true;
            } else {
                var word = scanner.scan(WORD);
                if (word && !this.garbage(word)) {
                    cleaned.push(word);
                    spaced = false;
                }
            }
        }

        return cleaned.join('').replace(REPEATED, '');
    };

    this.scan = function (w,regex) {
        var match = w.match(regex);
        if (match) {
            return match;
        }
        return [];
    };

    // Is a given word OCR garbage?
    this.garbage = function (w) {
        var acronym = w.match(ACRONYM);

        // More than 30 bytes in length.
        if (w.length > 30) {
            return true;
        }

        // If there are three or more identical characters in a row in the string.
        if (w.match(REPEAT)) {
            return true;
        }

        // More punctuation than alpha numerics.
        if (!acronym && (this.scan(w,ALNUM).length < this.scan(w,PUNCT).length)) {
            return true;
        }

        // Ignoring the first and last characters in the string, if there are three or
        // more different punctuation characters in the string.
        if (_.uniq(this.scan(w.slice(1,-1),PUNCT)).length >= 3) {
            return true;
        }

        // Four or more consecutive vowels, or five or more consecutive consonants.
        if (w.match(VOWEL_5) || w.match(CONSONANT_5)) {
            return true;
        }

        // Number of uppercase letters greater than lowercase letters, but the word is
        // not all uppercase + punctuation.
        if (!acronym && (this.scan(w,UPPER).length > this.scan(w,LOWER).length)) {
            return true;
        }

        // Single letters that are not A or I.
        if (w.length == 1 && w.match(ALL_ALPHA) && !w.match(SINGLETONS)) {
            return true;
        }

        // All characters are alphabetic and there are 8 times more vowels than
        // consonants, or 8 times more consonants than vowels.
        if (!acronym && (w.length > 2 && w.match(ALL_ALPHA) &&
            (((vows = this.scan(w,VOWEL).length) > (cons = this.scan(w,CONSONANT).length) * 8) ||
                (cons > vows * 8)))) {
            return true;
        }
    };

}

module.exports = TextCleaner;
