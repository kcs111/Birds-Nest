const { updatePassword } = require('../../models/user');

async function changePassword(_, { oldPassword, newPassword }, { user }) {
  if (!user) {
    throw new Error('You must be logged in to perform this action');
  }
  const accessToken = await updatePassword(user.id, oldPassword, newPassword);

  return {
    accessToken,
  };
}

module.exports = changePassword;
