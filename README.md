
# Clinic Appointment System

Hệ thống đặt lịch hẹn phòng khám trực tuyến.

## 1. Giới thiệu

Clinic Appointment System là hệ thống hỗ trợ khách hàng đặt lịch khám trực tuyến theo dịch vụ, bác sĩ và khung giờ.

Hệ thống cho phép:

- Xem danh sách dịch vụ khám.
- Xem danh sách bác sĩ.
- Chọn ngày và khung giờ khám.
- Nhập thông tin khách hàng.
- Đặt lịch hẹn.
- Lưu lịch hẹn vào PostgreSQL.
- Theo dõi trạng thái hoạt động của hệ thống.
- Thu thập và truy vấn log.
- Giám sát tài nguyên hệ thống.

## 2. Công nghệ sử dụng

### Application

- Node.js
- Express.js
- HTML
- CSS
- JavaScript

### Database

- PostgreSQL
- pgAdmin

### Reverse Proxy

- Nginx

### Monitoring

- Prometheus
- Grafana
- cAdvisor
- Node Exporter
- PostgreSQL Exporter
- Blackbox Exporter

### Logging

- Loki
- Promtail
- LogQL

### Deployment

- Docker
- Docker Compose
- GitHub

## 3. Kiến trúc hệ thống

```text
                    Client / Browser
                           |
                           v
                    +-------------+
                    |    Nginx    |
                    |    :8080    |
                    +------+------+
                           |
              +------------+------------+
              |                         |
              v                         v
        Frontend static             Backend API
                                      Node.js
                                      Express
                                        |
                                        v
                                  PostgreSQL
                                   :5432
                                        |
                                      pgAdmin

Monitoring:

Node Exporter --------\
cAdvisor --------------\
PostgreSQL Exporter ----> Prometheus ---> Grafana
Blackbox Exporter ------/

Logging:

Docker Containers ---> Promtail ---> Loki ---> LogQL
## 10. Hardening

Các biện pháp bảo mật đã triển khai:

- Backend chạy bằng user không phải root.
- PostgreSQL không expose trực tiếp ra mạng LAN.
- Backend chỉ bind trên localhost.
- Các service sử dụng Docker network riêng.
- Nginx cấu hình security headers.
- File `.env` không được commit lên GitHub.
- `.env.example` được sử dụng để mô tả cấu hình môi trường.

## 11. Chạy hệ thống

Clone repository:

```bash
git clone https://github.com/forkhanhhoa2311/dtc245280015-clinic-appointment.git
cd dtc245280015-clinic-appointment
