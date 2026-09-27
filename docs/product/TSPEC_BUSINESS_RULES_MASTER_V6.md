# TSPEC — BUSINESS RULES MASTER V6

**TSP EduConnect (TSPEC) — Center-first baseline**  
**Phạm vi:** Multi-tenant education center operations, identity/workspaces, subjects, classes, enrollment approvals, scheduling, attendance, make-up, facilities, tuition, teacher workload, ratings và parent experience.  
**Trạng thái:** Working baseline cập nhật theo các quyết định nghiệp vụ mới nhất, bao gồm cấp tài khoản trực tiếp và first-login password confirmation.

---

## 1. Định hướng sản phẩm
- TSPEC ưu tiên mô hình **trung tâm đào tạo / công ty giáo dục**, không giả định là trường phổ thông.
- Một `Tenant` tương ứng một tổ chức/công ty vận hành độc lập.
- Bên trong tenant có nhiều đơn vị như `CENTER`, `BRANCH`, `UNIT`.
- Dữ liệu tenant dùng chung database vật lý nhưng mọi dữ liệu tenant-owned phải có `tenantId` và tuyệt đối không cross-tenant.
- `AcademicYear/AcademicTerm` không còn là parent bắt buộc của Class; tenant nào cần có thể dùng `AcademicPeriod/ReportingPeriod` tùy chọn.

## 2. Workspace chính
Các workspace UX chính còn lại:
1. `SYSTEM_ADMIN` — quản trị nền tảng toàn hệ thống.
2. `TENANT_ADMIN` — quản trị tổ chức/tenant.
3. `TEACHER` — giáo viên.
4. `STUDENT` — học sinh.
5. `PARENT` — phụ huynh.

**Loại bỏ `ACCOUNTANT` và `CASHIER` khỏi nghiệp vụ/workspace chuẩn của hệ thống.**

`WorkspaceType` quyết định trải nghiệm UI; `Role/Permission` vẫn là RBAC cấu hình được và không hard-code role name trong authorization backend.

## 3. Account, TenantPerson, Membership
### UserAccount
- Là danh tính đăng nhập **global**, tách khỏi thông tin người dùng riêng của từng tenant.
- Lifecycle: `ACTIVE / SUSPENDED / DEACTIVATED`.
- Không còn `PENDING_ACTIVATION`; **cơ chế lời mời kích hoạt đã bị loại khỏi nghiệp vụ chuẩn**.
- Chỉ lưu dữ liệu account/security cần thiết.
- Một account có thể tham gia nhiều tenant.
- Mật khẩu luôn được lưu bằng password hash phù hợp; không lưu/log plaintext password.
- Account mới do quản trị cấp có `firstLoginStatus = PENDING` cho đến khi người dùng hoàn tất bước xác nhận mật khẩu ở lần đăng nhập đầu tiên.

### TenantPerson
- Là thông tin người dùng riêng trong một tenant.
- Một UserAccount có thể liên kết nhiều TenantPerson ở các tenant khác nhau.
- Trong cùng tenant: `UNIQUE(tenantId, accountId)` khi đã có account.
- TenantPerson có thể tồn tại không có UserAccount nếu chỉ cần lưu hồ sơ nghiệp vụ; khi cần truy cập hệ thống, Tenant Admin thực hiện **Cấp tài khoản**.
- Thông tin profile của tenant A không được tự động ghi đè tenant B.

### Membership
- TenantPerson phải có membership ACTIVE để sử dụng tenant.
- Lifecycle: `PENDING / ACTIVE / LEFT / REVOKED`.
- Khi Tenant Admin cấp tài khoản để người dùng truy cập ngay, membership/workspace access tương ứng phải ở trạng thái cho phép đăng nhập theo permission hiện hành.

