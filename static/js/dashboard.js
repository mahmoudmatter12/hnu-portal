let users = [];
var students = [];

document.addEventListener('DOMContentLoaded', function () {
    fetch('/Data/users.json')
        .then(response => response.json())
        .then(Users => {
            users = Users;
            
        });

    fetch('/Data/students.json')
        .then(response => response.json())
        .then(Students => {
            students = Students;
            numbers();
            displayusers();
        });
});

function numbers() {
    document.getElementById('studentsnum').innerText = students.length;
    document.getElementById('usersnum').innerText = users.length;
    document.getElementById('level1num').innerText = students.filter(student => student.level === "1").length;
    document.getElementById('level2num').innerText = students.filter(student => student.level === '2').length;
}

function displayusers() {
    const table = document.getElementById('usersTable');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Id</th>
                <th>Username</th>
                <th>Role</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    `;

    const tbody = table.querySelector('tbody');

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.role}</td>
        `;
        tbody.appendChild(row);
    });
}
