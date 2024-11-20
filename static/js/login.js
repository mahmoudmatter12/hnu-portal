document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('/Data/users.json')
            .then(response => response.json())
            .then(users => {
                const user = users.find(user => user.name === username && user.pass === password);

                if (user) {
                    sessionStorage.setItem('currentUser', JSON.stringify(user));
                    window.location.href = '/templates/profile.html';
                } else {
                    Swal.fire({
                        icon: "error",
                        title: "Login Failed!",
                        text: "Invalid username or password. Please try again. or contact the administrator for assistance.",
                      }).then((result) => {
                        if (result.isConfirmed) {
                            document.getElementById('username').value = '';
                            document.getElementById('password').value = '';
                        }
                    });
                }
            });
    });

    function parseCSV(data) {
        const lines = data.split('\n');
        const result = [];
        const headers = lines[0].split(',');

        for (let i = 1; i < lines.length; i++) {
            const obj = {};
            const currentline = lines[i].split(',');

            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
        return result;
    }
});

