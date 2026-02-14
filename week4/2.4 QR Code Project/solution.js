import inquirer from "inquirer";
import qr from "qr-image";
import fs from "fs";
import path from "path"; //AI en

inquirer
  .prompt([
    {
      message: "QR CODE CREATION\nType in your FULL URL (e.g., https://example.com):", //ADDED FOR CLARITY TO USER
      name: "URL",
      validate: (input) => { //AI GEN 
        // Check if input is empty
        if (!input || input.trim() === "") {
          return "Please enter FULL URL"; //added for clarity to user 
        }
        
        // Basic URL validation
        try {
          new URL(input);
          return true;
        } catch (error) {
          return "Please enter a valid URL (e.g., https://example.com)"; //AI GEN
        }
      },
    },
  ])
  .then((answers) => {
    const url = answers.URL;
    const qrImagePath = path.resolve("qr_img.png"); //AI GEN
    const textFilePath = path.resolve("URL.txt"); //AI GEN
    
    const qr_svg = qr.image(url);
    qr_svg.pipe(fs.createWriteStream("qr_img.png"));

    fs.writeFile("URL.txt", url, (err) => {
      if (err) throw err;
      console.log("\n✓ Success! Files have been created:"); //AI GEN
      console.log(`  → QR Code image: ${qrImagePath}`); //AI GEN
      console.log(`  → URL text file: ${textFilePath}`); //AI GEN
      console.log(`\nURL saved: ${url}`); //AI GEN
    });
  })
  .catch((error) => {
    if (error.isTtyError) {
      console.log("Prompt couldn't be rendered in the current environment");
    } else {
      console.log("An error occurred:", error);
    }
  });
