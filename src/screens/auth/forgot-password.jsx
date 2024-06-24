import React, { useState } from "react";
import { Box, Button, Stack, Typography, InputAdornment } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { InputField } from "../../components";
import AuthLayout from "./auth-layout";
import usePageTitle from "../../hooks/use-page-title";
import { handleLoader, setToast } from "../../store/reducer";
import ApiManager from "../../services/api-manager";
import errorsSetter from "../../helpers/errors-setter";

function ForgotPassword() {
    usePageTitle("Forgot Password");
    const [formData, setFormData] = useState({ email: "" });
    const { email } = formData;
    const [formErrors, setFormErrors] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const showMessage = (type, msg) => dispatch(setToast({ type: type, message: msg }));

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(handleLoader(true));
            setFormErrors({});
            let { data } = await ApiManager({ method: "post", path: "admin/forgot-password", params: { email } });
            showMessage("success", data.message);
            navigate(`/reset-password/${email}`);
        } catch (error) {
            if (error?.response?.status === 422) {
                setFormErrors(errorsSetter(error));
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
                    >Forgot Password</Typography>
                    <InputField
                        labelTop="Email"
                        size="large"
                        placeholder="john@example.com"
                        required
                        type="email"
                        name="email"
                        value={email}
                        error={formErrors?.email}
                        onChange={handleInputChange}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <PersonIcon />
                                </InputAdornment>
                            ),
                        }}
                        helperText="Token will be send on the given email address."
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
                    > Go to <Box
                        component={Link}
                        to="/login"
                        sx={{ color: "primary.main" }}
                    > login </Box> screen.
                    </Box>
                </Stack>
            </Box>
        </AuthLayout>
    );
}

export default ForgotPassword;
