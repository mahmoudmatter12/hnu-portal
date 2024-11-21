// Logout function
function logout() {
    sessionStorage.removeItem('currentUser');
    window.location.href = '/';
}
function home() {
    window.location.href = '/';
}
function scanner() {
    window.location.href = '/templates/display.html';
}
function checkLogin() {
    if (!sessionStorage.getItem('currentUser')) {
        window.location.href = '/templates/login.html';
    }
}

function isalreadysignedin() {
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = '/templates/profile.html';
    }
}

// Function to show a toast notification
function showToast(message, type = "danger") {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show`;
    toast.role = "alert";
    toast.ariaLive = "assertive";
    toast.ariaAtomic = "true";
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 5000);

    // to use must add 
    //   <div id="toast-container" class="position-fixed bottom-0 end-0 p-3" style="z-index: 1055;"></div>
}

function profile() {
    window.location.href = '/templates/profile.html';
}
function TimeTable() {
    window.location.href = '/templates/time_table.html';
}
function Matrix() {
    window.location.href = '/Matrix.html';
}

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const today = new Date().getDay();
const todayName = daysOfWeek[today];

checkLogin();


isalreadysignedin();