### Tạo người dùng và cấp tài khoản bởi Tenant Admin
Tenant Admin có thể:
- tạo TenantPerson trực tiếp;
- chọn workspace/profile ban đầu trong các workspace chuẩn hiện hành;
- khai báo center/node phụ trách;
- nếu là Teacher, khai báo loại giáo viên `CONTRACT` hoặc `COLLABORATOR`;
- **cấp UserAccount trực tiếp**, không qua cơ chế lời mời kích hoạt.

Khi cấp một UserAccount mới:
1. Quản trị nhập/chọn login identifier theo policy hệ thống (email/số điện thoại/username được hỗ trợ).
2. Quản trị nhập mật khẩu ban đầu hoặc dùng chức năng sinh mật khẩu.
3. Raw password chỉ tồn tại trong request/UI ở thời điểm cấp; server hash ngay, không ghi audit/log và không cho xem lại sau khi tạo.
4. Account được tạo `ACTIVE` với `firstLoginStatus = PENDING`.
5. TenantPerson + Membership + Workspace Access/RoleAssignment được liên kết trong cùng transaction phù hợp.
6. Hệ thống ghi audit việc tạo hồ sơ/cấp tài khoản nhưng không ghi mật khẩu hoặc hash.
7. Quản trị chịu trách nhiệm bàn giao login identifier + mật khẩu ban đầu cho người dùng qua kênh vận hành bên ngoài TSPEC.

Nếu login identifier đã thuộc một UserAccount global:
- hệ thống không tạo account trùng;
- chỉ cho liên kết account đó với TenantPerson của tenant hiện tại khi actor có permission và xác nhận rõ account đích;
- **không thay đổi/reset mật khẩu** của account đã tồn tại trong thao tác liên kết;
- không expose security state hoặc dữ liệu tenant khác của account.

### Đăng nhập lần đầu
Sau khi authentication thành công, nếu `firstLoginStatus = PENDING`, hệ thống phải hiển thị màn **Xác nhận mật khẩu lần đầu** trước bước chọn tenant/vai trò.

Người dùng có 2 lựa chọn:
1. **Giữ mật khẩu hiện tại**
   - không thay password hash;
   - cập nhật `firstLoginStatus = COMPLETED` và `firstLoginCompletedAt`;
   - tiếp tục luồng chọn tenant/vai trò.
2. **Đổi mật khẩu**
   - nhập mật khẩu mới + xác nhận;
   - validate password policy;
   - hash và thay mật khẩu trong transaction;
   - cập nhật `passwordChangedAt`, `firstLoginStatus = COMPLETED`, `firstLoginCompletedAt`;
   - tiếp tục luồng chọn tenant/vai trò.

Không bắt buộc đổi mật khẩu nếu người dùng chọn **Giữ mật khẩu hiện tại**. Bước first-login là thuộc UserAccount global và chỉ thực hiện một lần cho account mới, không lặp lại ở từng tenant.


## 4. Login và Context
Flow bắt buộc:
`Login → First-login password confirmation (nếu PENDING) → Tenant selection → Workspace selection → Workspace dashboard`

Quy tắc:
- Authentication thành công nhưng `firstLoginStatus = PENDING` → xử lý first-login trước khi tải tenant/workspace.
- 0 tenant ACTIVE → no-access state.
- 1 tenant → auto-select.
- >1 tenant → hiển thị tenant cards.
- Sau tenant selection: 1 workspace → auto-select; >1 workspace → hiển thị workspace cards.
- Session context gồm `Account + ActiveTenant + TenantPerson + ActiveWorkspace + EffectivePermissions`.
- Đổi tenant/workspace phải validate lại membership, role assignments, capabilities và reload navigation.
- Navigation không union màn hình của nhiều workspace vào cùng một shell.
- SYSTEM_ADMIN là global-only context; khi xem tenant phải vào explicit tenant context và audit.

## 5. Organization / Center / Facility
### OrganizationNode
Node types tối thiểu: `CENTER, BRANCH, UNIT`; có thể giữ SCHOOL/CAMPUS cho tenant đặc thù nhưng không phải mô hình mặc định.

