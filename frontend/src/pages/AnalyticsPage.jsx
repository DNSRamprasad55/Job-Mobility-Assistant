import { useAuth } from '../context/AuthContext';
import HRDashboard from './HRDashboard';
import EmployeeDashboard from './EmployeeDashboard';

export default function AnalyticsPage() {
  const { isHR } = useAuth();
  return isHR ? <HRDashboard /> : <EmployeeDashboard />;
}
