const User = require('./models/User');

async function addUser(email, password) {
  await User.create({ email, password });
}

module.exports = { addUser };
