const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();

app.set('view engine', 'ejs'); // In order to use a view engine, you need to create a new folder called "views"

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const itemSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Item name is required"]
	}
});

const listSchema = new mongoose.Schema({
	name: String,
	items: [itemSchema]
});

const Item = mongoose.model("Item", itemSchema);
const List = mongoose.model("List", listSchema);

const item1 = new Item({
	name: "Buy Food"
});

const item2 = new Item({
	name: "Cook Food"
});

const item3 = new Item({
	name: "Eat Food"
});

const defaultItems = [item1, item2, item3];

app.route("/").get(function(req, res) {
	Item.find({}, function(err, items) {
		if (err) {
			console.log(err);
		} else {
			if (items.length === 0) {
				Item.insertMany(defaultItems, function(err) {
					if (err) {
						console.log(err);
					} else {
						console.log("Successfully added default items")
					}
				});
				res.redirect("/");
			} else {
				res.render("list", {listTitle: "Default", newListItems: items});
			}
		}
	});
}).post(function(req, res) {
	const item = req.body.newItem;
	const listName = req.body.list;

	const newItem = new Item({
		name: item,
	});

	if (listName === "Default") {
		newItem.save();
		res.redirect("/");
	} else { //if it's a custom list, find it, push the item to the array, save it and redirect to that page to show changes
		List.findOne({name: listName}, function (err, list) {
			list.items.push(newItem);
			list.save();
			res.redirect("/" + listName);
		});
	}
});

app.post("/delete", function(req, res) {
	const checkedItemId = req.body.checkbox;
	const listName = req.body.listName;

	if (listName === "Default") {
		Item.findByIdAndRemove(checkedItemId, function (err) {
			if (err) {
				console.log(err);
			} else {
				console.log("Successfully deleted item");
				res.redirect("/");
			}
			});
	} else {
		List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err){ // $pull of $pullAll can be used to delete items in arrays in mongoDB
			if (!err) {
				res.redirect("/" + listName);
			}
		});
	}
});

app.get("/:customListName", function(req, res) {
	const customListName = _.capitalize(req.params.customListName);

	List.findOne({name: customListName}, function(err, list) {
		if (!err) {
			if (list) {
				res.render("list", { listTitle: list.name, newListItems: list.items});
			} else {
				// Create new list and redirect
				const list = new List({
					name: customListName,
					items: defaultItems
				});

				list.save();
				res.redirect("/" + customListName);
			}
		}
	});
});



app.listen(3000, function() {
	console.log("Listening on port 3000");
});