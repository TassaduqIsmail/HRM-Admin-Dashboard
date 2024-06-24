import React from "react";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  Box, InputLabel, FormHelperText, IconButton,
  InputAdornment, TextField
} from "@mui/material";
import Utils from "../../utils";

const PasswordField = React.forwardRef(({
  labelTop = "",
  label = "",
  styles,
  error = "",
  helperText = "",
  icon,
  fullWidth = true,
  InputProps = {},
  value: propsValue,
  onChange: propsOnChange,
  size = "small",
  ...props
}, ref) => {
  const [stateValue, setStateValue] = React.useState("");
  const [secureEntry, setSecureEntry] = React.useState(true);
  const _id = `myInput__${Utils.generateId()}`;
  const value = propsValue !== undefined ? propsValue : stateValue;

  const onChange = (event) => {
    if (propsOnChange) {
      propsOnChange(event);
    } else {
      setStateValue(event.target.value);
    }
  };

  const printError = () => {
    if (error !== "") {
      return <FormHelperText sx={{ color: "red", mt: "0 !important" }}>
        {error}
      </FormHelperText>
    }
  }

  const printHelperText = () => {
    if (helperText !== "") {
      return <FormHelperText sx={{ mt: "0 !important", display: "flex", alignItems: "center", gap: 1 }}>
        {helperText}{icon}
      </FormHelperText>
    }
  }

  return (
    <Box sx={styles}>
      {labelTop && (
        <InputLabel
          htmlFor={_id}
          sx={{
            marginBottom: "5px",
            color: "#000",
          }}
        >
          {labelTop}
        </InputLabel>
      )}
      <TextField
        id={_id}
        type={secureEntry ? "password" : "text"}
        inputRef={ref}
        fullWidth={fullWidth}
        error={Boolean(error !== "")}
        label={label}
        size={size}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => setSecureEntry(!secureEntry)}
              >
                {secureEntry ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
          ...InputProps
        }}
        autoComplete={secureEntry ? "new-password" : "off"}
        value={value}
        onChange={onChange}
        {...props}
      />
      {printHelperText()}
      {printError()}
    </Box>
  );
})


export default PasswordField;
