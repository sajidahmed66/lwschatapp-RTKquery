import { useEffect, useState } from "react";
import { useAppDispatch } from "../app/hooks";
import { userLoggedIn } from "../features/auth/authSlice";

export default function useAuthCheck() {
  const [authChecked, setAuthChecked] = useState(false);
  const dispatch = useAppDispatch();
  useEffect(() => {
    const localAuth = localStorage.getItem("auth");
    if (localAuth) {
      const auth = JSON.parse(localAuth);
      if (auth?.accessToken && auth?.user) {
        dispatch(
          userLoggedIn({ accessToken: auth.accessToken, user: auth.user })
        );
      }
    }
    setAuthChecked(true);
  }, [dispatch, setAuthChecked]);

  return authChecked;
}
