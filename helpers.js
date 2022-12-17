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
    res.status(400).send("400 Bad Request - ");
    return true;
  }
};

const urlsForUser = (id, urlDatabase) => {
  const filteredURLS = {};

  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      filteredURLS[urlId] = urlDatabase[urlId];
    }
  }

  return filteredURLS;
};


module.exports = {
  emptyFields,
  findUserByEmail,
  generateRandomString,
  urlsForUser,
};
