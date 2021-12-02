import { gql } from '@apollo/client';

export default gql`
  query CurrentUser {
    currentUser {
      email
      name
    }
  }
`;
