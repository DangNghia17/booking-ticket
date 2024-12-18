import { Outlet, Navigate } from "react-router-dom";
import React, { Component }  from 'react';

function PublicRoute({ isAuth }) {
  return isAuth ? <Navigate to="/" /> : <Outlet />;
}
export default PublicRoute;
