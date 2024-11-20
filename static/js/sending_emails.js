document.getElementById("emailForm").addEventListener("submit", function (e) {
  e.preventDefault();

  document.getElementById("loading").style.display = "block"; // Show the spinner

  const templateParams = {
    to_email: document.getElementById("email").value,
    subject: document.getElementById("subject").value,
    message: document.getElementById("message").value,
  };

  emailjs.send("service_983cppw", "template_npzrw6o", templateParams)
    .then(
      (response) => {
        alert("Email sent successfully!");
        document.getElementById("loading").style.display = "none"; // Hide spinner
      },
      (error) => {
        alert("Failed to send email.");
        document.getElementById("loading").style.display = "none"; // Hide spinner
      }
    );
});

Swal.fire({
  icon: "success",
  title: "Email Sent!",
  text: "Your email was sent successfully.",
});
Swal.fire({
  icon: "error",
  title: "Oops!",
  text: "Failed to send email. Please try again.",
});
