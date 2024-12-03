document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

function initializeApp() {
    // Ensure elements exist before attaching event listeners
    const searchForm = document.getElementById("searchForm");
    const deleteButton = document.getElementById("deleteStudentButton");
    const resetTableButton = document.getElementById("resetTable");
    const qrReaderLink = document.getElementById("qr-reader-link");
    const exportExcelButton = document.getElementById("exportExcel");
    const organizerTypeDropdown = document.getElementById("organizerType");

    if (searchForm) {
        searchForm.addEventListener("submit", handleSearchSubmit);
    }
    if (deleteButton) {
        deleteButton.addEventListener("click", handleDeleteStudent);
    }
    if (resetTableButton) {
        resetTableButton.addEventListener("click", handleResetTable);
    }
    if (qrReaderLink) {
        qrReaderLink.addEventListener("click", handleQRCodeScan);
    }
    if (exportExcelButton) {
        exportExcelButton.addEventListener("click", exportExcel);
    }
    if (organizerTypeDropdown) {
        organizerTypeDropdown.addEventListener("change", handleOrganizerTypeChange);
    }

    // Initial setup
    populateDeleteDropdown();
    loadSavedData();
    clearExpiredData();
}

// Handle search form submission
function handleSearchSubmit(event) {
    event.preventDefault();
    const ssnOrId = document.getElementById("ssn").value.trim();
    const organizerType = document.getElementById("organizerType").value;

    if (validateInput(ssnOrId, organizerType)) {
        fetchDataAndSearch(organizerType, ssnOrId);
    } else {
        Swal.fire({
            title: "Invalid Input",
            text:
                organizerType === "ocs"
                    ? "ID must be numeric."
                    : "Phone number must be exactly 9 digits long.",
            icon: "warning",
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false,
        });
    }
}
// Export table data to Excel
function exportExcel() {
    const tableBody = document.getElementById("studentTableBody");
    const rows = Array.from(tableBody.querySelectorAll("tr"));
    const organizerType = document.getElementById("organizerType").value;

    if (rows.length === 0) {
        Swal.fire({
            title: "No Data to Export",
            text: "The table is empty. Add some students first.",
            icon: "info",
            confirmButtonText: "Okay",
        });
        return;
    }

    const workbook = XLSX.utils.book_new();
    const data =
        organizerType === "ocs"
            ? [["Name", "Email", "Phone", "ID"]] // Wrap headers in an array
            : [["Name", "Date", "Url", "Committee"]];

    rows.forEach((row) => {
        const cells = Array.from(row.querySelectorAll("td")).map((cell, index) => {
            if (organizerType !== "ocs" && index === 2) {
                const link = cell.querySelector("a");
                return link ? link.href : "N/A"; // Handle missing anchor tags
            }
            return cell.textContent.trim();
        });
        data.push(cells);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Event Participants");

    XLSX.writeFile(workbook, "EventParticipants.xlsx");

    // Clear the table and local storage
    localStorage.removeItem("studentData");
    document.getElementById("studentTableBody").innerHTML = "";
    populateDeleteDropdown();

    Swal.fire({
        title: "Export Successful",
        text: "The table has been exported to an Excel file and data has been cleared.",
        icon: "success",
        confirmButtonText: "Great!",
    });
}


// Validate input based on organizer type
function validateInput(input, type) {
    if (type === "ocs") {
        return /^\d+$/.test(input); // ID should be numeric
    } else if (type === "ieee") {
        return /^\d{11}$/.test(input); // SSN should be 11 digits
    }
    return false;
}

// Fetch data and search for the student
function fetchDataAndSearch(type, identifier) {
    const dataPath = type === "ocs" ? "/Data/ocs2.json" : "/Data/ieee.json";

    fetch(dataPath)
        .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
        })
        .then((data) => {
            const student =
                type === "ocs"
                    ? data.find((item) => item.id.toString() === identifier)
                    : data.find((item) => item.ssn === identifier);

            if (student) {
                addToTable(student, type);
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
        text: "The entered ID does not match any student in our records.",
        icon: "error",
        confirmButtonText: "Okay",
    });
    document.getElementById("ssn").value = "";
}

// Handle fetch error
function displayFetchError(error) {
    console.error("Fetch error:", error);
    Swal.fire({
        title: "Error",
        text: "There was an issue fetching student data. Please try again later.",
        icon: "error",
        confirmButtonText: "Okay",
    });
}

// Add student data to the table
function addToTable(student, type) {
    const tableBody = document.getElementById("studentTableBody");
    const identifier = type === "ocs" ? student.id : student.ssn;
    const existingRow = document.querySelector(`[data-id="${identifier}"]`);

    if (existingRow) {
        displayDuplicateEntry();
        return;
    }

    const newRow = createTableRow(student, type);
    tableBody.appendChild(newRow);

    saveToLocalStorage({ ...student, type });

    Swal.fire({
        title: "Student Added",
        text: `${student.name} has been added to the table.`,
        icon: "success",
        confirmButtonText: "Great!",
    });

    document.getElementById("ssn").value = "";
}


const headers = {
    ocs: ["Name", "Email", "Phone", "ID"],
    ieee: ["Name", "Date", "URL", "Committee"],
  };
  
function updateTableHeaders() {
    const tableHead = document.getElementById("headers");
    const type = document.getElementById("organizerType").value;
    const headerHTML = headers[type].map((header) => `<th>${header}</th>`).join("");
    tableHead.innerHTML = headerHTML;
}

function handleOrganizerTypeChange() {
    updateTableHeaders();
    document.getElementById("studentTableBody").innerHTML = "";
    populateDeleteDropdown();
}

// Create table row based on data type
function createTableRow(student, type) {
    const row = document.createElement("tr");
    const identifier = type === "ocs" ? student.id : student.ssn;
    row.setAttribute("data-id", identifier);

    if (type === "ocs") {
        row.innerHTML = `
    
          <td>${student.name}</td>
          <td>${student.email}</td>
          <td>${student.phone}</td>
          <td>${student.id}</td>
       
    `;
    } else if (type === "ieee") {
        row.innerHTML = `
      <td>${student.name}</td>
      <td>${new Date().toLocaleString()}</td>
      <td><a href="${student.url}" target="_blank">View URL</a></td>
      <td>${student.Committee}</td>
    `;
    }
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

    savedStudents.forEach((student) => {
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

    storedStudents.forEach((student) => {
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
    const updatedStudents = storedStudents.filter(
        (student) => student.ssn && student.ssn.toString() !== ssn
    );
    localStorage.setItem("studentData", JSON.stringify(updatedStudents));

    // Remove the row from the table
    const tableBody = document.getElementById("studentTableBody");
    const rowToRemove = Array.from(tableBody.querySelectorAll("tr")).find(
        (row) => row.getAttribute("data-id") === ssn
    );
    if (rowToRemove) {
        tableBody.removeChild(rowToRemove);
    }

    // Update the dropdown
    populateDeleteDropdown();

    Swal.fire({
        title: "Student Deleted",
        text: "The selected student has been removed.",
        icon: "success",
        confirmButtonText: "Okay",
    }).then(() => {
        location.reload();
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
    }).then((result) => {
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
        displayQRCodeError(
            "QR Code Scanner Unavailable",
            "The QR Code scanning library is not loaded."
        );
        return;
    }

    const scanner = new Instascan.Scanner({ video });

    scanner.addListener("scan", (content) => {
        document.getElementById("ssn").value = content;
        document.getElementById("searchForm").dispatchEvent(new Event("submit"));
        scanner.stop();
        video.style.display = "none";
    });

    Instascan.Camera.getCameras()
        .then((cameras) => {
            const backCamera = cameras.find(
                (camera) =>
                    camera.name.toLowerCase().includes("back") ||
                    camera.name.toLowerCase().includes("environment")
            );
            if (backCamera) {
                scanner.start(backCamera);
                // Flip the camera preview
                video.style.transform = "scaleX(1)";
            } else {
                displayQRCodeError(
                    "Back Camera Not Found",
                    "Please use a device with a back-facing camera."
                );
            }
        })
        .catch((error) => {
            console.error("Camera error:", error);
            displayQRCodeError(
                "Camera Error",
                "An error occurred while accessing the camera."
            );
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
