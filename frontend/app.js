const API_BASE = "/api";

const serviceSelect = document.getElementById("service");
const doctorSelect = document.getElementById("doctor");
const dateInput = document.getElementById("appointment-date");
const slotsContainer = document.getElementById("slots");
const bookingButton = document.getElementById("booking-btn");
const message = document.getElementById("message");
const confirmation = document.getElementById("confirmation");
const confirmationContent = document.getElementById("confirmation-content");

let selectedSlot = null;
let services = [];
let doctors = [];

// =========================
// Load services
// =========================
async function loadServices() {
    try {
        const response = await fetch(`${API_BASE}/services`);

        if (!response.ok) {
            throw new Error("Không thể tải danh sách dịch vụ");
        }

        services = await response.json();

        serviceSelect.innerHTML =
            '<option value="">-- Chọn dịch vụ --</option>';

        services.forEach(service => {
            const option = document.createElement("option");

            option.value = service.id;
            option.textContent =
                `${service.name} - ${Number(service.price).toLocaleString("vi-VN")}đ`;

            serviceSelect.appendChild(option);
        });

    } catch (error) {
        serviceSelect.innerHTML =
            '<option value="">Không thể tải dịch vụ</option>';

        showMessage(error.message, "error");
    }
}

// =========================
// Load doctors
// =========================
async function loadDoctors() {
    try {
        const response = await fetch(`${API_BASE}/doctors`);

        if (!response.ok) {
            throw new Error("Không thể tải danh sách bác sĩ");
        }

        doctors = await response.json();

        doctorSelect.innerHTML =
            '<option value="">-- Chọn dịch vụ trước --</option>';

    } catch (error) {
        doctorSelect.innerHTML =
            '<option value="">Không thể tải bác sĩ</option>';

        showMessage(error.message, "error");
    }
}

function filterDoctorsByService() {
    const serviceId = serviceSelect.value;

    selectedSlot = null;

    slotsContainer.innerHTML =
        '<p class="muted">Vui lòng chọn bác sĩ và ngày khám.</p>';

    doctorSelect.innerHTML =
        '<option value="">-- Chọn bác sĩ --</option>';

    if (!serviceId) {
        doctorSelect.innerHTML =
            '<option value="">-- Chọn dịch vụ trước --</option>';
        return;
    }

    const serviceToSpecialty = {
        "1": "1",
        "2": "2",
        "3": "3",
        "4": "4"
    };

    const specialtyId = serviceToSpecialty[serviceId];

    const filteredDoctors = doctors.filter(
        doctor => String(doctor.specialty_id) === specialtyId
    );

    if (filteredDoctors.length === 0) {
        doctorSelect.innerHTML =
            '<option value="">Không có bác sĩ phù hợp</option>';
        return;
    }

    filteredDoctors.forEach(doctor => {
        const option = document.createElement("option");

        option.value = doctor.id;
        option.textContent =
            `${doctor.full_name} - ${doctor.specialty_name}`;

        doctorSelect.appendChild(option);
    });
}

// =========================
// Load slots
// =========================
async function loadSlots() {
    const doctorId = doctorSelect.value;
    const date = dateInput.value;

    selectedSlot = null;

    if (!doctorId || !date) {
        slotsContainer.innerHTML =
            '<p class="muted">Vui lòng chọn bác sĩ và ngày khám.</p>';
        return;
    }

    slotsContainer.innerHTML =
        '<p class="muted">Đang tải khung giờ...</p>';

    try {
        const response = await fetch(
            `${API_BASE}/doctors/${doctorId}/slots?date=${date}`
        );

        if (!response.ok) {
            throw new Error("Không thể tải khung giờ");
        }

        const slots = await response.json();

        if (slots.length === 0) {
            slotsContainer.innerHTML =
                '<p class="muted">Không còn khung giờ phù hợp.</p>';
            return;
        }

        slotsContainer.innerHTML = "";

        slots.forEach(slot => {
            const button = document.createElement("button");

            button.type = "button";
            button.className = "slot";

            button.textContent =
                `${slot.start_time.slice(0, 5)} - ${slot.end_time.slice(0, 5)}`;

            button.addEventListener("click", () => {
                document
                    .querySelectorAll(".slot")
                    .forEach(item => item.classList.remove("selected"));

                button.classList.add("selected");

                selectedSlot = slot;
            });

            slotsContainer.appendChild(button);
        });

    } catch (error) {
        slotsContainer.innerHTML =
            '<p class="muted">Không thể tải khung giờ.</p>';

        showMessage(error.message, "error");
    }
}

// =========================
// Booking
// =========================
async function createAppointment() {
    const serviceId = serviceSelect.value;
    const doctorId = doctorSelect.value;
    const patientName =
        document.getElementById("patient-name").value.trim();
    const patientPhone =
        document.getElementById("patient-phone").value.trim();
    const patientEmail =
        document.getElementById("patient-email").value.trim();
    const reason =
        document.getElementById("reason").value.trim();

    if (!serviceId || !doctorId) {
        showMessage("Vui lòng chọn dịch vụ và bác sĩ.", "error");
        return;
    }

    if (!selectedSlot) {
        showMessage("Vui lòng chọn khung giờ.", "error");
        return;
    }

    if (!patientName || !patientPhone || !patientEmail) {
        showMessage("Vui lòng nhập đầy đủ thông tin khách hàng.", "error");
        return;
    }

    bookingButton.disabled = true;
    bookingButton.textContent = "Đang xử lý...";

    try {
        /*
         * Hiện tại backend đang sử dụng patient_id = 1
         * cho patient mẫu trong database.
         *
         * Bước tiếp theo sẽ bổ sung API tạo patient để
         * frontend có thể lưu đúng thông tin khách hàng.
         */
        const response = await fetch(`${API_BASE}/appointments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                patient_id: 1,
                doctor_id: Number(doctorId),
                service_id: Number(serviceId),
                slot_id: Number(selectedSlot.id),
                reason: reason || "Đặt lịch khám"
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || data.message || "Đặt lịch thất bại");
        }

        showMessage("Đặt lịch thành công!", "success");

        confirmation.classList.remove("hidden");

        confirmationContent.innerHTML = `
            <p><strong>Mã lịch hẹn:</strong> ${data.appointment.id}</p>
            <p><strong>Trạng thái:</strong> Chờ xác nhận</p>
            <p><strong>Khách hàng:</strong> ${patientName}</p>
            <p><strong>Số điện thoại:</strong> ${patientPhone}</p>
            <p><strong>Email:</strong> ${patientEmail}</p>
            <p><strong>Khung giờ:</strong>
                ${selectedSlot.start_time.slice(0, 5)}
                -
                ${selectedSlot.end_time.slice(0, 5)}
            </p>
        `;

        await loadSlots();

    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        bookingButton.disabled = false;
        bookingButton.textContent = "Xác nhận đặt lịch";
    }
}

// =========================
// Message
// =========================
function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

// =========================
// Events
// =========================
serviceSelect.addEventListener("change", filterDoctorsByService);
doctorSelect.addEventListener("change", loadSlots);
dateInput.addEventListener("change", loadSlots);
bookingButton.addEventListener("click", createAppointment);

// =========================
// Initial load
// =========================
loadServices();
loadDoctors();