### Floor
- Thuộc một Center/Branch.
- Có code/name, displayOrder, status.
- **Tạo tầng là thao tác riêng**, không gộp với tạo phòng.

### Room
- Thuộc một Floor và Center.
- Có code/name, capacity optional, roomType optional, status.
- **Tạo phòng là thao tác riêng** và bắt buộc chọn Floor hiện hữu.
- Room có thể được gán cho TeachingSession.
- Nếu session có Room thì **Room conflict là bắt buộc kiểm tra**, cùng Teacher conflict và Class conflict.
- Online/off-site session có thể không có roomId.

## 6. Subject / Course
`Subject/Course` là danh mục môn/chương trình được giảng dạy trong tenant.

Thông tin tối thiểu:
- tenantId
- code
- name
- shortDescription optional
- `coverImageAssetId` optional — ảnh đại diện môn học
- status: `ACTIVE / INACTIVE / ARCHIVED`

Quy tắc:
- Tenant Admin có màn **Môn học** riêng để tạo/cập nhật/ngừng sử dụng môn.
- Ảnh đại diện là optional; khi upload phải qua storage/media service của tenant, không lưu raw base64 vào business table.
- API upload phải giới hạn loại file/kích thước theo security policy; prototype chỉ mô phỏng preview local.
- Subject đã được Class sử dụng không hard delete; dùng lifecycle.
- Subject là bắt buộc khi tạo Class.

## 7. Class — lớp môn học tại trung tâm
Một Class là một **lớp môn học/course class tại trung tâm**, không phải homeroom.

Thông tin tối thiểu:
- tenantId
- centerId
- subjectId
- name/code
- plannedStartDate
- plannedEndDate
- plannedSessionCount
- tuitionAmount optional
- academicPeriodId optional
- `catalogVisibility`: `HIDDEN / VISIBLE`
- `enrollmentOpen`: boolean
- status

Lifecycle:
`PLANNED → ACTIVE → COMPLETED → CLOSED → ARCHIVED`

### 7.1 Tạo lớp
- Class mới luôn bắt đầu ở `PLANNED`.
- Subject bắt buộc.
- Center bắt buộc.
- plannedStartDate < plannedEndDate.
- Giáo viên chưa bắt buộc khi tạo.
- Có thể khai báo học phí, số buổi dự kiến và visibility cho Parent catalog.

### 7.2 Cập nhật lớp
Khi `PLANNED`:
- được sửa các thông tin cơ bản, subject, center, planned dates, plannedSessionCount, tuition và catalog settings.

Khi `ACTIVE`:
- không đổi subject/center để tránh rewrite lịch sử;
- tên hiển thị, plannedEndDate, plannedSessionCount và các metadata được phép sửa có kiểm soát;
- thay đổi lịch/teacher dùng TimetableRule/TeacherAssignment tương ứng và phải reconcile TeachingSession;
- mọi material change phải audit/version.

`COMPLETED/CLOSED/ARCHIVED` mặc định read-only, trừ correction có permission đặc biệt và audit.

### 7.3 Bắt đầu lớp
Trước `PLANNED → ACTIVE` phải validate đồng thời:
- Subject còn hợp lệ.
- Có ít nhất một TeacherAssignment hợp lệ.
- Có ít nhất một TimetableRule/lịch giảng dạy hợp lệ.
- `plannedSessionCount > 0` và đã được xác nhận.
- plannedStartDate/plannedEndDate hợp lệ.

Khi activate:
- sinh/reconcile TeachingSession đồng bộ;
- chuyển các enrollment đã được duyệt từ `PENDING` sang `ACTIVE` khi đủ điều kiện;
- ghi audit.

### 7.4 Hoạt động
Khi ACTIVE:
- tiếp tục sinh/reconcile lịch theo các thay đổi hợp lệ;
- quản lý attendance, make-up, ad-hoc session, progress, tuition và workload;
- Parent không được tạo yêu cầu rút trước-khai-giảng nữa sau khi lớp đã bắt đầu.

