const { check } = require('express-validator');

UserCreateValidation = [
  check('email', 'Email is required!').not().isEmpty(),
  check('password', 'Password is required!').not().isEmpty()
]

UserLoginValidation = [
  check('email', 'Email is required!').not().isEmpty(),
  check('password', 'Password is required!').not().isEmpty()
]

const validation = {
  UserCreateValidation: UserCreateValidation,
  UserLoginValidation: UserLoginValidation
};

module.exports = validation;