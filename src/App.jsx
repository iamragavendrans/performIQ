import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { ROLES } from './lib/roles';

import Login from './pages/Login';
import Shell from './components/layout/Shell';
import { Toast } from './components/ui';

import EmpDashboard from './pages/employee/Dashboard';
import MyGoals from './pages/employee/MyGoals';
import AIFeedback from './pages/employee/AIFeedback';
import MyRating from './pages/employee/MyRating';
import LifeEvents from './pages/employee/LifeEvents';

import MgrDashboard from './pages/manager/Dashboard';
import MyTeam from './pages/manager/MyTeam';
import MgrGoalMgmt from './pages/manager/GoalMgmt';
import MgrApprovals from './pages/manager/Approvals';
import MgrReports from './pages/manager/Reports';
import MgrPromotions from './pages/manager/Promotions';

import AdminDashboard from './pages/admin/Dashboard';
import UserMgmt from './pages/admin/UserMgmt';
import GoalCatalog from './pages/admin/GoalCatalog';
import RatingPeriods from './pages/admin/RatingPeriods';
import Groups from './pages/admin/Groups';
import AdminApprovals from './pages/admin/Approvals';
import AdminPromotions from './pages/admin/Promotions';
import OrgReport from './pages/admin/OrgReport';

function Router() {
  const { user, page, toast, managerMode } = useApp();
  if (!user) return <><Login /><Toast toast={toast} /></>;

  const isManagerLike = user.role === ROLES.MANAGER || user.role === ROLES.DIRECTOR;
  const useManagerSurface = isManagerLike && managerMode;
  const useAdminSurface = user.role === ROLES.ADMIN;

  let content = null;
  if (useAdminSurface) {
    content = {
      dashboard:  <AdminDashboard />,
      users:      <UserMgmt />,
      catalog:    <GoalCatalog />,
      periods:    <RatingPeriods />,
      groups:     <Groups />,
      approvals:  <AdminApprovals />,
      promotions: <AdminPromotions />,
      reports:    <OrgReport />,
    }[page] || <AdminDashboard />;
  } else if (useManagerSurface) {
    content = {
      dashboard:    <MgrDashboard />,
      'my-team':    <MyTeam />,
      'goals-mgmt': <MgrGoalMgmt />,
      approvals:    <MgrApprovals />,
      reports:      <MgrReports />,
      promotions:   <MgrPromotions />,
    }[page] || <MgrDashboard />;
  } else {
    content = {
      dashboard:     <EmpDashboard />,
      'my-goals':    <MyGoals />,
      'ai-feedback': <AIFeedback />,
      'my-rating':   <MyRating />,
      'life-events': <LifeEvents />,
    }[page] || <EmpDashboard />;
  }

  return (
    <>
      <Shell>{content}</Shell>
      <Toast toast={toast} />
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <Router />
      </AppProvider>
    </ThemeProvider>
  );
}