### 7.5 Kết thúc lớp
`ACTIVE → COMPLETED` yêu cầu:
- không còn TeachingSession future ở trạng thái cần xử lý, hoặc admin phải xử lý/cancel/reschedule trước;
- xác nhận tiến trình lớp và các attendance còn mở;
- enrollment ACTIVE chuyển `COMPLETED` theo transaction;
- phát notification đánh giá cho học sinh đủ điều kiện;
- lớp không còn nhận enrollment mới.

`COMPLETED → CLOSED` là bước khóa hành chính tùy tenant; sau CLOSED chỉ correction đặc biệt.

## 8. ClassEnrollment và yêu cầu ghi danh của Phụ huynh
### 8.1 Parent course catalog — “Lớp học mới”
Parent có menu **Lớp học mới** trong ActiveTenant.

Danh sách chỉ hiển thị Class:
- `catalogVisibility = VISIBLE`;
- thuộc tenant hiện tại;
- không ARCHIVED.

Card tối thiểu hiển thị:
- ảnh/tên môn hoặc lớp;
- tên lớp;
- center;
- plannedStartDate–plannedEndDate;
- học phí;
- trạng thái thời gian: **Sắp bắt đầu / Đang diễn ra / Đã kết thúc**;
- CTA xem chi tiết;
- nút **Ghi danh** chỉ với lớp Sắp bắt đầu và `enrollmentOpen=true`.

Filter dạng chip:
- mặc định `Tất cả`;
- nếu tenant có từ 2 center trở lên, hiển thị chip center để lọc;
- `Sắp bắt đầu`;
- `Đang diễn ra`;
- `Đã kết thúc`.

### 8.2 EnrollmentApplication
Phụ huynh gửi ghi danh cho một child có ACTIVE relationship.

Lifecycle:
`PENDING → APPROVED / REJECTED / CANCELED`

Quy tắc:
- request phải thuộc Parent + Child + Class + ActiveTenant.
- chỉ tạo khi Class chưa bắt đầu, catalog đang mở ghi danh và child chưa có enrollment/request trùng hiệu lực.
- Parent có thể hủy request khi còn `PENDING`.
- Tenant Admin có màn xử lý yêu cầu ghi danh.
- APPROVED tạo `ClassEnrollment` trạng thái `PENDING`; khi lớp bắt đầu thì chuyển `ACTIVE`.
- REJECTED/CANCELED không tạo enrollment.

### 8.3 ClassEnrollment
Lifecycle: `PENDING / ACTIVE / WITHDRAWN / COMPLETED`.
- Không hard delete.
- Enrollment không thay đổi chỉ vì học bù cá nhân ở session khác.

### 8.4 WithdrawalRequest trước khi lớp bắt đầu
Phụ huynh chỉ được yêu cầu rút khi:
- enrollment/application đã được duyệt;
- Class vẫn chưa bắt đầu (`PLANNED` và thời điểm bắt đầu chưa tới).

Lifecycle:
`PENDING → APPROVED / REJECTED / CANCELED`

Quy tắc:
- Tenant Admin phải duyệt/từ chối.
- Khi request còn PENDING, Parent có thể **Hủy yêu cầu rút**.
- APPROVED → ClassEnrollment chuyển `WITHDRAWN` hoặc enrollment pending bị kết thúc tương ứng.
- Sau khi Class ACTIVE, flow rút học cần một decision riêng; baseline này không tự suy diễn chính sách hoàn học phí/rút giữa khóa.

### 8.5 “Lớp học của con”
Parent có menu **Lớp học của con**, UI card tương tự catalog nhưng chỉ hiển thị dữ liệu của child đang chọn:
- request ghi danh đang chờ;
- lớp đã được duyệt/chưa bắt đầu;
- lớp đang học;
- lớp đã kết thúc;
- trạng thái yêu cầu rút nếu có.

