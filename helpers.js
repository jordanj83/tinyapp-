const generateRandomString = () => {
  return ((Math.random() + 1) * 0x10000).toString(36).substring(6);
};

const findUserByEmail = (email, users) => {
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

// const urlsForUser = (id, urlDatabase) => {
//   const filteredURLS = {};
//   console.log(urlDatabase, "heres my string");
//   // console.log(urlDatabase, "heres another string")
//   for (const urlId in urlDatabase) {
//     console.log("test", urlDatabase[urlId].userID);
//     if (urlDatabase[urlId].userID === id) {
//       console.log("Hello", filteredURLS);
//       filteredURLS[urlId] = urlDatabase[urlId];
//     }
//   }

//   return filteredURLS;
// };
//this is where we left off

// const loggedIn = (req, users) => {
//   if (!req.session.user_id) {
//     return false;
//   }

//   const emailCookie = req.cookies.user.email;
//   const passwordCookie = req.cookies.user.password;
//   console.log("hello", req.cookies)
//   if (!findUserByEmail(emailCookie)) {
//     return false;
//   }

//   const userID = findUserByEmail(emailCookie);

//   if (users[userID].password !== passwordCookie) {
//     return false;
//   }

//   return true;
// };

module.exports = {
  emptyFields,
  findUserByEmail,
  generateRandomString,
};
