// Temporary storage for attendance data and headers
let attendanceData = [];
let headers = [];

document
  .getElementById("searchForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    const ssn = document.getElementById("ssn").value;
    searchStudent(ssn);
  });

// Load user role from session storage
const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

function getURLParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    level: params.get("level"),
    group: params.get("group"),
  };
}

function displayAllreadyAdded() {
  const successCard = document.getElementById("alreadyAttendedMessage");
  successCard.style.display = "flex";
  successCard.style.opacity = "1";
  successCard.style.transform = "translate(-50%, -50%)";

  // Hide after 1 second
  setTimeout(() => {
    successCard.style.opacity = "0";
    successCard.style.transform = "translate(-50%, -60%)";
    setTimeout(() => {
      successCard.style.display = "none";
    }, 500);
  }, 500);
}

async function searchStudent(ssn) {
  // Hide the "already attended" message each time a new search is attempted
  document.getElementById("alreadyAttendedMessage").style.display = "none";

  // Check if SSN already exists in attendanceData
  const alreadyExists = attendanceData.some((row) => row[0] === ssn);
  if (alreadyExists) {
    // Show the warning message if the student has already attended
    displayAllreadyAdded();
    return;
  }

  try {
    // Fetch the JSON file
    const response = await fetch("/Data/students.json");
    const students = await response.json();

    // Extract specific headers from the first student object
    if (attendanceData.length === 0 && students.length > 0) {
      headers = ["group", "section", "level", "name", "ssn", "student_id"];
    }

    // Find the student based on SSN
    const studentData = students.find((student) => student.ssn === ssn);

    const resultDiv = document.getElementById("studentInfo");
    resultDiv.innerHTML = "";

    if (studentData) {
      // console.log('Student found:', studentData);
      // Get level and group from URL parameters
      const { level, group } = getURLParams();
      const studentLevel = studentData.level; // Access the "level" property directly
      const studentGroup = studentData.group_number; // Access the "group" property directly
      // !
      if (currentUser.role === "prof") {
      }
      // !

      if (attendanceData.some((student) => student.ssn === ssn)) {
        displayAllreadyAdded();
        return;
      }

      if (level && group && studentLevel == level && studentGroup == group) {
        // If levels and groups match, add to attendanceData
        addStudentToAttendance(studentData);
        displaySuccessCard();
      } else {
        // Show student info and prompt professor to confirm addition
        resultDiv.innerHTML = `<h2>Student Information</h2>`;

        resultDiv.innerHTML = `
                    <div class="card shadow-lg mb-4" style="max-width: 500px; margin: auto;">
                        <div class="card-body">
                            <h2 class="card-title text-center">Student Information</h2>
                            <p><strong>Name:</strong> ${studentData.name}</p>
                            <p><strong>Student ID:</strong> ${studentData.student_id}</p>
                            <p><strong>Group:</strong> ${studentData.group_number}</p>
                            <p><strong>Section:</strong> ${studentData.section}</p>
                            <p><strong>Level:</strong> ${studentData.level}</p>
                            <p><strong>SSN:</strong> ${studentData.ssn}</p>
                            <hr>
    
                            <p class="alert alert-warning" role="alert">
                                Level and group do not match. Do you want to add this student to the attendance anyway?
                            </p>
    
                            <div class="d-flex justify-content-center">
                                <button class="btn btn-outline-success me-3" id="confirmAddBtn">Add</button>
                                <button class="btn btn-outline-danger" onclick="clearStudentInfo()">Cancel</button>
                            </div>
                        </div>
                    </div>
                `;

        // Add event listener for the "Add" button
        document
          .getElementById("confirmAddBtn")
          .addEventListener("click", function () {
            addStudentToAttendance(studentData);
            displaySuccessCard();
          });
      }
    } else {
      resultDiv.innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Student with SSN <strong>${ssn}</strong> not found in the database.
                </div>
            `;
      document.getElementById("ssn").value = "";
    }
  } catch (error) {
    console.error("Error fetching or parsing JSON:", error);
  }
}

function addStudentToAttendance(studentData) {
  // Append the data to attendanceData for later download
  attendanceData.push(studentData);

  // Update attendance count display
  updateAttendanceCount();

  // Clear the student info section
  clearStudentInfo();
}

function clearStudentInfo() {
  document.getElementById("studentInfo").innerHTML = "";
  document.getElementById("ssn").value = "";
}

function updateAttendanceCount() {
  // Display the current number of students in attendanceData
  document.getElementById("attendanceCount").textContent =
    attendanceData.length;
}

function downloadAndClear() {
  if (attendanceData.length === 0) {
    alert("No data to download");
    return;
  }

  // Create a new array that only includes the desired fields for each student
  const filteredAttendanceData = attendanceData.map((student) => [
    student.name,
    student.group,
    student.section,
    student.level,
    student.student_id,
  ]);

  // Add headers for the selected fields
  const filteredHeaders = ["Name", "Group", "Section", "Level", "Student ID"];

  // Create a workbook and add filtered attendance data with headers
  const wb = XLSX.utils.book_new();
  const worksheetData = [filteredHeaders].concat(filteredAttendanceData); // Add filtered headers as the first row
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  // Generate XLSX and trigger download
  XLSX.writeFile(wb, "attendance.xlsx");

  // Clear attendance data for new entries
  attendanceData = [];
  updateAttendanceCount(); // Reset the counter display
  alert("Data downloaded and cleared");
}

function Clear() {
  document.getElementById("ssn").value = "";
  document.getElementById("studentInfo").innerHTML = "";
  document.getElementById("attendanceCount").innerHTML = 0;
  document.getElementById("alreadyAttendedMessage").style.display = "none";
  attendanceData = [];
}

function Attended_Students() {
  const { level, group } = getURLParams();
  const attendedStudentsInfo = document.getElementById(
    "attended_students_info"
  );
  attendedStudentsInfo.innerHTML = ""; // Clear previous content

  attendanceData.forEach((student, index) => {
    const studentCard = document.createElement("div");
    studentCard.className = "card shadow-lg mb-4";
    studentCard.style.maxWidth = "500px";
    studentCard.style.margin = "auto";
    studentCard.innerHTML = `
    <div class="card-body d-flex justify-content-between align-items-center ${student.level !== level || student.group_number !== group ? 'alert alert-warning' : ''}">
        <div>
            <div class="mb-2">
                <strong>Student Name:</strong> ${student.name}
            </div>
            <div class="mb-2">
                <strong>Student ID:</strong> ${student.student_id}
            </div>
            <div class="d-flex flex-wrap">
                <div class="me-3 mb-2">
                    <strong>Group:</strong> ${student.group_number}
                </div>
                <div class="me-3 mb-2">
                    <strong>Section:</strong> ${student.section}
                </div>
                <div class="me-3 mb-2">
                    <strong>Level:</strong> ${student.level}
                </div>
            </div>
        </div>
        <button class="btn btn-outline-danger" onclick="removeStudent(${index})">delete</button>
    </div>
`;

    attendedStudentsInfo.appendChild(studentCard); // Append student card to the modal body
  });
}

// Function to remove a student from the attendance list
function removeStudent(index) {
  attendanceData.splice(index, 1); // Remove student from the array
  updateAttendanceCount(); // Update the attendance count
  Attended_Students(); // Re-render the students
}

// Event listener for the button to show the modal
document
  .querySelector('button[data-bs-target="#display"]')
  .addEventListener("click", function () {
    Attended_Students(); // Populate the modal with student data when it's opened
  });

// QR Code Reader handling
document
  .getElementById("qr-reader-link")
  .addEventListener("click", function (event) {
    event.preventDefault();
    const video = document.getElementById("preview");
    video.style.display = "block";

    if (typeof Instascan === "undefined") {
      console.error("Instascan library is not loaded.");
      alert(
        "QR Code scanning is not available. Please check if the Instascan library is loaded."
      );
      video.style.display = "none";
      return;
    }

    let scanner = new Instascan.Scanner({
      video: document.getElementById("preview"),
    });
    scanner.addListener("scan", function (content) {
      document.getElementById("ssn").value = content;
      document.getElementById("searchForm").dispatchEvent(new Event("submit"));
      document.getElementById("ssn").value = "";
      video.style.display = "none";
    });

    Instascan.Camera.getCameras()
      .then(function (cameras) {
        if (cameras.length > 0) {
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
            alert(
              "Back camera not found. Please use a device with a back camera."
            );
            video.style.display = "none";
          }
        } else {
          alert(
            "No cameras found or access denied. Please allow camera access."
          );
          video.style.display = "none";
        }
      })
      .catch(function (e) {
        console.error("Error starting camera:", e);
        video.style.display = "none";
      });
  });