Child switch phải validate `ACTIVE_RELATIONSHIP` lại trước khi tải dữ liệu.

## 9. Teacher và phân loại giáo viên
### TeacherType
- `CONTRACT`: giáo viên hợp đồng.
- `COLLABORATOR`: cộng tác viên.

`teacherType` chỉ là thuộc tính phân loại hồ sơ giáo viên; không quyết định lương/thù lao.

### TeacherAssignment
- Kết nối Teacher với Class/Subject.
- Có thể có nhiều teacher cho một class.
- Assignment quyết định scope dạy/điểm danh/xem student.
- Mỗi TeachingSession phải xác định teacher/TeacherAssignment thực tế phụ trách để tổng hợp tải giảng dạy.
- Teacher schedule read-only trong Teacher workspace.

## 10. TimeSlotTemplate
Center có thể khai báo khung giờ dùng lại, ví dụ:
- Ca chiều 1: 17:30–19:00
- Ca tối 1: 19:15–20:45

Template chỉ là tiện ích nhập nhanh; TimetableRule vẫn có thể dùng custom start/end.

## 11. Holiday / Closed Day
### HolidayEntry
- Scope: TENANT hoặc CENTER.
- Có name, startDate, endDate, status.
- Dùng cho lễ, Tết, nghỉ trung tâm, bảo trì, sự kiện đặc biệt.
- Khi generate TeachingSession, occurrence rơi vào holiday bị skip.

Nếu holiday được thêm sau khi session đã sinh:
- future SCHEDULED session chưa attendance → `CANCELED_HOLIDAY`;
- session lịch sử/đã attendance không tự sửa;
- cảnh báo lớp có thể thiếu buổi so với plannedSessionCount để admin xếp makeup/ad-hoc;
- có thể tạo explicit ad-hoc session trên ngày holiday nhưng phải warning + confirmation + permission.

## 12. Scheduling — lịch xuất phát từ Class
Scheduling là class-centric.

### TimetableRule
Một rule thuộc một Class và mô tả slot lặp:
- classId
- teacherAssignmentId
- weekday
- localStart/localEnd
- timezone
- effective range
- roomId optional
- timeSlotTemplateId optional
- status/version

### Conflict
Bắt buộc:
- Class conflict.
- Teacher conflict.
- Room conflict nếu có roomId.

Overlap: `newStart < existingEnd AND newEnd > existingStart`.
Session liền nhau không conflict.

### Chiến lược sinh TeachingSession
**Nguồn chính là synchronous generation, không dùng cronjob làm nguồn sinh lịch chính.**

Khi:
- Class chuyển PLANNED → ACTIVE;
- TimetableRule ACTIVE được tạo/thay đổi;
- planned range của Class thay đổi hợp lệ;

hệ thống generate/reconcile TeachingSession ngay, idempotent.

Cron/background job nếu có chỉ dùng reconciliation/repair monitoring.

### Generation rules
- occurrence identity ổn định theo TimetableRule + local occurrence date/time;
- skip HolidayEntry;
- không duplicate;
- không recreate session đã hủy;
- historical/attendance-linked session không rewrite.

## 13. TeachingSession
Types tối thiểu:
- `REGULAR` — sinh từ TimetableRule.
- `CLASS_MAKEUP` — học bù cả lớp.
- `AD_HOC` — lịch dạy phát sinh của Class.
- `INDIVIDUAL_MAKEUP` — session riêng phục vụ học bù cá nhân.

Mọi TeachingSession có:
- classId
- teacherAssignmentId
- start/end
- roomId optional
- type
- status
- countsTowardClassProgress
- source links nếu replacement/makeup

### Lịch dạy phát sinh
Tenant Admin được tạo AD_HOC TeachingSession:
- bắt buộc chọn Class;
- TeacherAssignment hợp lệ;
- thời gian;
- Room optional;
- check Class/Teacher/Room conflict;
- mặc định `countsTowardClassProgress=true`.

