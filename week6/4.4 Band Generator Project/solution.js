/*
 Project: Band Generator
  Admin: Lexter Cortez
  Course: ICS 385
  Date: 2/20/2026
  Description: This is a web app that allows users to randombly generate a band name.
  Changes: Per the WEEK 6 instructions, I changed it form band names to course names. 
*/






import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("solution.ejs");
});

app.post("/submit", (req, res) => {
  const randomID = ID[Math.floor(Math.random() * ID.length)]; //changed to reflect course ID and name from line 29-33
  const randomName = NAME[Math.floor(Math.random() * NAME.length)];
  res.render("solution.ejs", {
    courseID: randomID,
    courseName: randomName,
  });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
//added these arrays to reflect course ID and name instead of band adjectives and nouns.
const ID = [
  "BUS 320",
  "ICS 385",
  "ART 105",
  "ENG 316",
  "ICS 360",
];

const NAME = [
  "Entrepreneurship ",
  "Web Devl-Admin",
  "Intro to Ceramics",
  "WI-Adv Research Writing",
  "Database Design-Devl",
];

