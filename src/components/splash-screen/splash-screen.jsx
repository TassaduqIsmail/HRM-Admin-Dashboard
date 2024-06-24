import { styled, keyframes } from "@mui/system";
import { Logo } from "../../assets";
import { Avatar } from "@mui/material";

const waveAnimation = keyframes`
  0% {
    transform: translateY(0);
  }
  10% {
    transform: translateY(-0.1em);
  }
  20% {
    transform: translateY(0.1em);
  }
  30% {
    transform: translateY(-0.05em);
  }
  40% {
    transform: translateY(0.05em);
  }
  50% {
    transform: translateY(-0.025em);
  }
  60% {
    transform: translateY(0.025em);
  }
  70% {
    transform: translateY(-0.0125em);
  }
  80% {
    transform: translateY(0.0125em);
  }
  90% {
    transform: translateY(-0.00625em);
  }
  100% {
    transform: translateY(0);
  }
`;

const RootContainer = styled("div")`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(to bottom, #EC1C24, #9C0D11);
  color: #fff;
`;

const Title = styled("div")`
  margin-top: 0.6em;
  font-size:4rem;
  text-align: center;
`;

const AnimatedLetter = styled("span")`
  display: inline-block;
  animation: ${waveAnimation} 1.5s ease-in-out infinite;
  font-weight:bold;
  font-family: 'Rouge Script', cursive;
 
`;

const SplashScreen = () => {
  return (
    <RootContainer>
      <Title>
        {/* <AnimatedLetter sx={{ animationDelay: "0.1s" }}>S</AnimatedLetter>
        <AnimatedLetter sx={{ animationDelay: "0.2s" }}>O</AnimatedLetter>
        <AnimatedLetter sx={{ animationDelay: "0.3s" }}>Y</AnimatedLetter> */}
        <Avatar
          variant="square"
          src={Logo}
          sx={{
            width: "100%",
            maxWidth: "250px",
            height: "auto",
          }}
        >
        </Avatar>
      </Title>
    </RootContainer>
  );
};

export default SplashScreen;
