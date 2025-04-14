# 🏫 HNU-PORTAL  


```markdown
**A Vanilla JS University Management System**  
**👉 Live Demo & Case Study:** [Explore on my Portfolio](https://matter-portofilio.vercel.app/#projects)  
```

![Dashboard Preview](/static/images/screenshot-dashboard.png)  
*Role-based dashboard built with pure HTML/CSS/JS*


### 🚪 User Authentication
- Secure login system with `sessionStorage` persistence
- Role-based access control (Admin, OC, Faculty)
- SweetAlert2 for intuitive error handling

### 📚 Academic Management
- **Dynamic Time Table**:
  - Auto-detects current day (Mon-Sun)
  - Fetches schedules from JSON files
  - Visual indicators for free slots
- **Course Management**:
  - View assigned courses
  - Track academic schedule
- **Assignment System**:
  - Submit course assignments
  - Track submission status

### 📊 Student Portal
- **Attendance Tracking**:
  - QR code scanning (Instascan.js)
  - Manual SSN entry
  - Excel export functionality
- **Grade Management**:
  - View course grades
  - Track academic progress
- **Profile Management**:
  - Update personal information
  - Role-specific dashboard views

### 🎪 Event Management (OC Role)
- Volunteer coordination
- Attendance tracking
- Data export capabilities

---

## 🛠️ Technical Implementation

### 🔧 Core Architecture
```javascript
// Example: Dynamic timetable loading
fetch(`/Data/time_table/${getCurrentDay()}.json`)
  .then(response => response.json())
  .then(data => populateTimetable(data));
```

### 📦 Key Technologies
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Libraries**:
  - SweetAlert2 for interactive alerts
  - Instascan for QR code processing
  - SheetJS for Excel exports
  - Bootstrap 5 for responsive layouts
---

## 🎓 Key Learnings
✅ **Vanilla JS Optimization**  
- Efficient DOM manipulation techniques  
- Event delegation patterns  
- Modular code organization  

✅ **Performance Enhancements**  
- Debounced input handlers (300ms)  
- Batch DOM updates with DocumentFragment  
- Lazy loading of JSON data  

✅ **User Experience**  
- Role-based interface adaptation  
- Progressive disclosure of features  
- Consistent feedback mechanisms  

---

## 🚀 Getting Started
1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```
2. Open `index.html` in a browser (Live Server recommended)

---

## 🔮 Future Roadmap
- Implement IndexedDB for offline support
- Add Web Workers for data processing
- Develop REST API integration
- Enhance accessibility features

---

## 📜 License  
This project is licensed under the **HNU-SU License**.

**🔗 Explore the full case study:** [My Portfolio](https://matter-portofilio.vercel.app/#projects)
