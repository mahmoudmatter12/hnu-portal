let student_Data = [];
let filteredStudents = [];
let currentPage = 1;
const studentsPerPage = 6;
let currentStudentSSN = null;


// Fetch data from the JSON file
async function fetchStudentData() {
    const spinner = document.getElementById("loading-spinner");
    spinner.style.display = "block";

    try {
        const response = await fetch("/Data/students.json");
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }

        student_Data = await response.json();
        populateDepartmentDropdown();
        filterAndDisplayStudents();
    } catch (error) {
        console.error("Failed to fetch student data:", error);
        document.getElementById("student-list").innerHTML = `
      <div class="alert alert-danger" role="alert">
        Failed to load student data. Please try again later.
      </div>
    `;
    } finally {
        spinner.style.display = "none";
    }
}

// Populate department dropdown with unique values
function populateDepartmentDropdown() {
    const departmentFilter = document.getElementById("department-filter");
    const uniqueDepartments = [
        "All",
        ...new Set(student_Data.map((student) => student.department)),
    ];

    departmentFilter.innerHTML = uniqueDepartments
        .map((department) => `<option value="${department}">${department}</option>`)
        .join("");
}

// Display students with pagination
function displayStudents(students) {
    const studentList = document.getElementById("student-list");
    studentList.innerHTML = "";

    if (students.length === 0) {
        studentList.innerHTML = `
      <div class="alert alert-warning text-center" role="alert">
        No students found matching the criteria.
      </div>
    `;
        return;
    }

    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = Math.min(startIndex + studentsPerPage, students.length);
    const studentsToDisplay = students.slice(startIndex, endIndex);

    studentsToDisplay.forEach((student, index) => {
        const card = document.createElement("div");
        card.classList.add("col-12", "col-md-6", "col-lg-4", "mb-4");
        const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        card.innerHTML = `
          <div class="card shadow-sm h-100">
        <div class="card-body bg">
          <div class="badge1">
            <span class="badge rounded-pill text-bg-primary badge-content">
              <strong class="st" >${startIndex + index + 1}</strong>
            </span>
          </div>
          <header class="header">
            <h5 class="card-title text-center" ></i>${highlightSearchMatch(student.name)}</h5>
          </header>
          <h6 class="card-subtitle mb-2 text-muted subheader">
            <i class="fas fa-id-card"></i> ID: ${highlightSearchMatch(
            student.student_id
        )}
          </h6>
          <p class="card-text em-txt">
            <i class="fas fa-envelope"></i> <strong class="st" >Email :<br></strong> ${highlightSearchMatch(
            student.gmail
        )}<br><br>
            <i class="fas fa-id-badge"></i> <strong class="st">SSN :</strong> ${highlightSearchMatch(
            student.ssn
        )}<br><br>
            ${student.phone_num ? `
            <i class="fab fa-whatsapp"></i> <strong class='wb'>WhatsApp :</strong> <a class="link" href="${generalwhatappphonelink(student.phone_num, `Hello ${student.name}, I'm ${currentUser.role} ${currentUser.name} from the Attendance portal`)} target="_blank">${student.phone_num}</a>
            `: `
            <i class="fab fa-whatsapp"></i> <strong class="wb">WhatsApp :</strong> Not available`}
            <br>
            <br>
            <i class="fab fa-facebook"></i> <strong class="st">Facebook Page:</strong> ${student.facebook_url ? `<a class="link" href="${student.facebook_url}" target="_blank"><br>${student.facebook_name}</a>` : "Not available"}
            <br>
            <hr>
            <div class="d-flex justify-content-between align-items-center">
              <span>
            <i class="fas fa-building"></i> <strong class="st">Department:</strong><br> 
            ${highlightSearchMatch(student.department)}
              </span>
              <span>
            <i class="fas fa-graduation-cap"></i> <strong class="st">Grade:</strong><br> 
            ${student.grade}
              </span>
            </div>
            <hr>
            <div class="d-flex justify-content-between align-items-center">
              <button 
            type="button" 
            class="btn btn-outline-primary" 
            data-bs-toggle="modal" 
            data-bs-target="#exampleModal" 
            onclick="showStudentDetails('${student.ssn}')">
            View Details
              </button>
              <button type="button" class="btn btn-outline-danger" onclick="openFieldSelectionModal('${student.ssn}')">Make report</button>
            </div>
          </p>
        </div>
          </div>
        `;
        studentList.appendChild(card);
    });

    displayPagination(students);
}