## 14. Tiến trình lớp học
Class có `plannedSessionCount`.

- `taughtSessionCount` = TeachingSession `COMPLETED` và `countsTowardClassProgress=true`.
- Hiển thị `taughtSessionCount / plannedSessionCount` và phần trăm.
- REGULAR, CLASS_MAKEUP, AD_HOC có thể tính progress.
- CANCELED không tính.
- Học bù cá nhân ghép vào session lớp khác không tăng progress lớp gốc.
- Nếu taught vượt planned, UI hiển thị ví dụ `25/24` và cảnh báo; không tự đổi denominator.

## 15. Attendance
### AttendanceRecord
- teachingSessionId
- studentId
- status: `PRESENT / ABSENT / LATE / EXCUSED`
- source: `TEACHER / STUDENT_CHECK_IN`
- approvalStatus: `NOT_REQUIRED / PENDING / APPROVED / REJECTED`
- markedAt/markedBy

Teacher của class điểm danh trực tiếp.  
Student self check-in → PENDING → Teacher APPROVE/REJECT.  
Session có attendance/history không được rewrite/xóa tự động.

## 16. Make-up
### Class makeup
- Giữ session gốc/history.
- Tạo CLASS_MAKEUP linked original session.
- Session makeup completed có thể tính class progress.

### Individual makeup
- Không thay Enrollment lớp gốc.
- Có thể ghép vào session tương thích class khác hoặc tạo session riêng.
- Ghép class khác phải cùng tenant, subject/course tương thích, còn chỗ, không conflict học sinh.
- Nếu join session đã tồn tại thì không tạo thêm class progress lớp gốc và không tạo workload session mới.

## 17. Tuition / học phí lớp
### ClassTuition
Mỗi Class có thể khai báo:
- tuitionAmount
- currency mặc định VND
- dueDate/default collection window optional

### StudentTuitionAccount
Theo Enrollment:
- tuitionAmount
- paidAmount
- remainingAmount
- status: `UNPAID / PARTIAL / PAID / WAIVED`

### Payment
- Trong baseline hiện tại, **Tenant Admin có permission phù hợp** được ghi nhận payment và receipt reference.
- Không còn Accountant/Cashier workspace mặc định.
- Sau này có thể cấp permission tài chính cho custom RBAC role trong workspace phù hợp nếu có decision mở rộng, nhưng baseline không tự tạo thêm persona tài chính.

Chưa chốt: discount engine, scholarship, refund, installment phức tạp, invoice/tax integration.

## 18. Teacher Management / Teaching Workload
Mục tiêu quản lý khối lượng giảng dạy, không tính lương/thù lao.

Tenant Admin có menu **Quản lý giáo viên**:
- danh sách teacher + TeacherType;
- lọc center/status/month;
- lớp đang phụ trách;
- số buổi và số giờ dạy dự kiến/thực tế trong tháng;
- drill-down TeachingSession.

Teacher có thể xem workload của mình read-only nếu capability cho phép.

### MonthlyTeacherWorkload
Theo `teacherId + tenantId + month`:
- plannedSessionCount
- completedSessionCount
- plannedTeachingMinutes
- actualTeachingMinutes
- remainingSessionCount
- remainingTeachingMinutes
- breakdown Center/Class/Subject/SessionType.

Dự kiến lấy từ workload-eligible TeachingSession trong tháng không CANCELED/ARCHIVED.  
Thực tế chỉ từ COMPLETED; nếu thiếu actual duration thì dùng scheduled duration và đánh dấu `SCHEDULED_DEFAULT`.

## 19. Rating / Evaluation
Thang điểm 1–5 sao.

Khi Class → COMPLETED:
- Student eligible nhận notification đánh giá.
- Form class review mặc định 5 sao.

### ClassReview
- rating 1..5
- comment optional
- một review/student/class
- Student có thể bỏ qua toàn bộ.

