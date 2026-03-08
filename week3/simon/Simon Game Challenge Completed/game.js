/*
  ================================================
  SIMON GAME - GAME LOGIC
  ================================================
  Admin: Lexter Cortez
  Course: ICS 385
  Description: Simon Says memory game
  ================================================
*/

// ============================================
// GLOBAL VARIABLES
// ============================================

var buttonColours = ["red", "blue", "green", "yellow"]; // Possible colors
var gamePattern = []; // Computer's sequence
var userClickedPattern = []; // Player's sequence
var started = false; // Track if game has started
var level = 0; // Current level
var challengeMode = false; // Track challenge mode
var responseTimeout; // Timeout for challenge mode response

// ============================================
// EVENT LISTENERS
// ============================================

// Detects when a key is pressed to start the game
$(document).keypress(function(event) {
  if (!started) {
    // Space bar (code 32) starts regular mode
    if (event.keyCode === 32 && !challengeMode) {
      event.preventDefault();
      startGame();
    }
    // Enter (code 13) starts challenge mode
    else if (event.keyCode === 13 && challengeMode) {
      event.preventDefault();
      startGame();
    }
  }
});

// Helper function to start the game
function startGame() {
  $("#counter-message").html('<span class="counter-label">Level:</span> <span id="counter-value">' + level + '</span>');
  nextSequence();
  started = true;
}

// Detects when a colored button is clicked
$(".btn").click(function() {
  var userChosenColour = $(this).attr("id"); // Get button color
  userClickedPattern.push(userChosenColour); // Add to player's sequence
  playSound(userChosenColour); // Play sound
  animatePress(userChosenColour); // Animate button
  
  // Clear timeout if in challenge mode
  if (challengeMode) {
    clearTimeout(responseTimeout);
    // Start a new per-click timeout: if player takes too long before next click, they lose
    responseTimeout = setTimeout(function() {
      playSound("wrong");
      $("body").addClass("game-over");
      $("#level-title").text("Too Slow! Press ENTER to Restart");
      setTimeout(function() {
        $("body").removeClass("game-over");
      }, 200);
      startOver();
    }, 3000); // 3 seconds allowed between clicks in challenge mode
  }
  
  checkAnswer(userClickedPattern.length - 1); // Check if correct
});

// Challenge Mode button click handler
$("#challenge-btn").click(function() {
  if (!started) { // Can only toggle before game starts
    challengeMode = !challengeMode;
    
    if (challengeMode) {
      $(this).addClass("active");
      $("#counter-message").html('Challenge Mode ON - Press ENTER to Start');
    } else {
      $(this).removeClass("active");
      $("#counter-message").html('Press Space Bar to Start');
    }
  }
});

// ============================================
// GAME LOGIC FUNCTIONS
// ============================================

// Function to check if user's click pattern matches game pattern
function checkAnswer(currentLevel) {
  // Compare user's click at this position to game's pattern
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    // If they match AND user has completed the whole sequence
    if (userClickedPattern.length === gamePattern.length) {
      // Completed the sequence for this level: clear any pending response timeout
      if (challengeMode) {
        clearTimeout(responseTimeout);
      }
      // Wait 1 second, then replay the full sequence and start next
      setTimeout(function() {
        replaySequence();
      }, 1000);
    }
  } else {
    // If user clicked wrong color
    playSound("wrong"); // Play wrong sound
    $("body").addClass("game-over"); // Add game-over class (makes it flash red)
    
    // After 200ms, remove the red flash
    setTimeout(function() {
      $("body").removeClass("game-over");
    }, 200);
    
    startOver(); // Reset the game
  }
}


// Function to replay the entire game sequence
function replaySequence() {
  // Calculate speed based on level (faster as level increases)
  var baseDelay;
  
  if (challengeMode) {
    baseDelay = 200; // Challenge mode: fixed 200ms speed
  } else {
    baseDelay = 600; // Starting delay in milliseconds at level 1
    var speedIncrease = 30; // Decrease delay by 30ms per level
    var minDelay = 250; // Minimum delay (don't go faster than this)
    baseDelay = Math.max(baseDelay - (level * speedIncrease), minDelay); // Calculate delay, but don't go below minimum
  }
  
  // Loop through each color in the gamePattern and flash it
  var i = 0;
  
  // Use setInterval to flash each button with timing
  var replayInterval = setInterval(function() {
    if (i < gamePattern.length) {
      // Flash the button at index i
      flashButton(gamePattern[i]);
      playSound(gamePattern[i]);
      i++;
    } else {
      // When done replaying, clear interval and start next sequence
      clearInterval(replayInterval);
      setTimeout(function() {
        nextSequence();
      }, 500);
    }
  }, baseDelay); // Delay between flashes based on current level or challenge mode
}

// Function to flash a button (without adding to pattern)
function flashButton(color) {
  $("#" + color).fadeIn(100).fadeOut(100).fadeIn(100);
}

// Function to generate the next sequence in the game
function nextSequence() {
  userClickedPattern = []; // Clear the user's pattern for this round
  level++; // Increase the level by 1
  $("#counter-value").text(level); // Update counter display number
  
  var randomNumber = Math.floor(Math.random() * 4); // Generate random number between 0-3
  var randomChosenColour = buttonColours[randomNumber]; // Use that number to pick a random color
  gamePattern.push(randomChosenColour); // Add that color to the game's pattern
  
  // Flash the new color to show the player
  flashButton(randomChosenColour);
  playSound(randomChosenColour); // Play the sound for that color
  
  // In challenge mode, set a timeout for player response
  if (challengeMode) {
    var timeLimit = 3000; // Player has 3 seconds to start clicking (can adjust)
    responseTimeout = setTimeout(function() {
      // Time's up! End the game
      playSound("wrong");
      $("body").addClass("game-over");
      $("#level-title").text("Time's Up! Press Space Bar to Restart");
      
      setTimeout(function() {
        $("body").removeClass("game-over");
      }, 200);
      
      startOver();
    }, timeLimit);
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Function to animate a button press
function animatePress(currentColor) {
  $("#" + currentColor).addClass("pressed"); // Add "pressed" class (makes it glow white and turn grey)
  
  // After 100ms, remove the "pressed" class
  setTimeout(function() {
    $("#" + currentColor).removeClass("pressed");
  }, 100);
}

// Function to play a sound
function playSound(name) {
  var audio = new Audio("sounds/" + name + ".mp3"); // Create new Audio object pointing to sound file
  audio.play(); // Play that audio
}

// Function to reset the game
function startOver() {
  level = 0; // Reset level to 0
  gamePattern = []; // Clear the game pattern array
  started = false; // Set started back to false
  
  // Clear any pending timeout
  if (challengeMode) {
    clearTimeout(responseTimeout);
  }
  
  // Update counter message based on mode
  if (challengeMode) {
    $("#counter-message").html('Challenge Mode ON - Press ENTER to Start');
  } else {
    $("#counter-message").html('Press Space Bar to Start');
  }
  
  // Re-enable buttons
}