// Function to select important fields and manage the 'Select All' checkbox
function selectAllFields() {
    const selectAllCheckbox = document.getElementById('select-all');
    const checkboxes = document.querySelectorAll('.data-field');
    checkboxes.forEach(checkbox => checkbox.checked = selectAllCheckbox.checked);
}

// Function to pre-check important fields and manage field selection
function infodata() {
    const importantFields = ['name', 'student_id', 'department', 'group_number', 'section'];
    const selectAllCheckbox = document.getElementById('select-all');
    const checkboxes = document.querySelectorAll('.data-field');
    checkboxes.forEach(checkbox => {
        checkbox.checked = importantFields.includes(checkbox.value) || selectAllCheckbox.checked;
    });
}

function GenerateFieldsBasedOnStudent() {
    const fieldCheckboxes = document.getElementById('field-checkboxes');
    fieldCheckboxes.innerHTML = '';

    const studentKeys = Object.keys(student_Data[0] || {});
    studentKeys.forEach(key => {
        const checkbox = document.createElement('div');
        checkbox.classList.add('form-check');
        checkbox.innerHTML = `
            <input class="form-check-input data-field" type="checkbox" value="${key}" id="field-${key}">
            <label class="form-check-label" for="field-${key}">
                <strong>${key.replace('_', ' ').toUpperCase()}</strong>
            </label>
        `;
        fieldCheckboxes.appendChild(checkbox);
    });
}

// Function to generate the student report based on selected fields
function generateReport() {
    // Get selected fields
    const selectedFields = Array.from(document.querySelectorAll('.data-field:checked')).map(cb => cb.value);

    // Find the selected student using the global variable `currentStudentSSN`
    const student = student_Data.find(s => s.ssn === currentStudentSSN);

    if (!student) {
        showToast("Student not found!", "warning");
        return;
    }

    // Start building the report card HTML
    let reportCardHTML = `
        <div class="report-card">
            <div class='card-title text-center report-title '>
                <h2>${student.name}</h2>
                <hr>
            </div>
        <div class="card">

    `;

    // Loop through selected fields to add to the report
    selectedFields.forEach(field => {
        if (field !== "GPA" && field !== "subjects" && field !== "name") {
            // Handle flat fields
            reportCardHTML += `
            <p><strong>${field.replace('_', ' ')}:</strong> ${student[field] || "N/A"}</p>
            <hr>
            `;
        }
    });

    reportCardHTML += `</div>`; // Close the card div

    // Add GPA details if selected
    if (selectedFields.includes("GPA") && student.GPA) {
        reportCardHTML += `
            <div class="card">
                <h3>GPA Details</h3>
                <table class="table table-striped table-bordered">
                    <thead class="thead-dark">
                        <tr><th>Semester</th><th>GPA</th></tr>
                    </thead>
                    <tbody>
                        ${student.GPA.map(gpa => `<tr><td>${gpa.semester}</td><td>${gpa.GPA}</td></tr>`).join("")}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Add subjects details if selected
    if (selectedFields.includes("subjects") && student.subjects) {
        reportCardHTML += `
            <div class="card">
                <h3>Subjects</h3>
        `;

        for (const [semester, subjects] of Object.entries(student.subjects)) {
            reportCardHTML += `<h5>Semester: ${semester}</h5><ul>`;
            subjects.forEach(sub => {
                reportCardHTML += `<li>${sub.subject_name} <i class="fa-solid fa-arrow-right"></i> (${sub.subject_code})</li>`;
            });
            reportCardHTML += `</ul><hr>`;
        }

        reportCardHTML += `</div>`;
    }

    // Close the report card div
    reportCardHTML += `<br> </div>`;

    // Display the generated report
    DisplayReport(reportCardHTML);
}

// Add the report content to the report card
function AddReportContent(reportCardHTML) {
    const reportInput = document.getElementById("report-input-content").value;
    if (reportInput) {
        reportCardHTML += `<p>${reportInput}</p>`;
    }
    document.getElementById("report-content").innerHTML = reportCardHTML;
}

function DisplayReport(reportCardHTML) {
    const modalContent = document.getElementById("report-modal-content");
    modalContent.innerHTML = reportCardHTML;

    const reportModal = new bootstrap.Modal(document.getElementById("report-modal"));
    reportModal.show();
}



function openFieldSelectionModal(ssn) {
    GenerateFieldsBasedOnStudent();
    currentStudentSSN = ssn;
    infodata();
    const modal = new bootstrap.Modal(document.getElementById("fieldSelectionModal"));
    modal.show();
}


function sendViaWhatsApp() {
    const reportCard = document.querySelector('.report-card');
    const reportContent = document.getElementById("report-content").textContent;

    if (!reportCard && !reportContent) {
        showToast("No report to send!", "warning");
        return;
    }

    const reportText = reportCard.innerText + "\n" + reportContent;
    const encodedText = encodeURIComponent(reportText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;

    window.open(whatsappUrl, '_blank');
}

function generalwhatappphonelink(phone_num, message = '') {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=+2${phone_num}&text=${encodedMessage}`;
    return whatsappUrl;

}
// Function to copy the report content
function copyreport() {
    const reportCard = document.querySelector('.report-card');
    const reportContent = document.getElementById("report-content").textContent;

    if (!reportCard && !reportContent) {
        showToast("No report to copy!", "warning");
        return;
    }

    const reportText = reportCard.innerText + "\n" + reportContent;

    navigator.clipboard.writeText(reportText).then(() => {
        showToast("Report copied to clipboard!", "success");
    }).catch(() => {
        showToast("Failed to copy report!", "danger");
    });
}


// Highlight matches in search query
function highlightSearchMatch(text) {
    const query = document.getElementById("search-input").value.toLowerCase();
    if (!query) return text;

    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, `<mark>$1</mark>`);
}

