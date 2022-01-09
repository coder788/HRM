const dev = {
  API_ENDPOINT_URL: "https://hr-api.arabianfal.net/api",
  SITE_URL: "https://hr-api.arabianfal.net",
  WS_SOCKET_URL: "wss://arabianfal.net:3000",
};

const prod = {
  API_ENDPOINT_URL: "https://api.arabianfal.net/api",
  SITE_URL: "https://api.arabianfal.net",
  WS_SOCKET_URL: "wss://arabianfal.net:3000",
};

const test = {
  API_ENDPOINT_URL: "https://staging-api.arabianfal.net/api",
  SITE_URL: "https://staging-api.arabianfal.net",
  WS_SOCKET_URL: "wss://arabianfal.net:3001",
};

const getEnv = () => {
  if (window.location.href.search("staging.") >= 0) {
    return test;
  }
  switch (process.env.NODE_ENV) {
    case "development":
      return dev;
    case "production":
      return prod;
    case "test":
      return test;
    default:
      break;
  }
};

export const env = getEnv();
