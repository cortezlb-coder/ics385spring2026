// ========================================
// DICEE GAME - MODERN JAVASCRIPT VERSION
// ========================================
// Overview:
// - Users click "Roll Dice" to generate random rolls for two players
// - The game displays dice images and determines the winner
// - Scores persist across multiple rolls
// - Console logging helps debug and learn

// ===== GAME STATE =====
let player1Wins = localStorage.getItem("player1Wins") ? parseInt(localStorage.getItem("player1Wins")) : 0;
let player2Wins = localStorage.getItem("player2Wins") ? parseInt(localStorage.getItem("player2Wins")) : 0;

console.log("Game initialized. Player 1 Wins:", player1Wins, "Player 2 Wins:", player2Wins);

// Update the scoreboard on page load
document.getElementById("player1-wins").textContent = player1Wins;
document.getElementById("player2-wins").textContent = player2Wins;

// ===== MAIN ROLL FUNCTION =====
function rollDice() {
  console.log("=== ROLL STARTED ===");
  
  // Generate random numbers for both players (1-6)
  const randomNumber1 = Math.floor(Math.random() * 6) + 1;
  const randomNumber2 = Math.floor(Math.random() * 6) + 1;
  
  console.log("Player 1 rolled:", randomNumber1);
  console.log("Player 2 rolled:", randomNumber2);
  
  // Update Player 1's dice image
  const randomImageSource1 = `images/dice${randomNumber1}.png`;
  document.querySelectorAll("img")[0].setAttribute("src", randomImageSource1);
  
  // Update Player 2's dice image
  const randomImageSource2 = `images/dice${randomNumber2}.png`;
  document.querySelectorAll("img")[1].setAttribute("src", randomImageSource2);
  
  // Determine the winner and update the heading
  let resultMessage = "";
  
  if (randomNumber1 > randomNumber2) {
    resultMessage = "🚩 Player 1 Wins!";
    player1Wins++;
    console.log("Player 1 wins this round!");
  } else if (randomNumber2 > randomNumber1) {
    resultMessage = "Player 2 Wins! 🚩";
    player2Wins++;
    console.log("Player 2 wins this round!");
  } else {
    resultMessage = "Draw! 🤝";
    console.log("It's a tie!");
  }
  
  document.querySelector("h1").textContent = resultMessage;
  
  // Update and save scores
  document.getElementById("player1-wins").textContent = player1Wins;
  document.getElementById("player2-wins").textContent = player2Wins;
  
  localStorage.setItem("player1Wins", player1Wins);
  localStorage.setItem("player2Wins", player2Wins);
  
  console.log("Scores updated. Player 1:", player1Wins, "| Player 2:", player2Wins);
}

// ===== EVENT LISTENERS =====
// Roll button event listener
document.getElementById("roll-button").addEventListener("click", rollDice);

// Reset button event listener
document.getElementById("reset-button").addEventListener("click", () => {
  player1Wins = 0;
  player2Wins = 0;
  
  localStorage.setItem("player1Wins", 0);
  localStorage.setItem("player2Wins", 0);
  
  document.getElementById("player1-wins").textContent = 0;
  document.getElementById("player2-wins").textContent = 0;
  
  document.querySelector("h1").textContent = "Let's Play Dicee!";
  
  console.log("Game reset! Scores cleared.");
});

console.log("Event listeners attached successfully");
