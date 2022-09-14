import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
interface IPublicRouteProps {
  children: JSX.Element;
}

const PublicRoute = ({ children, ...rest }: IPublicRouteProps) => {
  const isLoggedIn = useAuth();
  return !isLoggedIn ? children : <Navigate to="/inbox" />;
};

export default PublicRoute;
