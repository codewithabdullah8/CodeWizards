import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import ProAPI from "../../api/professionalDiary";

export default function ViewEntry() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    ProAPI.getOne(id)
      .then(({ data }) => {
        setEntry(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading entry:", err);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        await ProAPI.deleteEntry(id);
        navigate("/professional");
      } catch (err) {
        alert("Failed to delete entry");
      }
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
            <h5 className="text-muted">Loading entry...</h5>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="container py-5">
        <motion.div 
          className="alert alert-warning"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h5>Entry not found</h5>
          <Link to="/professional" className="btn btn-primary mt-2">
            Back to Professional Diary
          </Link>
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
            className="card shadow-lg diary-entry-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="card-body p-4">

              {/* Title */}
              <h2 className="text-primary mb-3">
                <i className="bi bi-briefcase me-2"></i>
                {entry?.title}
              </h2>

              {/* Meta info */}
              <div className="d-flex gap-3 mb-3 text-muted">
                <span>
                  <i className="bi bi-calendar-event me-1"></i>
                  {new Date(entry?.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span>
                  <i className="bi bi-clock me-1"></i>
                  {new Date(entry?.date).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Divider */}
              <hr />

              {/* Content */}
              <div className="mt-4 mb-4">
                <p style={{ whiteSpace: "pre-line", fontSize: "1.1rem", lineHeight: "1.8" }}>
                  {entry?.description}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-4 d-flex gap-2 justify-content-between">
                <motion.button
                  className="btn btn-outline-secondary px-4"
                  onClick={() => navigate("/professional")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to List
                </motion.button>

                <motion.button
                  className="btn btn-outline-danger px-4"
                  onClick={handleDelete}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="bi bi-trash me-2"></i>
                  Delete Entry
                </motion.button>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>

  );
}
