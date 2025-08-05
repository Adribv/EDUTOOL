import { Routes, Route } from 'react-router-dom';
import ParentLayout from '../components/layout/ParentLayout';
import ParentDashboard from '../pages/parent/ParentDashboard';
import Profile from '../pages/parent/Profile';
import Children from '../pages/parent/Children';
import ChildProgress from '../pages/parent/ChildProgress';
import ChildOverallProgress from '../pages/parent/ChildOverallProgress';
import Assignments from '../pages/parent/Assignments';
import StudentDetails from '../pages/parent/StudentDetails';
import FeeManagement from '../pages/parent/FeeManagement';
import P_Fee_Payments from '../pages/parent/P_Fee_Payments';
import Communication from '../pages/parent/Communication';
import Messages from '../pages/parent/Messages';
import Events from '../pages/parent/Events';
import Calendar from '../pages/parent/Calendar';
import ConsentForm from '../pages/parent/ConsentForm';
import ConsentFormsList from '../pages/shared/ConsentFormsList';
import P_Leave_Request from '../pages/parent/P_Leave_Request';
import P_Raise_Complaints from '../pages/parent/P_Raise_Complaints';
import Health from '../pages/parent/Health';
import Documents from '../pages/parent/Documents';
import Transport from '../pages/parent/Transport';
import Notifications from '../pages/parent/Notifications';
import NotFound from '../pages/NotFound';
import DisciplinaryFormAcknowledge from '../pages/parent/DisciplinaryFormAcknowledge';
import WardMisconduct from '../pages/parent/WardMisconduct';
import ParentTransportForms from '../pages/parent/ParentTransportForms';
import ParentTransportFormCreate from '../pages/parent/ParentTransportFormCreate';
import ParentTransportFormView from '../pages/parent/ParentTransportFormView';
import TeacherRemarksView from '../pages/parent/TeacherRemarksView';
import CounsellingRequestForm from '../components/CounsellingRequestForm';
import ComprehensiveProgressTemplate from '../pages/student/ComprehensiveProgressTemplate';
import TestPage from '../pages/parent/TestPage';

const ParentRoutes = () => {
  return (
    <Routes>
      <Route element={<ParentLayout />}>
        <Route index element={<ParentDashboard />} />
        <Route path="dashboard" element={<ParentDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="children" element={<Children />} />
        <Route path="children/:rollNumber/progress" element={<ChildProgress />} />
        <Route path="overall-progress" element={<ChildOverallProgress />} />
        <Route path="comprehensive-progress" element={<ComprehensiveProgressTemplate />} />
        <Route path="children/:rollNumber/assignments" element={<Assignments />} />
        <Route path="children/:rollNumber/details" element={<StudentDetails />} />
        <Route path="fees" element={<FeeManagement />} />
        <Route path="fee-payments" element={<P_Fee_Payments />} />
        <Route path="communication" element={<Communication />} />
        <Route path="messages" element={<Messages />} />
        <Route path="events" element={<Events />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="consent-form/:eventId" element={<ConsentForm />} />
        <Route path="consent-forms" element={<ConsentFormsList userRole="parent" />} />
        <Route path="leave-request" element={<P_Leave_Request />} />
        <Route path="complaints" element={<P_Raise_Complaints />} />
        <Route path="health" element={<Health />} />
        <Route path="documents" element={<Documents />} />
        <Route path="transport" element={<Transport />} />
        <Route path="notifications" element={<Notifications />} />
        {/* Teacher Remarks */}
        <Route path="teacher-remarks" element={<TeacherRemarksView />} />
        {/* Disciplinary Forms */}
        <Route path="disciplinary-forms/:formId/acknowledge" element={<DisciplinaryFormAcknowledge />} />
        <Route path="ward-misconduct" element={<WardMisconduct />} />
        
        {/* Transport Forms */}
        <Route path="transport-forms" element={<ParentTransportForms />} />
        <Route path="transport-forms/create" element={<ParentTransportFormCreate />} />
        <Route path="transport-forms/:formId" element={<ParentTransportFormView />} />
        <Route path="transport-forms/:formId/edit" element={<ParentTransportFormCreate />} />
        
        <Route path="counselling-request" element={<CounsellingRequestForm />} />
        <Route path="test" element={<TestPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default ParentRoutes; 