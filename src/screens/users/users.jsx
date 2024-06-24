import React, { Fragment, useEffect, useState } from "react";
import { Box, Button, Container, FormControlLabel, Grid, IconButton, Stack, Switch, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import usePageTitle from "../../hooks/use-page-title";
import { handleLoader, setToast } from "../../store/reducer";
import apiManager from "../../services/api-manager";
import { ConfirmationModal, InputField, SelectBox, TableContainer } from "../../components";
import Utils from "../../utils";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
// import { Delete } from "@mui/icons-material";

const Users = () => {

  usePageTitle("Employees");
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [IsFilterApply, setIsFilterApply] = useState(false);
  const dispatch = useDispatch();
  const showMessage = (type, msg) => dispatch(setToast({ type: type, message: msg }));

  // const [openDeleteModel, setOpenDeleteModel] = useState(false);
  // const [deleteId, setDeleteId] = useState(null);

  // const handleDelete = async () => {
  //   try {
  //     setIsLoading(true);
  //     const { data } = await apiManager({ method: "delete", path: `admin/users/${deleteId}` });
  //     setOpenDeleteModel(false);
  //   } catch (error) {
  //     showMessage("error", error?.response?.data?.message);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // Define table header labels.
  const thLabels = ["No.", "Name", "Email", "Role", "Company Name", "Phone number", "Status", "Actions"];

  // Function to fetch data from the server.
  const getData = async () => {
    try {
      setIsLoading(true);
      let path = `admin/users?search=${search}&page=${page}&per_page=${perPage}`;
      // Check if status is not 'all' before including it in the path
      if (status !== 'all') {
        path += `&status=${status}`;
      }
      let { data } = await apiManager({
        method: 'get',
        path: path,
      });
      setRecords(data?.response?.data);
    } catch (error) {
      showMessage("error", error?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger data fetching when the page, perPage, IsFilterApply changes.
  useEffect(() => {
    getData();
  }, [page, perPage, IsFilterApply, status]);

  // Function to update user status.
  const updateStatus = async (item) => {
    try {
      dispatch(handleLoader(true));
      let { data } = await apiManager({
        method: "put",
        path: `admin/user/${item._id}`,
        params: { status: item?.is_approved ? false : true },
      });
      dispatch(setToast({ type: "success", message: data?.message }));
      let prevData = records?.detail;
      let _index = prevData.findIndex((_item) => _item._id === item?._id);
      prevData[_index] = data?.response?.data;
      setRecords((prev) => ({ ...prev, data: prevData }));
      getData();
    } catch (error) {
      dispatch(setToast({ type: "error", message: error?.response?.data?.message }));
    } finally {
      dispatch(handleLoader(false));
    }
  };

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
        flexWrap="wrap"
        sx={{ "& > div,& > button": { mt: "10px !important" }, "& > div": { width: { md: "fit-content !important", xs: "100% !important" } } }}
      >
        <InputField size="small" fullWidth label={"Search"} onChange={(e) => setSearch(e.target.value)} value={search} />
        <SelectBox
          size="small"
          name="status"
          label={"Employee Status"}
          initValue={status}
          value={status}
          handleChange={(e) => setStatus(e.target.value)}
          items={[
            { label: "All", value: "all" },
            { label: "Active", value: true },
            { label: "In-Active", value: false },
          ]}
        />
        <Button variant="contained" sx={{ borderRadius: "25px", textTransform: "none", width: { md: "fit-content", xs: "100%" } }} disabled={!search} onClick={applyFilters}>Filter</Button>
        {IsFilterApply && <Button variant="contained" sx={{ borderRadius: "25px", textTransform: "none", width: { md: "fit-content", xs: "100%" } }} onClick={clearFilters}>Clear</Button>}
        <Button variant="contained" style={{ marginLeft: "auto" }} sx={{ borderRadius: "25px", textTransform: "none", width: { md: "fit-content", xs: "100%" } }}>
          <Link to="/user-crud" style={{ textDecoration: 'none', color: "inherit", width: "100%" }}>
            Add Employee
          </Link>
        </Button>
      </Stack>
    );
  };

  // Function to render a table row for a user record.
  const renderRow = (item, index) => {
    return (
      <TableRow>
        <TableCell>{Utils.getRowNumber(records?.current_page, records?.per_page, index)}</TableCell>
        <TableCell>{item?.name ? item?.name : "-"}</TableCell>
        <TableCell>{item?.email ? item?.email : "-"}</TableCell>
        <TableCell sx={{ textTransform: "capitalize" }} >{item?.role ? item?.role : "-"}</TableCell>
        <TableCell>{item?.company_detail?.name ? item?.company_detail?.name?.length > 20 ? `${item?.company_detail?.name.slice(0, 20)}...` : item?.company_detail?.name : "-"}</TableCell>
        <TableCell>{item?.phone_number && item?.area_code ? `(${item?.area_code}) ${item?.phone_number}` : "-"}</TableCell>
        <TableCell>
          <Box sx={{ width: "50px" }}>
            <FormControlLabel control={<Switch color="primary" checked={item.is_approved} onChange={() => updateStatus(item)} />} />
          </Box>
        </TableCell>
        <TableCell>
          <Tooltip title="Update Details" placement="top">
            <IconButton component={Link} to={`/user-crud/${item._id}`}>
              <ModeEditIcon sx={{ color: "primary.main" }} />
            </IconButton>
          </Tooltip>
          {/* <Tooltip title="Delete Employee" placement="top">
            <IconButton onClick={() => {
              setOpenDeleteModel(true)
              setDeleteId(item?._id)
            }}>
              <Delete sx={{ color: "primary.main" }} />
            </IconButton>
          </Tooltip> */}
          <Tooltip title="Attendence Details" placement="top">
            <Link to={`/attendance/get-attendances/${item?._id}?user-name=${item?.name}`} >
              <IconButton>
                <PermContactCalendarIcon sx={{ color: "primary.main" }} />
              </IconButton>
            </Link>
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
              <Typography variant="h6" children="Employees" />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            {useFilters()}
          </Grid>
          <Grid item xs={12}>
            <TableContainer
              isLoading={isLoading}
              thContent={
                <>
                  {thLabels.map((value, i) => (
                    <TableCell key={i} children={value} />
                  ))}
                </>
              }
              spanTd={thLabels.length}
              page={page}
              totalPages={records?.total_pages}
              callBack={setPage}
              isContent={records?.detail?.length}
            >
              {records?.detail?.map((item, i) => {
                return (
                  <Fragment key={i} children={renderRow(item, i)} />
                )
              })}
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
      {/* <ConfirmationModal
        open={openDeleteModel}
        close={() => setOpenDeleteModel(false)}
        callBack={handleDelete}
      /> */}
    </>
  );
}

export default Users;