import {
  Home,
  NotFound,
  Login,
  Users,
  UserCrud,
  Attendence,
  AttendenceDetail,
  Company,
  // AddCompany,
  Profile,
  ForgotPassword,
  ResetPassword,
  Attendences,
  Reports
} from "../screens";

export const appRoutes = [
  {
    routeName: "/",
    ele: <Home />,
    exact: true,
    isProtected: true,
    layout: "primary",
    fallBack: "/login",
    _for: "all"
  },
  {
    routeName: "/users",
    ele: <Users />,
    exact: true,
    isProtected: true,
    layout: "primary",
    fallBack: "/login",
    _for: "all"
  },
  {
    routeName: "/user-crud",
    ele: <UserCrud />,
    exact: true,
    isProtected: true,
    layout: "primary",
    fallBack: "/login",
    _for: "all"
  },
  {
    routeName: "/user-crud/:userID",
    ele: <UserCrud />,
    exact: true,
    isProtected: true,
    layout: "primary",
    fallBack: "/login",
    _for: "all"
  },
  {
    routeName: "/attendance/get-attendances/:userId",
    ele: <Attendence />,
    exact: true,
    isProtected: true,
    layout: "primary",
    fallBack: "/login",
    _for: "all"
  },
  {
    routeName: "/attendances/",
    ele: <Attendences />,
    exact: true,
    isProtected: true,
    layout: "primary",
    fallBack: "/login",
    _for: "all"
  },
  {
    routeName: "/attendance/get-attendances/detail/:AttendenceId",
    ele: <AttendenceDetail />,
    exact: true,
    isProtected: true,
    layout: "primary",
    fallBack: "/login",
    _for: "all"
  },
  {
    routeName: "/company",
    ele: <Company />,
    exact: true,
    isProtected: true,
    layout: "primary",
    fallBack: "/login",
    _for: "all"
  },
  // {
  //   routeName: "/add-company",
  //   ele: <AddCompany />,
  //   exact: true,
  //   isProtected: true,
  //   layout: "primary",
  //   fallBack: "/login",
  //   _for: "all"
  // },
  // {
  //   routeName: "/update-company/:companyID",
  //   ele: <AddCompany />,
  //   exact: true,
  //   isProtected: true,
  //   layout: "primary",
  //   fallBack: "/login",
  //   _for: "all"
  // },
  {
    routeName: "/reports",
    ele: <Reports />,
    exact: true,
    isProtected: true,
    layout: "primary",
    fallBack: "/login",
    _for: "all"
  },
  {
    routeName: "/profile",
    ele: <Profile />,
    exact: true,
    isProtected: true,
    layout: "primary",
    fallBack: "/login",
    _for: "all"
  },
  {
    routeName: "/*",
    ele: <NotFound />,
    exact: false,
    isProtected: false,
    layout: "primary",
    fallBack: "/",
    _for: "all"
  },
  {
    routeName: "/login",
    ele: <Login />,
    exact: true,
    isProtected: false,
    layout: "none",
    fallBack: "/",
    _for: "all"
  },
  {
    routeName: "/forgot-password",
    ele: <ForgotPassword />,
    exact: true,
    isProtected: false,
    layout: "none",
    fallBack: "/",
    _for: "all"
  },
  {
    routeName: "/reset-password/:email",
    ele: <ResetPassword />,
    exact: true,
    isProtected: false,
    layout: "none",
    fallBack: "/",
    _for: "all"
  },
];