# Birds Nest

## About

Put your description here

[See this repo in action!](http://localhost:3000)

## Requirements

- [MongoDB](https://www.mongodb.com/)
- [NodeJS 14+](https://nodejs.org/en/)

## Getting Started

1. Clone the repository
2. Install dependencies

```bash
# with NPM
npm i
# or with Yarn
yarn
```

3. Run the app

```bash
# with NPM
npm run dev
# or with Yarn
yarn dev
```

4. Create your `.env.local` for configurations
5. Navigate to http://localhost:3000

## Screenshots
[Heroku App](https://radiant-badlands-33612.herokuapp.com/)

TODO

## Configuration

Below is a table of required environment variables and what types it expects

| name                   | description                                                  |
| ---------------------- | ------------------------------------------------------------ |
| `PORT`                 | The port the app should run on. Default is 3000              |
| `AUTHORIZATION_SECRET` | The secret used for JWT signing. Required.                   |
| `GRAPHQL_PATH`         | The path for GraphQL to use for calls. Default is `/graphql` |
| `MONGO_URL`            | The URL for MongoDB. Required.                               |
