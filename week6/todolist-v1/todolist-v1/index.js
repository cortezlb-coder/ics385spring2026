/*
 Project: To Do List Web App
  Admin: Lexter Cortez
  Course: ICS 385
  Date: 2/18/2026
  Description: This is a web app that allows users to create a to do list. The user can also add additional items to list.
  Changes: adding 2 seperate lists. Chores list and camping list amd add routes to /chores and /camping. Also including preset array for each list. 
*/





//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

// create a date object that requires the date.js file
const date = require(__dirname + "/date.js");

const app = express();

// set an array for the default items in the list
let items = ["Buy Food", "Prepare Food", "Cook Food", "Eat Food", "Clean Plates"];
// set an empty array for new work items
let workItems = ["Show Up", "Get Settled", "Drink Coffee"];

// setup an array for Chores and another for Weekend
let choresItems = ["Do Laundry", "Clean Bathroom", "Wash Dishes"];
let campingItems = ["Smores Ingredients", "Pack tent", "Bring fish poles"];


// set EJS as the viewing engine to display html
app.set('view engine', 'ejs');

// use body parser to parse html file
app.use(bodyParser.urlencoded({extended: true}));

// use Express to serve or display static files such as images, CSS, JS files etc.
app.use(express.static("public"));

// default html file in web server
app.get("/", function(req, res) {

    
    // use EJS render to display the day and the To Do List
    res.render("list", { listTitle: "Work", newListItems: workItems });
    
});


// route for the chores list
app.get("/chores", function(req, res) {

    
  // changed list title to chores
res.render("list", { listTitle: "Chores", newListItems: choresItems });
});



// route for camping list
app.get("/camping", function(req, res) {

    
   // changed list title to camping 
    res.render("list", { listTitle: "Camping", newListItems: campingItems });
    
});


  
app.post("/", function(req, res) { //tidy and added chores and camoping lists
  let item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else if (req.body.list === "Chores") {
    choresItems.push(item);
    res.redirect("/chores");
  } else if (req.body.list === "Camping") {
    campingItems.push(item);
    res.redirect("/camping");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

// display default to do list on the localhost:3000/work route!
app.get("/work", function(req, res){

  let day = date.getDate();
  
    res.render("list", {listTitle: "Work Items To-Do List", newListItems: workItems})
});

// add a app.get for every route - /fun and /weekend
// Make sure your listTitle starts off with Fun Items and Weekend Items

app.listen(3000, function() {
console.log ("Server is running on port 3000")
});