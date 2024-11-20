// Get the current user from session storage
function getCurrentUser() {
    const user = sessionStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
}

// Example usage
const currentUser = getCurrentUser();


const loginButton = document.getElementById('login');
const logoutButton = document.getElementById('logout');
const profileButton = document.getElementById('profile');

if (loginButton && logoutButton && profileButton) {
    if (currentUser) {
        logoutButton.style.display = 'block';
        profileButton.style.display = 'block';
        loginButton.style.display = 'none';
    } else {
        logoutButton.style.display = 'none';
        profileButton.style.display = 'none';
        loginButton.style.display = 'block';
    }
}

function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '/';
}
function profile() {
    window.location.href = '/templates/profile.html';
}
function login() {
    window.location.href = '/templates/login.html';
}