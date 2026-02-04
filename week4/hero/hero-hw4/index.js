
/*
  ================================================
  HERO HOMEWORK 4
  ================================================
  Admin: Lexter Cortez
  Course: ICS 385
  Description:  display a hero, villain, inspiration-quote, popular-movie-quotes (new), and famous last words (new)
  ================================================


*/






//I reorganized the code to make it more readable and maintainable then tested it to make sure it still works as expected.


const superheroes = require('superheroes');
const supervillains = require('supervillains');
const Quote = require('inspirational-quotes');
const famousLastWords = require('famous-last-words'); // added famous-last-words package
const movieQuote = require("popular-movie-quotes");    // added popular-movie-quotes package

var mySuperHeroName = superheroes.random();
var mySuperVillainName = supervillains.random();
var myQuote = Quote.getRandomQuote();
var myFamousLastWords = famousLastWords[Math.floor(Math.random() * famousLastWords.length)];
 //added famous-last-words usage, lots of experimenting to get this to work
var mymovieQuote = movieQuote.getRandomQuote(); //added popular-movie-quotes usage

console.log(mySuperHeroName);
console.log(mySuperVillainName);
console.log(myQuote);
console.log(myFamousLastWords);
console.log(mymovieQuote);

// creates a local web server and displays the above variables
const http = require('http');
const hostname = '127.0.0.1';
const port = 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end("Super Hero: " + mySuperHeroName + "\nSuper Villain: " + mySuperVillainName + "\nQuote of the Day: " + myQuote + "\nMovie Quote: " + mymovieQuote + "\nFamous Last Words: " + myFamousLastWords); // it now shows last words and movie quote in the server response
    // writes the above variables to separate text files
    const fs = require("fs");
  fs.writeFileSync("file2.txt", "Super Hero: " + mySuperHeroName);  //made separate files for each variable for clarity
  fs.writeFileSync("file3.txt", "Super Villain: " + mySuperVillainName);
  fs.writeFileSync("file4.txt", "Quote of the Day: " + myQuote);
  fs.writeFileSync("file5.txt", "Movie Quote: " + mymovieQuote);
  fs.writeFileSync("file6.txt", "Famous Last Words: " + myFamousLastWords);

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});