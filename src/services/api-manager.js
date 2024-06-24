import axios from "axios";

let _baseUrl = import.meta.env.VITE_APP_API_KEY;

export default function apiManager({ header = { "Content-Type": "application/json", "ngrok-skip-browser-warning": true }, method = "get", path = "", params = {}, baseUrl = _baseUrl, token = localStorage.getItem(import.meta.env.VITE_APP_TOKEN) }) {
  let HEADER = { headers: header };
  if (token) {
    HEADER = { headers: { Authorization: `${token}`, ...header } };
  }

  return new Promise(function (myResolve, myReject) {
    if (["put", "patch", "post"].indexOf(method) !== -1) {
      axios[method](baseUrl + path, params, HEADER)
        .then((response) => {
          myResolve(response);
        })
        .catch((err) => {
          myReject(err);
        });
      return;
    }
    axios[method](baseUrl + path, HEADER)
      .then((response) => {
        myResolve(response);
      })
      .catch((err) => {
        myReject(err);
      });
  });
}
