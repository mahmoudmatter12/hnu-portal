// Redirect to login if the user is not logged in
const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

function checkLogin() {
    if (!currentUser) {
        window.location.href = '/templates/login.html';
        return;
    }
}

function checkAdmin() {
    if(currentUser.role != 'admin'){
        showAdminMassege();
    }
}

function populateTimetable(day, subjects) {
    subjects.forEach(subject => {
        if (subject.time && subject.subject_name) {
            const elementId = `${day}_${subject.time}`;
            const timetableCell = document.getElementById(elementId);

            if (timetableCell) {
                timetableCell.innerHTML = `${subject.subject_name}
                <br> 
                ${subject.subject_name != "FREE" ? 'Group: '+subject.group : ''} <br> ${subject.subject_name != "FREE" ? 'Level: '+subject.level : ''}
                ` // Set the subject name in the cell
                if(subject.subject_name == "FREE"){
                    timetableCell.style.backgroundColor = 'lightgreen';
                }
                if(subject.subject_name != "FREE"){
                    timetableCell.innerHTML += `<br><button class="btn btn-outline-info" onclick="redirectToSubject('${subject.subject_name}', '${subject.group}', '${subject.level}')">View Details</button>`;
                }

            } else {
                console.warn(`Element with ID ${elementId} not found in the timetable.`);
            }
        }
    });
}

// Fetch timetable data for all days and populate the timetable matrix
function fetchAllTimetables(userId) {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'saturday'];

    daysOfWeek.forEach(day => {
        fetch(`/Data/time_table/${day}.json?timestamp=${new Date().getTime()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
                console.log(response);
            })
            .then(data => {
                const profTimetable = data.find(entry => entry.prof_id === userId.toString());

                if (profTimetable) {
                    populateTimetable(day, profTimetable.subjects);
                } else {
                    console.warn(`No timetable found for this professor on ${day}.`);
                }
            })
            .catch(error => console.error(`Error fetching timetable for ${day}:`, error));
    });
}


// Fetch timetable data for all days and populate the timetable matrix for all users
function fetchAllTimetablesForAllUsers() {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'saturday'];

    daysOfWeek.forEach(day => {
        fetch(`/Data/time_table/${day}.json?timestamp=${new Date().getTime()}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                data.forEach(profTimetable => {
                    if (profTimetable.subjects) {
                        populateTimetable(day, profTimetable.subjects);
                    } else {
                        console.warn(`No subjects found for this professor on ${day}.`);
                    }
                });
            })
            .catch(error => console.error(`Error fetching timetable for ${day}:`, error));
    });
}

showAdminMassege = () => {
    const adminMessage = new bootstrap.Modal(document.getElementById('adminModal'));
    adminMessage.show();
    document.getElementById('adminModal').addEventListener('hidden.bs.modal', function () {
        window.location.href = '/';
    });
}

// Fetch and display timetable for all users for all days
fetchAllTimetablesForAllUsers();

// Function to redirect to display.html with subject data in URL
function redirectToSubject(name, group, level) {
    // Encode parameters to make them URL-safe
    const url = `/templates/display.html?subject_name=${encodeURIComponent(name)}&group=${encodeURIComponent(group)}&level=${encodeURIComponent(level)}`;
    window.location.href = url;
}

function getdays() {
    const days_cont = document.getElementById('days');

    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'saturday'];
    const today = new Date().getDay();

    daysOfWeek.forEach((day, index) => {
        const dayElement = document.createElement('div');
        dayElement.className = 'timetable-column';
        dayElement.textContent = day.charAt(0).toUpperCase() + day.slice(1);

        if (index === today) {
            dayElement.style.backgroundColor = 'cyan';
        }
        days_cont.appendChild(dayElement);
    });
}

function ToAdminLogin(){
    sessionStorage.removeItem('currentUser');
    window.location.href = '/templates/login.html';
}

// Run the login check when the page loads
checkLogin();
checkAdmin();
