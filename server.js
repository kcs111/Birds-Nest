const dotenv = require('dotenv');
const express = require('express');
const { json, urlencoded } = require('body-parser');
const { verify } = require('jsonwebtoken');
const { ApolloServer, gql } = require('apollo-server-express');
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require('apollo-server-core');
const {
  renderPlaygroundPage,
} = require('@apollographql/graphql-playground-html');
const next = require('next');
const mongoose = require('mongoose');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('url');
const Query = require('./app/resolvers/queries');
const Mutation = require('./app/resolvers/mutations');
const errorLogging = require('./app/middleware/error-logging');
const { getUserByAccessToken } = require('./app/models/user');

// get pre-existing files that live in /public and are to be static served
const staticFiles = fs
  .readdirSync('public', { withFileTypes: true })
  .map((filename) => `/${filename}`);

// load the .env file to load secrets for express
dotenv.config();

// determine if we're in dev or production
const dev = process.env.NODE_ENV !== 'production';
// get port we're running on
const port = process.env.PORT || '3000';

async function start() {
  // setup the MongoDB client
  mongoose.connect(process.env.MONGO_URL, (err) => {
    if (err) {
      console.error(`MongoDB failed to connect, ${err}`);
    } else {
      console.log('MongoDB connected');
    }
  });

  // setup the Next server
  const nextServer = next({ dev });
  await nextServer.prepare();
  const nextRequestHandler = nextServer.getRequestHandler();
  console.log('Next prepared');

  // setup the Express server
  const expressServer = express().use(
    // enable body-parser.json middleware
    json(),
    // enable body-parser.urlencoded middleware
    urlencoded({ extended: false }),
    // enable error logging middleware
    errorLogging()
  );

  // disable sending the x-powered-by header to let clients know what
  // technology the back-end is running on. This prevents possible exploit
  // pollution, making any intruder work harder to find security flaws
  expressServer.disable('x-powered-by');

  // if in development mode, create the GraphQL playground
  if (dev) {
    expressServer.get('/graphiql', (_, res) => {
      res.send(renderPlaygroundPage({ env: process.env })).end();
    });
  }

  // setup Express routes to render Next content
  expressServer.get('*', (req, res) => {
    const parsed = parse(req.url, true);
    // check if the path is asking for a static file
    if (staticFiles.indexOf(parsed.pathname) > -1) {
      // tell Next to static serve. This means it reads it directly and skips any
      // processing of the file
      return nextServer.serveStatic(
        req,
        res,
        path.join(__dirname, 'public', parsed.pathname)
      );
    }
    return nextRequestHandler(req, res);
  });
  console.log('Express configured');

  // create HTTP server
  const httpServer = http.createServer(expressServer);

  // setup GraphQL server
  const typeDefsFromFile = await fs.promises.readFile(
    path.join(__dirname, 'schema.gql')
  );
  const typeDefs = gql`
    ${typeDefsFromFile}
  `;
  const resolvers = {
    Query,
    Mutation,
  };
  const plugins = [
    ApolloServerPluginDrainHttpServer({ httpServer }),
    dev &&
      ApolloServerPluginLandingPageGraphQLPlayground({
        endpoint: 'http://localhost:3000/graphql',
      }),
  ].filter(Boolean);

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    plugins,
    dataSources: () => ({
      //
    }),
    context: async ({ req, res }) => {
      const token = req.headers.authorization;
      if (!token) {
        return;
      }

      // headers.authorization will return the value as Bearer ACCESS_TOKEN, so split
      const withoutBearer = token.split(' ')[1];
      try {
        // verify the JWT sent
        const accessToken = verify(
          withoutBearer,
          process.env.AUTHORIZATION_SECRET
        );
        // get the user by JWT token
        const user = getUserByAccessToken(withoutBearer);
        if (!user) {
          return console.log(`Invalid access token: ${accessToken}`);
        }
        // add the user to the GraphQL context
        return { user };
      } catch (err) {
        // the token has expired, ignore
        res.removeHeader('Authorization');
      }
    },
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({
    app: expressServer,
    path: process.env.GRAPHQL_PATH,
  });
  console.log('Apollo configured');
  await new Promise((resolve) => httpServer.listen({ port }, resolve));
  console.log(`Server ready at http://localhost:${port}`);
}

start();
