const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/todoDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
});

const todoSchema = new mongoose.Schema({
  todo: {
    type: String,
    required: true
  }
});

const listSchema = new mongoose.Schema({
  name: {
    type: String
  },
  items: [todoSchema]
});

const Todo = mongoose.model("Todo", todoSchema);

const List = mongoose.model("List", listSchema);

const todo1 = new Todo({
  todo: "Buy Food"
});

const todo2 = new Todo({
  todo: "Cook Food"
});

const todo3 = new Todo({
  todo: "Eat Food"
});

const defaultTodo = [todo1, todo2, todo3];

app.get("/", function(req, res) {
  Todo.find({}, function(err, todos) {
    if (todos.length === 0) {
      Todo.insertMany(defaultTodo, function(err) {
        if (err) {
          console.log("Error!");
        } else {
          console.log("Successfully added default todos!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        Title: "Todo list",
        Todos: todos
      });
    }
  });
});

app.get("/:listName", function(req, res) {
  const listName = _.capitalize(req.params.listName);
  List.findOne({ name: listName }, function(err, result) {
    if (err) {
      console.log("Error");
    } else {
      if (!result) {
        const list = new List({
          name: listName,
          items: defaultTodo
        });
        list.save();
        res.redirect("/" + listName);
      } else {
        res.render("list", {
          Title: result.name,
          Todos: result.items
        });
      }
    }
  });
});

app.post("/", function(req, res) {
  const newTodo = new Todo({
    todo: req.body.todo
  });
  const listName = req.body.btn;
  if (listName === "Todo list") {
    newTodo.save();
    console.log("Successfully added todo!");
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function(err, result) {
      if (err) {
        console.log("Error");
      } else {
        result.items.push(newTodo);
        result.save();
        res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.list;
  if (listName === "Todo list") {
    Todo.deleteOne({ _id: checkedItem }, function(err) {
      if (err) {
        console.log("Error!");
      } else {
        console.log("Successfully delete item!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItem } } },
      function(err) {
        if (err) {
          console.log("Error");
        } else {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.listen(3000, function() {
  console.log("Server has been started at port no. 3000!");
});
