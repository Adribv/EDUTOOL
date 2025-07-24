import { Routes, Route } from 'react-router-dom';
import ManagementLayout from '../components/layout/ManagementLayout';

// Admin pages
import Dashboard from '../pages/admin/Dashboard';
import A_Inventory from '../pages/admin/A_Inventory';
import A_Communication from '../pages/admin/A_Communication';
import A_Events from '../pages/admin/A_Events';
import EventConsentForm from '../pages/admin/EventConsentForm';
import A_Classes from '../pages/admin/A_Classes';
import A_Subjects from '../pages/admin/A_Subjects';
import A_Schedules from '../pages/admin/A_Schedules';
import Profile from '../pages/admin/Profile';
import StaffManagement from '../pages/admin/StaffManagement';
import StudentRecords from '../pages/admin/StudentRecords';
import FeeConfiguration from '../pages/admin/FeeConfiguration';
import SystemSettings from '../pages/admin/SystemSettings';
import UserManagement from '../pages/admin/UserManagement';
import Reports from '../pages/admin/Reports';
import A_Fees from '../pages/admin/A_Fees';
import A_Reports from '../pages/admin/A_Reports';
import A_Settings from '../pages/admin/A_Settings';
import A_Users from '../pages/admin/A_Users';
import Inventory_Management from '../pages/admin/Inventory_Management';
import Teachers from '../pages/admin/Teachers';
import Students from '../pages/admin/Students';
import Timetable from '../pages/admin/Timetable';
import Results from '../pages/admin/Results';
import Settings from '../pages/admin/Settings';
import Subjects from '../pages/admin/Subjects';
import Parents from '../pages/admin/Parents';
import Fees from '../pages/admin/Fees';
import FeeRecords from '../pages/admin/FeeRecords';
import Attendance from '../pages/admin/Attendance';
import Classes from '../pages/admin/Classes';
import Exams from '../pages/admin/Exams';
import A_Dashboard from '../pages/admin/A_Dashboard';
import Visitors from '../pages/admin/Visitors';
import A_Enquiries from '../pages/admin/A_Enquiries';
import A_ServiceRequests from '../pages/admin/A_ServiceRequests';
import DisciplinaryFormsManagement from '../pages/admin/DisciplinaryFormsManagement';
import DisciplinaryFormTemplate from '../pages/admin/DisciplinaryFormTemplate';
import DisciplinaryFormTemplateEditor from '../pages/admin/DisciplinaryFormTemplateEditor';
import DisciplinaryFormCreate from '../pages/teacher/DisciplinaryFormCreate';
import TransportFormsManagement from '../pages/admin/TransportFormsManagement';
import TransportFormCreate from '../pages/admin/TransportFormCreate';
import TransportFormView from '../pages/admin/TransportFormView';
import TeacherRemarks from '../pages/admin/TeacherRemarks';
import PermissionsManagement from '../pages/admin/PermissionsManagement';

// Teacher pages
import TeacherDashboard from '../pages/teacher/Dashboard';
import TeacherClasses from '../pages/teacher/Classes';
import TeacherStudents from '../pages/teacher/Students';
import TeacherAttendance from '../pages/teacher/Attendance';
import TeacherAssignments from '../pages/teacher/Assignments';
import TeacherExams from '../pages/teacher/Exams';
import TeacherLessonPlans from '../pages/teacher/LessonPlans';
// import TeacherReportsPage from '../pages/teacher/Reports';

// Librarian pages (create these if needed)
import LibraryDashboard from '../pages/library/Dashboard';
import BookManagement from '../pages/library/BookManagement';
import MemberManagement from '../pages/library/MemberManagement';
import BookIssueReturn from '../pages/library/BookIssueReturn';

// Wellness Counsellor pages (create these if needed)
import WellnessDashboard from '../pages/wellness/Dashboard';
import Counsellingsessions from '../pages/wellness/CounsellingSessionsManagement';
import WellnessPrograms from '../pages/wellness/WellnessPrograms';
import MentalHealthReports from '../pages/wellness/MentalHealthReports';

// HOD pages
import HODDashboard from '../pages/hod/Dashboard';
import DepartmentManagement from '../pages/hod/DepartmentManagement';
import FacultyManagement from '../pages/hod/FacultyManagement';
import CurriculumOversight from '../pages/hod/CurriculumOversight';

// Accountant pages
import AccountantDashboard from '../pages/accountant/Dashboard';
import FinancialReports from '../pages/accountant/FinancialReports';
import FeeManagement from '../pages/accountant/FeeManagement';
import ExpenseManagement from '../pages/accountant/ExpenseManagement';
import SalaryManagement from '../pages/accountant/SalaryManagement';

// IT Support pages
import ITDashboard from '../pages/it/Dashboard';
import ITSupportTickets from '../pages/it/SupportTickets';
import SystemMaintenance from '../pages/it/SystemMaintenance';
import NetworkManagement from '../pages/it/NetworkManagement';

