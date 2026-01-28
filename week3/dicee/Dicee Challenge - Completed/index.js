// ========================================
// DICEE GAME - BEGINNER EXPLANATIONS
// ========================================
// Overview (simple):
// - This script runs when the page loads and "rolls" two dice by choosing
//   random numbers from 1 to 6. It then updates the images on the page
//   and shows which player won.
//
// Execution note for beginners:
// - The <script> tag is placed at the end of the HTML body so the elements
//   (images and heading) already exist in the DOM when this code runs.
// - "DOM" means Document Object Model — the structure of the page that JS can read and change.

// ===== HELPFUL JS BUILDING BLOCKS =====
// Math.random(): returns a decimal between 0 (inclusive) and 1 (exclusive).
// Math.floor(x): rounds x down to the nearest integer.
// To get a random integer from 1 to 6:
//   Math.floor(Math.random() * 6) + 1
//   - Math.random() * 6 gives a number from 0 up to (but not including) 6.
//   - Math.floor(...) turns it into 0,1,2,3,4,5.
//   - +1 converts this to 1,2,3,4,5,6.

// ===== PLAYER 1: ROLL AND IMAGE UPDATE =====
// Generate a random number between 1 and 6 for player 1
var randomNumber1 = Math.floor(Math.random() * 6) + 1; // value: 1-6

// Build the image filename like "dice3.png" using string concatenation
var randomDiceImage = "dice" + randomNumber1 + ".png"; // e.g., "dice4.png"

// Prefix with the images/ folder to form the full path
var randomImageSource = "images/" + randomDiceImage; // e.g., "images/dice4.png"

// Select the first <img> element in the page (index 0) and update its 'src'
// Beginner tip: querySelectorAll("img") returns a list (NodeList) of img elements.
// The [0] picks the first one. You can also give the img an id and use getElementById.
var image1 = document.querySelectorAll("img")[0];
image1.setAttribute("src", randomImageSource);


// ===== PLAYER 2: ROLL AND IMAGE UPDATE =====
// Generate a random number for player 2
var randomNumber2 = Math.floor(Math.random() * 6) + 1;

// Create the path to player 2's image and set it directly
var randomImageSource2 = "images/dice" + randomNumber2 + ".png";
document.querySelectorAll("img")[1].setAttribute("src", randomImageSource2);


// ===== DETERMINE THE WINNER =====
// Compare the two numbers and update the heading text accordingly.
// innerHTML replaces the HTML content inside the <h1> element. It's easy to use,
// but be careful not to insert untrusted user content this way in real apps.
if (randomNumber1 > randomNumber2) {
  // Player 1 rolled higher
  document.querySelector("h1").innerHTML = "🚩 Player 1 Wins!";
}
else if (randomNumber2 > randomNumber1) {
  // Player 2 rolled higher
  document.querySelector("h1").innerHTML = "Player 2 Wins! 🚩";
}
else {
  // Same number -> tie
  document.querySelector("h1").innerHTML = "Draw!";
}

// ===== FURTHER IDEAS FOR LEARNING =====
// - Try replacing var with let or const and see how it behaves.
// - Give each <img> an id (like id="dice1") and use document.getElementById('dice1').
// - Log values to the console while learning: console.log(randomNumber1, randomNumber2);
