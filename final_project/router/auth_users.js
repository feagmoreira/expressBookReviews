const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let matchingUsers = users.filter((user)=>{
        return user.username === username
    });
    if (matchingUsers.length > 0){
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validUsers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if (validUsers.length > 0){
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
    if (authenticatedUser(username,password)) {
      let accessToken = jwt.sign({
        data: password
      }, 'access', { expiresIn: 60 * 60 });
      req.session.authorization = {
        accessToken,username
    }
    return res.status(200).send("User successfully logged in");
    } else {
      return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  let username = req.session.authorization['username'];
  let isbn = req.params.isbn;
  let review = req.query.review
  if (isbn && review){
    let reviews = books[isbn]["reviews"]
    if (reviews.length > 0){
        if (reviews["username"]){
            books[isbn]["reviews"][username] = review;
            res.send("Review updated for user")
        }
        else{
            reviews[username] = review;
            books[isbn]["reviews"] = reviews;
            res.send("Review added")
        }
    }
    else{
        reviews[username] = review;
        books[isbn]["reviews"] = reviews;
        res.send("Review added")
    }
  }
  return res.status(404).json({message: "Information Missing! Review not added"});
});

// Delete own review by a user
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let username = req.session.authorization['username'];
    let isbn = req.params.isbn;
    if (isbn){
      delete books[isbn]["reviews"][username]
    }
    res.send(`Review for username ${username} in the book with isbn ${isbn} deleted.`);
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