const ManagementRoutes = () => {
  return (
    <Routes>
      <Route element={<ManagementLayout />}>
        {/* Common routes available to all roles */}
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        
        {/* Academic Management */}
        <Route path="students" element={<StudentRecords />} />
        <Route path="student-records" element={<Students />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="classes" element={<Classes />} />
        <Route path="class-management" element={<A_Classes />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="subject-management" element={<A_Subjects />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="schedules" element={<A_Schedules />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="assignments" element={<TeacherAssignments />} />
        <Route path="exams" element={<Exams />} />
        <Route path="exam-management" element={<Exams />} />
        <Route path="results" element={<Results />} />
        
        {/* Financial Management */}
        <Route path="fees" element={<Fees />} />
        <Route path="fee-management" element={<FeeManagement />} />
        <Route path="fee-records" element={<FeeRecords />} />
        <Route path="a-fees" element={<A_Fees />} />
        <Route path="payments" element={<FinancialReports />} />
        <Route path="salaries" element={<SalaryManagement />} />
        <Route path="expenses" element={<ExpenseManagement />} />
        
        {/* Administrative */}
        <Route path="staff" element={<StaffManagement />} />
        <Route path="parents" element={<Parents />} />
        <Route path="communications" element={<A_Communication />} />
        <Route path="events" element={<A_Events />} />
        <Route path="events/:eventId/consent" element={<EventConsentForm />} />
        <Route path="transport" element={<TransportFormsManagement />} />
        <Route path="transport/create" element={<TransportFormCreate />} />
        <Route path="transport/:formId" element={<TransportFormView />} />
        <Route path="transport/:formId/edit" element={<TransportFormCreate />} />
        <Route path="disciplinary-forms" element={<DisciplinaryFormsManagement />} />
        <Route path="disciplinary-forms/create" element={<DisciplinaryFormCreate />} />
        <Route path="disciplinary-forms/:formId" element={<DisciplinaryFormCreate />} />
        <Route path="disciplinary-forms/template/new" element={<DisciplinaryFormTemplateEditor />} />
        <Route path="disciplinary-forms/template/:templateId/edit" element={<DisciplinaryFormTemplateEditor />} />
        <Route path="disciplinary-forms/template/:templateId" element={<DisciplinaryFormTemplateEditor />} />
        <Route path="disciplinary-template" element={<DisciplinaryFormTemplate />} />
        
        {/* Specialized Modules */}
        <Route path="library" element={<LibraryDashboard />} />
        <Route path="library/books" element={<BookManagement />} />
        <Route path="library/members" element={<MemberManagement />} />
        <Route path="library/issue-return" element={<BookIssueReturn />} />
        
        <Route path="wellness" element={<WellnessDashboard />} />
        <Route path="wellness/sessions" element={<CounsellingSessionsManagement />} />
        <Route path="wellness/programs" element={<WellnessPrograms />} />
        <Route path="wellness/reports" element={<MentalHealthReports />} />
        
        <Route path="counselling" element={<CounsellingSessionsManagement />} />
        
        <Route path="it-support" element={<ITDashboard />} />
        <Route path="it-support/tickets" element={<ITSupportTickets />} />
        <Route path="it-support/maintenance" element={<SystemMaintenance />} />
        <Route path="it-support/network" element={<NetworkManagement />} />
        
        <Route path="inventory" element={<Inventory_Management />} />
        <Route path="inventory-management" element={<A_Inventory />} />
        
        {/* Reports and Analytics */}
        <Route path="reports" element={<Reports />} />
        <Route path="a-reports" element={<A_Reports />} />
        <Route path="analytics" element={<A_Reports />} />
        <Route path="teacher-remarks" element={<TeacherRemarks />} />
        
        {/* System Management (Admin/Principal only) */}
        <Route path="settings" element={<Settings />} />
        <Route path="system-settings" element={<SystemSettings />} />
        <Route path="a-settings" element={<A_Settings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="a-users" element={<A_Users />} />
        <Route path="permissions" element={<PermissionsManagement />} />
        
        {/* Role-specific routes */}
        {/* Teacher specific */}
        <Route path="teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="teacher/classes" element={<TeacherClasses />} />
        <Route path="teacher/students" element={<TeacherStudents />} />
        <Route path="teacher/attendance" element={<TeacherAttendance />} />
        <Route path="teacher/assignments" element={<TeacherAssignments />} />
        <Route path="teacher/exams" element={<TeacherExams />} />
        <Route path="teacher/lesson-plans" element={<TeacherLessonPlans />} />
        {/* <Route path="teacher/reports" element={<TeacherReportsPage />} /> */}
        
        {/* HOD specific */}
        <Route path="hod/dashboard" element={<HODDashboard />} />
        <Route path="hod/department" element={<DepartmentManagement />} />
        <Route path="hod/faculty" element={<FacultyManagement />} />
        <Route path="hod/curriculum" element={<CurriculumOversight />} />
        
        {/* Accountant specific */}
        <Route path="accountant/dashboard" element={<AccountantDashboard />} />
        <Route path="accountant/reports" element={<FinancialReports />} />
        <Route path="accountant/fees" element={<FeeManagement />} />
        <Route path="accountant/expenses" element={<ExpenseManagement />} />
        <Route path="accountant/salaries" element={<SalaryManagement />} />
        
        {/* Admin specific */}
        <Route path="a-dashboard" element={<A_Dashboard />} />
        <Route path="Visitors" element={<Visitors />} />
        <Route path="Enquiries" element={<A_Enquiries />} />
        <Route path="service-requests" element={<A_ServiceRequests />} />
      </Route>
    </Routes>
  );
};

export default ManagementRoutes; 