import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { Container, Grid, Paper, Box, Stack, Typography, Fab, FormControlLabel, Switch, Button, Tooltip } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import apiManager from "../../services/api-manager";
import { handleLoader, setToast } from "../../store/reducer";
import { Delete } from "@mui/icons-material";
import { ConfirmationModal, InputField, PasswordField, SelectBox } from "../../components";
import usePageTitle from "../../hooks/use-page-title";
import errorsSetter from "../../helpers/errors-setter";
import { useNavigate, useParams } from "react-router-dom";

const UserCrud = () => {

    const { userID } = useParams();
    usePageTitle(`${userID ? "Update" : "Add"} Employee`);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const showMessage = (type, msg) => dispatch(setToast({ type, message: msg }));
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [companies, setCompanies] = useState([]);
    const [openDeleteModel, setOpenDeleteModel] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        company_id: "",
        phone_number: "",
        area_code: "",
        role: "",
        code: "",
        checkout_approval: false,
    });
    const showMessageAndSetLoading = (type, msg, loading) => {
        showMessage(type, msg);
        setIsLoading(loading);
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        const parsedValue = type === 'number' ? parseInt(value) : value;
        setFormData((prev) => ({ ...prev, [name]: parsedValue }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.name) errors.name = "Name is required";
        if (!formData.email) errors.email = "Email is required";
        if ((!formData.password && !userID) || (formData.password && formData.password.length < 6)) errors.password = "Password must be 6 characters long";
        if (!formData.company_id) errors.company_id = "Company Id is required";
        if (formData.area_code && !formData.phone_number) errors.phone_number = "Phone number is required";
        if (formData.phone_number && !formData.area_code) errors.area_code = "Area code is required";
        if (formData.role === "supervisor") {
            if (!formData.code || formData?.code?.toString()?.length < 4 || formData?.code?.toString()?.length > 8) {
                errors.code = "Code must be between 4 and 8 characters long";
            }
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const getData = async () => {
        try {
            dispatch(handleLoader(true));
            const { data } = await apiManager({ method: "get", path: `admin/user/${userID}` });
            let myData = data?.response?.data;
            let newFormData = { ...myData, company_id: myData?.company_id?._id };
            setFormData(newFormData);
        } catch (error) {
            showMessageAndSetLoading("error", "Something went wrong");
        } finally {
            dispatch(handleLoader(false));
        }
    };

    const fetchCompanies = async () => {
        try {
            dispatch(handleLoader(true));
            const { data } = await apiManager({ method: "get", path: "company/get-companies?per_page=5000" });
            const companyList = data?.response?.data || [];
            setCompanies(companyList);
        } catch (error) {
            showMessageAndSetLoading("error", "Error fetching companies");
        } finally {
            dispatch(handleLoader(false));
        }
    };

    useEffect(() => {
        if (userID) getData();
        fetchCompanies();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setFormErrors({});
        setIsLoading(true);
        const method = userID ? "put" : "post";
        try {
            const { data } = await apiManager({ method, path: method === "put" ? `admin/update-user/${userID}` : "admin/create-user", params: { ...formData } });
            navigate("/users");
            showMessageAndSetLoading("success", data?.message, false);
        } catch (error) {
            setFormErrors(errorsSetter(error));
            showMessageAndSetLoading("error", error?.response?.data?.message, false);
        } finally {
            dispatch(handleLoader(false));
        }
    };

    const companiesSelectItems = companies.map(company => ({
        label: company.name,
        value: company._id
    }));

    const handleDelete = async () => {
        try {
            setIsLoading(true);
            const { data } = await apiManager({ method: "delete", path: `admin/delete-user/${userID}` });
            navigate(-1)
            setOpenDeleteModel(false);
            showMessageAndSetLoading("success", data?.message, false);
        } catch (error) {
            showMessageAndSetLoading("error", error?.response?.data?.message, false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeChange = (e) => {
        let inputValue = e.target.value;
        if (inputValue.length > 0 && inputValue[0] === "0") {
            inputValue = inputValue.substring(0);
        }
        inputValue = inputValue.replace(/^0+/, 1);
        if (/^\d{4,8}$/.test(inputValue)) {
            setFormData({ ...formData, code: parseInt(inputValue) });
            // Clear any existing error message after 1 second
            setTimeout(() => {
                setFormErrors({ ...formErrors, code: '' });
            }, 1000);
        } else {
            setFormData({ ...formData, code: parseInt(inputValue) });
            setFormErrors({ ...formErrors, code: "Code must be between 4 and 8 digits and cannot start with 0" });
        }
    };

    return (
        <Container maxWidth="xxl" py={3} sx={{ mb: "60px" }}>
            <Grid container spacing={2} mt={2}>
                <Grid item xs={12}>
                    <Fab size="small" color="primary" onClick={() => { navigate(-1) }}><KeyboardBackspaceIcon /></Fab>
                    <Stack><Typography variant="h4" align="center" children={`${userID ? "Update" : "Add"} Employee`} /></Stack>
                </Grid>
                <Grid item xs={12} container>
                    <Container maxWidth={"md"}>
                        <Paper sx={{ padding: 3 }} elevation={8} component={"form"} onSubmit={handleSubmit}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
                                <Grid container>
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="h6" sx={{ mb: 1 }}>Employee Details</Typography>
                                    </Grid>
                                    {userID &&
                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ display: "flex", justifyContent: { sm: "flex-end" } }}>
                                                <Tooltip title="Delete Employee" placement="top">
                                                    <Button
                                                        variant="text"
                                                        onClick={() => setOpenDeleteModel(true)}
                                                        startIcon={<Delete />}
                                                        sx={{ textTransform: "capitalize" }}
                                                    >
                                                        Delete Permanently
                                                    </Button>
                                                </Tooltip>
                                            </Box>
                                        </Grid>
                                    }
                                </Grid>
                                <InputField
                                    size="large"
                                    label="Name"
                                    fullWidth
                                    required
                                    name="name"
                                    value={formData.name}
                                    error={formErrors.name}
                                    onChange={handleInputChange}
                                />
                                <InputField
                                    size="large"
                                    label="Email"
                                    fullWidth
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    error={formErrors.email}
                                    onChange={handleInputChange}
                                />
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={3} >
                                        <InputField
                                            size="large"
                                            label="Area Code"
                                            type="number"
                                            name="area_code"
                                            value={formData?.area_code}
                                            error={formErrors?.area_code}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={9}>
                                        <InputField
                                            size="large"
                                            label="Phone No"
                                            type="number"
                                            name="phone_number"
                                            value={formData?.phone_number}
                                            error={formErrors?.phone_number}
                                            onChange={handleInputChange}
                                        />
                                    </Grid>
                                </Grid>
                                <SelectBox
                                    size="large"
                                    label={"Company"}
                                    required
                                    fullWidth
                                    name="company_id"
                                    initValue={formData?.company_id}
                                    value={formData?.company_id}
                                    error={formErrors.company_id}
                                    handleChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                                    items={companiesSelectItems}
                                />
                                <Grid container spacing={2} alignItems={"center"}>
                                    <Grid item xs={12} sm={!formData.role ? 12 : 8}>
                                        <SelectBox
                                            size="large"
                                            label={"Role"}
                                            required
                                            fullWidth
                                            name="role"
                                            initValue={formData?.role}
                                            value={formData?.role}
                                            error={formErrors.role}
                                            handleChange={handleInputChange}
                                            items={[
                                                { label: "Employee", value: "employee" },
                                                { label: "Supervisor", value: "supervisor" },
                                            ]}
                                        />
                                    </Grid>
                                    {(formData.role !== "") ? (
                                        formData.role === "supervisor" ? (
                                            <Grid item xs={12} sm={4}>
                                                <InputField
                                                    size="large"
                                                    label="Pass Code"
                                                    required
                                                    type="number"
                                                    name="code"
                                                    value={formData?.code}
                                                    error={formErrors?.code}
                                                    onChange={handleCodeChange}
                                                />
                                            </Grid>
                                        ) : (
                                            <Grid item xs={12} sm={4}>
                                                <FormControlLabel
                                                    value="top"
                                                    label="Checkout approval"
                                                    control={<Switch color="primary" checked={formData?.checkout_approval} />}
                                                    onChange={(e) => setFormData({ ...formData, checkout_approval: e.target.checked })}
                                                    labelPlacement="end"
                                                />
                                            </Grid>
                                        )
                                    ) : null}
                                </Grid>
                                <PasswordField
                                    size="large"
                                    label="Password"
                                    fullWidth
                                    required={userID ? false : true}
                                    placeholder="Password"
                                    name="password"
                                    value={formData.password}
                                    error={formErrors?.password}
                                    onChange={handleInputChange}
                                />
                            </Box>
                            <Box><LoadingButton loading={isLoading} type="submit" variant="contained" sx={{ mt: 2 }}>{`${userID ? "Update" : "Add"} Employee`}</LoadingButton></Box>
                        </Paper>
                    </Container>
                </Grid>
            </Grid>
            <ConfirmationModal
                open={openDeleteModel}
                close={() => setOpenDeleteModel(false)}
                callBack={handleDelete}
                matchText="Delete"
            />
        </Container>
    );
};

export default UserCrud;