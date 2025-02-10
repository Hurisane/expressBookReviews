const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  if (!username || typeof username !== "string") return false; 

  username = username.trim(); 

  const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{2,19}$/; 

  return usernameRegex.test(username);
};


const authenticatedUser = (username,password)=>{ 
  
  return users.some((user) => user.username === username && user.password === password);

}

//only registered users can login


regd_users.post("/login", (req, res) => {
    let username = req.body.username ? req.body.username.trim() : null;
    let password = req.body.password ? req.body.password.trim() : null;

    if (!username || !password) {
        return res.status(400).json({ message: "You have to provide all required credentials!" });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign(
            { data: username },
            "access",
            { expiresIn: "1h" } 
        );

        
        req.session.authenticated = { accessToken, username };

        return res.status(200).json({ 
            message: "User successfully logged in", 
            accessToken 
        });
    }

    return res.status(401).json({ message: "Invalid username or password!" });
});


// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

  let isbn = req.params.isbn;
  let review = req.body.review;
  let user = req.session.authenticated?.username

  if(!user){

    return res.status(400).json({message:"You have to be logged in to add review"});
  }

    if (!books[isbn]) {
      return res.status(404).json({ message: "Book with provided ISBN not found!" });
  }

  if (!review) {
      return res.status(400).json({ message: "Review cannot be empty!" });
  }


  books[isbn].reviews[user] = review;

  return res.status(200).json({ message: "Review added/updated successfully!", reviews: books[isbn].reviews });

});


regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const user = req.session?.authenticated?.username;

  if (!user) {
      return res.status(401).json({ message: "You must be logged in to delete a review." });
  }

  if (!books[isbn]) {
      return res.status(404).json({ message: "Book with the provided ISBN not found!" });
  }

  if (!books[isbn].reviews || !books[isbn].reviews[user]) {
      return res.status(404).json({ message: "You haven't posted a review for this book." });
  }

  const review = books[isbn].reviews[user];
  delete books[isbn].reviews[user];

  return res.status(200).json({ message: `Your review: "${review}" has been successfully deleted.` });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
