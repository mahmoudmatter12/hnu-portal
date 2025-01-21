// Redirect to login if the user is not logged in
function checkLogin() {
    const currentUser = sessionStorage.getItem('currentUser');
    const user = currentUser ? JSON.parse(currentUser) : null;
    if (!currentUser) {
        Swal.fire({
            icon: "error",
            title: "Access Denied!",
            text: "You are not authorized to view this page.",
        }).then(() => {
            window.location.href = '/templates/profile.html';
        });
    } else {
        // Assuming currentUser contains the user ID
        const user = JSON.parse(currentUser);
        fetchTimetableByUserId(user.id);
    }
}

// Fetch timetable data for the logged-in user for the current day based on `id`
function fetchTimetableByUserId(userId) {
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    const todayName = daysOfWeek[today];
    // console.log('Today:', todayName);

    fetch(`/Data/time_table/${todayName}.json?timestamp=${new Date().getTime()}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched Data:', data); // Debug fetched data
            const profTimetable = data.find(entry => entry.prof_id === userId.toString());
            // console.log('Professor Timetable:', profTimetable); // Debug specific timetable

            if (profTimetable) {
                populateTimetable(profTimetable.subjects);
            } else {
                Swal.fire({
                    icon: "error",
                    title: "No Timetable Found!",
                    text: "Please contact the administrator for assistance.",
                    showCancelButton: false,
                    showConfirmButton: true,
                    confirmButtonText: `Go to Profile`
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/templates/profile.html';
                    }
                });
            }
        })
        .catch(error => console.error('Error fetching timetable:', error));
}

function populateTimetable(subjects) {
    subjects.forEach(subject => {
        if (subject.time && subject.subject_name) {
            const elementId = `${subject.time}`;
            const timetableCell = document.getElementById(elementId);

            if (timetableCell) {
                timetableCell.innerHTML = `
                <div class="${subject.subject_name == "FREE" ? "free" : ""}">
                <h1>${subject.subject_name}</h1>
                </div>
                <br> 
                <p>
                ${subject.subject_name != "FREE" ? 'Group: ' + subject.group : ''} 
                </p>
                <br> 
                <p>
                ${subject.subject_name != "FREE" ? 'Level: ' + subject.level : ''}
                </p>
                `;

                if (subject.subject_name == "FREE") {
                    timetableCell.style.backgroundColor = 'lightgreen';
                }
                if (subject.subject_name != "FREE") {
                    timetableCell.innerHTML += `<br><button class="btn btn-primary" onclick="redirectToSubject('${subject.subject_name}', '${subject.group}', '${subject.level}')">  View Details</button>`;
                }

            } else {
                console.warn(`Element with ID ${elementId} not found in the timetable.`);
            }
        }
    });
}

// Function to redirect to display.html with subject data in URL
function redirectToSubject(name, group, level) {
    // Encode parameters to make them URL-safe
    const url = `/templates/display.html?subject_name=${encodeURIComponent(name)}&group=${encodeURIComponent(group)}&level=${encodeURIComponent(level)}`;
    window.location.href = url;
}

function getdays() {
    const days_cont = document.getElementById('days');
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    const today = new Date().getDay();
    const dayElement = document.createElement('div');
    dayElement.className = 'timetable-column';
    dayElement.innerHTML = `<strong>${daysOfWeek[today].toUpperCase()}</strong>`;
    dayElement.style.backgroundColor = 'cyan';
    days_cont.appendChild(dayElement);

}
// Run the login check when the page loads
checkLogin();
