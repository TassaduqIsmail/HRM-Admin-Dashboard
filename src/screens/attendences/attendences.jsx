import React, { Fragment, useEffect, useState, useRef } from "react";
import { Container, Fab, Grid, IconButton, Stack, TableCell, TableRow, Tooltip, Typography, Autocomplete, TextField, Button, Box } from "@mui/material";
import { TimePicker, DatePicker, DateTimePicker } from "@mui/x-date-pickers";
import { PatternFormat } from "react-number-format";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import moment from "moment";
// LOCAL-IMPORTS.
import { handleLoader, setToast } from "../../store/reducer";
import { TableContainer } from "../../components";
import usePageTitle from "../../hooks/use-page-title";
import apiManager from "../../services/api-manager";
import AttandenceTable from "./attandenceTable";
import Utils from "../../utils";
// ICONS.
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import InfoIcon from "@mui/icons-material/Info";

function Attendences() {

  usePageTitle(`Attendance`);
  const dispatch = useDispatch();
  const showMessage = (type, msg) => { dispatch(setToast({ type: type, message: msg })); };
  const editableFieldValue = useRef();
  const [records, setRecords] = useState([]);
  const allEmployeeSelector = { _id: -1, name: "All Employees", email: "" };
  const [selectedUser, setSelectedUser] = useState(allEmployeeSelector);
  const [employees, setEmployees] = useState([allEmployeeSelector]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeListOpen, setEmployeeListOpen] = useState(false);
  const [markAttendanceEnable, setMarkAttendanceEnable] = useState(false);
  const [markAttendance, setMarkAttendance] = useState([]);
  const [edit, setEdit] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const thLabels = ["Date", "Employee", "Check In", "Check Out", "Total Office Hour", "Total Break Time", "Actions"];
  const [date, setDate] = useState({
    start_date: moment().format("yyyy-MM-DD"),
    end_date: moment().endOf("month").format("yyyy-MM-DD"),
  });
  const [editedAttendance, setEditedAttendance] = useState({
    userId: null,
    totalWorkHour: "00:00:00",
    checkIn: moment(`${date.start_date} 09:00`),
    checkOut: moment(`${date.start_date} 10:00`),
  });
  const [breakDuration, setBreakDuration] = useState("00:00:00");
  const [totalWorkHour, setTotalWorkHour] = useState("00:00:00");
  // Dynamic Hour PatternFormat for flexible hour digit display.
  const totalDuration = totalWorkHour;
  const hourDigits = totalDuration.split(':')[0].length;
  const hourFormat = '#'.repeat(hourDigits);

  // Fetch the list of employees from the API
  const getEmployees = async () => {
    try {
      setEmployeeLoading(true);
      let { data } = await apiManager({ method: "get", path: `admin/users?page=${page}&per_page=${9999999}` });
      setEmployees([allEmployeeSelector, ...data?.response?.data?.detail]);
      setEmployeeLoading(false);
    } catch (error) {
      showMessage("error", error?.message);
      setEmployeeLoading(false);
    }
  };

  // Fetch attendance data from the API
  const getAttendanceData = async () => {
    try {
      dispatch(handleLoader(true));
      let query = "";
      if (date.start_date || date.end_date) {
        query += `start_date=${date.start_date} 00:00:00&end_date=${date.end_date} 23:59:59&page=${page}&per_page=${perPage}&`;
      }
      if (selectedUser.length) {
        // Filter out selectedUser with _id === -1
        const filteredUsers = selectedUser.filter((employee) => employee._id !== -1);
        if (filteredUsers.length > 0) {
          filteredUsers.map((employee, index) => query += `user_id[${index}]=${employee._id}&`);
        };
      };
      let { data } = await apiManager({ method: "get", path: `attendance/get-attendances?${query}` });
      setRecords(data?.response);
      showMessage("success", data?.message);
    } catch (error) {
      showMessage("error", error?.response?.data?.message);
    } finally {
      dispatch(handleLoader(false));
    };
  };

  // Fetch employees and attendance data when the component mounts or when dependent state variables change
  useEffect(() => {
    getAttendanceData();
    getEmployees();
  }, [page, perPage, selectedUser, date, markAttendanceEnable]);

  // Update 'totalWorkHour' when 'editedAttendance' changes.
  useEffect(() => {
    if (editedAttendance.checkIn || editedAttendance.checkOut) {
      const value = calculateAttandenceTime(editedAttendance?.checkIn, editedAttendance?.checkOut)?.total_duration
      setTotalWorkHour(value)
    }
  }, [editedAttendance.checkIn, editedAttendance.checkOut])

  // Enable or disable 'markAttendance' based on its length.
  useEffect(() => {
    if (markAttendance.length < 1) {
      setMarkAttendanceEnable(false);
    }
  }, [markAttendance]);

  // Handle editing of attendance data
  const handleEditAttendance = (item) => {
    item.isEdit = true;
    setEditedAttendance({
      userId: item?.user?._id,
      totalWorkHour: item.total_duration || "00:00:00",
      checkIn: item?.checkIn || "09:00:00",
      checkOut: item?.checkOut || "10:00:00",
    });
    setBreakDuration(item?.break_duration || "00:00:00");
    setEdit(true);
  };

  // Save edited attendance data
  const handleSaveAttendance = async (item) => {
    const { userId } = editedAttendance;
    const attendanceTime = calculateAttandenceTime(editedAttendance.checkIn, editedAttendance.checkOut);
    const { checkIn, checkOut } = attendanceTime;
    const duration = moment.duration(totalWorkHour).asSeconds();
    if (!userId || !checkIn || !checkOut || !breakDuration) {
      showMessage("error", "Please provide valid data.");
      return;
    }
    if (duration === 0) {
      showMessage("error", "The Check-Out time should be later than the Check-In time.");
      return;
    }
    if (checkIn > checkOut) {
      const formatTime = (time) => moment(time, "YYYY-MM-DD HH:mm:ss").unix();
      const formatInToTime = (time) => moment.unix(time).format("HH:mm:ss");
      const newDate = moment(date.start_date).add(1, 'days').format("YYYY-MM-DD");
      const newDateAndCheckOut = formatTime(`${newDate} ${formatInToTime(checkOut)}`);
      dispatch(handleLoader(true));
      // Modify the params object to include checkout
      try {
        const { data } = await apiManager({
          method: "post",
          path: `admin/attendance/${userId}`,
          params: {
            checkIn: moment.unix(checkIn).format("YYYY-MM-DD HH:mm:ss"),
            checkOut: moment.unix(newDateAndCheckOut).format("YYYY-MM-DD HH:mm:ss"),
            total_duration: moment.duration(totalWorkHour).asSeconds(),
            break_duration: moment.duration(breakDuration).asSeconds(),
            attendance_id: item?._id,
          },
        });
        setEdit(false);
        getAttendanceData();
        showMessage("success", data?.message);
      } catch (error) {
        if (error?.response?.data?.status === 422) {
          const errorObj = error?.response?.data?.response?.error;
          if (errorObj) {
            const errorMessages = Object.values(errorObj).map((message) => `${message}`).join(' | ');
            showMessage("error", errorMessages || "Some error occurred");
          } else {
            showMessage("error", "Some error occurred");
          }
        } else {
          showMessage("error", error?.response?.data?.message || "Some error occurred.");
        }
      } finally {
        dispatch(handleLoader(false));
      }
      return;
    };
    dispatch(handleLoader(true));
    try {
      const { data } = await apiManager({
        method: "post",
        path: `admin/attendance/${userId}`,
        params: {
          checkIn: moment.unix(checkIn).format("YYYY-MM-DD HH:mm:ss"),
          checkOut: moment.unix(checkOut).format("YYYY-MM-DD HH:mm:ss"),
          // total_duration: moment.duration(totalWorkHour).asSeconds(),
          break_duration: moment.duration(breakDuration).asSeconds(),
          attendance_id: item?._id,
        },
      });
      setEdit(false);
      getAttendanceData();
      showMessage("success", data?.message);
    } catch (error) {
      if (error?.response?.data?.status === 422) {
        const errorObj = error?.response?.data?.response?.error;
        if (errorObj) {
          const errorMessages = Object.values(errorObj).map((message) => `${message}`).join(' | ');
          showMessage("error", errorMessages || "Some error occurred");
        } else {
          showMessage("error", "Some error occurred");
        }
      } else {
        showMessage("error", error?.response?.data?.message || "Some error occurred.");
      }
    } finally {
      dispatch(handleLoader(false));
    }
  };

  // Function to calculate attendance time based on check-in and check-out times.
  const calculateAttandenceTime = (checkIn, checkOut) => {
    const calculateDiff = checkOut - checkIn;
    const duration = moment.duration(calculateDiff, 'seconds');
    const formattedTotalDuration = () => {
      const hours = Math.abs(Math.floor(duration.asHours())).toString().padStart(2, '0');
      const minutes = duration.minutes().toString().padStart(2, '0');
      const seconds = duration.seconds().toString().padStart(2, '0');
      if (calculateDiff > 0) {
        return `${hours}:${minutes}:${seconds}`;
      } else {
        return `00:00:00`;
      }
    };
    const total_duration = formattedTotalDuration();
    return { checkIn, checkOut, total_duration };
  };

  // render DateTimePicker component.
  const renderTimePicker = (label, value, onChange) => {
    const dateAndTime = moment.unix(value);
    return (
      <TableCell>
        <Box sx={{ minWidth: "140px !important" }}>
          <TimePicker
            views={["hours", "minutes"]}
            value={dateAndTime}
            ampm={false}
            onChange={onChange}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
              },
            }}
          />
        </Box>
      </TableCell>
    );
  };

  // render DateTimePicker component.
  const renderDateTimePicker = (label, value, onChange) => {
    const dateAndTime = moment.unix(value);
    return (
      <TableCell>
        <Box sx={{ minWidth: "230px !important" }}>
          <DateTimePicker
            value={dateAndTime}
            ampm={false}
            onChange={onChange}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
              },
            }}
          />
        </Box>
      </TableCell>
    );
  };

  // Render a row of attendance data
  const renderRow = (item, index) => (
    <TableRow key={index}>
      <TableCell>{moment.unix(item.checkIn).format("DD, MMM YYYY")}</TableCell>
      {!markAttendanceEnable && <TableCell>{item?.user?.name ? item?.user?.name : "-"}</TableCell>}
      {!item.isEdit ? (
        <TableCell>{item?.checkIn ? moment.unix(item.checkIn).format("HH:mm:ss") : "-"}</TableCell>
      ) : (
        renderTimePicker("Check In", editedAttendance?.checkIn, (newValue) => setEditedAttendance((prev) => ({ ...prev, checkIn: newValue / 1000 })))
      )}
      {!item.isEdit ? (
        <TableCell>{item?.checkOut ? moment.unix(item?.checkOut).format("HH:mm:ss") : "-"}</TableCell>
      ) : (
        renderDateTimePicker("Check Out", editedAttendance?.checkOut, (newValue) => setEditedAttendance((prev) => ({ ...prev, checkOut: newValue / 1000 })))
      )}
      <TableCell>
        {!item.isEdit ? (
          item?.total_duration ? (item?.total_duration) : ("-")
        ) : (
          <PatternFormat
            getInputRef={editableFieldValue}
            value={totalWorkHour}
            name="totalWorkHour"
            format={`${hourFormat}:##:##`}
            disabled={true}
            mask="-"
            customInput={TextField}
            size="small"
            allowEmptyFormatting
            onValueChange={(val) => setTotalWorkHour(val.formattedValue)}
          />
        )}
      </TableCell>
      <TableCell>
        {!item.isEdit ? (
          item?.break_duration ? (item?.break_duration) : ("-")
        ) : (
          <PatternFormat
            getInputRef={editableFieldValue}
            value={breakDuration}
            name="breakDuration"
            format="##:##:##"
            mask="-"
            customInput={TextField}
            allowEmptyFormatting
            size="small"
            onValueChange={(val) => setBreakDuration(val.formattedValue)}
          />
        )}
      </TableCell>
      <TableCell>
        <Tooltip title={`${edit ? "Save" : "Edit"} Attendance`} placement="top">
          {item.isEdit ? (
            <>
              <IconButton onClick={() => handleSaveAttendance(item)}>
                <SaveIcon sx={{ color: "primary.main" }} />
              </IconButton>
              <IconButton
                onClick={() => {
                  setEdit(false)
                  item.isEdit = false;
                }}
              >
                <CloseIcon sx={{ color: "primary.main" }} />
              </IconButton>
            </>
          ) : (
            <>
              <Tooltip title="Edit Attendance" placement="top">
                <IconButton onClick={() => handleEditAttendance(item)}>
                  <ModeEditIcon sx={{ color: "primary.main" }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Attendance Details" placement="top">
                <IconButton component={Link} to={`/attendance/get-attendances/detail/${item._id}`}>
                  <InfoIcon sx={{ color: "primary.main" }} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Tooltip>
      </TableCell>
    </TableRow>
  );

  // handle remove row
  const handleRemoveRow = (id) => setMarkAttendance((prev) => prev.filter((each) => each._id !== id));

  // Render the attendance table
  const renderAttendanceTable = () => {
    const tableHeader = thLabels.map((value, i) => (<TableCell key={i} children={value} />));
    if (markAttendanceEnable) {
      return (
        <TableContainer
          thContent={thLabels.map((value, i) => {
            const employeeIndex = thLabels.indexOf("Employee");
            if (employeeIndex !== -1) {
              thLabels.splice(employeeIndex, 1);
            };
            return (<TableCell key={i} children={value} />);
          })}
          spanTd={thLabels.length - 1}
          isContent={1}
        >
          {markAttendance.map((eachItem) => (
            <AttandenceTable
              key={eachItem._id}
              date={date.start_date}
              userData={selectedUser}
              setMarkAttendanceEnable={setMarkAttendanceEnable}
              removeRow={() => handleRemoveRow(eachItem._id)}
              data={markAttendance}
            />
          ))}
        </TableContainer>
      );
    } else {
      return (
        <TableContainer
          thContent={tableHeader}
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
      );
    }
  };

  return (
    <>
      <Container maxWidth="xxl" py={3}>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12}>
            <Stack direction="row" alignItems="center" gap={2}>
              <Fab
                size="small"
                color="primary"
                aria-label="back"
                sx={{ my: 1 }}
                disabled={!markAttendanceEnable}
                onClick={() => {
                  setMarkAttendance([]);
                  setMarkAttendanceEnable(false);
                }}
              >
                <ArrowBackIcon />
              </Fab>
              <Typography variant="h6" children={`Attendance`} />
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item lg={6} md={6} xs={12}>
                <Autocomplete
                  multiple
                  limitTags={1}
                  disablePortal
                  ChipProps={{
                    variant: "filled",
                    color: "primary",
                    size: "small"
                  }}
                  fullWidth
                  disabled={markAttendanceEnable}
                  isOptionEqualToValue={(employee, value) => employee._id === value._id}
                  getOptionLabel={(employee) => employee.name}
                  options={Utils.sortByName(employees)}
                  loading={employeeLoading}
                  open={employeeListOpen}
                  onOpen={() => setEmployeeListOpen(true)}
                  onClose={() => setEmployeeListOpen(false)}
                  onChange={(event, employee) => {
                    setMarkAttendanceEnable(false);
                    setMarkAttendance([]);
                    setSelectedUser((!employee || employee.some(emp => emp._id === -1)) ? allEmployeeSelector : employee);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      onChange={(e) => getEmployees(e.target.value)}
                      fullWidth
                      type="Outlined"
                      size="small"
                      label="Employee"
                      value={selectedUser?.name}
                    />
                  )}
                />
              </Grid>
              <Grid item lg={2} md={3} xs={12}>
                <DatePicker
                  label="Start Date"
                  value={moment(date.start_date)}
                  onChange={(e) => {
                    setMarkAttendanceEnable(false);
                    setDate((prev) => ({ ...prev, start_date: moment(e).format(import.meta.env.VITE_APP_SERVER_FORMAT) }));
                  }}
                  disabled={markAttendanceEnable}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              <Grid item lg={2} md={3} xs={12}>
                <DatePicker
                  label="End Date"
                  value={moment(date.end_date)}
                  onChange={(e) => {
                    setMarkAttendanceEnable(false);
                    setDate((prev) => ({ ...prev, end_date: moment(e).format(import.meta.env.VITE_APP_SERVER_FORMAT) }));
                  }}
                  disabled={markAttendanceEnable}
                  minDate={moment(date.start_date)}
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </Grid>
              <Grid item lg={2} md={12} xs={12} sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  style={{ marginLeft: "auto" }}
                  sx={{ borderRadius: "25px", textTransform: "none", width: { lg: "100%", md: "fit-content", xs: "100%" }, height: "fit-content" }}
                  disabled={!selectedUser.length || selectedUser.length > 1 || selectedUser.some(emp => emp._id === -1)}
                  onClick={() => {
                    setMarkAttendanceEnable(true);
                    setMarkAttendance((prev) => [...prev, { _id: Math.random() }]);
                  }}
                >
                  Add record
                </Button>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            {renderAttendanceTable()}
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default Attendences;