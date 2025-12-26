import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ScheduleAPI from "../api/schedule";

export default function Schedule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await ScheduleAPI.getItems();
      setItems(data);
    } catch {
      setError("Failed to load schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await ScheduleAPI.createItem({ title, date, time, description });
      setTitle("");
      setDate("");
      setTime("");
      setDescription("");
      setShowCreate(false);
      fetchItems();
    } catch {
      alert("Failed to save schedule");
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this schedule?")) return;
    await ScheduleAPI.deleteItem(id);
    setItems(items.filter((i) => i._id !== id));
  };

  const toggleComplete = async (id) => {
    const { data } = await ScheduleAPI.toggleComplete(id);
    setItems(items.map((i) => (i._id === id ? data : i)));
  };

  if (loading) return (
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
          <h5 className="text-muted">Loading your schedule...</h5>
        </div>
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="container py-5">
      <motion.div 
        className="alert alert-danger d-flex align-items-center justify-content-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <i className="bi bi-exclamation-triangle me-3 fs-4"></i>
        <div>
          <h5 className="mb-1">Error Loading Schedule</h5>
          <p className="mb-0">{error}</p>
        </div>
      </motion.div>
    </div>
  );

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
              <i className="bi bi-calendar-check me-3"></i>
              Schedule Manager
            </h1>
            <p className="text-muted fs-5">Organize your time and stay productive</p>
          </motion.div>

          <AnimatePresence>
            {showCreate && (
              <motion.div 
                className="create-form mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0 text-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Add New Schedule Item
                  </h4>
                  <button
                    className="icon-btn btn btn-outline-secondary"
                    onClick={() => setShowCreate(false)}
                    title="Cancel"
                  >
                    <i className="bi bi-x"></i>
                  </button>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">
                      <i className="bi bi-tag me-2"></i>
                      Title
                    </label>
                    <input
                      className="form-control form-control-lg"
                      placeholder="Meeting, Task, Event..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold">
                      <i className="bi bi-calendar-event me-2"></i>
                      Date
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-bold">
                      <i className="bi bi-clock me-2"></i>
                      Time
                    </label>
                    <input
                      type="time"
                      className="form-control form-control-lg"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label fw-bold">
                      <i className="bi bi-text-paragraph me-2"></i>
                      Description
                    </label>
                    <textarea
                      className="form-control"
                      placeholder="Add details, notes, or location..."
                      rows="3"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-flex gap-3 justify-content-end mt-4">
                  <motion.button 
                    className="btn btn-outline-secondary px-4"
                    onClick={() => setShowCreate(false)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Cancel
                  </motion.button>
                  <motion.button 
                    className="btn btn-primary px-4"
                    onClick={handleSave}
                    disabled={!title || !date || !time}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <i className="bi bi-check-circle me-2"></i>
                    Save Schedule
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            className="d-flex justify-content-center mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <motion.button
              className="btn btn-primary btn-lg px-5 py-3"
              onClick={() => setShowCreate(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="bi bi-plus-circle me-2 fs-5"></i>
              Add Schedule Item
            </motion.button>
          </motion.div>

          {items.length === 0 ? (
            <motion.div 
              className="text-center py-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="mb-4">
                <i className="bi bi-calendar-x display-1 text-muted"></i>
              </div>
              <h4 className="text-muted mb-3">No schedule items yet</h4>
              <p className="text-muted mb-4 fs-5">
                Start organizing your time by adding your first schedule item.
              </p>
              <motion.button
                className="btn btn-primary btn-lg px-5 py-3"
                onClick={() => setShowCreate(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Create Your First Item
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              className="row g-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {items
                .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
                .map((item, index) => (
                <motion.div 
                  key={item._id} 
                  className="col-12"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.4 }}
                >
                  <div className={`card schedule-item ${item.completed ? 'opacity-75' : ''}`}>
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-md-8">
                          <div className="d-flex align-items-center mb-2">
                            <motion.button
                              className={`btn me-3 ${item.completed ? 'btn-success' : 'btn-outline-success'} icon-btn`}
                              onClick={() => toggleComplete(item._id)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              title={item.completed ? "Mark as incomplete" : "Mark as complete"}
                            >
                              <i className={`bi ${item.completed ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                            </motion.button>
                            <h5 className={`card-title mb-0 ${item.completed ? 'text-decoration-line-through text-muted' : 'text-primary'}`}>
                              {item.title}
                            </h5>
                          </div>
                          {item.description && (
                            <p className={`card-text mb-2 ${item.completed ? 'text-decoration-line-through' : ''}`}>
                              {item.description}
                            </p>
                          )}
                        </div>
                        <div className="col-md-3">
                          <div className="text-md-end">
                            <div className="mb-1">
                              <i className="bi bi-calendar-event me-2 text-primary"></i>
                              <strong>{new Date(item.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}</strong>
                            </div>
                            <div>
                              <i className="bi bi-clock me-2 text-primary"></i>
                              <strong>{new Date(`1970-01-01T${item.time}`).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-1">
                          <motion.button
                            className="btn btn-outline-danger icon-btn w-100"
                            onClick={() => deleteItem(item._id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            title="Delete item"
                          >
                            <i className="bi bi-trash"></i>
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
