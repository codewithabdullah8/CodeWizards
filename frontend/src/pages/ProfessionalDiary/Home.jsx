import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import ProAPI from "../../api/professionalDiary";
import ScheduleAPI from "../../api/schedule";

export default function ProfessionalHome() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEntries = async () => {
    setLoading(true);
    try {
      const [proRes, schedRes] = await Promise.all([
        ProAPI.getEntries(),
        ScheduleAPI.getItems(),
      ]);
      const proList = (proRes.data || []).map((e) => ({ ...e, source: 'professional' }));
      const schedList = (schedRes.data || []).map((e) => ({ ...e, source: 'schedule' }));
      const combined = [...proList, ...schedList];
      combined.sort((a, b) => new Date(b.date) - new Date(a.date));
      setEntries(combined);
      setLoading(false);
    } catch (err) {
      setError("Failed to load professional diary entries");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEntries();

    const refreshHandler = () => {
      loadEntries();
    };

    window.addEventListener('refreshProfessionalEntries', refreshHandler);
    return () => {
      window.removeEventListener('refreshProfessionalEntries', refreshHandler);
    };
  }, []);

  const deleteEntry = async (id, source = 'professional') => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      if (source === 'schedule') {
        await ScheduleAPI.deleteItem(id);
      } else {
        await ProAPI.deleteEntry(id);
      }
      setEntries(entries.filter((e) => e._id !== id));
      // notify both recent list and professional list
      window.dispatchEvent(new Event('refreshRecentEntries'));
      window.dispatchEvent(new Event('refreshProfessionalEntries'));
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <motion.div 
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: '400px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <motion.div 
              className="spinner-border text-primary mb-3"
              style={{ width: '3rem', height: '3rem' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <span className="visually-hidden">Loading...</span>
            </motion.div>
            <h5 className="text-muted">Loading your professional diary...</h5>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <motion.div 
          className="alert alert-danger d-flex align-items-center justify-content-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <i className="bi bi-exclamation-triangle me-3 fs-4"></i>
          <div>
            <h5 className="mb-1">Error Loading Professional Diary</h5>
            <p className="mb-0">{error}</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      className="container py-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          <motion.div 
            className="text-center mb-5"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="page-header display-4 mb-3">
              <i className="bi bi-briefcase me-3"></i>
              Professional Diary
            </h1>
            <p className="text-muted fs-5">Track your professional journey and growth</p>
          </motion.div>

      {entries.length === 0 ? (
        <motion.div 
          className="text-center py-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="mb-4">
            <i className="bi bi-journal-x display-1 text-muted"></i>
          </div>
          <h4 className="text-muted mb-3">No professional or schedule items yet</h4>
          <p className="text-muted mb-4 fs-5">
            Start documenting your professional journey or add a schedule by creating your first entry.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/professional/new" className="btn btn-primary btn-lg px-5 py-3">
              <i className="bi bi-plus-circle me-2"></i>
              Create Your First Entry
            </Link>
          </motion.div>
        </motion.div>
      ) : (
        <>
          <motion.div 
            className="text-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/professional/new" className="btn btn-primary btn-lg px-5 py-3">
                <i className="bi bi-plus-circle me-2"></i>
                New Professional Entry
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            className="row g-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
          {entries.map((entry, index) => (
            <motion.div 
              key={entry._id}
              className="col-12 col-md-6 col-lg-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * index, duration: 0.4 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className="card diary-entry-card h-100 shadow-sm" style={{ transition: 'all 0.3s ease' }}>
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title text-primary mb-0" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      fontSize: '1.1rem'
                    }}>
                      {entry.source === 'schedule' ? (
                        <><i className="bi bi-calendar3 me-1"></i>{entry.title}</>
                      ) : (
                        entry.title
                      )}
                    </h5>
                  </div>
                  <small className="text-muted mb-3">
                    <i className="bi bi-calendar-event me-1"></i>
                    {new Date(entry.date).toLocaleDateString()}
                    {entry.source === 'schedule' && entry.time ? (
                      <span> {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    ) : null}
                  </small>
                  <p className="card-text text-muted mb-3 flex-grow-1" style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '80px'
                  }}>
                    {entry.description}
                  </p>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex gap-2">
                        {entry.source === 'professional' ? (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              to={`/professional/entry/${entry._id}`}
                              className="btn btn-outline-primary btn-sm px-3"
                            >
                              <i className="bi bi-eye me-1"></i>
                              View
                            </Link>
                          </motion.div>
                        ) : entry.source === 'schedule' ? (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link
                              to={`/schedule/item/${entry._id}`}
                              className="btn btn-outline-secondary btn-sm px-3"
                            >
                              <i className="bi bi-calendar3 me-1"></i>
                              View
                            </Link>
                          </motion.div>
                        ) : null}
                        <motion.button
                          onClick={() => deleteEntry(entry._id, entry.source)}
                          className="btn btn-outline-danger btn-sm px-3"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <i className="bi bi-trash me-1"></i>
                        </motion.button>
                      </div>
                    </div>
                    <small className="text-muted d-block text-end">
                      <i className="bi bi-clock me-1"></i>
                      {new Date(entry.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        </>
      )}

      {entries.length > 0 && (
        <motion.div 
          className="mt-5 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <p className="text-muted mb-0 fs-6">
            <i className="bi bi-shield-check me-2 text-success"></i>
            All entries are private and secure
          </p>
        </motion.div>
      )}
        </div>
      </div>
    </motion.div>
  );
}
