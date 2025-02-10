const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {

  let username = req.body.username.trim();
  let password = req.body.password.trim();

  if(!username || !password) {

    return res.status(400).json({message:"You have to provide all required credentials to registeter!"});

  }

  let isExistingUser = users.find((user) => user.username === username);

  if(!isExistingUser) {

    users.push({"username":username,"password":password});
    return res.status(201).json({message:`User with username ${username} has been successfully registered`});
  }
  
  return res.status(409).json({message:"User with those credentials already exists!"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {

  return res.status(200).json(books);
  
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {

  let isbn = Number(req.params.isbn);

  if(books[isbn]) {

    return res.status(200).json(books[isbn]);

  }

  return res.status(404).json({message:"Book with provided ISBN number not found !"});
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {

  let author = req.params.author;

  let booksByAuthor = Object.values(books).filter((book) => book.author.trim().toLowerCase() === author.trim().toLowerCase());

  if(booksByAuthor.length > 0) {
    
    return res.status(200).json(booksByAuthor);
  }

  return res.status(404).json({message:"Books written by provided author not found !"});
  
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {

  let title = req.params.title;

  let bookByTitle = Object.values(books).find((book) => book.title.trim().toLowerCase() === title.trim().toLocaleLowerCase());

  if(bookByTitle) {

    return res.status(200).json(bookByTitle);
  }

  return res.status(404).json({message:"Book by provided title not found !"});
  
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {

  let isbn = req.params.isbn;

  if(books[isbn]) {

    return res.status(200).json(books[isbn].reviews);
  }

  return res.status(404).json({message:"Book by provided ISBN number not found !"});
 
});

module.exports.general = public_users;
