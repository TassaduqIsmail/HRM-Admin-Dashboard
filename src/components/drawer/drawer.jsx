import * as React from "react";
import { Box, Drawer as DrawerNavigation, Avatar, List, Divider, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, useMediaQuery, Stack } from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toggleMenu } from "../../store/reducer";
import { logoutUser } from "../../store/reducer";
import { Logo } from "../../assets";

const drawerWidth = 260;

export default function Drawer({ routes }) {
  const { openMenu } = useSelector((state) => state.appReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const matches = useMediaQuery("(min-width:900px)");

  const logOut = async () => {
    localStorage.removeItem(import.meta.env.VITE_APP_TOKEN)
    dispatch(logoutUser());
  };

  return (
    <>
      <DrawerNavigation
        variant={matches ? "permanent" : "temporary"}
        open={openMenu}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
          },
        }}
        onClose={() => dispatch(toggleMenu(!openMenu))}
      >
        <Stack alignItems="center" justifyContent="center" >
          <Avatar onClick={() => navigate('/')} variant="square" src={Logo} sx={{ width: "100%", maxWidth: "100px", height: "auto", mt: 2, filter: "drop-shadow(4px 2px 1px #000) invert(1)", cursor: 'pointer' }}>
          </Avatar>
        </Stack>
        <Divider sx={{ mt: 3, mb: 3 }} />
        <Box>
          <List sx={{ "& .MuiListItemIcon-root": { color: "#000" } }}>
            {routes.map((v, i) => (
              <React.Fragment key={i}>
                <NavItem item={v} />
              </React.Fragment>
            ))}
            <Divider sx={{ mt: 3, mb: 3 }} />
            <ListItem disablePadding>
              <ListItemButton onClick={logOut}>
                <ListItemIcon>
                  <LogoutIcon />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </DrawerNavigation>
    </>
  );
}

const NavItem = ({ item }) => {
  const navigate = useNavigate();
  const path = window.location.pathname === "/" ? window.location.pathname : `/${window.location.pathname.split("/").filter((each) => each !== "")[0]}`;
  const isMatch = (path) => {
    if (item?.children.some((each) => each.match === path)) {
      return true;
    } else if (path === item.match) {
      return true;
    }
  };

  return (
    <ListItem disablePadding sx={{ width: "100%" }}>
      <ListItemButton onClick={() => navigate(item.routeName)} selected={isMatch(path)}>
        <ListItemIcon>{item.icon}</ListItemIcon>
        <ListItemText>
          <Typography variant="subtitle">{item.label}</Typography>
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
};