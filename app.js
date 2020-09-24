const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js"); // creating a local module

const app = express();

const items = ["Buy Food", "Cook Food", "Eat Food"]; // const arrays cannot be assigned totally new values but they can be altered with commands like push
const workItems = [];

app.set('view engine', 'ejs'); // In order to use a view engine, you need to create a new folder called "views"

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
	const day = date.getDate();

	res.render("list", {listTitle: day, newListItems: items});
});

app.post("/", function(req, res) {
	const item = req.body.newItem;
	
	if (req.body.list === "Work List") {
		workItems.push(item);

		res.redirect("/work");
	} else {
		items.push(item);

		res.redirect("/");
	}
});

app.get("/work", function(req, res) {
	res.render("list", {listTitle: "Work List", newListItems:workItems});
});



app.listen(3000);