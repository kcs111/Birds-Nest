const { createUser } = require('../../models/user');

module.exports = async function register(
  _,
  { username, email, password },
  { user }
) {
  if (user) {
    throw new Error('User is already logged in');
  }
  const accessToken = await createUser(username, email, password);
  if (!accessToken) {
    throwGenericRegistrationError();
  }
  return { accessToken };
};

function throwGenericRegistrationError() {
  throw new Error('Failed to create account');
}
