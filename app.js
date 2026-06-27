// Global Variables
let currentLocation = null;
let map = null;
let markers = {
    classrooms: [],
    student: null
};
let students = [];
let classrooms = [];
let attendanceRecords = [];
let selectedStudent = null;
let selectedClassroom = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    initializeMap();
    startGPSTracking();
});

// ==================== DATA LOADING ====================
async function loadData() {
    try {
        // Load students
        const studentsRes = await fetch('students.json');
        students = await studentsRes.json();
        students = students.students || students;
        populateStudentSelect();

        // Load classrooms
        const classroomsRes = await fetch('classrooms.json');
        classrooms = await classroomsRes.json();
        classrooms = classrooms.classrooms || classrooms;
        populateClassroomSelects();

        // Load attendance
        const attendanceRes = await fetch('attendance.json');
        attendanceRecords = await attendanceRes.json();
        attendanceRecords = attendanceRecords.attendanceRecords || attendanceRecords;
    } catch (error) {
        console.error('Error loading data:', error);
        showNotification('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    }
}

function populateStudentSelect() {
    const select = document.getElementById('studentSelect');
    select.innerHTML = '<option value="">-- เลือกชื่อของคุณ --</option>';
    students.forEach(student => {
        const option = document.createElement('option');
        option.value = student.id;
        option.textContent = `${student.name} (${student.studentId})`;
        select.appendChild(option);
    });
    select.addEventListener('change', (e) => {
        selectedStudent = students.find(s => s.id === e.target.value);
    });
}

function populateClassroomSelects() {
    // Student panel
    const studentSelect = document.getElementById('classroomSelect');
    studentSelect.innerHTML = '<option value="">-- เลือกห้องเรียน --</option>';
    classrooms.forEach(classroom => {
        const option = document.createElement('option');
        option.value = classroom.id;
        option.textContent = classroom.name;
        studentSelect.appendChild(option);
    });
    studentSelect.addEventListener('change', (e) => {
        selectedClassroom = classrooms.find(c => c.id === e.target.value);
        updateMapMarkers();
    });

    // Teacher panel
    const teacherSelect = document.getElementById('teacherClassroomSelect');
    teacherSelect.innerHTML = '<option value="">-- เลือกห้องเรียน --</option>';
    classrooms.forEach(classroom => {
        const option = document.createElement('option');
        option.value = classroom.id;
        option.textContent = classroom.name;
        teacherSelect.appendChild(option);
    });
}

// ==================== GPS & LOCATION ====================
function startGPSTracking() {
    if ('geolocation' in navigator) {
        // Watch position for continuous updates
        navigator.geolocation.watchPosition(
            (position) => {
                currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: new Date()
                };
                updateLocationDisplay();
                updateMapMarkers();
                updateStudentStatus();
            },
            (error) => {
                console.error('GPS Error:', error);
                showNotification('⚠️ ไม่สามารถรับตำแหน่ง GPS ได้', 'error');
            },
            { 
                enableHighAccuracy: true, 
                timeout: 10000, 
                maximumAge: 0 
            }
        );
    } else {
        showNotification('❌ เบราว์เซอร์ของคุณไม่รองรับ GPS', 'error');
    }
}

function refreshLocation() {
    startGPSTracking();
    showNotification('🔄 กำลังอัพเดตตำแหน่ง...', 'info');
}

function updateLocationDisplay() {
    if (currentLocation) {
        document.getElementById('currentLat').textContent = currentLocation.latitude.toFixed(6);
        document.getElementById('currentLng').textContent = currentLocation.longitude.toFixed(6);
        document.getElementById('currentAccuracy').textContent = 
            Math.round(currentLocation.accuracy) + ' เมตร';
        document.getElementById('lastUpdate').textContent = 
            currentLocation.timestamp.toLocaleTimeString('th-TH');
    }
}

// ==================== MAP INITIALIZATION ====================
function initializeMap() {
    const defaultLat = 14.7995;
    const defaultLng = 100.6534;
    
    map = L.map('map').setView([defaultLat, defaultLng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 19
    }).addTo(map);

    // Add classroom markers
    updateMapMarkers();
}

function updateMapMarkers() {
    // Clear existing markers
    markers.classrooms.forEach(marker => map.removeLayer(marker));
    markers.classrooms = [];
    if (markers.student) {
        map.removeLayer(markers.student);
        markers.student = null;
    }

    // Add selected classroom marker
    if (selectedClassroom) {
        const greenIcon = L.icon({
            iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green" width="24" height="24"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E',
            iconSize: [30, 30]
        });
        const marker = L.marker([selectedClassroom.latitude, selectedClassroom.longitude], { icon: greenIcon })
            .addTo(map)
            .bindPopup(`<strong>${selectedClassroom.name}</strong><br>รัศมี: ${selectedClassroom.radius}ม.`);
        markers.classrooms.push(marker);
    } else {
        // Show all classrooms
        classrooms.forEach(classroom => {
            const greenIcon = L.icon({
                iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green" width="20" height="20"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E',
                iconSize: [25, 25]
            });
            const marker = L.marker([classroom.latitude, classroom.longitude], { icon: greenIcon })
                .addTo(map)
                .bindPopup(`<strong>${classroom.name}</strong>`);
            markers.classrooms.push(marker);
        });
    }

    // Add student location marker
    if (currentLocation) {
        const blueIcon = L.icon({
            iconUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="blue" width="24" height="24"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3C/svg%3E',
            iconSize: [30, 30]
        });
        markers.student = L.marker([currentLocation.latitude, currentLocation.longitude], { icon: blueIcon })
            .addTo(map)
            .bindPopup('ตำแหน่งของคุณ');
    }

    // Fit map bounds
    if (selectedClassroom && currentLocation) {
        const bounds = L.latLngBounds([
            [selectedClassroom.latitude, selectedClassroom.longitude],
            [currentLocation.latitude, currentLocation.longitude]
        ]);
        map.fitBounds(bounds, { padding: [50, 50] });
    }
}

// ==================== CHECK-IN LOGIC ====================
function updateStudentStatus() {
    if (!currentLocation || !selectedClassroom) {
        document.getElementById('studentStatus').textContent = '⚠️ กรุณาเลือกห้องเรียนและเปิด GPS';
        document.getElementById('studentStatus').className = 'status-box status-warning';
        return;
    }

    const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        selectedClassroom.latitude,
        selectedClassroom.longitude
    );

    if (distance <= selectedClassroom.radius) {
        document.getElementById('studentStatus').textContent = 
            `✓ อยู่ในเขตห้องเรียน (ระยะห่าง: ${Math.round(distance)}เมตร)`;
        document.getElementById('studentStatus').className = 'status-box status-success';
        document.getElementById('checkInBtn').disabled = false;
    } else {
        document.getElementById('studentStatus').textContent = 
            `✗ ไม่อยู่ในเขตห้องเรียน (ระยะห่าง: ${Math.round(distance)}เมตร)`;
        document.getElementById('studentStatus').className = 'status-box status-error';
        document.getElementById('checkInBtn').disabled = true;
    }
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

async function performCheckIn() {
    if (!selectedStudent) {
        showNotification('❌ กรุณาเลือกชื่อของคุณ', 'error');
        return;
    }
    if (!selectedClassroom) {
        showNotification('❌ กรุณาเลือกห้องเรียน', 'error');
        return;
    }
    if (!currentLocation) {
        showNotification('❌ ไม่สามารถรับตำแหน่ง GPS', 'error');
        return;
    }

    const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        selectedClassroom.latitude,
        selectedClassroom.longitude
    );

    if (distance > selectedClassroom.radius) {
        showNotification(`❌ ไม่อยู่ในเขตห้องเรียน (ระยะห่าง: ${Math.round(distance)}เมตร)`, 'error');
        return;
    }

    // Create check-in record
    const checkInRecord = {
        id: 'att' + Date.now(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        studentCode: selectedStudent.studentId,
        classroomId: selectedClassroom.id,
        classroomName: selectedClassroom.name,
        checkInTime: new Date().toISOString(),
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        distance: distance,
        accuracy: currentLocation.accuracy,
        status: 'checked-in'
    };

    // Add to local records
    attendanceRecords.push(checkInRecord);
    
    // Update localStorage
    localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));

    showNotification('✅ เช็คอินสำเร็จ!', 'success');
    document.getElementById('checkInBtn').disabled = true;
    updateStudentHistory();
}

