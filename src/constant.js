import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    typography: {
        fontFamily: ["Poppins", "Lato", "Parisienne"].join(","),
        Regular: 400,
        Medium: 500,
        SemiBold: 600,
        Bold: 700,
        ExtraBold: 900,
    },
    palette: {
        primary: {
            main: "#EC1C24",
        },
        secondary: {
            main: "#231F20",
            light: "#fff",
            dimLight: "#F3F3F3",
        },
    },
});
