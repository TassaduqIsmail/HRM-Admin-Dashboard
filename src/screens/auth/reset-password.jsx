import React, { useState } from "react";
import { Box, Button, Stack, Typography, InputAdornment } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import PinIcon from '@mui/icons-material/Pin';
import AuthLayout from "./auth-layout";
import usePageTitle from "../../hooks/use-page-title";
import { handleLoader, setToast } from "../../store/reducer";
import ApiManager from "../../services/api-manager";
import { InputField, PasswordField } from "../../components";

function ResetPassword() {
    const { email } = useParams();
    usePageTitle("Reset Password");
    const [formData, setFormData] = useState({ otp: "", password: "" });
    const [formErrors, setFormErrors] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { otp, password } = formData;
    const showMessage = (type, msg) =>
        dispatch(setToast({ type: type, message: msg }));

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            return setFormErrors((prev) => ({
                ...prev,
                password: "Should be at least 6 character long.",
            }));
        }
        try {
            dispatch(handleLoader(true));
            setFormErrors({});
            await ApiManager({ method: "post", path: "admin/reset-password", params: { ...formData, email: email } });
            showMessage("success", "Password reset successfully.");
            navigate("/login");
        } catch (error) {
            if (error?.response?.status === 422) {
                setFormErrors(error?.response?.data?.response?.error);
            }
            if (error?.response?.status !== 422) {
                showMessage("error", error?.response?.data?.error?.message);
            } else {
                showMessage("error", error?.response?.data?.message);
            }
        } finally {
            dispatch(handleLoader(false));
        }
    };

    return (
        <AuthLayout>
            <Box
                component="form"
                autoComplete="off"
                autoCapitalize="off"
                onSubmit={handleSubmit}
            >
                <Stack spacing={2}>
                    <Typography
                        variant="h4"
                        color="initial"
                        fontWeight={"bold"}
                        textAlign="center"
                        mb={2}
                    >
                        Reset Password
                    </Typography>
                    <InputField
                        labelTop="Token"
                        size="large"
                        placeholder="0000"
                        required
                        name="otp"
                        value={otp}
                        error={formErrors?.otp}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PinIcon />
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
                        value={password}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockIcon />
                                </InputAdornment>
                            ),
                        }}
                        helperText="Type your new password."
                    />
                    <Button
                        variant="contained"
                        type="submit"
                        size="large"
                        sx={{ color: "#fff" }}
                    >
                        Submit
                    </Button>
                    <Box
                        sx={{
                            textAlign: "center",
                            pt: 3,
                        }}
                    >
                        Go to <Box
                            component={Link}
                            to="/login"
                            sx={{ color: "primary.main" }}
                        >
                            login
                        </Box> screen.
                    </Box>
                </Stack>
            </Box>
        </AuthLayout>
    );
}

export default ResetPassword;