function displayPagination(students) {
    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";

    const totalPages = Math.ceil(students.length / studentsPerPage);
    const maxVisiblePages = 7; // Number of visible pages at a time

    // Determine the range of pages to display
    const startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Ensure the visible pages remain within bounds
    const visibleStartPage = Math.max(1, endPage - maxVisiblePages + 1);

    if (currentPage > 1) {
        const prevButton = createPaginationButton("Previous", () => {
            currentPage--;
            displayStudents(students);
        });
        pagination.appendChild(prevButton);
    }

    for (let i = visibleStartPage; i <= endPage; i++) {
        const pageButton = createPaginationButton(
            i,
            () => {
                currentPage = i;
                displayStudents(students);
            },
            i === currentPage
        );
        pagination.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        const ellipsis = document.createElement("span");
        ellipsis.textContent = "...";
        ellipsis.classList.add("m-1");
        pagination.appendChild(ellipsis);
    }

    if (currentPage < totalPages) {
        const nextButton = createPaginationButton("Next", () => {
            currentPage++;
            displayStudents(students);
        });
        pagination.appendChild(nextButton);
    }
}

// Create a reusable pagination button
function createPaginationButton(label, onClick, isActive = false) {
    const button = document.createElement("button");
    button.textContent = label;
    button.classList.add("btn", "btn-sm", "btn-outline-primary", "m-1");
    if (isActive) button.classList.add("active");
    button.addEventListener("click", onClick);
    return button;
}


// Filter and display students based on search and dropdowns
function filterAndDisplayStudents() {
    const department = document.getElementById("department-filter").value;
    const paymentState = document.getElementById("payment-filter").value;
    const query = document.getElementById("search-input").value.toLowerCase();

    filteredStudents = student_Data.filter((student) => {
        return (
            (department === "All" || student.department === department) &&
            (paymentState === "All" || student.payment_state === paymentState) &&
            (student.name.toLowerCase().includes(query) ||
                student.department.toLowerCase().includes(query) ||
                student.student_id.toLowerCase().includes(query) ||
                student.gmail.toLowerCase().includes(query) ||
                (student.ssn && student.ssn.toLowerCase().includes(query)))
        );
    });

    displayStudents(filteredStudents);
    updateStudentCount();
}

// Update total student count
function updateStudentCount() {
    document.getElementById(
        "total-students"
    ).textContent = `${filteredStudents.length}`;
}

// Reset filters and search
function resetFilters() {
    document.getElementById("department-filter").value = "All";
    document.getElementById("payment-filter").value = "All";
    document.getElementById("search-input").value = "";
    currentPage = 1;
    filterAndDisplayStudents();
}

