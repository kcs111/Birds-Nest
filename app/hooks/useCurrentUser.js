import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import queries from '../queries';
import mutations from '../mutations';

export default function useCurrentUser() {
  const [user, setUser] = useState();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const {
    loading: currentUserLoading,
    error: currentUserError,
    data: currentUserData,
  } = useQuery(mutations.currentUser);
  const [loginMutation, loginMutationContext] = useMutation(mutations.login);
  const [logoutMutation, logoutMutationContext] = useMutation(mutations.logout);

  async function login() {}

  async function logout() {}

  return { user, isAuthenticated, login, logout };
}
