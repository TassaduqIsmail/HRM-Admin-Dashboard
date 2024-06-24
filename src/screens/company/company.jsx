import React, { Fragment, useEffect, useState } from "react";
import { Button, Chip, Container, Grid, IconButton, Stack, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import usePageTitle from "../../hooks/use-page-title";
import { setToast } from "../../store/reducer";
import apiManager from "../../services/api-manager";
import { InputField, TableContainer } from "../../components";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import Utils from "../../utils";

const Company = () => {

  usePageTitle("Companies");
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [IsFilterApply, setIsFilterApply] = useState(false);
  const dispatch = useDispatch();
  const showMessage = (type, msg) => dispatch(setToast({ type: type, message: msg }));

  // Define table header labels.
  const thLabels = ["No.", "Name", "Address", "Geo Fence Status", "Actions"];

  // Function to fetch data from the server.
  const getData = async () => {
    try {
      setIsLoading(true);
      let { data } = await apiManager({
        method: "get", path: `company/get-companies?per_page=${perPage}&page=${page}&search=${search}`,
      });
      setRecords(data?.response);
      showMessage("success", data?.message);
    } catch (error) {
      showMessage("error", error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger data fetching when the page, perPage, IsFilterApply changes.
  useEffect(() => {
    getData();
  }, [page, perPage, IsFilterApply]);

  // Function to apply filters.
  const applyFilters = () => {
    getData();
    setIsFilterApply(true);
  };

  // Function to clear filters.
  const clearFilters = () => {
    if (search) {
      setSearch("");
    }
    getData();
    setIsFilterApply(!IsFilterApply);
  };

  // Function to render filter input fields and buttons.
  const useFilters = () => {
    return (
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent={{ xs: "center", md: "flex-start" }}
        alignItems={{ xs: "center", md: "flex-end" }}
        spacing={1}
        position={"relative"}
        flexWrap="wrap"
        sx={{ "& > div,& > button": { mt: "10px !important" }, "& > div": { width: { md: "fit-content !important", xs: "100% !important" } } }}
      >
        <InputField size="small" fullWidth label={"Search"} onChange={(e) => setSearch(e.target.value)} value={search} />
        <Button
          variant="contained"
          sx={{ borderRadius: "25px", textTransform: "none", width: { md: "fit-content", xs: "100%" } }}
          disabled={!search}
          onClick={applyFilters}
        >
          Filter
        </Button>
        {IsFilterApply && (
          <Button
            variant="contained"
            sx={{ borderRadius: "25px", textTransform: "none", width: { md: "fit-content", xs: "100%" } }}
            onClick={clearFilters}
          >
            Clear
          </Button>
        )}
        <Button variant="contained" style={{ marginLeft: "auto" }} sx={{ borderRadius: "25px", textTransform: "none", width: { md: "fit-content", xs: "100%" } }}>
          <Link to="/add-company" style={{ textDecoration: 'none', color: "inherit", width: "100%" }}>
            Add Company
          </Link>
        </Button>
      </Stack>
    );
  };

  // Capitalize First Character.
  const capitalizeFirstCharacter = (bool) => bool ? "ON" : "OFF";

  // Function to render a table row for a user record.
  const renderRow = (item, index) => {
    return (
      <TableRow key={index}>
        <TableCell>{Utils.getRowNumber(records?.current_page, records?.per_page, index)}</TableCell>
        <TableCell>{item?.name ? item?.name?.length > 30 ? `${item?.name.slice(0, 30)}...` : item?.name : "-"}</TableCell>
        <TableCell>{item?.address ? item?.address?.length > 35 ? `${item?.address.slice(0, 35)}...` : item?.address : "-"}</TableCell>
        <TableCell><Chip label={capitalizeFirstCharacter(item?.geo_fence_status)} variant="filled" color={item?.geo_fence_status ? "primary" : "default"} sx={{ fontWeight: 700 }} /></TableCell>
        <TableCell>
          <Tooltip title="Update Details" placement="top">
            <IconButton component={Link} to={`/update-company/${item._id}`}>
              <ModeEditIcon sx={{ color: "primary.main" }} />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      <Container maxWidth="xxl" py={3}>
        <Grid container spacing={2} my={2}>
          <Grid item xs={12}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6" children="Companies" />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            {useFilters()}
          </Grid>
          <Grid item xs={12}>
            <TableContainer
              isLoading={isLoading}
              thContent={thLabels.map((value, i) => (<TableCell key={i} children={value} />))}
              spanTd={thLabels.length}
              page={page}
              totalPages={records?.total_pages}
              callBack={setPage}
              isContent={records?.data?.length}
            >
              {records?.data?.map((item, i) => {
                return <Fragment key={i} children={renderRow(item, i)} />;
              })}
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Company;