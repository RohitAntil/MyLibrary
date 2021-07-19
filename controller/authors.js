const express = require('express')
const author = require('../models/author')
const router = express.Router()
const Author = require('../models/author')

//All authors
router.get('/', async (req, res) =>{
    const searchOptions = {}
    if(req.query.name != null && req.query.name != ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try{
        const authors = await Author.find(searchOptions)
        res.render('authors/index', {authors : authors})
    }catch{
        res.render('/',{ errorMessage : 'something went wrong'})
    }
})

//New author
router.get('/new', (req, res) =>{
    res.render('authors/new', { author: new Author() })
})

//Create Author
router.post('/', async(req, res) =>{
    const author = new Author({
        name : req.body.name
    })
//  let locals = { errorMessage : `something went wrong` }
    try{
        const newAuthor = await author.save()
        res.redirect('authors')
    }catch{
        res.render('authors/new',{
            author : author,
            errorMessage : 'something went wrong'
                })
    }
})

module.exports = router