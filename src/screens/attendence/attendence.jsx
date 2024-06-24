import React, { Fragment, useEffect, useState } from "react";
import { Button, Container, Fab, Grid, IconButton, Stack, TableCell, TableRow, Tooltip, Typography } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import usePageTitle from "../../hooks/use-page-title";
import { handleLoader, setToast } from "../../store/reducer";
import apiManager from "../../services/api-manager";
import { InputField, TableContainer } from "../../components";
import moment from "moment";
import Utils from "../../utils";

function Attendence() {

  usePageTitle(`Attendance`);
  const { userId } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userName = searchParams.get("user-name");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [records, setRecords] = useState([]);
  const [clearFilter, setClearFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const momentDate = moment().format('YYYY-MM-DD');
  const currentDate = moment(momentDate, 'YYYY-MM-DD');
  const [startDate, setStartDate] = useState(currentDate.clone().startOf('month').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(currentDate.clone().endOf('month').format('YYYY-MM-DD'));
  const showMessage = (type, msg) => dispatch(setToast({ type: type, message: msg }));
  const thLabels = ["No.", "Date", "Check In", "Check Out", "Total Office Hour", "Total Break Time", "Actions"];

  const getAttendanceData = async () => {
    try {
      dispatch(handleLoader(true));
      // Filter method. 
      let query = `user_id[0]=${userId}&page=${page}&per_page=${perPage}`;
      if (startDate && endDate) { query += `&start_date=${startDate} 00:00:00&end_date=${endDate} 23:59:59` }
      let { data } = await apiManager({ method: 'get', path: `attendance/get-attendances?${query}` });
      setRecords(data?.response);
    } catch (error) {
      showMessage("error", error?.response?.data?.message);
    } finally {
      dispatch(handleLoader(false));
    }
  };

  useEffect(() => {
    getAttendanceData();
  }, [page, perPage, clearFilter]);

  const renderRow = (item, index) => (
    <TableRow key={index}>
      <TableCell>{Utils.getRowNumber(records?.current_page, records?.per_page, index)}</TableCell>
      <TableCell>{moment.unix(item.checkIn).format("DD, MMM YYYY")}</TableCell>
      <TableCell>{item?.checkIn ? moment.unix(item.checkIn).format('HH:mm:ss') : '-'}</TableCell>
      <TableCell>{item?.checkOut ? moment.unix(item?.checkOut).format('HH:mm:ss') : '-'}</TableCell>
      <TableCell>{item?.total_duration ? item.total_duration : '-'}</TableCell>
      <TableCell>{item?.break_duration ? item?.break_duration : '-'}</TableCell>
      <TableCell>
        <Tooltip title="Attendance Details" placement="top">
          <IconButton component={Link} to={`/attendance/get-attendances/detail/${item._id}`}>
            <InfoIcon sx={{ color: "primary.main" }} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );

  // Filter function for date
  const filterByDate = () => {
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    if (startDateObj > endDateObj) {
      showMessage("error", "End date cannot be earlier than start date");
    } else {
      getAttendanceData();
    }
  };

  // Clear date filters
  const clearDateFilters = () => {
    setStartDate("");
    setEndDate("");
    setClearFilter(!clearFilter);
  };

  return (
    <>
      <Container maxWidth="xxl" py={3}>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12}>
            <Stack direction="row" alignItems="center" gap={2}>
              <Fab size="small" color="primary" aria-label="back" sx={{ my: 1 }} onClick={() => navigate(-1)}><ArrowBackIcon /></Fab>
              <Typography variant="h6" children={`${userName ? userName : "User"} Attendances`} />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item lg={2} md={3} xs={12}>
                <InputField
                  size="small"
                  fullWidth
                  labelTop="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Grid>
              <Grid item lg={2} md={3} xs={12}>
                <InputField
                  size="small"
                  fullWidth
                  labelTop="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Grid>
              <Grid item lg={2} md={3} xs={12} sx={{ display: "flex", flexDirection: "row", flexWrap: "nowrap" }}>
                <Button variant="contained" disabled={!startDate || !endDate} sx={{ borderRadius: "25px", textTransform: "none", mr: 1, mt: { md: 3.6 } }} onClick={filterByDate}>Filter</Button>
                {(startDate || endDate) && (
                  <Button variant="contained" sx={{ borderRadius: "25px", textTransform: "none", mt: { md: 3.6 } }} onClick={clearDateFilters}>Clear</Button>
                )}
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <TableContainer
              thContent={thLabels.map((value, i) => (<TableCell key={i} children={value} />))}
              spanTd={thLabels.length}
              page={page}
              totalPages={records?.total_pages}
              callBack={setPage}
              isContent={records?.data?.length}
            >
              {records?.data?.map((item, i) => {
                return (
                  <Fragment key={i} children={renderRow(item, i)} />
                )
              })}
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default Attendence;