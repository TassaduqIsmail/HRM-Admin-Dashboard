import React, { useState } from "react";
import { Box, Button, Stack, Typography, InputAdornment } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { InputField, PasswordField } from "../../components";
import AuthLayout from "./auth-layout";
import usePageTitle from "../../hooks/use-page-title";
import { setTimezone, setToast, setUser } from "../../store/reducer";
import apiManager from "../../services/api-manager";

function Login() {
  usePageTitle("Login");
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      let { data } = await apiManager({ method: "post", path: "admin/sign-in", params: formData, });
      dispatch(setUser(data?.response?.data));
      dispatch(setTimezone(data?.response?.timezone));
      localStorage.setItem(import.meta.env.VITE_APP_TOKEN, data?.response?.token);
      navigate("/");
    } catch (error) {
      if (error?.response?.status === 422) {
        dispatch(setToast({ type: "error", message: error?.response?.data?.message }));
        setFormErrors(error?.response?.data?.error);
      } else {
        dispatch(setToast({ type: "error", message: error?.response?.data?.message }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Box component="form" autoComplete="off" autoCapitalize="off" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <Typography variant="h4" color="initial" fontWeight={"bold"} textAlign="center" mb={2}>
            {isLoading ? "loading" : "Login"}
          </Typography>
          <InputField
            labelTop="Email"
            size="large"
            placeholder="john@example.com"
            required
            type="email"
            name="email"
            value={formData.email}
            error={formErrors?.email}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon />
                </InputAdornment>
              ),
            }}
          />
          <PasswordField
            size="large"
            labelTop="Password"
            placeholder="xxxxxx"
            required
            name="password"
            error={formErrors?.password}
            value={formData.password}
            onChange={handleInputChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box
            sx={{
              mt: "5px !important",
              textAlign: "right",
              pb: 2,
            }}
          >
            <Box
              component={Link}
              to="/forgot-password"
              sx={{ color: "primary.main" }}
            >
              Forgot password?
            </Box>
          </Box>
          <Box pt={2} />
          <Button type="submit" variant="contained" size="large" sx={{ color: "#fff" }}>
            Login
          </Button>
        </Stack>
      </Box>
    </AuthLayout>
  );
}

export default Login;
