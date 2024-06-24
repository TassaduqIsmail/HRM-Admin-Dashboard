import React, { useRef, useState } from "react";
import { Box, IconButton, TableCell, TableRow, TextField, Tooltip } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { PatternFormat } from "react-number-format";
import moment from "moment";
import { useDispatch } from "react-redux";
import { handleLoader, setToast } from "../../store/reducer";
import apiManager from "../../services/api-manager";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers";

const AttandenceTable = ({ date, userData, removeRow }) => {

  const dispatch = useDispatch();
  const editableFieldValue = useRef();
  const showMessage = (type, msg) => dispatch(setToast({ type, message: msg }));
  const [formData, setFormData] = useState({
    checkIn: moment(`${date} 09:00`),
    checkOut: moment(`${date} 10:00`),
    totalWorkHour: "00:00:00",
    date: moment(date),
  });
  const [breakDuration, setBreakDuration] = useState("00:00:00");

  const handleInputChange = (newValue) => {
    setFormData((prev) => ({ ...prev, totalWorkHour: newValue }));
  };

  const calculateAttendanceTime = () => {
    const formatTime = (time) => moment(time, "YYYY MM DD HH:mm:ss").unix();
    const formatDate = (time) => moment(time).format("YYYY MM DD");
    const formatInToTime = (time) => moment(time).format("HH:mm:ss");
    const getUnixTimestamp = (time) => moment(time).unix();
    const { checkIn, checkOut, date } = formData;
    const formattedCheckInUnix = formatTime(`${formatDate(date)} ${formatInToTime(checkIn)}`);
    const checkOutUnix = getUnixTimestamp(checkOut);
    const totalDuration = checkOutUnix - formattedCheckInUnix;
    const duration = moment.duration(totalDuration, 'seconds');

    const formattedTotalDuration = () => {
      const hours = Math.abs(Math.floor(duration.asHours())).toString().padStart(2, '0');
      const minutes = duration.minutes().toString().padStart(2, '0');
      const seconds = duration.seconds().toString().padStart(2, '0');
      if (totalDuration > 0) {
        return `${hours}:${minutes}:${seconds}`;
      } else {
        return `00:00:00`;
      }
    };
    return {
      totalDuration: formattedTotalDuration(),
      breakDuration: moment.duration(breakDuration).asSeconds(),
      dateAndCheckIn: formattedCheckInUnix,
      dateAndCheckOut: checkOutUnix,
      unixTotalDuration: totalDuration,
    };
  };

  const handleMarkAttendance = async () => {
    const attendanceTime = calculateAttendanceTime();
    try {
      const { dateAndCheckIn, dateAndCheckOut, unixTotalDuration, breakDuration } = attendanceTime;
      if (unixTotalDuration < 0) {
        showMessage("error", "The Check-Out time should be later than the Check-In time.");
        return;
      }
      dispatch(handleLoader(true));
      const response = await apiManager({
        method: "post",
        path: `admin/attendance/${userData[0]?._id}`,
        params: {
          checkIn: moment.unix(dateAndCheckIn).format("YYYY-MM-DD HH:mm:ss"),
          checkOut: moment.unix(dateAndCheckOut).format("YYYY-MM-DD HH:mm:ss"),
          // total_duration: unixTotalDuration,
          break_duration: breakDuration,
        },
      });
      showMessage("success", response?.data?.message);
      removeRow();
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

  const CheckInDate = calculateAttendanceTime()?.dateAndCheckIn;
  const checkOutDate = calculateAttendanceTime()?.dateAndCheckOut;

  const MyDateTimePicker = ({ label, value, onChange, type = "time" }) => {
    return (
      <>
        {type === "time" ? (
          <Box sx={{ minWidth: "140px !important" }}>
            <TimePicker
              views={["hours", "minutes"]}
              value={value}
              onChange={onChange}
              ampm={false}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                },
              }}
            />
          </Box>
        ) : (
          <Box sx={{ minWidth: "155px !important" }}>
            <DatePicker
              value={value}
              onChange={onChange}
              maxDate={moment.unix(checkOutDate)}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                },
              }}
            />
          </Box>
        )}
      </>
    );
  };

  // Dynamic Hour PatternFormat for flexible hour digit display.
  const totalDuration = calculateAttendanceTime().totalDuration;
  const hourDigits = totalDuration.split(':')[0].length;
  const hourFormat = '#'.repeat(hourDigits);

  return (
    <TableRow>
      <TableCell>
        <MyDateTimePicker
          type="date"
          value={formData.date}
          onChange={(newValue) => setFormData((prev) => ({ ...prev, date: newValue }))}
        />
      </TableCell>
      <TableCell>
        <MyDateTimePicker
          value={formData.checkIn}
          onChange={(newValue) => setFormData((prev) => ({ ...prev, checkIn: newValue }))}
        />
      </TableCell>
      <TableCell>
        <Box sx={{ minWidth: "230px !important" }}>
          <DateTimePicker
            minDate={moment.unix(CheckInDate)}
            value={formData.checkOut}
            ampm={false}
            onChange={(newValue) => setFormData((prev) => ({ ...prev, checkOut: newValue }))}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
              }
            }}
          />
        </Box>
      </TableCell>
      <TableCell>
        <PatternFormat
          getInputRef={editableFieldValue}
          value={calculateAttendanceTime().totalDuration}
          name="totalWorkHour"
          format={`${hourFormat}:##:##`}
          disabled={true}
          mask="-"
          customInput={TextField}
          size="small"
          fullWidth
          onValueChange={(name, val, event) => handleInputChange(name, val, event)}
        />
      </TableCell>
      <TableCell>
        <PatternFormat
          getInputRef={editableFieldValue}
          value={breakDuration}
          format="##:##:##"
          mask="-"
          customInput={TextField}
          size="small"
          onValueChange={(val, event) => setBreakDuration(event?.event?.target?.value)}
        />
      </TableCell>
      <TableCell>
        <Tooltip title={`Mark Attendance`} placement="top">
          <IconButton onClick={handleMarkAttendance}>
            <SaveIcon sx={{ color: "primary.main" }} />
          </IconButton>
        </Tooltip>
        <Tooltip title={`Delete`} placement="top">
          <IconButton onClick={removeRow}>
            <CloseIcon sx={{ color: "primary.main" }} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
};

export default AttandenceTable;