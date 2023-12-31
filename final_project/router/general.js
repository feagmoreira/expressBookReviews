const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      if (!isValid(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
  });

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    res.send(books[isbn])
    });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  let author = req.params.author;
  let matchingAuthors = [];
  if (author){
    for (let key in books){
        if(books[key]["author"] === author){
            matchingAuthors.push(books[key]); 
        }
    }
    if (matchingAuthors.length > 0){
        res.send(matchingAuthors);
    }   
  }
  return res.status(404).json({message: "No book found for this author."});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let title = req.params.title;
    let matchingTitles = [];
    if (title){
      for (let key in books){
          if(books[key]["title"] === title){
              matchingTitles.push(books[key]); 
          }
      }
      if (matchingTitles.length > 0){
          res.send(matchingTitles);
      }   
    }
    return res.status(404).json({message: "No book found with this title."});
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  let isbn = req.params.isbn
  res.send(books[isbn]["reviews"]);
});

//New Functions using asyn/await
// Get the book list available in the shop
async function getAllBooks(){
	try{
        const response = await axios.get("https://feagmoreira-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/");
        return response.data;
    }
    catch(error){
        return error;
    }
};

public_users.get('/async', async function (req, res) {
    try{
        const response = await getAllBooks();
        res.send(JSON.stringify(response,null,4));
    }
    catch(error){
        res.send(error)
    }
});

// Get book details based on ISBN
async function getBookByISBN(isbn){
	try{
        const response = await axios.get(`https://feagmoreira-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/isbn/${isbn}`);
        console.log(response.data)
        return response.data;
    }
    catch(error){
        return error;
    }
    
};

public_users.get('/async/isbn/:isbn', async function (req, res) {
    try{
        const isbn = req.params.isbn;
        const response = await getBookByISBN(isbn)
        res.send(response)
    }
    catch(error){
        res.send(error);
    }
    
});

// Get book details based on author
async function getBookByAuthor(author){
	try{
        const response = await axios.get(`https://feagmoreira-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/author/${author}`);
        console.log(response.data)
        return response.data
    }
    catch(error){
        return(error)
    }
    
};

public_users.get('/async/author/:author', async function (req, res) {
    try{
        let author = req.params.author;
        const response = await getBookByAuthor(author)
        res.send(response)
    }
    catch(error){
        res.send(error)
    }
});

// Get all books based on title
async function getBookByTitle(title){
	try{
        const response = await axios.get(`https://feagmoreira-5000.theiadockernext-1-labs-prod-theiak8s-4-tor01.proxy.cognitiveclass.ai/title/${title}`);
        console.log(response.data)
        return response.data
    }
    catch(error){
        return error;
    }
    
};
public_users.get('/async/title/:title',async function (req, res) {
    try{
        let title = req.params.title;
        const response = await getBookByTitle(title)
        res.send(response)
    }
    catch(error){
        res.send(error)
    }
    
});

module.exports.general = public_users;
