module.exports = function currentUser(_, __, { user }) {
  if (!user) {
    throw new Error('You must be logged in to perform this action');
  }
  return user;
};
