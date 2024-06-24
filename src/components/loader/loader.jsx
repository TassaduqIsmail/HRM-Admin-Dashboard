import React from "react";
import { CircularProgress, Backdrop, LinearProgress } from "@mui/material";

function Loader({ open = false }) {
  if (!open) {
    return <></>;
  }
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={open}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export default Loader;

