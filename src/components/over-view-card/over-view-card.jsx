import { Box, Skeleton, Typography } from "@mui/material";
import useAnimateNumber from "../../hooks/use-animate-number";
import CountUp from 'react-countup';

const OverViewCard = ({ value, title, icon, sign = "", isLoading }) => {
  return (
    <>
      {isLoading ? (
        <Box height={155}>
          <Skeleton variant="rectangular" height={"100%"} sx={{ borderRadius: 2 }} />
        </Box>
      ) : (
        <Box sx={styles.card}>
          {icon}
          <Typography sx={styles.title}>{title}</Typography>
          <Typography sx={styles.numbers}>
            {sign}
            {value}
          </Typography>
        </Box>
      )}
    </>
  );
};

export default OverViewCard;

const styles = {
  card: {
    bgcolor: "#fff",
    px: 2,
    py: 3,
    color: "#333",
    borderRadius: 2,
    boxShadow: "0 10px 10px #00000017",
    transition: "transform .4s all",
    "&:before": {
      content: '""',
      position: "absolute",
      zIndex: -1,
      top: "-53px",
      right: "-20px",
      bgcolor: "primary.main",
      height: "50px",
      width: "50px",
      borderRadius: "32px",
      transform: "scale(1)",
      transformOrigin: "50% 50%",
      transition: "transform .4s ease-out",
    },
    "&:hover": {
      "&:before": {
        transform: "scale(35);",
      },
      color: "white",
    },
    zIndex: 1,
    overflow: "hidden",
    position: "relative",
  },
  bg: {
    bgcolor: "#fff",
    px: 2,
    py: 3,
    color: "#333",
    borderRadius: 2,
    boxShadow: "0 10px 10px #00000017",
  },
  title: {
    fontSize: { md: 24, xs: 18 },
    fontWeight: 500,
  },
  numbers: {
    fontSize: { md: 29, xs: 22 },
    fontWeight: 600,
    textAlign: "end",
  },
};
