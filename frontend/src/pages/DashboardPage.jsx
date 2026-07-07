import { useAuth } from '../context/AuthContext';
import EmployeeDashboard from './EmployeeDashboard';
import HRDashboard from './HRDashboard';

export default function DashboardPage() {
  const { isHR } = useAuth();
  return isHR ? <HRDashboard /> : <EmployeeDashboard />;
}
