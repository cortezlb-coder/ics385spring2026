
/*
  ================================================
  DICEE CHALLENGE - GAME LOGIC
  ================================================
  Admin: Lexter Cortez
  Course: ICS 385
  Description: Rolls 3 dice and determines winner
  ================================================
*/





var randomNumber1 = Math.floor(Math.random() * 6) + 1; // Pick a random whole number from 1 to 6 for player 1

var randomDiceImage = "dice" + randomNumber1 + ".png"; // Turn the number into a file name like dice3.png

var randomImageSource = "images/" + randomDiceImage; // Add the folder so the path is like images/dice3.png

var image1 = document.querySelectorAll("img")[0]; // Find the first <img> on the page (player 1)

image1.setAttribute("src", randomImageSource); // Change player 1’s image to the random dice picture


var randomNumber2 = Math.floor(Math.random() * 6) + 1; // Pick a random whole number from 1 to 6 for player 2

var randomImageSource2 = "images/dice" + randomNumber2 + ".png"; // Build the path for player 2’s dice image

document.querySelectorAll("img")[1].setAttribute("src", randomImageSource2); // Change player 2’s image


var randomNumber3 = Math.floor(Math.random() * 6) + 1; // Pick a random whole number from 1 to 6 for player 3

var randomImageSource3 = "images/dice" + randomNumber3 + ".png"; // Build the path for player 3’s dice image

document.querySelectorAll("img")[2].setAttribute("src", randomImageSource3); // Change player 3’s image


// Decide who won and show a message
var highestNumber = Math.max(randomNumber1, randomNumber2, randomNumber3); // Find the biggest roll

var highestCount = 0; // Count how many players have the highest roll
if (randomNumber1 === highestNumber) {
  highestCount++; // Player 1 has the highest number
}
if (randomNumber2 === highestNumber) {
  highestCount++; // Player 2 has the highest number
}
if (randomNumber3 === highestNumber) {
  highestCount++; // Player 3 has the highest number
}

if (highestCount > 1) { // If at least two players share the highest number...
  document.querySelector("h1").innerHTML = "Draw!"; // ...show Draw because there is no single winner
}
else if (randomNumber1 === highestNumber) { // If player 1 has the highest roll...
  document.querySelector("h1").innerHTML = "🚩 Player 1 Wins!"; // ...show player 1 wins
}
else if (randomNumber2 === highestNumber) { // If player 2 has the highest roll...
  document.querySelector("h1").innerHTML = "Player 2 Wins! 🚩"; // ...show player 2 wins
}
else { // Otherwise player 3 must have the highest roll
  document.querySelector("h1").innerHTML = "Player 3 Wins! 🚩"; // ...show player 3 wins
}
