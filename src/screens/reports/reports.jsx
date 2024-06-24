import React, { Fragment, useEffect, useState } from "react";
import { Container, Fab, Grid, Stack, TableCell, TableRow, Tooltip, Typography, Autocomplete, TextField, Button, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useDispatch } from "react-redux";
import moment from "moment";
import usePageTitle from "../../hooks/use-page-title";
import apiManager from "../../services/api-manager";
import { handleLoader, setToast } from "../../store/reducer";
import { InputField, SelectBox, TableContainer } from "../../components";
import InfoIcon from "@mui/icons-material/Info";
import { Link, useNavigate } from "react-router-dom";
import Utils from "../../utils";

const Reports = () => {

    usePageTitle(`Reports`);
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const showMessage = (type, msg) => { dispatch(setToast({ type: type, message: msg })) };
    const [records, setRecords] = useState([]);
    const [reportType, setReportType] = useState(null);

    // state for employees.
    const allEmployeeSelector = { _id: -1, name: "All Employees", email: "" };
    const [selectedUser, setSelectedUser] = useState(allEmployeeSelector);
    const [employees, setEmployees] = useState([allEmployeeSelector]);
    const [employeeLoading, setEmployeeLoading] = useState(false);
    const [employeeListOpen, setEmployeeListOpen] = useState(false);

    // state for companies.
    const allCompanySelector = { _id: -1, name: "All Companies", email: "" };
    const [selectedCompany, setSelectedCompany] = useState(allEmployeeSelector);
    const [companies, setCompanies] = useState([allEmployeeSelector]);
    const [companyLoading, setCompanyLoading] = useState(false);
    const [companyListOpen, setCompanyListOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState(moment().format("yyyy-MM-DD"));
    const [endDate, setEndDate] = useState(moment().format("yyyy-MM-DD"));
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(25);
    const thLabels = ["No", "Date", "Employee", "Company", "Check In", "Check Out", "Breaks", "Actions"];

    // Function to fetch employees.
    const getEmployees = async () => {
        try {
            setEmployeeLoading(true);
            let { data } = await apiManager({ method: "get", path: `admin/users?page=${1}&per_page=${9999999}` });
            // let { data } = await apiManager({ method: "get", path: `admin/users?page=${page}&per_page=${9999999}` });
            setEmployees([allEmployeeSelector, ...data?.response?.data?.detail]);
            setEmployeeLoading(false);
        } catch (error) {
            showMessage("error", error?.message);
            setEmployeeLoading(false);
        }
    };

    // Function to fetch Companies.
    const getCompanies = async () => {
        try {
            setCompanyLoading(true);
            let { data } = await apiManager({ method: "get", path: `company/get-companies?page=${1}&per_page=${9999999}` });
            // let { data } = await apiManager({ method: "get", path: `company/get-companies?page=${page}&per_page=${9999999}` });
            setCompanies([allCompanySelector, ...data?.response?.data]);
            setCompanyLoading(false);
        } catch (error) {
            showMessage("error", error?.message);
            setCompanyLoading(false);
        }
    };

    // Function to fetch attendance data.
    const getReportsData = async () => {
        try {
            dispatch(handleLoader(true));
            let query = "";
            if (selectedUser.length) {
                const filteredUsers = selectedUser.filter((employee) => employee._id !== -1);
                if (filteredUsers.length > 0) {
                    filteredUsers.map((employee, index) => query += `employee_id[${index}]=${employee._id}&`);
                };
            };
            if (!!selectedCompany && selectedCompany?._id != -1) { query += `company_id=${selectedCompany?._id}&` }
            if (startDate || endDate) { query += `start_date=${startDate} 00:00:00&end_date=${endDate} 23:59:59&page=${page}&per_page=${perPage}&` }
            if (reportType) { query += `report_type=${reportType}` }
            let { data } = await apiManager({ method: "get", path: `admin/attendance-reports?${query}` });
            setRecords(data?.response);
            showMessage("success", data?.message);
        } catch (error) {
            showMessage("error", error?.response?.data?.message);
        } finally {
            dispatch(handleLoader(false));
        }
    };

    const downloadCSVFile = async () => {
        try {
            setIsLoading(true);
            let query = "";
            if (selectedUser.length) {
                const filteredUsers = selectedUser.filter((employee) => employee._id !== -1);
                if (filteredUsers.length > 0) {
                    filteredUsers.map((employee, index) => query += `employee_id[${index}]=${employee._id}&`);
                };
            };
            if (!!selectedCompany && selectedCompany?._id != -1) { query += `company_id=${selectedCompany?._id}&` }
            if (startDate || endDate) { query += `start_date=${startDate} 00:00:00&end_date=${endDate} 23:59:59&page=${page}&per_page=${perPage}&` }
            if (reportType) { query += `report_type=${reportType}&csv_file=${true} ` }

            let response = await apiManager({ method: "get", path: `admin/download-reports?${query}`, header: { responseType: "blob" }, });

            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]));
            // Create a link element to trigger the download
            const link = document.createElement('a');
            link.href = url;
            link.download = `${reportType}-report.csv`;
            // Append the link to the document and trigger the download
            document.body.appendChild(link);
            link.click();
            // Remove the link from the document
            document.body.removeChild(link);
            showMessage("success", "CSV file downloaded");
            setIsLoading(false);
        } catch (error) {
            showMessage("error", "Something went wrong on downloading csv file.");
        } finally {
            setIsLoading(false);
        }
    }

    // Use useEffect to fetch data when dependencies change.
    useEffect(() => {
        getReportsData();
        getEmployees();
        getCompanies();
    }, [page, perPage, selectedUser, selectedCompany, startDate, endDate, reportType]);

    useEffect(() => {
        if (!!reportType) {
            downloadCSVFile();
            setReportType(null)
        }
    }, [reportType]);

    useEffect(() => {
        setPage(1)
    }, [selectedUser, selectedCompany]);

    const formatTime = (value) => {
        let hour = Math.floor(moment.duration(value, "seconds").asHours());
        let min = Math.floor(moment.duration(value, "seconds").minutes());
        let sec = Math.floor(moment.duration(value, "seconds").seconds());

        return `${hour > 9 ? hour : `0${hour}`}:${min > 9 ? min : `0${min}`}:${sec > 9 ? sec : `0${sec}`
            }`;
    };

    const formatCheckout = (checkIn, checkOut) => {
        if (moment.unix(checkIn).format('DD') != moment.unix(checkOut).format('DD')) {
            return <>
                {moment.unix(checkOut).format("HH:mm:ss")}
                <br />
                {moment.unix(checkOut).format("DD, MMM YYYY")}
            </>
        }
        return moment.unix(checkOut).format("HH:mm:ss")
    }

    // Function to render a table row.
    const renderRow = (item, index) => {
        return (
            <TableRow key={index}>
                <TableCell>{Utils.getRowNumber(records?.current_page, records?.per_page, index)}</TableCell>
                <TableCell>{item?.checkIn ? moment.unix(item.checkIn).format("DD, MMM YYYY") : "-"}</TableCell>
                <TableCell>{item?.employee_detail?.name ? item?.employee_detail?.name : "-"}</TableCell>
                <TableCell>{item?.company_detail?.name ? item?.company_detail?.name : "-"}</TableCell>
                <TableCell>{item?.checkIn ? moment.unix(item.checkIn).format("HH:mm:ss") : "-"}</TableCell>
                <TableCell>{item?.checkOut ? formatCheckout(item.checkIn, item?.checkOut) : "-"}</TableCell>
                <TableCell>
                    {!item?.is_admin_update ? (
                        item?.breaks?.length ?
                            item?.breaks?.map((item, i) => <Fragment key={i}>
                                {`(${item?.breakIn ? moment.unix(item.breakIn).format('HH:mm:ss') : 'N/A'}) - (${item?.breakOut ? moment.unix(item.breakOut).format('HH:mm:ss') : 'N/A'})`}<br />
                            </Fragment>) : "-"
                    ) : (
                        item?.break_duration ?
                            <Fragment>
                                Updated by Admin
                                <br />
                                {item?.break_duration ? moment.utc(item?.break_duration * 1000).format('HH:mm:ss') : "---"}
                            </Fragment> :
                            "-"
                    )}
                </TableCell>
                <TableCell>
                    <Tooltip title="Attendance Details" placement="top">
                        <IconButton component={Link} to={`/attendance/get-attendances/detail/${item._id}`}>
                            <InfoIcon sx={{ color: "primary.main" }} />
                        </IconButton>
                    </Tooltip>
                </TableCell>
            </TableRow>
        );
    };

    return (
        <>
            <Container maxWidth="xxl" py={3}>
                <Grid container spacing={2} mt={2}>
                    <Grid item xs={12}>
                        <Stack direction="row" alignItems="center" gap={2}>
                            <Fab size="small" color="primary" aria-label="back" sx={{ my: 1 }} onClick={() => navigate(-1)}>
                                <ArrowBackIcon />
                            </Fab>
                            <Typography variant="h6" children={`Reports`} />
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            {/* Autocomplete component for company selection */}
                            <Grid item lg={3} md={6} xs={12}>
                                <Autocomplete
                                    disablePortal
                                    fullWidth
                                    isOptionEqualToValue={(company, value) => company._id === value._id}
                                    getOptionLabel={(company) => company.name}
                                    // options={companies}
                                    options={Utils.sortByName(companies)}
                                    loading={companyLoading}
                                    open={companyListOpen}
                                    onOpen={() => setCompanyListOpen(true)}
                                    onClose={() => setCompanyListOpen(false)}
                                    onChange={(event, company) => setSelectedCompany(!company ? allCompanySelector : company)}
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
                            {/* Autocomplete component for employee selection */}
                            <Grid item lg={3} md={6} xs={12}>
                                <Autocomplete
                                    multiple
                                    limitTags={1}
                                    ChipProps={{
                                        variant: "filled",
                                        color: "primary",
                                        size: "small"
                                    }}
                                    disablePortal
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
                            {/* Input field for selecting a start date */}
                            <Grid item lg={2} md={6} xs={12}>
                                <InputField
                                    size="small"
                                    fullWidth
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Grid>
                            {/* Input field for selecting a end date */}
                            <Grid item lg={2} md={6} xs={12}>
                                <InputField
                                    size="small"
                                    fullWidth
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Grid>
                            <Grid item lg={2} md={12} xs={12}>
                                <SelectBox
                                    size="small"
                                    label={"Download Report"}
                                    fullWidth
                                    name="reportType"
                                    initValue={reportType}
                                    value={reportType}
                                    handleChange={(e) => setReportType(e.target.value)}
                                    items={[
                                        { label: "Attendance", value: "attendance" },
                                        { label: "Payroll", value: "payroll" },
                                        { label: "Detail", value: "detail" },
                                    ]}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        {/* TableContainer component for displaying the attendance records */}
                        <TableContainer
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

export default Reports;