import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
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
import SyllabusCompletion from '../pages/admin/SyllabusCompletion';
import CurriculumTemplateDemo from '../pages/admin/CurriculumTemplateDemo';
import PermissionsManagement from '../pages/admin/PermissionsManagement';
import AdminSalaryPayroll from '../pages/admin/SalaryPayroll';
import AuditLog from '../pages/admin/AuditLog';
import InspectionLog from '../pages/admin/InspectionLog';
import BudgetApproval from '../pages/admin/BudgetApproval';
import ExpenseLog from '../pages/admin/ExpenseLog';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="students" element={<StudentRecords />} />
        <Route path="fees" element={<FeeConfiguration />} />
        <Route path="settings" element={<SystemSettings />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="reports" element={<Reports />} />
        <Route path="inventory" element={<A_Inventory />} />
        <Route path="communications" element={<A_Communication />} />
        <Route path="events" element={<A_Events />} />
        <Route path="events/:eventId/consent" element={<EventConsentForm />} />
        <Route path="classes" element={<A_Classes />} />
        <Route path="subjects" element={<A_Subjects />} />
        <Route path="schedules" element={<A_Schedules />} />
        <Route path="a-fees" element={<A_Fees />} />
        <Route path="a-reports" element={<A_Reports />} />
        <Route path="a-settings" element={<A_Settings />} />
        <Route path="a-users" element={<A_Users />} />
        <Route path="inventory-management" element={<Inventory_Management />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="student-records" element={<Students />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="results" element={<Results />} />
        <Route path="system-settings" element={<Settings />} />
        <Route path="subject-management" element={<Subjects />} />
        <Route path="parents" element={<Parents />} />
        <Route path="fee-management" element={<Fees />} />
        <Route path="fee-records" element={<FeeRecords />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="class-management" element={<Classes />} />
        <Route path="exam-management" element={<Exams />} />
        <Route path="a-dashboard" element={<A_Dashboard />} />
        <Route path="Visitors" element={<Visitors />} />
        <Route path="Enquiries" element={<A_Enquiries />} />
        <Route path="service-requests" element={<A_ServiceRequests />} />
        {/* Syllabus Completion Route */}
        <Route path="syllabus-completion" element={<SyllabusCompletion />} />
        {/* Audit Log Route */}
        <Route path="audit-log" element={<AuditLog />} />
        {/* Inspection Log Route */}
        <Route path="inspection-log" element={<InspectionLog />} />
        {/* Budget Approval Route */}
        <Route path="budget-approval" element={<BudgetApproval />} />
        <Route path="expense-log" element={<ExpenseLog />} />
        {/* Teacher Remarks Routes */}
        <Route path="teacher-remarks" element={<TeacherRemarks />} />
        {/* Curriculum Template Demo Route */}
        <Route path="curriculum-template-demo" element={<CurriculumTemplateDemo />} />
        {/* Transport Forms Routes */}
        <Route path="transport-forms" element={<TransportFormsManagement />} />
        <Route path="transport-forms/create" element={<TransportFormCreate />} />
        <Route path="transport-forms/:formId" element={<TransportFormView />} />
        <Route path="transport-forms/:formId/edit" element={<TransportFormCreate />} />

        {/* Disciplinary Forms Routes */}
        <Route path="disciplinary-forms" element={<DisciplinaryFormsManagement />} />
        <Route path="disciplinary-template" element={<DisciplinaryFormTemplate />} />
        <Route path="disciplinary-forms/create" element={<DisciplinaryFormCreate />} />
        <Route path="disciplinary-forms/:formId" element={<DisciplinaryFormCreate />} />
        <Route path="disciplinary-forms/template/new" element={<DisciplinaryFormTemplateEditor />} />
        <Route path="disciplinary-forms/template/:templateId/edit" element={<DisciplinaryFormTemplateEditor />} />
        <Route path="disciplinary-forms/template/:templateId" element={<DisciplinaryFormTemplateEditor />} />
        <Route path="permissions" element={<PermissionsManagement />} />
        {/* Salary Payroll Route */}
        <Route path="salary-payroll" element={<AdminSalaryPayroll />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes; 