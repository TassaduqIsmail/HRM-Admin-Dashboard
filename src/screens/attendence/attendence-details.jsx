import React, { useEffect, useState } from "react";
import { Typography, Container, Grid, Card, CardContent, Box, Divider, IconButton, Stack, Tooltip, Button } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleLoader, setToast } from "../../store/reducer";
import apiManager from "../../services/api-manager";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from '@mui/icons-material/Delete';
import { Fab } from '@mui/material';
import moment from "moment";
import { ModalWrapper } from "../../components";
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';

const AttendenceDetail = () => {

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const userName = searchParams.get("user-name");
  const navigate = useNavigate();
  const { AttendenceId } = useParams();
  const dispatch = useDispatch();
  const [attendanceData, setAttendanceData] = useState(null);
  const showMessage = (type, msg) => dispatch(setToast({ type, message: msg }));
  const [openModal, setOpenModal] = useState({ isVisible: false, info: "", });
  const [checkTime, setCheckTime] = useState(null);

  // Function to fetch the attendance data
  const getSingleAttendance = async () => {
    try {
      dispatch(handleLoader(true));
      const { data } = await apiManager({ method: 'get', path: `attendance/get-attendance/${AttendenceId}` });
      setAttendanceData(data?.response?.data);
    } catch (error) {
      showMessage("error", error?.response?.data?.message);
    } finally {
      dispatch(handleLoader(false));
    }
  };

  // Fetch attendance data on component mount
  useEffect(() => {
    getSingleAttendance();
  }, []);

  // handle Delete Break.
  const handleDeleteBreak = async (breakId) => {
    dispatch(handleLoader(true));
    try {
      const { data } = await apiManager({ method: "delete", path: `admin/delete-break/attendance/${AttendenceId}/break/${breakId}` });
      showMessage("success", data?.message);
      getSingleAttendance();
    } catch (error) {
      showMessage("error", error?.response?.data?.message);
    } finally {
      dispatch(handleLoader(false));
    }
  };

  const handleTimeChange = (newTime) => {
    setCheckTime(newTime)
  };

  // calculate Difference between currentCheck and updatedCheck.
  const calculateDifference = () => {
    let currentCheck = openModal.info;
    return moment(checkTime, 'h:mmA').diff(moment.unix(currentCheck), "seconds");
  };

  // handle Update CheckIn and CheckOut.
  const handleUpdateCheck = async (e) => {
    e.preventDefault();
    dispatch(handleLoader(true));
    const difference = calculateDifference();
    try {
      const { data } = await apiManager({
        method: "put",
        path: `admin/update-attendance/${AttendenceId}`,
        params: { action: openModal.info !== attendanceData?.checkIn ? "checkOut" : "checkIn", time: difference }
      });
      setOpenModal({ isVisible: false })
      getSingleAttendance();
      showMessage("success", data?.message);
      setCheckTime('');
    } catch (error) {
      showMessage("error", error?.response?.data?.message);
    } finally {
      dispatch(handleLoader(false));
    }
  };

  return (
    <>
      <Container maxWidth="lg" py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Fab size="small" color="primary" aria-label="back" sx={{ mt: 5, position: "absolute" }} onClick={() => navigate(-1)}><ArrowBackIcon /></Fab>
            <Typography variant="h6" align="center" gutterBottom mt={4}>Attendance Detail</Typography>
            <Typography variant="body1" align="center" color="textSecondary" gutterBottom>Employee: {attendanceData?.user.name}</Typography>
            <Typography variant="body1" align="center" color="textSecondary">{attendanceData?.createdAt ? moment.unix(attendanceData?.checkIn).format('MMM, DD YYYY') : '-'}</Typography>
          </Grid>

          <Grid item xs={12} container spacing={3}>
            {/* Card for Work Details */}
            <Grid item xs={12} md={6} lg={6}>
              <Card variant="outlined" sx={{ flex: 1, height: "100%" }}>
                <CardContent sx={{ gap: 5 }}>
                  <Typography gutterBottom>Work Details:</Typography>
                  <Stack sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 2, alignItems: "center" }}>
                    <Typography variant="body1" color="textSecondary">Check In: {attendanceData?.checkIn ? moment.unix(attendanceData?.checkIn).format('HH:mm:ss') : '-'}</Typography>
                  </Stack>
                  <Stack sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", gap: 2, alignItems: "center" }}>
                    <Typography color="textSecondary" gutterBottom>Check Out: {attendanceData?.checkOut ? moment.unix(attendanceData?.checkOut).format('HH:mm:ss') : '-'}</Typography>
                  </Stack>
                  <Divider sx={{ my: 2 }} />
                  <Typography color="textSecondary">Total Work Hour: {attendanceData?.total_duration ? attendanceData?.total_duration : '-'}</Typography>
                </CardContent>
              </Card>
            </Grid>
            {/* Card for Notes */}
            <Grid item container xs={12} md={6} lg={6} spacing={3}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography gutterBottom>Notes:</Typography>
                    <Typography variant="body1" color="textSecondary">
                      {attendanceData?.note ? attendanceData?.note : 'No notes available.'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography gutterBottom>Approval:</Typography>
                    <Typography variant="body1" color="textSecondary">
                      {attendanceData?.checkout_approved_by?.name ? attendanceData?.checkout_approved_by?.name : '------'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* Section for Break Details in Card*/}
          <Grid item xs={12}>
            <Typography gutterBottom>Break Details:</Typography>
            {!attendanceData?.is_admin_update ? (
              attendanceData?.breaks?.length ? (
                <Grid container spacing={2}>
                  {attendanceData?.breaks?.map((item, i) => {
                    return (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                        <Card variant="outlined" sx={{ width: '100%' }}>
                          <CardContent sx={{ position: "relative" }} >
                            {userName &&
                              <IconButton sx={{ position: "absolute", top: 1, right: 1 }} onClick={() => { handleDeleteBreak(item?._id) }}>
                                <DeleteIcon sx={{ color: "primary.main" }} />
                              </IconButton>
                            }
                            <Typography color="textSecondary" sx={{ pt: 2 }}>Break In: {item?.breakIn ? moment.unix(item?.breakIn).format('HH:mm:ss') : 'N/A'}</Typography>
                            <Typography color="textSecondary">Break Out: {item?.breakOut ? moment.unix(item.breakOut).format('HH:mm:ss') : 'N/A'}</Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography color="textSecondary">Total Break Duration: {item?.breakOut && item?.breakIn ? moment.unix(item?.breakOut - item?.breakIn).format('mm:ss') : 'Duration: N/A'}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  })}
                </Grid>
              ) : (
                <Typography variant="caption">No Break Records Found</Typography>
              )
            ) : (
              (attendanceData?.break_duration !== "00:00:00") ?
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <Card variant="outlined" sx={{ width: '100%' }}>
                    <CardContent sx={{ position: "relative" }} >
                      <Typography variant="body2">Updated by admin</Typography>

                      <Divider sx={{ my: 2 }} />
                      <Typography color="textSecondary">Total Break Duration: {attendanceData?.break_duration}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                :
                <Typography variant="caption">No Break Records Found</Typography>
            )}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default AttendenceDetail;