// Function to show a toast notification
function showToast(message, type = "danger") {
    const toastContainer = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show`;
    toast.role = "alert";
    toast.ariaLive = "assertive";
    toast.ariaAtomic = "true";
    toast.style.zIndex = 1050; // Ensure it appears above the modal
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}


function showStudentDetails(ssn) {
    // Display a loading indicator while fetching data
    document.getElementById("student-name").textContent = "Loading...";

    // Ensure that student_Data is available
    if (!Array.isArray(student_Data) || student_Data.length === 0) {
        showToast("Student data is not available.", "warning");
        return;
    }

    // Find the student data by SSN
    const student = student_Data.find((s) => s.ssn === ssn);

    if (!student) {
        showToast("Student not found!", "warning");
        return;
    }

    try {
        // Populate general student details
        document.getElementById("student-name").textContent = student.name || "N/A";
        document.getElementById("student-id").textContent = student.student_id || "N/A";
        document.getElementById("student-ssn").textContent = student.ssn || "N/A";
        document.getElementById("student-department").textContent = student.department || "N/A";
        document.getElementById("student-group").textContent = student.group_number || "N/A";
        document.getElementById("student-section").textContent = student.section || "N/A";
        document.getElementById("student-payment").textContent =
            student.payment_state === "True" ? "Paid" : "Unpaid";

        // Populate GPA details
        const gpaTableBody = document.querySelector("#gpa-details tbody");
        gpaTableBody.innerHTML = "";
        if (student.GPA && Array.isArray(student.GPA) && student.GPA.length > 0) {
            student.GPA.forEach((semesterGPA) => {
                const row = document.createElement("tr");
                row.innerHTML = `<td>${semesterGPA.semester}</td><td>${semesterGPA.GPA}</td>`;
                gpaTableBody.appendChild(row);
            });
        } else {
            gpaTableBody.innerHTML = "<tr><td colspan='2'>No GPA records found</td></tr>";
        }


        // Populate Subjects details
        const subjectsList = document.getElementById("subjects-list");
        subjectsList.innerHTML = "";
        if (student.subjects && typeof student.subjects === 'object') {
            for (const [semester, subjects] of Object.entries(student.subjects)) {
            const semesterHeader = document.createElement("h5");
            semesterHeader.textContent = `Semester: ${semester}`;
            subjectsList.appendChild(semesterHeader);

            const ul = document.createElement("ul");
            subjects.forEach((subject) => {
                const li = document.createElement("li");
                li.innerHTML = `${subject.subject_name} <i class="fa-solid fa-arrow-right-long"></i> (${subject.subject_code})`;
                ul.appendChild(li);
            });
            subjectsList.appendChild(ul);
            subjectsList.appendChild(document.createElement("hr"));
            }
        } else {
            subjectsList.innerHTML = "<li>No subjects found</li>";
        }

        // Show the modal
        const modal = new bootstrap.Modal(document.getElementById("card-modal"));
        modal.show();
    } catch (error) {
        console.error("Error displaying student details:", error);
        showToast("An unexpected error occurred.", "danger");
    }
}

function closeModal() {
    const modalElement = document.getElementById('card-modal');
    if (modalElement) {
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
        if (modalInstance) {
            modalInstance.hide();
        }
    }
}

// Function to add report content
function addReport() {
    const reportInput = document.getElementById("report-input-content").value;
    const reportContent = document.getElementById("report-content");
    reportContent.textContent = reportInput;
}
// Function to add report content in real-time
document.getElementById("report-input-content").addEventListener("input", function () {
    const reportContent = document.getElementById("report-content");
    reportContent.textContent = this.value;
});


// Function to clear report content
function clearReport() {
    const reportContent = document.getElementById("report-content");
    reportContent.textContent = "";
    document.getElementById("report-input-content").value = "";
}

// Function to request a meeting
function requestMeeting() {
    const reportContent = document.getElementById("report-content").textContent;
    if (!reportContent) {
        showToast("Please add a report before requesting a meeting!", "warning");
        return;
    }
    // Logic to request a meeting (e.g., send an email or open a meeting request form)
    showToast("Meeting requested successfully!", "success");
}

// Event listeners
document
    .getElementById("department-filter")
    .addEventListener("change", filterAndDisplayStudents);
document
    .getElementById("payment-filter")
    .addEventListener("change", filterAndDisplayStudents);
document
    .getElementById("search-input")
    .addEventListener("input", filterAndDisplayStudents);
document
    .getElementById("reset-filters")
    .addEventListener("click", resetFilters);

// Initialize on load
fetchStudentData();

