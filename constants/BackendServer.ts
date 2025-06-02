const DEV_MODE = false;

export const BackendServer = DEV_MODE
  ? "http://10.0.0.15:5000/api/v1"
  : "https://gratefultime.eesa.hackclub.app/api/v1";
