const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const generateRandomString = () => {
  return ((Math.random() + 1) * 0x10000).toString(36).substring(6);
};
const findUserByEmail = (email) => {
  for (const user in users) {
    if (email === users[user].email) {
      return user;
    }
  }
};

const emptyFields = (req, res) => {
  if (!req.body.email || !req.body.password) {
    //respond with an error
    res.status(400).send("400 Bad Request - ");
    return;
  }
};

const randomName = generateRandomString();
const users = {
  userRandomID: {
    id: generateRandomString(),
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
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

//this is where we left off

const loggedIn = (req) => {
  if (!req.cookies.user) {
    return false;
  }

  const emailCookie = req.cookies.user.email;
  const passwordCookie = req.cookies.user.password;

  if (!findUserByEmail(emailCookie)) {
    return false;
  }

  const userID = findUserByEmail(emailCookie);

  if (users[userID].password !== passwordCookie) {
    return false;
  }

  return true;
};

// const urlsForUser = (id) => {
//   if(req.cookies.user === req.cookies.user.email)
//   return
// }

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls", (req, res) => {
  // if (!req.cookies["user_id"]) {
  //   return res.send("user is not logged in");
  // }
  const user = req.cookies["user_id"];
  const templateVars = { urls: urlDatabase, user};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.send("Hey you cant do it, you're not logged in.");
  }
  const randomName = generateRandomString();
  const newLongUrl = req.body.longURL;
  if (
    newLongUrl.slice(0, 8) === "https://" ||
    newLongUrl.slice(0, 7) === "http://"
  ) {
    urlDatabase[randomName] = newLongUrl; // check if contains http: already
  } else {
    urlDatabase[randomName] = `https://${newLongUrl}`; // check if contains http: already
  }
  // check if contains http: already
  res.redirect(`/urls/${randomName}`);
});

app.get("/urls/:id", (req, res) => {
  // redirect to  summary id page
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  const templateVars = {
    id,
    longURL,
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
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
  // redirect to  summary id page
  const shortUrl = req.params.id;
  delete urlDatabase[shortUrl];
  res.redirect("/urls");
});

app.post("/urls/:id/edit", (req, res) => {
  const shortUrl = req.params.id;
  const newLongUrl = req.body.longUrl;

  if (
    newLongUrl.slice(0, 8) === "https://" ||
    newLongUrl.slice(0, 7) === "http://"
  ) {
    urlDatabase[shortUrl] = newLongUrl; // adds http: into input feild so http not manually required
  } else {
    urlDatabase[shortUrl] = `https://${newLongUrl}`; // check if contains https: already
  }
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userId = findUserByEmail(email);
  emptyFields(req, res);
  if (!userId) {
    return res.status(400).send("User not found!");
  }
  if (password !== users[userId].password) {
    return res.status(400).send("Incorrect password");
  }

  const cookieObj = {
    email,
    password,
    id: userId,
  };
  res.cookie("user_id", cookieObj);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const templateVars = { user: null };
  if (loggedIn(req)) {
    return res.redirect("/urls");
  }
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const user = req.body.email;
  const templateVars = { user };
  if (loggedIn(req)) {
    return res.redirect("/urls");
  }

  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user_id = randomName;
  const foundUser = findUserByEmail(email);

  emptyFields(req, res);
  if (foundUser) {
    //respond with error email in use
    res.status(400).send("400 User Already in Database");
  } else {
    const newUser = {
      id: generateRandomString(),
      email: email,
      password: password,
    };
    users[newUser.id] = newUser;
    res.cookie("user_id", newUser);
    res.redirect("/urls");
  }
});
