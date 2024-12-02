
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
    const emailElement = document.getElementById('email');

    if (nameElement) {
        if (user.name === 'Matter') {
            nameElement.innerHTML = `<img src="/static/images/matter.png" alt="Matter Image" class="matterimg">`;
        }
        else {
            nameElement.textContent = user.name;
        }

    }

    if (roleElement) {
        roleElement.textContent = user.role;
    }

    if (emailElement && user.email) {
        emailElement.textContent = user.email;
    } else {
        emailElement.innerHTML = `No email provided`;
    }

    if (idElement) {
        idElement.textContent = user.id;
    }
}

// Check if the user is an admin and display admin elements
function checkAdminRole(user) {
    const ocElements = document.querySelectorAll('.oc');
    const time_table = document.querySelector('.time_table');
    const lectures_time_table = document.querySelector('.lectures_time_table');
    const student_info = document.querySelector('.student_info');

    if (user.role === 'admin') {
        ocElements.forEach(element => element.style.display = 'block');
        time_table.style.display = 'block';
        lectures_time_table.style.display = 'block';
        student_info.style.display = 'block';
    }
    else if (user.role === 'OC') {
        ocElements.forEach(element => element.style.display = 'block');
        time_table.style.display = 'none';
        lectures_time_table.style.display = 'none';
        student_info.style.display = 'none';
    }
    else {
        ocElements.forEach(element => element.style.display = 'none');
        time_table.style.display = 'block';
        lectures_time_table.style.display = 'none';
        student_info.style.display = 'none';
    }
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
function oc() {
    window.location.href = '/templates/event.html';
}



// Run the login check when the page loads
checkLogin();
