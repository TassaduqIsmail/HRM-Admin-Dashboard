import React, { Fragment, useEffect, useState } from "react";
import { Autocomplete, Container, Grid, TableCell, TableRow, TextField, useMediaQuery } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import { InputField, OverViewCard, TableContainer } from "../../components";
import usePageTitle from "../../hooks/use-page-title";
import apiManager from "../../services/api-manager";
import { useDispatch } from "react-redux";
import { handleLoader, setToast } from "../../store/reducer";
import { Link } from "react-router-dom";
import moment from "moment";
import Utils from "../../utils";

function Home() {

  usePageTitle("Home");
  const dispatch = useDispatch();
  const [records, setRecords] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const showMessage = (type, msg) => dispatch(setToast({ type, message: msg }));
  // state for employees.
  const allEmployeeSelector = { _id: -1, name: "All Employees", email: "" };
  const [selectedUser, setSelectedUser] = useState(allEmployeeSelector);
  const [employees, setEmployees] = useState([allEmployeeSelector]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeListOpen, setEmployeeListOpen] = useState(false);
  // state for companies.
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState();
  const [companyLoading, setCompanyLoading] = useState(false);
  const [companyListOpen, setCompanyListOpen] = useState(false);

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const thLabels = ["Employee", "Check In"];
  const dataIcons = [<GroupsIcon />, <AccessTimeFilledIcon />, <AccessTimeFilledIcon />, <AccessTimeFilledIcon />];

  // Function to calculate initial start and end dates
  const calculateInitialDates = () => {
    const currentDate = moment().format("YYYY-MM-DD");
    const initialStartDate = moment().subtract(1, 'month').startOf('month').date(16).format('YYYY-MM-DD');
    const initialEndDate = moment().startOf('month').date(15).format('YYYY-MM-DD');
    const currentDateObj = new Date(currentDate);
    const endDateObj = new Date(initialEndDate);
    if (currentDateObj > endDateObj) {
      return {
        startDate: moment().startOf('month').date(16).format('YYYY-MM-DD'),
        endDate: moment().add(1, 'month').date(15).format('YYYY-MM-DD'),
      };
    }
    return { startDate: initialStartDate, endDate: initialEndDate };
  };

  const [dates, setDates] = useState(calculateInitialDates);

  useEffect(() => {
    setDates(calculateInitialDates());
  }, []);

  // Fetch attendance data from the API
  const getAttendanceData = async () => {
    try {
      dispatch(handleLoader(true));
      let query = "";
      query += `start_date=${moment().format("YYYY-MM-DD 00:00:00")}&end_date=${moment().format("YYYY-MM-DD 23:59:59")}&page=${page}&per_page=999999`;
      if (!!selectedCompany) { query += `&company_id=${selectedCompany?._id}` }
      let { data } = await apiManager({ method: "get", path: `attendance/get-attendances?${query}` });
      setAttendanceRecords(data?.response);
      showMessage("success", data?.message);
    } catch (error) {
      showMessage("error", error?.response?.data?.message);
    } finally {
      dispatch(handleLoader(false));
    };
  };

  // Fetch the list of employees from the API
  const getEmployees = async () => {
    try {
      setEmployeeLoading(true);
      const { data } = await apiManager({ method: "get", path: `admin/users?page=${page}&per_page=${9999999}` });
      setEmployees([allEmployeeSelector, ...(data?.response?.data?.detail || [])]);
    } catch (error) {
      showMessage("error", error?.message);
    } finally {
      setEmployeeLoading(false);
    }
  };

  // Function to fetch Companies.
  const getCompanies = async () => {
    try {
      setCompanyLoading(true);
      const { data } = await apiManager({ method: "get", path: `company/get-companies?page=${page}&per_page=${9999999}` });
      setCompanies(data?.response?.data || []);
    } catch (error) {
      showMessage("error", error?.message);
    } finally {
      setCompanyLoading(false);
    }
  };

  const getData = async () => {
    const startDateObj = new Date(dates.startDate);
    const endDateObj = new Date(dates.endDate);
    if (startDateObj > endDateObj) {
      showMessage("error", "End date cannot be earlier than start date");
      return;
    }
    let query = "";
    if (dates.startDate && dates.endDate) { query = `start_date=${dates.startDate}&end_date=${dates.endDate}&` }
    if (!!selectedCompany) { query += `company_id=${selectedCompany?._id}&` }
    if (selectedUser.length) {
      // Filter out selectedUser with _id === -1
      const filteredUsers = selectedUser.filter((employee) => employee._id !== -1);
      if (filteredUsers.length > 0) {
        filteredUsers.map((employee, index) => query += `user_id[${index}]=${employee._id}&`);
      }
    };
    try {
      setIsLoading(true);
      let { data } = await apiManager({ path: `admin/overview?${query}` });
      setRecords(data?.response?.data);
    } catch (error) {
      showMessage("error", "Unknown error occurred.");
    } finally {
      setTimeout(() => { setIsLoading(false) }, 1000);
    }
  };

  useEffect(() => {
    getData();
    getEmployees();
    getCompanies();
    getAttendanceData();
  }, [page, perPage, selectedUser, selectedCompany, dates]);

  // Function to render a table row.
  const renderRow = (item, index) => {
    return (
      <TableRow key={index}>
        <TableCell>{item?.user?.name ? item?.user?.name : "-"}</TableCell>
        <TableCell>{item?.checkIn ? moment.unix(item.checkIn).format("HH:mm:ss") : "-"}</TableCell>
      </TableRow>
    );
  };

  return (
    <Container maxWidth="xxl" sx={{ py: 3, display: "flex", flexDirection: { sm: "column", xs: "column-reverse" } }}>
      <Grid container spacing={2} sx={{ mt: { sm: 0, xs: 1 } }}>
        <Grid container item xs={12} spacing={2}>
          <Grid item lg={4} sm={4} xs={12}>
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
              isOptionEqualToValue={(employee, value) => employee._id === value._id}
              getOptionLabel={(employee) => employee.name}
              options={Utils.sortByName(employees)}
              loading={employeeLoading}
              open={employeeListOpen}
              onOpen={() => setEmployeeListOpen(true)}
              onClose={() => setEmployeeListOpen(false)}
              onChange={(event, employee) => setSelectedUser((!employee || employee.some(emp => emp._id === -1)) ? allEmployeeSelector : employee)}
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
          <Grid item lg={4} sm={4} xs={12}>
            <InputField
              size="small"
              fullWidth
              label="Start Date"
              type="date"
              max={dates.endDate}
              value={dates.startDate}
              onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
            />
          </Grid>
          <Grid item lg={4} sm={4} xs={12}>
            <InputField
              size="small"
              fullWidth
              label="End Date"
              type="date"
              min={dates.startDate}
              value={dates.endDate}
              onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
            />
          </Grid>
        </Grid>
        {isLoading ? (
          Array(4).fill("_")?.map((each, i) => (
            <Grid key={i} item lg={4} sm={6} xs={12}>
              <OverViewCard key={i} isLoading={true} />
            </Grid>
          ))
        ) : (
          records?.map((each, i) => {
            return (
              <Grid item lg={4} sm={6} xs={12} key={i}>
                {each?.key === "Total_Employees" ? (
                  <Link to='/users' style={{ textDecoration: 'none' }}>
                    <OverViewCard title={each?.title} value={each?.total} icon={dataIcons[i]} key={i} />
                  </Link>
                ) : (
                  <OverViewCard key={i} title={each?.title} value={each?.total} icon={dataIcons[i]} />
                )}
              </Grid>
            )
          })
        )}
      </Grid>
      <Grid container spacing={2} sx={{ mt: { sm: 1, xs: 0 } }}>
        <Grid item xs={12}>
          <Autocomplete
            fullWidth
            isOptionEqualToValue={(company, value) => company._id === value._id}
            getOptionLabel={(company) => company.name}
            options={Utils.sortByName(companies)}
            loading={companyLoading}
            open={companyListOpen}
            onOpen={() => setCompanyListOpen(true)}
            onClose={() => setCompanyListOpen(false)}
            onChange={(event, company) => setSelectedCompany(company)}
            renderInput={(params) => (
              <TextField
                {...params}
                onChange={(e) => getCompanies(e.target.value)}
                fullWidth
                type="Outlined"
                size="small"
                label="Company"
                value={selectedCompany?.name}
              />
            )}
          />
        </Grid>
        <Grid item xs={12}>
          <TableContainer
            thContent={thLabels.map((value, i) => (<TableCell key={i} children={value} />))}
            spanTd={thLabels.length}
            page={page}
            totalPages={attendanceRecords?.total_pages}
            callBack={setPage}
            isContent={attendanceRecords?.data?.length}
          >
            {attendanceRecords?.data?.map((item, i) => {
              return <Fragment key={i} children={renderRow(item, i)} />;
            })}
          </TableContainer>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;