import "./scss/app.scss";
import Router from "./router/router";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./constant";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <ThemeProvider theme={theme}>
        <Router />
      </ThemeProvider>
    </LocalizationProvider>
  );
}

export default App;
