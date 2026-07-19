import Navbar from '../components/Navbar';

function MainLayout({ children }) {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main-content">
        <div className="container">{children}</div>
      </main>
    </div>
  );
}

export default MainLayout;