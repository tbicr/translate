var assert = require('assert'),
    hg = require('./highlight.js');

describe('sanitizeHtml', function () {
    it('Valid', function () {
        assert.equal(hg.sanitizeHtml('<a href="#test"><sup>Test</sup></a>'), '\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0\0Test\0\0\0\0\0\0\0\0\0\0')
    });
});

describe('warnPunctuation', function() {
    it('Valid', function () {
        assert.deepEqual(hg.warnPunctuation('test'), []);
        assert.deepEqual(hg.warnPunctuation('test.'), []);
        assert.deepEqual(hg.warnPunctuation('test. next.'), []);
        assert.deepEqual(hg.warnPunctuation('test... next.'), []);
        assert.deepEqual(hg.warnPunctuation('test!.. next.'), []);
        assert.deepEqual(hg.warnPunctuation('test?.. next.'), []);
        assert.deepEqual(hg.warnPunctuation('<b>test.</b>'), []);
        assert.deepEqual(hg.warnPunctuation('<p>test.</p>\n<p>test.</p>'), []);
    });

    it('Many Spaces', function () {
        assert.deepEqual(hg.warnPunctuation('test.  '), [[4, 5, 'warn-punctuation-many-spaces']]);
        assert.deepEqual(hg.warnPunctuation('test.  next.  '), [[4, 5, 'warn-punctuation-many-spaces'], [11, 12, 'warn-punctuation-many-spaces']]);
        assert.deepEqual(hg.warnPunctuation('test...  '), [[4, 7, 'warn-punctuation-many-spaces']]);
        assert.deepEqual(hg.warnPunctuation('test...  next...  '), [[4, 7, 'warn-punctuation-many-spaces'], [13, 16, 'warn-punctuation-many-spaces']]);
        assert.deepEqual(hg.warnPunctuation('<b>test.</b>  next.'), [[7, 8, 'warn-punctuation-many-spaces']]);
    });

    it('Except Spaces', function () {
        assert.deepEqual(hg.warnPunctuation('test.next.'), [[4, 5, 'warn-punctuation-except-spaces']]);
        assert.deepEqual(hg.warnPunctuation('test...next...more...'), [[4, 7, 'warn-punctuation-except-spaces'], [11, 14, 'warn-punctuation-except-spaces']]);
    });
});