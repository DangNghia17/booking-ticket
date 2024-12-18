import { Outlet, Navigate } from "react-router-dom";
import React, { Component }  from 'react';

function PrivateRoutes({ isAuth }) {
  return isAuth ? <Outlet /> : <Navigate to="/login" />;
}
export default PrivateRoutes;
