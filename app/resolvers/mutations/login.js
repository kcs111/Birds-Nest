const {
  getUserByUsernameOrEmail,
  validatePassword,
} = require('../../models/user');

module.exports = async function login(
  _,
  { usernameOrEmail, password },
  { user }
) {
  if (user) {
    throw new Error('User is already logged in');
  }
  const foundUser = await getUserByUsernameOrEmail(usernameOrEmail);
  if (!foundUser) {
    console.log(`No user found for ${usernameOrEmail}`);
    throwGenericLoginError();
  }
  const accessToken = await validatePassword(foundUser.id, password);
  if (!accessToken) {
    console.log(`Password attempt failed for ${foundUser.username}`);
    throwGenericLoginError();
  }
  return { accessToken };
};

// throw an error not specifying what credentials were incorrect. This
// prevents bad actors from trying to discover emails/usernames registered
function throwGenericLoginError() {
  throw new Error('Invalid credentials');
}
