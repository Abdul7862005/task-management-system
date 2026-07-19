import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTodo, UserCircle, LogOut, CheckCircle2, CalendarCheck, Calendar as CalendarIcon } from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
    const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/tasks', label: 'Tasks', icon: ListTodo },
  { path: '/plans', label: 'Plans', icon: CalendarCheck },
  { path: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { path: '/profile', label: 'Profile', icon: UserCircle },
];

  

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="navbar-brand-icon">
          <CheckCircle2 size={18} />
        </div>
        TaskManager
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={isActive ? 'sidebar-link active' : 'sidebar-link'}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="navbar-avatar">{initials}</div>
          <span>{user?.name}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <LogOut size={14} /> Logout
        </button>
      </div>
    </aside>
  );
}

export default Navbar;