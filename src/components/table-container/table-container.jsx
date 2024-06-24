import React from "react";
import {
  TableContainer as TContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  CircularProgress,
  Pagination,
  Box,
} from "@mui/material";

function TableContainer({
  tableStyle,
  containerStyle,
  spanTd,
  message,
  isLoading,
  isContent,
  children,
  thContent,
  page,
  totalPages,
  callBack,
  ...props
}) {
  return (
    <>

      <TContainer sx={containerStyle}>
        <Table
          sx={[
            tableStyle,
            {
              "& .MuiTableCell-root": {
                paddingTop: "10px",
                paddingBottom: "10px",
              },
            },
          ]}
          {...props}
        >
          <TableHead>
            <TableRow
              sx={{
                "& th": {
                  padding: { sm: "15px !important", xs: "10px !important" },
                  fontWeight: "bold",
                  bgcolor: "primary.main",
                  color: "#fff",
                },
              }}
            >
              {thContent}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={spanTd} align="center">
                  <CircularProgress size={22} />
                </TableCell>
              </TableRow>
            ) : isContent ? (
              children
            ) : (
              <TableRow>
                <TableCell colSpan={spanTd} align="center">
                  <Typography variant="caption1">
                    {!!message ? message : "No Records Found"}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TContainer>
      {(!!isContent && !!page) && (
        <UseMyPagination
          totalPages={totalPages}
          page={page}
          callBack={callBack}
          margin={{ mt: 2 }}
        />
      )}
    </>
  );
}
TableContainer.defaultProps = {
  tableStyle: {},
  spanTd: "1",
  message: null,
  isContent: false,
  isLoading: false,
};

const UseMyPagination = ({ margin, totalPages, callBack, page }) => {
  return (
    <Box sx={{ ...margin, display: "flex", justifyContent: "flex-end" }}>
      <Pagination
        page={page}
        count={totalPages}
        color="primary"
        onChange={(_, newPage) => callBack(newPage)}
      />
    </Box>
  );
};

export default TableContainer;
