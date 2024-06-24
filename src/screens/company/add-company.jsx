import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { Container, Divider, Grid, Paper, Box, Stack, Typography, FormControlLabel, Switch, Fab } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import apiManager from "../../services/api-manager";
import { handleLoader, setToast } from "../../store/reducer";
import { InputField } from "../../components";
import usePageTitle from "../../hooks/use-page-title";
import errorsSetter from "../../helpers/errors-setter";
import { Link, useNavigate, useParams } from "react-router-dom";

const AddCompany = () => {

  const { companyID } = useParams();
  usePageTitle(`${companyID ? "Update" : "Add"} Company`);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const showMessage = (type, msg) => dispatch(setToast({ type, message: msg }));
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    longitude: "",
    latitude: "",
    radius: "",
    geo_fence_status: true,
  });

  const showMessageAndSetLoading = (type, msg, loading) => {
    showMessage(type, msg);
    setIsLoading(loading);
  };

  const getData = async () => {
    try {
      dispatch(handleLoader(true));
      const { data } = await apiManager({ method: "get", path: `company/get-company/${companyID}` });
      let myData = data?.response?.data;
      let newFormData = { ...myData, ...{ longitude: myData.location.longitude, latitude: myData.location.latitude, radius: myData.location.radius } };
      setFormData(newFormData);
    } catch (error) {
      showMessageAndSetLoading("error", "Something went wrong");
    } finally {
      dispatch(handleLoader(false));
    }
  };

  useEffect(() => {
    if (companyID) getData();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name) errors.name = "Name is required";
    if (!formData.address) errors.address = "Address is required";
    if (!formData.longitude) errors.longitude = "Longitude is required";
    if (!formData.latitude) errors.latitude = "Latitude is required";
    if (!formData.radius) errors.radius = "Radius is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setFormErrors({});
    setIsLoading(true);
    const method = companyID ? "put" : "post";
    try {
      const { data } = await apiManager({
        method,
        path: method === "put" ? `company/update-company/${companyID}` : "company/store-company",
        params: {
          ...formData,
          location: {
            longitude: formData.longitude,
            latitude: formData.latitude,
            radius: formData.radius,
            geo_fence_status: formData.geo_fence_status
          },
        },
      });
      navigate("/company");
      showMessageAndSetLoading("success", data?.message, false);
    } catch (error) {
      setFormErrors(errorsSetter(error));
      showMessageAndSetLoading("error", error?.response?.data?.message, false);
    } finally {
      dispatch(handleLoader(false));
    }
  };

  return (
    <Container maxWidth="xxl" py={3} sx={{ mb: "60px" }}>
      <Grid container spacing={2} mt={2}>
        <Grid item xs={12}>
          <Fab size="small" color="primary" component={Link} to="/company">
            <KeyboardBackspaceIcon />
          </Fab>
          <Stack>
            <Typography variant="h4" align="center" children={`${companyID ? "Update" : "Add"} Company`} />
          </Stack>
        </Grid>
        <Grid item xs={12} container>
          <Container maxWidth={"md"}>
            <Paper sx={{ padding: 3 }} elevation={8} component={"form"} onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>Company Details</Typography>
                <InputField
                  size="large"
                  label="Company name"
                  fullWidth
                  required
                  name="name"
                  value={formData.name}
                  error={formErrors.name}
                  onChange={handleInputChange}
                />
                <InputField
                  size="large"
                  label="Company address"
                  fullWidth
                  required
                  name="address"
                  value={formData.address}
                  error={formErrors.address}
                  onChange={handleInputChange}
                />
              </Box>
              <Stack gap={3}>
                <Stack
                  direction={"row"}
                  justifyContent={"flex-start"}
                  alignItems={"center"}
                  gap={2}
                >
                  <Typography variant="h6">Geo Fence</Typography>
                  <FormControlLabel
                    value="top"
                    control={<Switch color="primary" checked={formData?.geo_fence_status} />}
                    onChange={(e) => setFormData({ ...formData, geo_fence_status: e.target.checked })}
                    labelPlacement="end"
                  />
                </Stack>
                <Grid container item spacing={2} xs={12}>
                  <Grid item xs={12} sm={4.5} >
                    <InputField
                      size="large"
                      label="Longitude"
                      placeholder="Longitude"
                      required
                      type="number"
                      name="longitude"
                      value={formData.longitude}
                      error={formErrors.longitude}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4.5} >
                    <InputField
                      size="large"
                      label="Latitude"
                      placeholder="Latitude"
                      required
                      type="number"
                      name="latitude"
                      value={formData.latitude}
                      error={formErrors.latitude}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} >
                    <InputField
                      size="large"
                      label="Radius (meters)"
                      placeholder="Radius"
                      required
                      type="number"
                      name="radius"
                      value={formData.radius}
                      error={formErrors.radius}
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
                <Box>
                  <LoadingButton loading={isLoading} type="submit" variant="contained" sx={{ mt: 2 }}>{companyID ? "Update Company" : "Create Company"}</LoadingButton>
                </Box>
              </Stack>
            </Paper>
          </Container>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AddCompany;
