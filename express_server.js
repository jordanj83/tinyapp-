//put urlsForUser into the help function


const express = require("express");
const app = express();
const PORT = 8080; 

const cookieSession = require("cookie-session");

const bcrypt = require("bcryptjs");

const {
  emptyFields,
  findUserByEmail,
  generateRandomString,
  urlsForUser,
} = require("./helpers");

const randomName = generateRandomString();
const users = {
  userRandomID: {
    id: generateRandomString(),
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  aJ48lW: {
    id: "aJ48lW",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

app.use(
  cookieSession({
    name: "session",
    keys: ["elantra", "hyundai"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);


app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  const userID = req.session.user_id;
  if (!userID) {
    return res.redirect("/login");
  } 

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  
  if (!userID) {
    return res.redirect("/login");
  }
  
  const filteredURLDatabase = urlsForUser(userID.id, urlDatabase);

  const templateVars = { urls: filteredURLDatabase, user: userID };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: req.session.user_id,
  };
  res.render("urls_new", templateVars);
});


app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.send("Sorry, only logged in users can have shorted URLs");
  }
  const randomName = generateRandomString();
  const newLongUrl = req.body.longURL;

  if (
    newLongUrl.slice(0, 8) === "https://" ||
    newLongUrl.slice(0, 7) === "http://"
  ) {
    urlDatabase[randomName] = {
      longURL: newLongUrl,
      userID: req.session.user_id.id,
    }; 
  } else {
    urlDatabase[randomName] = {
      longURL: `https://${newLongUrl}`,
      userID: req.session.user_id.id,
    };
  }
  res.redirect(`/urls/${randomName}`);
});


app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userObj = req.session.user_id;
  let userId;
  if (userObj) {
    userId = userObj.id;
  }

  if (!userId) {
    return res.send("Please login to view this content.");
  }

  const url = urlDatabase[id]
  if(!url) {
    return res.status(404).send("Page not found")
  }



  if(url.userID !== userId) {
    return res.status(401).send("You do not own this ID, only owners can update URLS");
  }

  const longURL = url.longURL;
  const templateVars = {
    id,
    longURL,
    user: userObj,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  if (!urlDatabase[id].longURL) {
    return res.send("this url does not exist");
  }
  const longURL = urlDatabase[id].longURL;

  res.redirect(longURL);
});

app.post("/urls/:id/delete", (req, res) => {
  const userObj = req.session.user_id;
  let userId;
  if (userObj) {
    userId = userObj.id;
  }
  const deleteshortUrl = req.params.id;
  const filteredUrlDatabase = urlsForUser(userId, urlDatabase);
  let doesExist = false; 
  if (!userId) {
    return res.status(401).send("User is not logged in to TinyUrl");
  }
  
  for (let shortUrl in filteredUrlDatabase) {
    if (shortUrl === deleteshortUrl) {
      doesExist = true; 
      delete urlDatabase[shortUrl];
    }
  }
  if (doesExist === false) {
  
    return res.status(402).send("Only Owners can delete URLs");
  }



  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const shortUrl = req.params.id;
  const newLongUrl = req.body.longUrl;
  

  if (!req.session.user_id) {
    return res.status(400).send("Sorry you need to log in to edit");
  }
  if(!res.body){
    return res.status(400).send("invalid web address.")
  }
  if (
    newLongUrl.slice(0, 8) === "https://" ||
    newLongUrl.slice(0, 7) === "http://"
  ) {
    urlDatabase[shortUrl] = {
      longURL: newLongUrl,
      userID: req.session.user_id.id,
    }; 
  } else {
    urlDatabase[shortUrl] = {
      longURL: `https://${newLongUrl}`,
      userID: req.session.user_id.id,
    }; 
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userId = findUserByEmail(email, users);
  emptyFields(req, res);
  if (!userId) {
    return res.status(403).send("User not found!");
  }

  if (!bcrypt.compareSync(req.body.password, users[userId].password)) {
    return res.status(403).send("Incorrect password");
  }
  const cookieObj = {
    email,
    password,
    id: userId,
  };
  req.session.user_id = cookieObj;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = { user: null };
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const user = req.body.email;
  const templateVars = { user };
  if (req.session.user_id) {
    return res.redirect("/urls");
  }

  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user_id = generateRandomString();
  emptyFields(req, res);
  const foundUser = findUserByEmail(email, users);
  if (foundUser) {

    res.status(400).send("400 User Already in Database");
  } else {
    const newUser = {
      id: user_id,
      email: email,
      password: hashedPassword,
    };
    users[newUser.id] = newUser;

    req.session.user_id = newUser;
    res.redirect("/urls");
  }
});



