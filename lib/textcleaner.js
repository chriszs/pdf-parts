/*
adapted from https://github.com/documentcloud/docsplit/blob/2a63a8158579cae84dd3e3acd0e5b7e0da6c6b53/lib/docsplit/text_cleaner.rb
original by Andrew Frankel, Jeremy Ashkenas
copyright DocumentCloud, licensed MIT
*/

var StringScanner = require('StringScanner'),
    uniq = require('lodash.uniq');

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
    const WORD = /\S+/;

    const SPACE = /\s+/;
    const NEWLINE = /[\r\n]/;
    const ALNUM = /[a-z0-9]/i;
    const PUNCT = /[[:punct:]]/i;
    const REPEAT = /([^0-9])\1{2,}/;
    const UPPER = /[A-Z]/;
    const LOWER = /[a-z]/;
    const ACRONYM = /^\(?[A-Z0-9\.-]+('?s)?\)?[.,:]?$/;
    const ALL_ALPHA = /^[a-z]+$/i;
    const CONSONANT = /(^y|[bcdfghjklmnpqrstvwxz])/i;
    const VOWEL = /([aeiou]|y$)/i;
    const CONSONANT_5 = /[bcdfghjklmnpqrstvwxyz]{5}/i;
    const VOWEL_5 = /[aeiou]{5}/i;
    const REPEATED = /(\b\S{1,2}\s+)(\S{1,3}\s+){5,}(\S{1,2}\s+)/;
    const SINGLETONS = /^[AaIi]$/;

    this.clean = function (text) {
        const scanner = new StringScanner(text);
        const cleaned = [];
        let spaced = false;

        while (!scanner.eos()) {
            const space = scanner.scan(SPACE);
            if (space) {
                if (!(spaced && !space.match(NEWLINE))) {
                    cleaned.push(space);
                }
                spaced = true;
            } else {
                const word = scanner.scan(WORD);
                if (word && !this.garbage(word)) {
                    cleaned.push(word);
                    spaced = false;
                }
            }
        }

        return cleaned.join('').replace(REPEATED, '');
    };

    this.scan = (w, regex) => {
        const match = w.match(regex);
        if (match) {
            return match;
        }
        return [];
    };

    // Is a given word OCR garbage?
    this.garbage = function (w) {
        const acronym = w.match(ACRONYM);

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
        if (uniq(this.scan(w.slice(1,-1),PUNCT)).length >= 3) {
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
