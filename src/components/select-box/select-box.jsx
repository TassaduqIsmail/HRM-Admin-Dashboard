import React, { useState, useEffect } from "react";
import { InputLabel, FormControl, Select, MenuItem, FormHelperText, Box } from "@mui/material";

export default function SelectBox({ initValue = "", labelTop, label, items = [], name = "", error = "", addNew = false, styles = {}, required, addHandle = () => { }, search = () => { }, handleChange = () => { }, ...props }) {

  const [selected, setSelected] = useState("");
  const rand = Math.ceil(Math.random());

  useEffect(() => {
    setSelected(initValue);
  }, [initValue]);

  const handleSelect = (e) => {
    setSelected(e.target.value);
    handleChange(e);
  };

  return (
    <Box sx={styles}>
      {labelTop && <InputLabel id={`select${rand}`} sx={{ marginBottom: "5px", color: "" }}>{labelTop}</InputLabel>}
      <FormControl sx={{ minWidth: "150px" }} {...props}>
        {label && <InputLabel id={`select${rand}`} sx={{ backgroundColor: "#fff" }}>{label}</InputLabel>}
        <Select id={`select${rand}`} onChange={handleSelect} value={selected} name={name} required={required} error={Boolean(error !== "")}>
          {addNew && <MenuItem value="" onClick={() => addHandle(true)}>Add New</MenuItem>}
          {items.map((_v, _i) => <MenuItem key={_i} value={_v.value}>{_v.label}</MenuItem>)}
        </Select>
      </FormControl>
      {error !== "" && <FormHelperText sx={{ color: "red", mt: "0 !important" }}>{error}</FormHelperText>}
    </Box>
  );
}
