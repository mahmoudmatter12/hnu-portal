
// Redirect to login if the user is not logged in
function checkLogin() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        window.location.href = '/templates/login.html';
        return;
    }

    // Display user info if logged in
    displayProfileInfo(JSON.parse(currentUser));
}

// Display the user's profile information
function displayProfileInfo(user) {
    const nameElement = document.getElementById('name');
    const roleElement = document.getElementById('role');
    const idElement = document.getElementById('id');

    if (nameElement) {
        nameElement.textContent += user.name;

    }

    if (roleElement) {
        roleElement.textContent = user.role;
    }

    if (idElement) {
        idElement.textContent = user.id;
    }
}

// Check if the user is an admin and display admin elements
function checkAdminRole(user) {
    console.log(user['role']);
    const adminElements = document.querySelectorAll('.admin');
    adminElements.forEach(element => {
        if (user.role === 'admin') {
            element.style.display = 'inline';
        } else {
            element.style.display = 'none';
        }
    });
}

// Call the checkAdminRole function after displaying profile info
checkAdminRole(JSON.parse(sessionStorage.getItem('currentUser')));

// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '/';
}
function time_table() {
    window.location.href = '/templates/time_table.html';
}
function students() {
    window.location.href = '/templates/studentsdata.html';
}
function home() {
    window.location.href = '/';
}


// Run the login check when the page loads
checkLogin();
