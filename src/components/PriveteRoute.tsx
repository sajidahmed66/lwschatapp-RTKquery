import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
interface IPriveteRouteProps {
  children: JSX.Element;
}

const PriveteRoute = ({ children, ...rest }: IPriveteRouteProps) => {
  const isLoggedIn = useAuth();
  if (isLoggedIn) {
    return children;
  }
  return (
    <Navigate
      to={{
        pathname: "/",
      }}
    />
  );
};

export default PriveteRoute;
