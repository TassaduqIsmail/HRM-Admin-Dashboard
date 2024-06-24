import React from "react";
import { useMediaQuery, IconButton, Dialog, DialogContent, DialogTitle, DialogActions, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ModalWrapper = ({ open, onClose, title, children, dialogContentSx, ...props }) => {
  function BootstrapDialogTitle(props) {
    const { children, onClose, ...other } = props;
    const match = useMediaQuery("(min-width:600px)");

    return (
      <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
        {children}
        {match && onClose ? (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      sx={{
        "& .MuiDialog-container": {
          "& .MuiPaper-root": {
            minWidth: "280px", // Set your width here
          },
        },
      }}
      scroll="paper"
      {...props}
    >
      <BootstrapDialogTitle onClose={onClose}> {title}</BootstrapDialogTitle>
      <DialogContent sx={{ dialogContentSx }} dividers>
        {children}
      </DialogContent>
      {/* <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default ModalWrapper;
