import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Conversation from "./pages/Conversation";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./App.css";
import useAuthCheck from "./hooks/useAuthCheck";
function App() {
  const authCheck = useAuthCheck();
  return !authCheck ? (
    <div>checking auth....</div>
  ) : (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/inbox" element={<Conversation />} />
        <Route path="/inbox/:id" element={<Inbox />} />
      </Routes>
    </Router>
  );
}

export default App;
