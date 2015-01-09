from flask import Flask, render_template, jsonify, request
from flask.ext.sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Enum, ForeignKey
from sqlalchemy.orm import relationship


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app)


class Book(db.Model):
    id = Column(Integer, primary_key=True)
    name = Column(String(100))
    author = Column(String(100))
    translator = Column(String(100))
    lang = Column(String(100))


class Page(db.Model):
    id = Column(Integer, primary_key=True)
    book_id = Column(Integer, ForeignKey('book.id'))
    book = relationship(Book, backref='pages')
    page = Column(Integer)
    text = Column(String(5000))
    next = Column(Enum('unknown', 'word', 'old_paragraph', 'new_paragraph', 'new_page'))


@app.route('/')
def home():
    return render_template('home.html')


@app.route('/download')
def download():
    book_id = int(request.values.get('book_id'))
    pages = db.session.query(Page).filter(Page.book_id == book_id).order_by(Page.page).all()
    next = 'new_page'
    content = []
    for page in pages:
        text = page.text.strip()
        while text.startswith('<p></p>'):
            text = text[len('<p></p>'):].lstrip()
        while text.endswith('<p></p>'):
            text = text[:-len('<p></p>')].rstrip()
        if content and next in ('unknown', 'new_paragraph', 'new_page'):
            content.append('\n')
        elif content and next in ('word', 'old_paragraph'):
            if text.startswith('<p>'):
                text = text[len('<p>'):].lstrip()
            if content[-1].endswith('</p>'):
                content[-1] = content[-1][:-len('</p>')].rstrip()
            if next == 'old_paragraph':
                content.append(' ')
        content.append(text)
        next = page.next
    return ''.join(content)


@app.route('/page', methods=['GET'])
def get_page():
    book_id = int(request.values.get('book_id'))
    page = int(request.values.get('page'))
    curr = db.session.query(Page).filter(Page.book_id == book_id, Page.page == page).one()
    prev = db.session.query(Page).filter(Page.book_id == book_id, Page.page == page - 1).first()
    next = db.session.query(Page).filter(Page.book_id == book_id, Page.page == page + 1).first()
    return jsonify({
        'status': 'ok',
        'curr': {'page': curr.page, 'next': curr.next, 'text': curr.text},
        'prev': {'page': prev.page, 'next': prev.next, 'text': prev.text} if prev else None,
        'next': {'page': next.page, 'next': next.next, 'text': next.text} if next else None,
    })


@app.route('/page', methods=['POST'])
def save_page():
    book_id = int(request.values.get('book_id'))
    page = int(request.values.get('page'))
    text = request.values.get('text')
    next = request.values.get('next')
    page = db.session.query(Page).filter(Page.book_id == book_id, Page.page == page).one()
    page.text = text
    page.next = next
    db.session.commit()
    return jsonify({'status': 'ok'})
