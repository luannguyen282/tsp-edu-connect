# TSPEC UI Surface Map

Source reference: `docs/reference/tspec-prototype.html`.

This is a coverage map, not a second business specification. If prototype behavior conflicts with Business Rules, Business Rules win.

## Authentication and context

- Login
- First-login password confirmation: keep current password / change password
- Tenant selection
- Workspace selection
- Context switch tenant/workspace

## SYSTEM_ADMIN

- Tổng quan hệ thống
- Tổ chức
- Bảo mật & nhật ký

## TENANT_ADMIN

- Tổng quan
- Trung tâm
- Tầng & phòng
- Người dùng
- Môn học
- Lớp học
- Lịch giảng dạy
- Ngày nghỉ & lễ
- Điểm danh
- Học bù
- Học phí
- Quản lý giáo viên
- Đánh giá
- Vai trò & quyền
- Nhật ký hệ thống

## TEACHER

- Tổng quan
- Lịch của tôi
- Lớp của tôi
- Điểm danh
- Học bù
- Đánh giá của tôi
- Giờ dạy của tôi

## STUDENT

- Tổng quan
- Lịch học
- Tự điểm danh
- Lớp của em
- Học bù
- Đánh giá khóa học

## PARENT

- Tổng quan
- Lớp học mới
- Lớp học của con
- Lịch của con
- Chuyên cần
- Học bù
- Học phí

## Coverage rule

A screen is not considered implemented merely because its route exists. The happy-path action represented in the prototype must work against real API/database data for the baseline scenario covered by its wave.
