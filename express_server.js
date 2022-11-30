const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const { application } = require("express");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


const generateRandomString = () => {
  return ((Math.random() + 1)* 0x10000).toString(36).substring(6);
}
const findUserByEmail = (email) => {
  for (const user in users) {
    if (email === users[user].email){
      return user;
    }
  } 
  return null;
};

const randomName = generateRandomString()
const users = {
  
  userRandomID: {
    id:generateRandomString()   ,
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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");

app.get("/urls", (req, res) => {
  const user = users[req.cookies["username"]]
  const templateVars = { urls: urlDatabase, user:users[req.cookies["username"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user:users[req.cookies["username"]] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  const randomName = generateRandomString()
  const newLongUrl = req.body.longURL
  if (newLongUrl.slice(0,8) === 'https://' || newLongUrl.slice(0,7) === 'http://') {
    urlDatabase[randomName] = newLongUrl  // check if contains http: already
  } else {
    urlDatabase[randomName] = `https://${newLongUrl}`  // check if contains http: already
  }
   // check if contains http: already
  res.redirect(`/urls/${randomName}`)
  });
  
  app.get("/urls/:id", (req, res) => {   // redirect to  summary id page
    const id = req.params.id
    const longURL = urlDatabase[id]
    const templateVars = { id, longURL, urls: urlDatabase, user:users[req.cookies["username"]] };
    res.render("urls_show", templateVars);
  });
  
  app.get("/u/:id", (req, res) => {   // redirect to actual website
    const id = req.params.id
    const longURL = urlDatabase[id]
    res.redirect(longURL);
  });
  
  app.post("/urls/:id/delete", (req, res) => {   // redirect to  summary id page
    const shortUrl = req.params.id;
    delete urlDatabase[shortUrl];
    res.redirect("/urls");
  });
  
  app.post("/urls/:id/edit", (req, res) => {
    const shortUrl = req.params.id;
    const newLongUrl = req.body.longUrl
    
    if (newLongUrl.slice(0, 8) === 'https://' || newLongUrl.slice(0, 7) === 'http://') {
      urlDatabase[shortUrl] = newLongUrl;  // adds http: into input feild so http not manually required
    } else {
      urlDatabase[shortUrl] = `https://${newLongUrl}`;  // check if contains https: already
    }
    res.redirect('/urls');
  });
  
  app.post("/login", (req, res) => {   
    const username = req.body.username;
    res.cookie('username', username)
    res.redirect('/urls')
  });
  
  app.post("/logout", (req, res) => {   
    res.clearCookie("username")
    res.redirect('/urls')
  });

  app.get("/register", (req, res) => {
    const templateVars = {user:null }
    console.log(templateVars);
    res.render("urls_register", templateVars);
  });
  
  app.post("/register", (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user_id = randomName;
  
    if (!email || !password) {
      //respond with an error
      res.send("error - please input email/password");
    }
    const foundUser = findUserByEmail(email);
    if (foundUser) {
      //respond with error email in use 
      res.send("Email/password already exists");
    } else {
      const newUser = {
        id: generateRandomString(),
        email: email,
        password: password
      };
      users[newUser.id] = newUser;
      // console.log(users)
      res.cookie('username', newUser.id);
      res.redirect('/urls');
    }
  });

//   app.post('/register', (req, res) => { 
//     const email = req.body.email;
//     const password = req.body.password
//     if(!email || !password) {
//       //respond with an error
//     }  

//     //does email already exist

//     const foundUser = findUserByEmail(email);
//     if (foundUser) {
//       //respond with an error that email is already in use
//     }

//     //create the user object, happy path
//     const id = //generate random ID
//     const newUser = {
//       id: id,
//       email: email,
//       password: password,
//       //make sure names are all the same
//     }
//     // add the new user to the users object
//     users[id] = newUser
//     console.log(users)
//     //set the cookie
//     res.cookie('user_id', id)
//     //only need to save the user id to the cookie
//     res.redirect('/urls')
//   });

//   app.get('/urls', (req, res) => {
//     const userID = req.cookies.user_id"
//   const user = users[userID];

// const templateVars = {
//   urls: urlDatabase,
//   user: user
// }

// res.render('urls_index', templateVars);


// <% if (user { %>
//  <h2> You are signed in as: <5= user.email %></h2>
// <% } %>

// })



//   <form method="POST" action="/register">
//     <input name="email" />
//     <input name="password" />

//     <button type="submit">Register!</button>
//   </form>