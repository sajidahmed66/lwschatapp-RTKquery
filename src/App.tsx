import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";
import useAuthCheck from "./hooks/useAuthCheck";
import PriveteRoute from "./components/PriveteRoute";
import PublicRoute from "./components/PublicRoute";
function App() {
  const authCheck = useAuthCheck();
  return !authCheck ? (
    <div>checking auth....</div>
  ) : (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <PriveteRoute>
              <Conversation />
            </PriveteRoute>
          }
        />
        <Route
          path="/inbox/:id"
          element={
            <PriveteRoute>
              <Inbox />
            </PriveteRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
