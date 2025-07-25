import { Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/teacher/Dashboard';
import Profile from '../pages/teacher/Profile';
import ClassManagement from '../pages/teacher/ClassManagement';
import AssignmentManagement from '../pages/teacher/AssignmentManagement';
import ExamManagement from '../pages/teacher/ExamManagement';
import StudentManagement from '../pages/teacher/StudentManagement';
import Timetable from '../pages/teacher/Timetable';
import Exams from '../pages/teacher/Exams';
import LearningResources from '../pages/teacher/LearningResources';
import Communication from '../pages/teacher/Communication';
import Assignments from '../pages/teacher/Assignments';
import Attendance from '../pages/teacher/Attendance';
import LeaveRequests from '../pages/teacher/LeaveRequests';
import Calendar from '../pages/teacher/Calendar';
import Classes from '../pages/teacher/Classes';
import MCQBuilder from '../pages/teacher/MCQBuilder';
import MCQManagement from '../pages/teacher/MCQManagement';
import LessonPlans from '../pages/teacher/LessonPlans';
import SubstituteTeacherRequest from '../pages/teacher/SubstituteTeacherRequest';
import SubstituteRequests from '../pages/teacher/SubstituteRequests';
import DisciplinaryFormCreate from '../pages/teacher/DisciplinaryFormCreate';
import TeacherRemarks from '../pages/teacher/TeacherRemarks';
import CounsellingRequestForm from '../components/CounsellingRequestForm';

const TeacherRoutes = () => {
  return (
    <Routes>
      <Route index element={<Dashboard />} />
      <Route path="dashboard" element={<Dashboard />} />
      <Route path="profile" element={<Profile />} />
      <Route path="classes" element={<ClassManagement />} />
      <Route path="assignments" element={<AssignmentManagement />} />
      <Route path="exams" element={<ExamManagement />} />
      <Route path="students" element={<StudentManagement />} />
      <Route path="timetable" element={<Timetable />} />
      <Route path="exam-management" element={<Exams />} />
      <Route path="learning-resources" element={<LearningResources />} />
      <Route path="communication" element={<Communication />} />
      <Route path="assignment-management" element={<Assignments />} />
      <Route path="attendance-management" element={<Attendance />} />
      <Route path="leave-requests" element={<LeaveRequests />} />
      <Route path="calendar" element={<Calendar />} />
      <Route path="class-management" element={<Classes />} />
      <Route path="mcq-builder" element={<MCQBuilder />} />
      <Route path="mcq-management" element={<MCQManagement />} />
      <Route path="lesson-plans" element={<LessonPlans />} />
      <Route path="substitute-request" element={<SubstituteTeacherRequest />} />
      <Route path="substitute-requests" element={<SubstituteRequests />} />
      {/* Teacher Remarks Routes */}
      <Route path="teacher-remarks" element={<TeacherRemarks />} />
      {/* Disciplinary Forms Routes */}
      <Route path="disciplinary-forms/create" element={<DisciplinaryFormCreate />} />
      <Route path="disciplinary-forms/:formId" element={<DisciplinaryFormCreate />} />
      <Route path="counselling-request" element={<CounsellingRequestForm />} />
    </Routes>
  );
};

export default TeacherRoutes; 