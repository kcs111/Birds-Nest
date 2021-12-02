import { gql } from '@apollo/client';

export default gql`
  mutation Login($usernameOrEmail: String!, $password: String!) {
    login(usernameOrEmail: $usernameOrEmail, password: $password) {
      wasSuccessful
    }
  }
`;
