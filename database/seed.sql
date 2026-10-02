BEGIN;

-- =========================================================
-- 1. SPECIALTIES
-- =========================================================

INSERT INTO specialties (name, description)
VALUES
    ('Nội tổng quát', 'Khám và tư vấn các bệnh lý nội khoa thường gặp'),
    ('Tim mạch', 'Khám và theo dõi các bệnh lý tim mạch'),
    ('Da liễu', 'Khám và điều trị các bệnh lý về da'),
    ('Nhi khoa', 'Khám và chăm sóc sức khỏe trẻ em')
ON CONFLICT (name) DO NOTHING;


-- =========================================================
-- 2. USERS - DOCTORS
-- =========================================================

INSERT INTO users
    (full_name, email, password_hash, phone, role)
VALUES
    (
        'Nguyễn Minh An',
        'an.doctor@clinic.local',
        'DEMO_HASH_DO_NOT_USE_IN_PRODUCTION',
        '0901000001',
        'doctor'
    ),
    (
        'Trần Thu Hà',
        'ha.doctor@clinic.local',
        'DEMO_HASH_DO_NOT_USE_IN_PRODUCTION',
        '0901000002',
        'doctor'
    ),
    (
        'Lê Quốc Bảo',
        'bao.doctor@clinic.local',
        'DEMO_HASH_DO_NOT_USE_IN_PRODUCTION',
        '0901000003',
        'doctor'
    )
ON CONFLICT (email) DO NOTHING;


-- =========================================================
-- 3. USERS - PATIENT
-- =========================================================

INSERT INTO users
    (full_name, email, password_hash, phone, role)
VALUES
    (
        'Nguyễn Văn Khách',
        'customer@clinic.local',
        'DEMO_HASH_DO_NOT_USE_IN_PRODUCTION',
        '0902000001',
        'patient'
    )
ON CONFLICT (email) DO NOTHING;


-- =========================================================
-- 4. DOCTORS
-- =========================================================

INSERT INTO doctors
    (
        user_id,
        specialty_id,
        qualification,
        experience_years,
        consultation_fee
    )
SELECT
    u.id,
    s.id,
    'Bác sĩ chuyên khoa I',
    8,
    200000
FROM users u
JOIN specialties s
    ON s.name = 'Nội tổng quát'
WHERE u.email = 'an.doctor@clinic.local'
  AND NOT EXISTS (
      SELECT 1
      FROM doctors d
      WHERE d.user_id = u.id
  );


INSERT INTO doctors
    (
        user_id,
        specialty_id,
        qualification,
        experience_years,
        consultation_fee
    )
SELECT
    u.id,
    s.id,
    'Bác sĩ chuyên khoa II',
    10,
    300000
FROM users u
JOIN specialties s
    ON s.name = 'Tim mạch'
WHERE u.email = 'ha.doctor@clinic.local'
  AND NOT EXISTS (
      SELECT 1
      FROM doctors d
      WHERE d.user_id = u.id
  );


INSERT INTO doctors
    (
        user_id,
        specialty_id,
        qualification,
        experience_years,
        consultation_fee
    )
SELECT
    u.id,
    s.id,
    'Bác sĩ chuyên khoa I',
    6,
    250000
FROM users u
JOIN specialties s
    ON s.name = 'Da liễu'
WHERE u.email = 'bao.doctor@clinic.local'
  AND NOT EXISTS (
      SELECT 1
      FROM doctors d
      WHERE d.user_id = u.id
  );


-- =========================================================
-- 5. PATIENT
-- =========================================================

INSERT INTO patients
    (
        user_id,
        date_of_birth,
        gender,
        address
    )
SELECT
    u.id,
    '2006-09-10',
    'female',
    'Bắc Giang'
FROM users u
WHERE u.email = 'customer@clinic.local'
  AND NOT EXISTS (
      SELECT 1
      FROM patients p
      WHERE p.user_id = u.id
  );


-- =========================================================
-- 6. SERVICES
-- =========================================================

INSERT INTO services
    (
        name,
        description,
        duration_minutes,
        price
    )
VALUES
    (
        'Khám tổng quát',
        'Khám và tư vấn sức khỏe tổng quát',
        30,
        200000
    ),
    (
        'Khám tim mạch',
        'Khám và tư vấn các vấn đề về tim mạch',
        45,
        350000
    ),
    (
        'Khám da liễu',
        'Khám và tư vấn các bệnh lý về da',
        30,
        250000
    ),
    (
        'Tư vấn sức khỏe',
        'Tư vấn sức khỏe tổng quát',
        20,
        150000
    )
ON CONFLICT (name) DO NOTHING;


-- =========================================================
-- 7. APPOINTMENT SLOTS
-- =========================================================

-- Doctor 1 - Nội tổng quát
INSERT INTO appointment_slots
    (doctor_id, slot_date, start_time, end_time)
SELECT
    d.id,
    CURRENT_DATE + 1,
    v.start_time,
    v.end_time
FROM doctors d
CROSS JOIN (
    VALUES
        (TIME '08:00', TIME '08:30'),
        (TIME '08:30', TIME '09:00'),
        (TIME '09:00', TIME '09:30'),
        (TIME '09:30', TIME '10:00'),
        (TIME '14:00', TIME '14:30'),
        (TIME '14:30', TIME '15:00')
) AS v(start_time, end_time)
WHERE d.user_id = (
    SELECT id
    FROM users
    WHERE email = 'an.doctor@clinic.local'
)
ON CONFLICT (
    doctor_id,
    slot_date,
    start_time,
    end_time
) DO NOTHING;


-- Doctor 2 - Tim mạch
INSERT INTO appointment_slots
    (doctor_id, slot_date, start_time, end_time)
SELECT
    d.id,
    CURRENT_DATE + 1,
    v.start_time,
    v.end_time
FROM doctors d
CROSS JOIN (
    VALUES
        (TIME '08:00', TIME '08:45'),
        (TIME '08:45', TIME '09:30'),
        (TIME '09:30', TIME '10:15'),
        (TIME '14:00', TIME '14:45'),
        (TIME '14:45', TIME '15:30')
) AS v(start_time, end_time)
WHERE d.user_id = (
    SELECT id
    FROM users
    WHERE email = 'ha.doctor@clinic.local'
)
ON CONFLICT (
    doctor_id,
    slot_date,
    start_time,
    end_time
) DO NOTHING;


-- Doctor 3 - Da liễu
INSERT INTO appointment_slots
    (doctor_id, slot_date, start_time, end_time)
SELECT
    d.id,
    CURRENT_DATE + 2,
    v.start_time,
    v.end_time
FROM doctors d
CROSS JOIN (
    VALUES
        (TIME '08:00', TIME '08:30'),
        (TIME '08:30', TIME '09:00'),
        (TIME '09:00', TIME '09:30'),
        (TIME '14:00', TIME '14:30'),
        (TIME '14:30', TIME '15:00')
) AS v(start_time, end_time)
WHERE d.user_id = (
    SELECT id
    FROM users
    WHERE email = 'bao.doctor@clinic.local'
)
ON CONFLICT (
    doctor_id,
    slot_date,
    start_time,
    end_time
) DO NOTHING;


COMMIT;
