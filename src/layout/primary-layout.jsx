import React from 'react';
import { Box } from "@mui/material";
import { Header, Drawer } from "../components";
import { routes } from './data';

function PrimaryLayout({ children }) {
    return (
        <Box className="layout_container">
            <Drawer routes={routes} />
            <Box className="page_content" sx={{ width: { md: "calc(100% - 260px)" } }}>
                <Header />
                <main>{children}</main>
            </Box>
        </Box>
    );
}

export default PrimaryLayout;