function updateStudentHistory() {
    if (!selectedStudent) return;

    const studentRecords = attendanceRecords.filter(r => r.studentId === selectedStudent.id);
    const historyDiv = document.getElementById('studentHistory');

    if (studentRecords.length === 0) {
        historyDiv.innerHTML = '<p class="empty-message">ยังไม่มีประวัติการเช็คอิน</p>';
        return;
    }

    historyDiv.innerHTML = studentRecords.map(record => `
        <div class="history-item">
            <div class="history-header">
                <strong>${record.classroomName}</strong>
                <span class="history-time">${new Date(record.checkInTime).toLocaleString('th-TH')}</span>
            </div>
            <div class="history-details">
                <span>ระยะห่าง: ${Math.round(record.distance)}เมตร</span>
                <span>ความแม่นยำ: ${Math.round(record.accuracy)}เมตร</span>
            </div>
        </div>
    `).join('');
}

// ==================== TEACHER DASHBOARD ====================
async function loadAttendanceData() {
    const classroomId = document.getElementById('teacherClassroomSelect').value;
    if (!classroomId) {
        document.getElementById('attendanceTableBody').innerHTML = 
            '<tr><td colspan="6" class="empty-message">กรุณาเลือกห้องเรียน</td></tr>';
        return;
    }

    const classroom = classrooms.find(c => c.id === classroomId);
    const classStudents = students;
    const checkedInRecords = attendanceRecords.filter(r => r.classroomId === classroomId);

    // Update stats
    const checkedInCount = checkedInRecords.length;
    const totalCount = classStudents.length;
    const absentCount = totalCount - checkedInCount;
    const percentage = Math.round((checkedInCount / totalCount) * 100);

    document.getElementById('totalStudents').textContent = totalCount;
    document.getElementById('checkedInCount').textContent = checkedInCount;
    document.getElementById('absentCount').textContent = absentCount;
    document.getElementById('attendancePercentage').textContent = percentage + '%';

    // Update table
    const tbody = document.getElementById('attendanceTableBody');
    const rows = classStudents.map((student, index) => {
        const record = checkedInRecords.find(r => r.studentId === student.id);
        const status = record ? `✓ เช็คอินแล้ว` : `✗ ยังไม่เช็คอิน`;
        const statusClass = record ? 'status-checked-in' : 'status-absent';
        const time = record ? new Date(record.checkInTime).toLocaleString('th-TH') : '-';
        const distance = record ? `${Math.round(record.distance)}` : '-';

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${student.studentId}</td>
                <td>${student.name}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
                <td>${time}</td>
                <td>${distance}</td>
            </tr>
        `;
    }).join('');

    tbody.innerHTML = rows || '<tr><td colspan="6" class="empty-message">ไม่มีข้อมูล</td></tr>';
}

function exportAttendance() {
    const classroomId = document.getElementById('teacherClassroomSelect').value;
    if (!classroomId) {
        showNotification('❌ กรุณาเลือกห้องเรียน', 'error');
        return;
    }

    const classroom = classrooms.find(c => c.id === classroomId);
    const checkedInRecords = attendanceRecords.filter(r => r.classroomId === classroomId);

    let csv = 'เลขที่,รหัสนักศึกษา,ชื่อ - นามสกุล,สถานะ,เวลาเช็คอิน,ระยะห่าง(เมตร)\n';
    
    students.forEach((student, index) => {
        const record = checkedInRecords.find(r => r.studentId === student.id);
        const status = record ? 'เช็คอินแล้ว' : 'ยังไม่เช็คอิน';
        const time = record ? new Date(record.checkInTime).toLocaleString('th-TH') : '-';
        const distance = record ? Math.round(record.distance) : '-';
        csv += `${index + 1},"${student.studentId}","${student.name}","${status}","${time}","${distance}"\n`;
    });

    downloadCSV(csv, `attendance_${classroom.name}_${new Date().toISOString().split('T')[0]}.csv`);
    showNotification('✅ ส่งออก CSV สำเร็จ', 'success');
}

function downloadCSV(csv, filename) {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}

// ==================== UI INTERACTIONS ====================
function switchTab(tab) {
    const studentPanel = document.getElementById('studentPanel');
    const teacherPanel = document.getElementById('teacherPanel');
    const studentTabBtn = document.getElementById('studentTabBtn');
    const teacherTabBtn = document.getElementById('teacherTabBtn');

    if (tab === 'student') {
        studentPanel.classList.add('active');
        teacherPanel.classList.remove('active');
        studentTabBtn.classList.add('active');
        teacherTabBtn.classList.remove('active');
    } else {
        studentPanel.classList.remove('active');
        teacherPanel.classList.add('active');
        studentTabBtn.classList.remove('active');
        teacherTabBtn.classList.add('active');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Load stored attendance records on startup
window.addEventListener('load', () => {
    const stored = localStorage.getItem('attendanceRecords');
    if (stored) {
        attendanceRecords = JSON.parse(stored);
    }
});
