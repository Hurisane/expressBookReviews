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
public_users.get('/',async (req, res) =>{

  try {

    const booksData = await new Promise((resolve) => {

      resolve(books);
    });

    return res.status(200).json(booksData);
  }

  catch (error) {

    return res.status(500).json({message:"Error retrieving data"})
  }

});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {

  try {
    const isbn = req.params.isbn;

    const bookData = await new Promise((resolve, reject) => {
      if (books[isbn]) {
        resolve(books[isbn]);
      } else {
        reject(new Error("Book with provided ISBN number not found!"));
      }
    });

    return res.status(200).json(bookData);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});
  
// Get book details based on author

public_users.get('/author/:author', async (req, res) => {
  try {
    let author = req.params.author;

    const booksByAuthor = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(
        (book) => book.author.trim().toLowerCase() === author.trim().toLowerCase()
      );

      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(new Error("Books written by provided author not found!"));
      }
    });

    return res.status(200).json(booksByAuthor);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  try {
    let title = req.params.title;

    const booksByTitle = await new Promise((resolve, reject) => {
      const filteredBooks = Object.values(books).filter(
        (book) => book.title.trim().toLowerCase() === title.trim().toLowerCase()
      );

      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(new Error("Books with the provided title not found!"));
      }
    });

    return res.status(200).json(booksByTitle);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
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
