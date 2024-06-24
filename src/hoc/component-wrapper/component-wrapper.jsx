import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import PrimaryLayout from "../../layout/primary-layout";
import { SplashScreen } from "../../components";
import apiManager from "../../services/api-manager";
import { setTimezone, setToast, setUser } from "../../store/reducer";

// This function acts as a wrapper for components and handles authentication and loading logic.
function ComponentWrapper({ item = {}, ...props }) {
  const { layout, _for, ele, isProtected, fallBack } = item;
  const [isLoading, setIsLoading] = useState(true);
  const { isLogged } = useSelector((state) => state.appReducer);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const showMessage = (type, msg) => dispatch(setToast({ type: type, message: msg }));

  // Effect to handle redirection based on authentication state and loading.
  useEffect(() => {
    if (!isLogged && !isLoading && isProtected) {
      // Redirect to the specified 'fallBack' route if not logged in and component is protected.
      navigate(fallBack);
    }

    if (isLogged && !isLoading && !isProtected) {
      // Redirect to the specified 'fallBack' route if logged in and component is not protected.
      navigate(fallBack);
    }
  }, [isLogged, isLoading, navigate]);

  // Effect to initialize the component and fetch user data.
  useEffect(() => {
    async function init() {
      try {
        // Retrieve the authentication token from local storage.
        let token = localStorage.getItem(import.meta.env.VITE_APP_TOKEN);
        if (token) {
          // If a token exists, make an API call to fetch user data.
          let { data } = await apiManager({ method: "get", path: "admin/me" });
          // Dispatch an action to update user data in the Redux store.
          dispatch(setUser(data?.response?.data));
          dispatch(setTimezone(data?.response?.timezone));
        }
      } catch (error) {
        showMessage("error", error?.response?.data?.message);
        if (error?.response?.status === 401) {
          localStorage.removeItem(import.meta.env.VITE_APP_TOKEN);
        }
      } finally {
        // Set loading to false after a timeout of 3 seconds.
        setTimeout(() => { setIsLoading(false) }, 3000);
      }
    }
    init();
  }, []);

  // Render a loading screen if the component is still loading.
  if (isLoading) {
    return <SplashScreen />;
  }

  // Render the component based on authentication and layout.
  if (isProtected && isLogged && layout === "primary") {
    return <PrimaryLayout children={ele} />;
  }
  if (!isProtected) {
    return ele;
  }
}

export default ComponentWrapper;