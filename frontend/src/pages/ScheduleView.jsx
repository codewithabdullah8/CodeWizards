import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ScheduleAPI from '../api/schedule';

export default function ScheduleView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await ScheduleAPI.getItem(id);
        setItem(data);
      } catch (err) {
        setError('Could not load schedule item');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this schedule item?')) return;
    try {
      await ScheduleAPI.deleteItem(id);
      window.dispatchEvent(new Event('refreshRecentEntries'));
      window.dispatchEvent(new Event('refreshProfessionalEntries'));
      navigate('/professional');
    } catch (err) {
      alert('Failed to delete schedule');
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <motion.div className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="container py-5">
        <motion.div className="alert alert-warning" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h5>Schedule item not found</h5>
          <Link to="/professional" className="btn btn-primary mt-2">Back</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div className="container py-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <motion.div className="card diary-entry-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="card-body">
              <h2 className="text-primary mb-3">
                <i className="bi bi-calendar3 me-2"></i>
                {item.title}
              </h2>
              <p className="text-muted mb-2">
                <i className="bi bi-calendar-event me-1"></i>
                {new Date(item.date).toLocaleDateString()}
                {item.time && (
                  <span> {new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                )}
              </p>
              <p className="card-text fs-5 lh-base mb-4">{item.description}</p>
              <div className="d-flex justify-content-end gap-2">
                <button className="btn btn-outline-danger" onClick={handleDelete}>
                  <i className="bi bi-trash me-1"></i> Delete
                </button>
                <Link to="/professional" className="btn btn-secondary">
                  Back
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
