import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const { admin, role, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">Inversiones Wildar Admin</div>
        <nav className="admin-sidebar__nav">
          <NavLink to="/admin/products" className="admin-sidebar__link">
            Productos
          </NavLink>
          {role !== "price_editor" && (
            <>
              <NavLink to="/admin/categories" className="admin-sidebar__link">
                Categorías
              </NavLink>
              <NavLink to="/admin/banners" className="admin-sidebar__link">
                Banners
              </NavLink>
              <NavLink to="/admin/settings" className="admin-sidebar__link">
                Configuración
              </NavLink>
            </>
          )}
        </nav>
        <div className="admin-sidebar__footer">
          <span>{admin?.email}</span>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
