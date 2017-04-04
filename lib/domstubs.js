// from https://github.com/mozilla/pdf.js/blob/a7c35025fed8beb8f9b93688fff40497c7ad2de0/examples/node/pdf2svg.js

/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */

var Canvas = require('canvas');

function xmlEncode(s){
  let i = 0;
  let ch;
  s = String(s);
  while (i < s.length && (ch = s[i]) !== '&' && ch !== '<' &&
         ch !== '\"' && ch !== '\n' && ch !== '\r' && ch !== '\t') {
    i++;
  }
  if (i >= s.length) {
    return s;
  }
  let buf = s.substring(0, i);
  while (i < s.length) {
    ch = s[i++];
    switch (ch) {
      case '&':
        buf += '&amp;';
        break;
      case '<':
        buf += '&lt;';
        break;
      case '\"':
        buf += '&quot;';
        break;
      case '\n':
        buf += '&#xA;';
        break;
      case '\r':
        buf += '&#xD;';
        break;
      case '\t':
        buf += '&#x9;';
        break;
      default:
        buf += ch;
        break;
    }
  }
  return buf;
}

global.btoa = function btoa(chars) {
  const digits =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  let buffer = '';
  let i;
  let n;
  for (i = 0, n = chars.length; i < n; i += 3) {
    const b1 = chars.charCodeAt(i) & 0xFF;
    const b2 = chars.charCodeAt(i + 1) & 0xFF;
    const b3 = chars.charCodeAt(i + 2) & 0xFF;
    const d1 = b1 >> 2;
    const d2 = ((b1 & 3) << 4) | (b2 >> 4);
    const d3 = i + 1 < n ? ((b2 & 0xF) << 2) | (b3 >> 6) : 64;
    const d4 = i + 2 < n ? (b3 & 0x3F) : 64;
    buffer += (digits.charAt(d1) + digits.charAt(d2) +
    digits.charAt(d3) + digits.charAt(d4));
  }
  return buffer;
};

class DOMElement {
  constructor(name) {
    this.nodeName = name;
    this.childNodes = [];
    this.attributes = {};
    this.textContent = '';

    if (name === 'style') {
      this.sheet = {
        cssRules: [],
        insertRule(rule) {
          this.cssRules.push(rule);
        },
      };
    }
  }

  setAttributeNS(NS, name, value='') {
    value = xmlEncode(value);
    this.attributes[name] = value;
  }

  appendChild(element) {
    const childNodes = this.childNodes;
    if (!childNodes.includes(element)) {
      childNodes.push(element);
    }
  }

  toString() {
    const attrList = [];
    for (var i in this.attributes) {
      attrList.push(`${i}="${xmlEncode(this.attributes[i])}"`);
    }

    if (this.nodeName === 'svg:tspan' || this.nodeName === 'svg:style') {
      const encText = xmlEncode(this.textContent);
      return `<${this.nodeName} ${attrList.join(' ')}>${encText}</${this.nodeName}>`;
    } else if (this.nodeName === 'svg:svg') {
      const ns = 'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
               'xmlns:svg="http://www.w3.org/2000/svg"';
      return `<${this.nodeName} ${ns} ${attrList.join(' ')}>${this.childNodes.join('')}</${this.nodeName}>`;
    } else {
      return `<${this.nodeName} ${attrList.join(' ')}>${this.childNodes.join('')}</${this.nodeName}>`;
    }
  }

  cloneNode() {
    const newNode = new DOMElement(this.nodeName);
    newNode.childNodes = this.childNodes;
    newNode.attributes = this.attributes;
    newNode.textContent = this.textContent;
    return newNode;
  }
}

global.document = {
  childNodes : [],

  get currentScript() {
    return { src: '' };
  },

  get documentElement() {
    return this;
  },

  createElementNS(NS, element) {
    const elObject = new DOMElement(element);
    return elObject;
  },

  createElement(element) {
    if (element == 'canvas') {
      return new Canvas();
    }

    return this.createElementNS('', element);
  },

  getElementsByTagName(element) {
    if (element === 'head') {
      return [this.head || (this.head = new DOMElement('head'))];
    }
    return [];
  }
};