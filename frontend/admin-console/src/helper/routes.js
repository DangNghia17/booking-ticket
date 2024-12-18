import React, { lazy } from 'react';
import Loading from "../components/Loading";

const EventsPage = lazy(() => import("../pages/Events"));
const AddEditEventPage = lazy(() => import("../pages/AddEditEvent"));
const OverviewPage = lazy(() => import("../pages/Overview"));
const LoginPage = lazy(() => import("../pages/AdminLogin"));
const OrderPage = lazy(() => import("../pages/Orders"));
const PaymentPage = lazy(() => import("../pages/Payments"));
const ProfilePage = lazy(() => import("../pages/Profile"));
const ForgotPasswordPage = lazy(() => import("../pages/ForgotPassword"));
const AccountPage = lazy(() => import("../pages/Accounts"));
const ChangePasswordPage = lazy(() => import("../pages/ChangePassword"));
const CategoriesPage = lazy(() => import("../pages/Categories"));
const TicketPage = lazy(() => import("../pages/Tickets"));
const NewPasswordPage = lazy(() => import("../pages/NewPassword"));
const AdminDashboardPage = lazy(() => import("../pages/AdminDashboard"));
const PaymentRedirectPage = lazy(() => import("../pages/PaymentRedirect"));

export const routes = [
  {
    element: <LoginPage />,
    path: "/login",
  },
  {
    element: <ForgotPasswordPage />,
    path: "/forgot-password",
  },
  {
    element: <NewPasswordPage />,
    path: "/new-password",
  },
  {
    path: "/payment/redirect",
    element: <PaymentRedirectPage />
  }
];
export const adminRoutes = [
  {
    element: <AdminDashboardPage />,
    path: "/",
  },
  {
    element: <AdminDashboardPage />,
    path: "/overview",
  },
  {
    element: <AccountPage />,
    path: "/accounts",
  },
  {
    element: <ChangePasswordPage />,
    path: "/update-password",
  },
  {
    element: <CategoriesPage />,
    path: "/categories",
  },
  {
    element: <ProfilePage />,
    path: "/profile",
  },
];
export const organizerRoutes = [
  {
    element: <AddEditEventPage />,
    path: "/event/create",
  },
  {
    element: <AddEditEventPage />,
    path: "/event/update/:eventId",
  },
  {
    element: <ChangePasswordPage />,
    path: "/update-password",
  },
  {
    element: <EventsPage />,
    path: "/events",
  },
  {
    element: <PaymentPage />,
    path: "/payment-list",
  },
  {
    element: <OverviewPage />,
    path: "/",
  },
  {
    element: <OverviewPage />,
    path: "/overview",
  },
  {
    element: <OrderPage />,
    path: "/orders",
  },
  {
    element: <ProfilePage />,
    path: "/profile",
  },
  {
    element: <TicketPage />,
    path: "/tickets",
  },
];
export { EventsPage, OverviewPage, OrderPage, AddEditEventPage, TicketPage };
export default routes;
