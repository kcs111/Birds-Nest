const mongoose = require('mongoose');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const PasswordValidator = require('password-validator');
const { sign } = require('jsonwebtoken');

const { Schema, SchemaTypes, Types } = mongoose;
const usernameRegex = /^[A-Za-z0-9_.]{3,}$/g;
const passwordSchema = new PasswordValidator()
  .is()
  .min(8)
  .is()
  .max(100)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .digits(1)
  .has()
  .not()
  .spaces();
const saltRounds = 10;
const accessTokenDuration = 60 * 60 * 24 * 7 * 1000;

const UserSchema = new Schema({
  username: SchemaTypes.String,
  email: SchemaTypes.String,
  hashedPassword: SchemaTypes.String,
  accessToken: SchemaTypes.String,
  passwordResetId: SchemaTypes.String,
});
const User = mongoose.model('User', UserSchema);

/**
 * Validates and hashes the password
 *
 * @param {String} password
 *
 * @returns {Promise<String>}
 */
async function hashPassword(password) {
  if (!passwordSchema.validate(password)) {
    throw new Error('Password does not satisfy requirements');
  }
  return await bcrypt.hash(password, saltRounds);
}

async function getUserById(userId, ignoreIfNull = false) {
  try {
    const result = await User.findById(userId).exec();
    if (!result && ignoreIfNull) {
      throw new Error(`No user found with the ID ${userId}`);
    }
    return result;
  } catch (err) {
    console.error(err);
  }
}

async function getUserByUsername(username) {
  try {
    return await User.findOne({ username }).exec();
  } catch (err) {
    console.error(err);
  }
}

async function getUserByEmail(email) {
  try {
    return await User.findOne({ email }).exec();
  } catch (err) {
    console.error(err);
  }
}

async function getUserByUsernameOrEmail(usernameOrEmail) {
  try {
    const fromUsername = await getUserByUsername(usernameOrEmail);
    if (fromUsername) {
      return fromUsername;
    }
    const fromEmail = await getUserByEmail(usernameOrEmail);
    if (fromEmail) {
      return fromEmail;
    }
  } catch (err) {
    console.error(err);
  }
}

async function createUser(username, email, password) {
  try {
    if (await User.exists({ email })) {
      return console.error(`Email already exists: ${email}`);
    }
    if (await User.exists({ username })) {
      return console.error(`Username already exists: ${username}`);
    }
    if (!emailValidator.validate(email)) {
      return console.error(`Email validation failed: ${email}`);
    }
    if (!usernameRegex.test(username)) {
      return console.error(`Username validation failed: ${username}`);
    }
    if (!passwordSchema.validate(password)) {
      return console.error(`Password validation failed: ${username}`);
    }
    const hashedPassword = await hashPassword(password);
    const user = await User.create({ username, email, hashedPassword });
    console.log(
      `Created user, id: ${user.id}, username: ${username}, email: ${email}`
    );
    const accessToken = await generateAccessToken(user.id);
    user.accessToken = accessToken;
    await user.save();
    return accessToken;
  } catch (err) {
    console.error(err);
  }
}

/**
 * Marks a pre-existing account as requiring a new or forgotten password
 *
 * @param {String} usernameOrEmail
 *
 * @returns {Promise<String>} The password reset UUID
 */
async function beginPasswordReset(usernameOrEmail) {
  try {
    const user = await getUserByUsernameOrEmail(usernameOrEmail);
    // generate a new passwordResetId
    const passwordResetId = uuid.v4();
    user.passwordResetId = passwordResetId;
    await user.save();
    return passwordResetId;
  } catch (err) {
    console.error(err);
  }
}

/**
 * Finalizes a pre-existing account with a new password and access token
 *
 * @param {String} userId
 * @param {String} passwordResetId
 * @param {String} newPassword
 *
 * @returns {Promise<String>}
 */
async function finalizePasswordReset(userId, passwordResetId, newPassword) {
  try {
    const user = await getUserById(userId);
    if (user.passwordResetId !== passwordResetId) {
      throw new Error(`Password reset ID does not match for ${userId}`);
    }
    const hashedPassword = await hashPassword(newPassword);
    const accessToken = await generateAccessToken(userId);
    if (!accessToken) {
      throw new Error(`Failed to generate access token for ${userId}`);
    }
    user.hashedPassword = hashedPassword;
    user.accessToken = accessToken;
    user.passwordResetId = null;
    await user.save();
    return accessToken;
  } catch (err) {
    console.error(err);
  }
}

/**
 * Checks if a pre-existing account is currently awaiting password reset
 *
 * @param {String} userId
 *
 * @returns {Promise<boolean>}
 */
async function isPasswordResetInProgress(userId) {
  try {
    const user = await getUserById(userId, true);
    console.log(user);
    return user && user.passwordResetId;
  } catch (err) {
    console.error(err);
  }
}

/**
 * Checks the passed password against an pre-existing account, returning a new access token
 * if successful
 *
 * @param {String} userId
 * @param {String} password
 *
 * @returns {Promise<String>}
 */
async function validatePassword(userId, password) {
  try {
    const user = await getUserById(userId);
    if (await isPasswordResetInProgress(userId)) {
      throw new Error(
        `User attempted login while password reset pending: ${userId}`
      );
    }
    const matches = await bcrypt.compare(password, user.hashedPassword);
    if (!matches) {
      throw new Error(`Invalid login attempt for ${userId}`);
    }
    const accessToken = await generateAccessToken(userId);
    user.accessToken = accessToken;
    await user.save();
    return accessToken;
  } catch (err) {
    console.error(err);
  }
}

/**
 * Updates the password for the user ID. If the account is being registered, it will
 * create a new authorization context
 *
 * @param {String} userId
 * @param {String} oldPassword
 * @param {String} newPassword
 *
 * @returns {Promise<String>} The accounts access token
 */
async function updatePassword(userId, oldPassword, newPassword) {
  try {
    const hashedPassword = await hashPassword(newPassword);
    const user = await getUserById(userId);
    // compare against the hashed password stored
    if (!(await bcrypt.compare(oldPassword, auth.hashedPassword))) {
      throw new Error(`Password incorrect for ${userId}`);
    }
    // generate new access token
    const accessToken = await generateAccessToken(userId);
    // update the authorization context
    user.hashedPassword = hashedPassword;
    user.accessToken = accessToken;
    user.passwordResetId = null;
    await user.save();
    return accessToken;
  } catch (err) {
    console.error(err);
  }
}

/**
 *
 * @param {String} accessToken
 *
 * @returns {Promise<any>}
 */
async function getUserByAccessToken(accessToken) {
  try {
    const user = User.findOne({ accessToken });
    if (!user) {
      throw new Error(`No user found with the access token ${accessToken}`);
    }
    return user;
  } catch (err) {
    console.error(err);
  }
}

/**
 * Generates a new access token for a pre-existing account
 *
 * @param {String} userId
 *
 * @returns {Promise<String>}
 */
async function generateAccessToken(userId) {
  const accessToken = sign({ id: userId }, process.env.AUTHORIZATION_SECRET, {
    expiresIn: accessTokenDuration,
  });
  console.log(`Generated access token for ${userId}: ${accessToken}`);
  return accessToken;
}

module.exports = {
  getUserById,
  getUserByUsername,
  getUserByEmail,
  getUserByUsernameOrEmail,
  createUser,
  beginPasswordReset,
  finalizePasswordReset,
  updatePassword,
  isPasswordResetInProgress,
  validatePassword,
  getUserByAccessToken,
};
