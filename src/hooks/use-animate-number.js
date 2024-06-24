import { useState, useEffect } from "react";

const useAnimateNumber = (value) => {
  const [number, setNumber] = useState(0);

  useEffect(() => {
    const animationDuration = 2000; // Animation duration in milliseconds
    const endNumber = value;

    const startTimestamp = Date.now();
    const endTimestamp = startTimestamp + animationDuration;

    const updateNumber = () => {
      const currentTimestamp = Date.now();
      const elapsed = currentTimestamp - startTimestamp;

      if (currentTimestamp >= endTimestamp) {
        setNumber(endNumber);
      } else {
        const progress = elapsed / animationDuration;
        const animatedNumber = Math.floor(progress * endNumber);
        setNumber(animatedNumber);
        requestAnimationFrame(updateNumber);
      }
    };

    requestAnimationFrame(updateNumber);
  }, []);
  return number;
};

export default useAnimateNumber;
