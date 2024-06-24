import HomeIcon from "@mui/icons-material/Home";
import GroupIcon from "@mui/icons-material/Group";
import BusinessIcon from '@mui/icons-material/Business';
import CoPresentIcon from '@mui/icons-material/CoPresent';
import AssessmentIcon from '@mui/icons-material/Assessment';

export const routes = [
  {
    label: "Dashboard",
    routeName: "/",
    match: "/",
    icon: <HomeIcon />,
    children: [],
  },
  {
    label: "Company",
    routeName: "/company",
    match: "/company",
    icon: <BusinessIcon />,
    children: [],
  },
  {
    label: "Employees",
    routeName: "/users",
    match: "/users",
    icon: <GroupIcon />,
    children: [],
  },
  {
    label: "Attendance",
    routeName: "/attendances",
    match: "/attendances",
    icon: <CoPresentIcon />,
    children: [],
  },
  {
    label: "Reports",
    routeName: "/reports",
    match: "/reports",
    icon: <AssessmentIcon />,
    children: [],
  },
];
