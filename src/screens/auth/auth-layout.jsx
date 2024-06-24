import React from "react";
import { Box, Stack } from "@mui/material";
import { Logo } from "../../assets";

function AuthLayout({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom, #EC1C24, #9C0D11)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "contain",
        backgroundSize: "cover",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="flex-start">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="cetner"
          sx={{ width: { md: "500px", xs: "100%" }, minHeight: "100vh" }}
          bgcolor="#fff"
          p={2}
        >
          <Box width="100%">{children}</Box>
        </Stack>
        <Box
          component={Stack}
          alignItems="center"
          justifyContent="center"
          sx={{
            position: "relative",
            minHeight: "100vh",
            width: "calc(100% - 500px)",
          }}
        >
          <Box
            sx={{
              display: { md: "block", xs: "none" },
              textAlign: "center",
            }}
          >
            <img src={Logo} alt="eventsify.png" width="250px" style={{ filter: "brightness(0) invert(1)" }} />
          </Box>
        </Box>
      </Stack>
    </Box>
  );
}

export default AuthLayout;
