import React from "react";
import { Box, IconButton, Toolbar, useMediaQuery } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useDispatch, useSelector } from "react-redux";
import ViewHeadlineIcon from "@mui/icons-material/ViewHeadline";
import { Link } from "react-router-dom";
import { toggleMenu } from "../../store/reducer";

const Header = () => {

    const _openMenu = useSelector((state) => state.appReducer.openMenu);
    const dispatch = useDispatch();
    const matches = useMediaQuery("(min-width:900px)");

    return (
        <Box
            component="header"
            sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, bgcolor: "primary.main" }}
        >
            <Toolbar>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Box>
                        {!matches && (
                            <IconButton
                                onClick={() => dispatch(toggleMenu(!_openMenu))}
                                disabled={matches}
                            >
                                <ViewHeadlineIcon
                                    sx={{
                                        color: "white",
                                        fontSize: "2.4rem",
                                    }}
                                />
                            </IconButton>
                        )}
                    </Box>
                    <Box>
                        <Link to="/profile">
                            <PersonIcon
                                sx={{
                                    color: "white",
                                    fontSize: "3rem",
                                }}
                            />
                        </Link>
                    </Box>
                </Box>
            </Toolbar>
        </Box>
    );
};

export default Header;