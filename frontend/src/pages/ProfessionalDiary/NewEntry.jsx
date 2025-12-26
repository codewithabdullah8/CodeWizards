import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ProAPI from "../../api/professionalDiary";

export default function NewEntry() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Basic validation
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    setLoading(true);
    try {
      await ProAPI.createEntry({ title: title.trim(), description: description.trim() });
      setSuccess(true);
      // Small delay to show success message
      setTimeout(() => {
        navigate("/professional");
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create entry. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        className="container mt-5"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <motion.div 
              className="card text-center border-success"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="card-body py-5">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                >
                  <i className="bi bi-check-circle-fill text-success display-1 mb-4"></i>
                </motion.div>
                <h4 className="card-title text-success mb-3">Entry Created Successfully!</h4>
                <p className="card-text text-muted mb-4">Your professional reflection has been saved.</p>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Redirecting...</span>
                  </div>
                </motion.div>
                <p className="text-muted mt-3 small">Redirecting to your professional diary...</p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
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
              <i className="bi bi-plus-circle me-3"></i>
              New Professional Entry
            </h1>
            <p className="text-muted fs-5">Document your professional journey and growth</p>
          </motion.div>

          <motion.div 
            className="card professional-card"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} noValidate>
                <motion.div 
                  className="mb-4"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.4 }}
                >
                  <label htmlFor="entry-title" className="form-label fw-bold fs-5">
                    <i className="bi bi-tag me-2 text-primary"></i>
                    Entry Title <span className="text-danger">*</span>
                  </label>
                  <input
                    id="entry-title"
                    type="text"
                    className={`form-control form-control-lg ${error && !title.trim() ? 'is-invalid' : ''}`}
                    placeholder="Give your professional entry a clear, descriptive title..."
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    maxLength={100}
                  />
                  <div className="form-text d-flex justify-content-between">
                    <span>Be specific and meaningful</span>
                    <span className={title.length > 90 ? 'text-warning' : 'text-muted'}>
                      {title.length}/100 characters
                    </span>
                  </div>
                </motion.div>

                <motion.div 
                  className="mb-4"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.4 }}
                >
                  <label htmlFor="entry-description" className="form-label fw-bold fs-5">
                    <i className="bi bi-pencil me-2 text-primary"></i>
                    Professional Reflection <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="entry-description"
                    className={`form-control ${error && !description.trim() ? 'is-invalid' : ''}`}
                    rows={10}
                    placeholder="Share your professional thoughts, achievements, challenges, learnings, or goals. What did you accomplish? What obstacles did you overcome? How did you grow?"
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    maxLength={2000}
                  />
                  <div className="form-text d-flex justify-content-between">
                    <span>Reflect on your professional development</span>
                    <span className={description.length > 1800 ? 'text-warning' : 'text-muted'}>
                      {description.length}/2000 characters
                    </span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.4 }}
                >
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center mb-4" role="alert">
                      <i className="bi bi-exclamation-triangle me-3 fs-5"></i>
                      <div>
                        <h6 className="mb-1">Please check your input</h6>
                        <p className="mb-0">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="d-flex gap-3 justify-content-end">
                    <motion.button
                      type="button"
                      className="btn btn-outline-secondary px-4 py-2"
                      onClick={() => navigate("/professional")}
                      disabled={loading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="btn btn-primary px-4 py-2 d-flex align-items-center"
                      disabled={loading || !title.trim() || !description.trim()}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                          Creating Entry...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-2"></i>
                          Save Professional Entry
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              </form>
            </div>
          </motion.div>

          <motion.div 
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <div className="alert alert-info border-0" style={{ background: 'var(--light-blue)', borderRadius: '16px' }}>
              <div className="d-flex align-items-start">
                <i className="bi bi-lightbulb text-primary fs-4 me-3 mt-1"></i>
                <div>
                  <h6 className="alert-heading text-primary mb-2">
                    <strong>Tips for Meaningful Professional Entries</strong>
                  </h6>
                  <div className="row">
                    <div className="col-md-6">
                      <ul className="mb-0 small">
                        <li>Use specific examples from your work</li>
                        <li>Reflect on challenges and solutions</li>
                        <li>Note skills you've developed</li>
                      </ul>
                    </div>
                    <div className="col-md-6">
                      <ul className="mb-0 small">
                        <li>Consider career goals and progress</li>
                        <li>Document feedback and learnings</li>
                        <li>Track your professional growth</li>
                      </ul>
                    </div>
                  </div>
                  <p className="text-muted mb-0 mt-2 small">
                    <i className="bi bi-shield-check me-1"></i>
                    All entries are private and secure
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
