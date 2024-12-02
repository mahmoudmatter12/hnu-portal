// Initializations and Event Listeners
document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

function initializeApp() {
    populateDeleteDropdown();
    loadSavedData();
    clearExpiredData();

    document.getElementById("searchForm").addEventListener("submit", handleSearchSubmit);
    document.getElementById("deleteStudentButton").addEventListener("click", handleDeleteStudent);
    document.getElementById("resetTable").addEventListener("click", handleResetTable);
    document.getElementById("qr-reader-link").addEventListener("click", handleQRCodeScan);
}

// Handle search form submission
function handleSearchSubmit(event) {
    event.preventDefault();
    const ssn = document.getElementById("ssn").value.trim();

    if (validateSSN(ssn)) {
        searchStudent(ssn);
    } else {
        Swal.fire({
            title: "Invalid Input",
            text: "SSN must be exactly 9 digits long.",
            icon: "warning",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
    }
}

// Validate SSN format
function validateSSN(ssn) {
    return /^\d{11}$/.test(ssn);
}

// Search for a student by SSN
function searchStudent(ssn) {
    fetch('/Data/ocs.json')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            const student = data.find(student => student.ssn.toString() === ssn);
            if (student) {
                addToTable(student);
            } else {
                displayStudentNotFound();
            }
        })
        .catch(displayFetchError);
}

// Display student not found message
function displayStudentNotFound() {
    Swal.fire({
        title: "Student Not Found",
        text: "The entered SSN does not match any student in our records.",
        icon: "error",
        confirmButtonText: "Okay",
    });
    document.getElementById("ssn").value = "";
}

// Handle fetch error
function displayFetchError(error) {
    console.error('Fetch error:', error);
    Swal.fire({
        title: "Error",
        text: "There was an issue fetching student data. Please try again later.",
        icon: "error",
        confirmButtonText: "Okay",
    });
}

// Add a student to the table
function addToTable(student) {
    const tableBody = document.getElementById("studentTableBody");
    const existingRow = document.querySelector(`[data-ssn="${student.ssn}"]`);

    if (existingRow) {
        displayDuplicateEntry();
        return;
    }

    const newRow = createTableRow(student);
    tableBody.appendChild(newRow);
    saveToLocalStorage(student);

    Swal.fire({
        title: "Student Added",
        text: `${student.name} has been added to the table.`,
        icon: "success",
        confirmButtonText: "Great!",
    });

    document.getElementById("ssn").value = "";
}

// Create a table row for a student
function createTableRow(student) {
    const row = document.createElement("tr");
    row.setAttribute("data-ssn", student.ssn);

    row.innerHTML = `
        <td>${student.name}</td>
        <td>${new Date().toLocaleString()}</td>
        <td><a href="${student.url}" target="_blank">View URL</a></td>
        <td>${student.Committee}</td>
    `;
    return row;
}

// Save a student to local storage
function saveToLocalStorage(student) {
    const storedStudents = JSON.parse(localStorage.getItem("studentData")) || [];
    storedStudents.push(student);
    localStorage.setItem("studentData", JSON.stringify(storedStudents));
    populateDeleteDropdown();
}

// Load saved data from local storage
function loadSavedData() {
    const savedStudents = JSON.parse(localStorage.getItem("studentData")) || [];
    const tableBody = document.getElementById("studentTableBody");

    savedStudents.forEach(student => {
        const newRow = createTableRow(student);
        tableBody.appendChild(newRow);
    });
}

// Populate delete dropdown with students
function populateDeleteDropdown() {
    const dropdown = document.getElementById("deleteStudentDropdown");
    dropdown.innerHTML = ""; // Clear existing options

    const storedStudents = JSON.parse(localStorage.getItem("studentData")) || [];
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a student to delete";
    dropdown.appendChild(defaultOption);

    storedStudents.forEach(student => {
        const option = document.createElement("option");
        option.value = student.ssn;
        option.textContent = student.name;
        dropdown.appendChild(option);
    });
}

// Handle delete student button click
function handleDeleteStudent() {
    const ssn = document.getElementById("deleteStudentDropdown").value;

    if (!ssn) {
        Swal.fire({
            title: "No Selection",
            text: "Please select a student to delete.",
            icon: "warning",
            confirmButtonText: "Okay",
        });
        return;
    }

    deleteStudentBySSN(ssn);
}

// Delete a student by SSN
function deleteStudentBySSN(ssn) {
    const storedStudents = JSON.parse(localStorage.getItem("studentData")) || [];
    const updatedStudents = storedStudents.filter(student => student.ssn.toString() !== ssn);
    localStorage.setItem("studentData", JSON.stringify(updatedStudents));

    const row = document.querySelector(`[data-ssn="${ssn}"]`);
    if (row) row.remove();

    populateDeleteDropdown();

    Swal.fire({
        title: "Student Deleted",
        text: "The selected student has been removed.",
        icon: "success",
        confirmButtonText: "Okay",
    });
}

// Handle reset table button click
function handleResetTable() {
    Swal.fire({
        title: "Are you sure?",
        text: "This will clear all table data.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, reset!",
    }).then(result => {
        if (result.isConfirmed) {
            resetTable();
        }
    });
}

// Reset table and clear local storage
function resetTable() {
    document.getElementById("studentTableBody").innerHTML = "";
    localStorage.removeItem("studentData");
    populateDeleteDropdown();

    Swal.fire({
        title: "Reset!",
        text: "The table has been cleared.",
        icon: "success",
    });
}

// Clear expired data from local storage
function clearExpiredData() {
    const expirationTime = localStorage.getItem("expirationTime");
    const currentTime = Date.now();

    if (expirationTime && currentTime > expirationTime) {
        localStorage.removeItem("studentData");
        localStorage.removeItem("expirationTime");
        console.log("Local storage data expired and cleared.");
    }
}

// Set data expiration time
function setExpirationTime(hours = 1) {
    const expirationTime = Date.now() + hours * 3600000;
    localStorage.setItem("expirationTime", expirationTime);
}

// Handle QR code scanning
function handleQRCodeScan(event) {
    event.preventDefault();
    const video = document.getElementById("preview");
    video.style.display = "block";

    if (!window.Instascan) {
        displayQRCodeError("QR Code Scanner Unavailable", "The QR Code scanning library is not loaded.");
        return;
    }

    const scanner = new Instascan.Scanner({ video });

    scanner.addListener("scan", content => {
        document.getElementById("ssn").value = content;
        document.getElementById("searchForm").dispatchEvent(new Event("submit"));
        scanner.stop();
        video.style.display = "none";
    });

    Instascan.Camera.getCameras()
        .then(cameras => {
            const backCamera = cameras.find(camera =>
                camera.name.toLowerCase().includes("back") ||
                camera.name.toLowerCase().includes("environment")
            );
            if (backCamera) {
                scanner.start(backCamera);
                // Flip the camera preview
                video.style.transform = "scaleX(1)";
            } else {
                displayQRCodeError("Back Camera Not Found", "Please use a device with a back-facing camera.");
            }
        })
        .catch(error => {
            console.error("Camera error:", error);
            displayQRCodeError("Camera Error", "An error occurred while accessing the camera.");
        });
}

// Display QR code error
function displayQRCodeError(title, text) {
    Swal.fire({
        title,
        text,
        icon: "error",
        confirmButtonText: "Okay",
    });
    document.getElementById("preview").style.display = "none";
}

// Display duplicate entry message
function displayDuplicateEntry() {
    Swal.fire({
        title: "Duplicate Entry",
        text: "This student is already listed in the table.",
        icon: "info",
        confirmButtonText: "Okay",
    });
}
