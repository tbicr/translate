import { zfill } from 'util';
import { warnAll } from 'highlight';

var containerPrev = document.querySelector('.container-prev'),
    containerNext = document.querySelector('.container-next'),
    image = document.querySelector('.scan-image'),
    imagePrev = document.querySelector('.scan-image-prev'),
    imageNext = document.querySelector('.scan-image-next'),
    article = document.querySelector('.text-edit'),
    articleHighlight = document.querySelector('.text-highlight'),
    articlePrev = document.querySelector('.text-edit-prev'),
    articleNext = document.querySelector('.text-edit-next'),
    articleMedium = new Medium({
        element: article,
        mode: Medium.richMode,
        attributes: null,
        tags: null,
        pasteAsText: false
    });

new MutationObserver(function () {
    articleHighlight.innerHTML = warnAll(articleMedium.value());
}).observe(article, {
    childList: true,
    characterData: true,
    subtree: true,
    attributes: true
});

localStorage['currentPage'] = localStorage['currentPage'] || 0;

var firstPage = 0,
    lastPage = 207,
    pageIndexLength = ('' + lastPage).length,
    prefix = '/static/data/Tven.Pryhody_Toma_Souera-',
    suffixImage = '.png';

var setPage = function () {
    var currentPage = parseInt(localStorage['currentPage']) || 0;
    image.src = prefix + zfill(currentPage, pageIndexLength) + suffixImage;
    imagePrev.src = prefix + zfill(currentPage - 1, pageIndexLength) + suffixImage;
    imageNext.src = prefix + zfill(currentPage + 1, pageIndexLength) + suffixImage;
    $.get('/page', {
        book_id: 1,
        page: zfill(currentPage, pageIndexLength)
    }, function (data) {
        if (data.status !== 'ok') {
            return;
        }
        articleMedium.value(data.curr.text);
        document.querySelector('input[name=next][value=' + data.curr.next + ']').checked = true;
        if (data.prev) {
            articlePrev.innerHTML = data.prev.text;
            containerPrev.style.opacity = 1;
        } else {
            containerPrev.style.opacity = 0;
        }
        if (data.next) {
            articleNext.innerHTML = data.next.text;
            containerNext.style.opacity = 1;
        } else {
            containerNext.style.opacity = 0;
        }

    });
    window.location.hash = currentPage;
};

setPage();

document.querySelector('.action-prev').addEventListener('click', function () {
    var currentPage = parseInt(localStorage['currentPage']) || 0;
    if (currentPage <= firstPage) {
        return;
    }
    localStorage['currentPage'] = currentPage - 1;
    setPage();
}, false);

document.querySelector('.action-next').addEventListener('click', function () {
    var currentPage = parseInt(localStorage['currentPage']) || 0;
    if (currentPage >= lastPage) {
        return;
    }
    localStorage['currentPage'] = currentPage + 1;
    setPage();
}, false);

document.querySelector('.action-first').addEventListener('click', function () {
    var currentPage = parseInt(localStorage['currentPage']) || 0;
    if (currentPage === firstPage) {
        return;
    }
    localStorage['currentPage'] = firstPage;
    setPage();
}, false);

document.querySelector('.action-last').addEventListener('click', function () {
    var currentPage = parseInt(localStorage['currentPage']) || 0;
    if (currentPage === lastPage) {
        return;
    }
    localStorage['currentPage'] = lastPage;
    setPage();
}, false);

document.querySelector('.action-save').addEventListener('click', function () {
    var currentPage = parseInt(localStorage['currentPage']) || 0;
    var checkboxes = document.querySelectorAll('input[name=next]');
    var checked = 'unknown';
    for (var i = 0, l = checkboxes.length; i < l; i++) {
        var checkbox = checkboxes[i];
        if (checkbox.checked) {
            checked = checkbox.value;
            break;
        }
    }
    console.log(checked);
    $.post('/page', {
        book_id: 1,
        page: zfill(currentPage, pageIndexLength),
        text: article.innerHTML,
        next: checked
    }, function () {

    })
}, false);

var replacer = {
    '.action-style-h1': ['heading', 'h1', null, null],
    '.action-style-h2': ['heading', 'h2', null, null],
    '.action-style-h3': ['heading', 'h3', null, null],
    '.action-style-h4': ['heading', 'h4', null, null],
    '.action-style-h5': ['heading', 'h5', null, null],
    '.action-style-h6': ['heading', 'h6', null, null],
    '.action-style-p': ['insertParagraph', false, null, null],
    '.action-style-b': ['bold', false, null, null],
    '.action-style-i': ['italic', false, null, null],
    '.action-style-quote': ['insertText', true, '«', '»'],
    '.action-style-comment': ['insertHTML', true, '<sup><a>', '</a></sup>']
};

for (var selector in replacer) {
    var items = replacer[selector];
    document.querySelector(selector).addEventListener('mousedown', (function (action, argText, argPre, argPost) {
        var arg = argText
            ? (argPre || '') + (argText === true ? document.getSelection() : argText) + (argPost || '')
            : null;
        articleMedium.invokeElement(action, arg);
        return false;
    }).bind(null, items[0], items[1], items[2], items[3]), false);
    document.querySelector(selector).addEventListener('mouseup', function () {
        article.focus();
    }, false);
}

image.addEventListener('load', function () {
    article.style.width = (image.clientWidth + 1) + 'px';
    article.style.height = (image.clientHeight + 1) + 'px';
    articleHighlight.style.width = (image.clientWidth + 1) + 'px';
    articleHighlight.style.height = (image.clientHeight + 1) + 'px';
    imagePrev.style.width = (image.clientWidth + 1) + 'px';
    imagePrev.style.height = (image.clientHeight + 1) + 'px';
    articlePrev.style.width = (image.clientWidth + 1) + 'px';
    imageNext.style.width = (image.clientWidth + 1) + 'px';
    imageNext.style.height = (image.clientHeight + 1) + 'px';
    articleNext.style.width = (image.clientWidth + 1) + 'px';
}, false);