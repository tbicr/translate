var getData = function () {
    return {
        match: arguments[0],
        groups: Array.prototype.slice.call(arguments, 1, -2),
        index: Array.prototype.slice.call(arguments, -2, -1)[0],
        input: Array.prototype.slice.call(arguments, -1)[0]
    }
};

var punctuationManySpaces = /(\?|\?\.\.|\!|\!\.\.|\.|\.\.\.|\,|\;|\:)\0*(\s\s+)/gm;
var punctuationExceptSpaces = /(\?|\?\.\.|\?\!|\!|\!\.\.|\.|\.\.\.|\,|\;|\:)\0*([^$\s\?\!\.\0])/gm;

export var warnPunctuation = function (text) {
    var matches = [];
    text.replace(punctuationManySpaces, function () {
        var match = getData.apply(this, arguments);
        matches.push([match.index, match.index + match.groups[0].length, 'warn-punctuation-many-spaces']);
    });
    text.replace(punctuationExceptSpaces, function () {
        var match = getData.apply(this, arguments);
        matches.push([match.index, match.index + match.groups[0].length, 'warn-punctuation-except-spaces']);
    });
    return matches;
};

export var warnParagraphEnd = function (text) {
    var matches = [];
    return matches;
};

var lettersUppercase = 'АБВГДЕЁЖЗІЙКЛМНОПРСТУЎФХЦЧШЫЬЭЮЯ';
var lettersLowercase = 'абвгдеёжзійклмнопрстуўфхцчшыьэюя';
var letters = lettersUppercase + lettersLowercase;
var numbers = '0123456789';
var punctuation = '!?.,;:- ';
var chars = letters + punctuation + numbers;
var suspiciousCharacters = new RegExp('([^' + letters + numbers + '\\?\\!\\.\\,\\;\\:\\-\' \n«»\\(\\)\0]+)', 'gm');

export var warnWordSymbols = function (text) {
    var matches = [];
    return matches;
};

export var warnWordDictionary = function (text) {
    var matches = [];
    return matches;
};

export var warnSuspiciousCharacters = function (text) {
    var matches = [];
    //for (var i = 0, l = text.length; i < l; i ++) {
    //    if (chars.indexOf(text[i]) === -1) {
    //        matches.push([i, i + 1, 'warn-suspicious-characters']);
    //    }
    //}
    text.replace(suspiciousCharacters, function () {
        var match = getData.apply(null, arguments);
        matches.push([match.index, match.index + match.groups[0].length, 'warn-suspicious-characters']);
    });
    return matches;
};

var sanitizeHtmlRegexp = /<(\/?)([\w-]+)( +[\w-]+="[\w-#]+")*( *)(\/?)>/gm;

var sanitizeHtmlReplacer = function (match) {
    return new Array(match.length + 1).join('\0');
};

export var sanitizeHtml = function (text) {
    return text.replace(sanitizeHtmlRegexp, sanitizeHtmlReplacer);
};

export var warnAll = function (text) {
    var sanitizedText = sanitizeHtml(text);

    var matches = [];
    matches = matches.concat(warnPunctuation(sanitizedText));
    matches = matches.concat(warnParagraphEnd(sanitizedText));
    matches = matches.concat(warnWordSymbols(sanitizedText));
    matches = matches.concat(warnWordDictionary(sanitizedText));
    matches = matches.concat(warnSuspiciousCharacters(sanitizedText));
    var inserts = {};
    for (var i = 0, l = matches.length; i < l; i++) {
        var match = matches[i];
        if (!(match[0] in inserts)) {
            inserts[match[0]] = [];
        }
        if (!(match[1] in inserts)) {
            inserts[match[1]] = [];
        }
        inserts[match[0]].push('<span class="' + match[2] + '">');
        inserts[match[1]].push('</span>');
    }
    var keys = Object.keys(inserts).sort(function (key1, key2) {
        return parseInt(key2) - parseInt(key1);
    });
    for (var i = 0, l = keys.length; i < l; i++) {
        var key = keys[i];
        var insert = inserts[key];
        text = text.slice(0, key) + insert.join('') + text.slice(key);
    }
    return text;
};

export var warnClean = function (text) {
    return text;
};
