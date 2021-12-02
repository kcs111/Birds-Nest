import 'bootstrap/dist/css/bootstrap.min.css';
import { ApolloProvider, ApolloClient, InMemoryCache } from '@apollo/client';
const { ThemeProvider } = require('styled-components');
const { GlobalStyleSheet, theme } = require('../app/theme');

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
});

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyleSheet />
      <ApolloProvider client={client}>
        <Component {...pageProps} />
      </ApolloProvider>
    </ThemeProvider>
  );
}
