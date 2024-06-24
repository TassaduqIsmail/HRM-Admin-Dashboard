import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeToast } from "../../store/reducer";
import Alert from "@mui/material/Alert";
import { Snackbar } from "@mui/material";

function Toast() {
  const { toast } = useSelector((state) => state.appReducer);
  const dispatch = useDispatch();

  return (
      <Snackbar
        open={toast?.open}
        autoHideDuration={4000}
        onClose={(e) => dispatch(removeToast())}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
          <Alert variant="filled" severity={toast?.type} onClose={(e) => dispatch(removeToast())}>
            {toast.message}
          </Alert>
      </Snackbar>
  );
}

export default Toast;