import React from "react";
import { Box, InputLabel, FormHelperText, TextField } from "@mui/material";
import Utils from "../../utils";

const InputField = React.forwardRef(
  (
    {
      labelTop = "",
      label = "",
      styles,
      error = "",
      helperText = "",
      icon,
      fullWidth = true,
      value: propsValue,
      onChange: propsOnChange,
      size = "small",
      min = "",
      max = "",
      ...props
    },
    ref
  ) => {
    const [stateValue, setStateValue] = React.useState("");
    const value = propsValue !== undefined ? propsValue : stateValue;
    const _id = `myInput__${Utils.generateId()}`;

    const onChange = (event) => {
      if (propsOnChange) {
        propsOnChange(event);
      } else {
        setStateValue(event.target.value);
      }
    };

    const printError = () => {
      if (error !== "") {
        return <FormHelperText sx={{ color: "red", mt: "0 !important" }}>{error}</FormHelperText>;
      }
    };

    const printHelperText = () => {
      if (helperText !== "") {
        return (
          <FormHelperText
            sx={{
              mt: "0 !important",
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#6C6A6A",
              fontWeight: 500,
            }}
          >
            {helperText}
            {icon}
          </FormHelperText>
        );
      }
    };

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
          inputRef={ref}
          error={Boolean(error !== "")}
          label={label}
          fullWidth={fullWidth}
          size={size}
          autoComplete="off"
          value={value}
          onChange={onChange}
          inputProps={{
            min: min,
            max: max,
          }}
          {...props}
        />
        {printHelperText()}
        {printError()}
      </Box>
    );
  }
);

export default InputField;
