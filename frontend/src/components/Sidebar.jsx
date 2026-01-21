import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

export default function Sidebar({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="sidebar-overlay"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Sidebar */}
          <motion.aside
            className="daytrack-sidebar"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ ease: "easeOut", duration: 0.35 }}
          >
            <h3 className="sidebar-title">Menu</h3>

            <Link to="/" className="sidebar-item">
              <i className="bi bi-house"></i> Dashboard
            </Link>

            <Link to="/profile" className="sidebar-item">
              <i className="bi bi-person"></i> Profile
            </Link>

            <button className="sidebar-item logout">
              <i className="bi bi-box-arrow-right"></i> Log Out
            </button>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
