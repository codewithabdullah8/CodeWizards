import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="alert alert-success text-center" role="alert">
              <h4 className="alert-heading">Entry Created Successfully!</h4>
              <p>Redirecting to your professional diary...</p>
              <div className="spinner-border text-success mt-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h3 className="card-title mb-0">
                <i className="bi bi-plus-circle me-2"></i>
                New Professional Entry
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <label htmlFor="entry-title" className="form-label fw-semibold">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    id="entry-title"
                    type="text"
                    className={`form-control form-control-lg ${error && !title.trim() ? 'is-invalid' : ''}`}
                    placeholder="Enter a meaningful title for your entry..."
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    maxLength={100}
                  />
                  <div className="form-text">
                    {title.length}/100 characters
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="entry-description" className="form-label fw-semibold">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    id="entry-description"
                    className={`form-control ${error && !description.trim() ? 'is-invalid' : ''}`}
                    rows={8}
                    placeholder="Describe your professional thoughts, achievements, challenges, or reflections..."
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (error) setError("");
                    }}
                    required
                    maxLength={2000}
                  />
                  <div className="form-text">
                    {description.length}/2000 characters
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary me-md-2"
                    onClick={() => navigate("/professional")}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary d-flex align-items-center justify-content-center"
                    disabled={loading || !title.trim() || !description.trim()}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Entry...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-1"></i>
                        Save Entry
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="mt-4">
            <div className="alert alert-info">
              <h6 className="alert-heading">
                <i className="bi bi-info-circle me-2"></i>
                Tips for Better Entries
              </h6>
              <ul className="mb-0">
                <li>Use clear, descriptive titles that capture the essence of your entry</li>
                <li>Include specific details about your work, challenges, and achievements</li>
                <li>Consider how this entry reflects your professional growth</li>
                <li>Entries are private and secure - feel free to be honest and reflective</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