### TeacherRating
Mỗi student/teacher/class có tối đa một rating được tính:
1. `CLASS_DERIVED` — kế thừa sao ClassReview; nếu bỏ qua toàn bộ thì implicit = 5.
2. `DIRECT_TEACHER` — đánh giá riêng teacher, thay thế derived cho cùng student/teacher/class.

Teacher average là trung bình tất cả TeacherRating được tính, UI hiển thị breakdown derived/direct/overall.

## 20. Parent–Student
- Parent có thể có nhiều child.
- Relationship lifecycle ACTIVE / REVOKED.
- Child context switch validate tenant + ACTIVE relationship + capability.
- Parent chỉ xem/ghi danh/rút cho child có ACTIVE relationship.

## 21. Roles / Permissions
Assignable scopes tối thiểu:
`SYSTEM, TENANT/ORGANIZATION, ORGANIZATION_NODE, CLASS, SUBJECT`.

Contextual policies:
`SELF, TEACHING_ASSIGNMENT, ACTIVE_RELATIONSHIP`.

- UI theo ActiveWorkspace.
- Authorization dựa effective permission trong ActiveTenant/ActiveWorkspace.
- Sensitive permission cần confirmation + impact summary + audit.
- Last-admin/self-lockout protection bắt buộc.

## 22. Audit
Append-only. Ghi actor, time, tenant, workspace context, resource, action và metadata an toàn.

Audit bắt buộc cho:
- user creation/account provisioning/account-to-tenant linking;
- first-login completion/password change;
- subject create/update/lifecycle/image change;
- class create/update/start/complete/lifecycle;
- enrollment application approval/rejection/cancel;
- withdrawal request approval/rejection/cancel;
- role/permission changes;
- facility/schedule/holiday/session mutation;
- attendance approval;
- tuition payment;
- teacher administrative correction;
- rating admin mutation nếu có.

## 23. Data lifecycle và security
Không hard delete mặc định đối với dữ liệu nghiệp vụ quan trọng.

Mọi mutation quan trọng:
`Authenticate → ActiveTenant → TenantPerson/Membership → ActiveWorkspace → EffectivePermission → Scope → ResourceCheck → Transaction → Audit`

Bắt buộc test:
- cross-tenant leakage;
- IDOR;
- unauthorized mutation;
- scope leakage;
- active-workspace privilege leakage;
- parent-child relationship bypass;
- duplicate enrollment application;
- unauthorized enrollment/withdraw approval;
- room/teacher/class scheduling conflicts.

## 24. Core model
`UserAccount(firstLoginStatus) → TenantPerson → Membership → Workspace Access → RoleAssignment → EffectivePermission`

`Tenant → Center → Floor → Room`

`Tenant → Subject/Course → Class → TeacherAssignment + ClassEnrollment`

`Parent + Child + Class → EnrollmentApplication → ClassEnrollment`

`ClassEnrollment + Parent → WithdrawalRequest`

`Class → TimetableRule → TeachingSession → Attendance`

`Tenant/Center → HolidayEntry → Session generation/reconciliation`

`Class → ClassTuition → StudentTuitionAccount → Payment`

`TeacherProfile(TeacherType) + TeachingSession → MonthlyTeacherWorkload read model`

`Class COMPLETED → ClassReview → TeacherRating`

`Parent TenantPerson → ParentStudentRelationship → Student TenantPerson`

---

## 25. Decision chưa mở rộng
Chưa tự suy diễn thêm:
- policy rút lớp sau khi lớp đã ACTIVE;
- refund do rút lớp;
- discount/scholarship/installment engine;
- hóa đơn điện tử/thuế;
- chấm công nhân sự ngoài giờ dạy;
- payroll/lương/thù lao;
- moderation/chống gian lận đánh giá;
- QR/GPS/Wi-Fi cho self check-in.

Các phần này cần decision riêng khi vào scope.
