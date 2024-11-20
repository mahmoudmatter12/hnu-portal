  // Function to get query parameters from URL
  function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        subject_name: params.get('subject_name'),
        group: params.get('group'),
        level: params.get('level')
    };
}

// Display the subject details
function displaySubjectDetails() {
    const subjectDetails = getQueryParams();
    const detailsContainer = document.getElementById('subject-details');
    
    detailsContainer.innerHTML = `
        <h1>Subject Details</h1>
        <p><strong>Subject Name:</strong> ${subjectDetails.subject_name}</p>
        <p><strong>Group:</strong> ${subjectDetails.group}</p>
        <p><strong>Level:</strong> ${subjectDetails.level}</p>
    `;
}

// Display succssfully_add card when i click on the add button for 1 second
function displaySuccessCard() {
    const successCard = document.getElementById('successfully_added');
    successCard.style.display = 'flex';
    successCard.style.opacity = '1';
    successCard.style.transform = 'translate(-50%, -50%)';

    // Hide after 1 second
    setTimeout(() => {
        successCard.style.opacity = '0';
        successCard.style.transform = 'translate(-50%, -60%)';
        setTimeout(() => {
            successCard.style.display = 'none';
        }, 500);
    }, 500);

    // Clear the input field
    document.getElementById('ssn').value = '';
}





// Run display function when the page loads
displaySubjectDetails();