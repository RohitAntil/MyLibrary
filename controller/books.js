const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')
const path = require('path')
const fs = require('path')
//const multer = require('multer')
const uploadPath = path.join('public', Book.coverImageBasePath)
const mimeTypes = ['image/jpeg', 'image/png', 'image/gif']

// const upload = multer({
//     dest: uploadPath,
//     fileFilter: (req, file, callback) => {
//         callback(null, mimeTypes.includes(file.mimetype))
//     }
// })

//All books
router.get('/', async (req, res) => {
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate',req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate',req.query.publishedAfter)
    }
    try {
        const books = await query.exec()
        res.render('books/index', {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.render('/', { errorMessage: 'something went wrong' })
    }
})

//New book
router.get('/new', async (req, res) => {

    renderNewPage(res, new Book())

})

//Create Book
//router.post('/', upload.single('cover'), async (req, res) => {
router.post('/', async (req, res) => {
   // const fileName = req.file != null ? req.file.filename : null
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: req.body.publishDate,
        pageCount: req.body.pageCount,
        description: req.body.description
    })
    saveCover(book, req.body.cover)
    try {
        const newBook = await book.save()
        res.redirect('books')
    } catch {
        // if (book.coverImageName != null) {
        //     removerBookCover(book.coverImageName)
        // }
        renderNewPage(res, book, true)
    }
})

// function removerBookCover(filename) {
//     fs.unlink(path.join(uploadPath, filename), err => {
//         if (err) console.error(err)
//     })
// }

async function renderNewPage(res, book, hasError = false) {
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if (hasError)
            params.errorMessage = 'Error Creating Book'

        res.render('books/new', params)
    } catch {
        res.redirect('/books')
    }

}

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover= JSON.parse(coverEncoded)
    if(cover != null && mimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64')
        book.coverImageType = cover.type
    }
}
module.exports = router