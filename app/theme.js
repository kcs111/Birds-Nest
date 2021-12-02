const { createGlobalStyle } = require('styled-components');

exports.GlobalStyleSheet = createGlobalStyle`
  // here is where we put global styles
  body {
    margin: 0;
    padding: 0;
  }
`;

exports.theme = {
  colors: {
    backgroundColor: '#343434',
  },
  fonts: {},
  breakpoints: {},
};
