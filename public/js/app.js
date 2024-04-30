// Empty variable to hold the auth0 object later.
let auth0Client = null;

// Function that fetches the information from auth_config
const fetchAuthConfig = () => fetch("/auth_config.json");

// New function that uses fetchAuthConfig to download its content and also initializes the auth0 variable. 
const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();
  
    auth0Client = await auth0.createAuth0Client({
      domain: config.domain,
      clientId: config.clientId
    });
  };

// Call to intitialize above function on page load.
window.onload = async () => {
    await configureClient();

  // update the UI state
  updateUI();

  const isAuthenticated = await auth0Client.isAuthenticated();

  if (isAuthenticated) {
    // show the gated content
    return;
  }

  // Check for the code and state parameters
  const query = window.location.search;
  if (query.includes("code=") && query.includes("state=")) {

    // Process the login state
    await auth0Client.handleRedirectCallback();
    
    updateUI();

    // Use replaceState to redirect the user away and remove the querystring parameters
    window.history.replaceState({}, document.title, "/");
    }
};

const updateUI = async () => {
  const isAuthenticated = await auth0Client.isAuthenticated();

  document.getElementById("btn-logout").disabled = !isAuthenticated;
  document.getElementById("btn-login").disabled = isAuthenticated;

  // Add logic to show/hide gated content after authentication
  if (isAuthenticated) {
    document.getElementById("gated-content").classList.remove("hidden");

    document.getElementById(
      "ipt-access-token"
    ).innerHTML = await auth0Client.getTokenSilently();

    document.getElementById("ipt-user-profile").textContent = JSON.stringify(
      await auth0Client.getUser()
    );

  } else {
    document.getElementById("gated-content").classList.add("hidden");
  }
};

// Function for login, called by the login button defined in html.
const login = async () => {
    await auth0Client.loginWithRedirect({
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    });
};

// Function for logout, called by logout button once user is authenticated.
const logout = () => {
    auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
};