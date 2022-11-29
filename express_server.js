const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
//code above sets EJS as the view engine, which renders the view into html form to the browser
app.use(express.urlencoded({ extended: true }));

//generates a random dtring of numbers and letters for our short url
const generateRandomString = () => {
  return ((Math.random() + 1)* 0x10000).toString(36).substring(6);
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//sends a response to the user in the form of "Hello!"
app.get("/", (req, res) => {
  res.send("Hello!");
});

// app.listen convenience method that can be used to get an express app to start listening for requests on a given port.
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
//Express' app.get() function lets you define a route handler for GET requests to a given URL.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
//GET and POST is two common HTTP Requests used for building REST APIs. Both of these calls are meant for some special purpose. As per the documentation GET requests are meant to fetch data from specified resources and POST requests are meant to submit data to a specified resource.
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const randomName = generateRandomString()
  const newLongUrl = req.body.longURL
  if (newLongUrl.slice(0,8) === 'https://' || newLongUrl.slice(0,7) === 'http://'){
    urlDatabase[randomName] = newLongUrl  // check if contains http: already
  } else {
    urlDatabase[randomName] = `http://${newLongUrl}`  // check if contains http: already
  }
  res.redirect(`/urls/${randomName}`)
  console.log(urlDatabase)
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  const templateVars = { id, longURL};
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id
  const longURL = urlDatabase[id]
  //console.log(urlDatabase[id])
  console.log(id)
  res.redirect(longURL);
});


