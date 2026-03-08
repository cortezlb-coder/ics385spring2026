/*
Admin: Lexter Cortez
Course: ICS 385
Assignment: 4b QR Code Extension
Date: 2026-02-06
Overview: This program prompts the user to enter a URL, generates a QR code from the URL,
and saves both the QR image and the URL to local files.

HOW THE CODE WORKS
1. The inquirer package prompts the user to enter a URL.
2. Input validation ensures the URL is not empty and is properly formatted.
3. The qr-image package converts the URL into a QR code image.
4. The fs module saves:
   - qr_img.png (QR code image)
   - URL.txt (user input)
5. The path module displays the file locations clearly to the user.
6. A success message is printed after files are created.

HOW TO RUN
1. Open terminal in the project folder "week4\2.4 QR Code Project"
2. Run: npm install
3. Run: node solution.js
4. Enter a valid URL when prompted

EXPECTED OUTPUT
- qr_img.png is created in the project folder
- URL.txt is created in the project folder
- Terminal displays a success message


AI Prompts/Notes(messages in quotes are AI prompts used): 
- "explain this code in comments to a beginner programmer looking to expand." 
used this prompt to generate the comments in the solution.js to understand whats going on

- "remove the beginner comments on solution.js and clean up the code to look for organizd for a beginner"
Learned the lines in solutions and saw what was needed to be done, then removed the comments and cleaned up the code to make it more organized and easier to read for a beginner programmer.

- verified the code worked as intended

-Decided to add input validation to ensure that the user enters a valid URL and success messages to confirm that the QR code was generated and the URL was saved successfully.
"Input Validation
Add URL validation to ensure the user enters a valid URL before generating the QR code.

Success Messages
Provide clearer feedback about what files were created and where they're located."

Used AI to gen clear intructions and basic functions of the code and expected output 

Made the code prompts more straightfoward and clear to understand for user


*/
