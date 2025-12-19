import { useEffect, useState } from "react";
import ProAPI from "../../api/professionalDiary";
import { Link } from "react-router-dom";

export default function ProfessionalHome() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    ProAPI.getEntries()
      .then((res) => {
        setEntries(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load professional diary entries");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
          <div className="text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading your professional diary...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-briefcase me-2 text-primary"></i>
            Professional Diary
          </h2>
          <p className="text-muted mb-0">Track your professional journey and growth</p>
        </div>
        <Link to="/professional/new" className="btn btn-primary">
          <i className="bi bi-plus-circle me-1"></i>
          New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-5">
          <div className="mb-4">
            <i className="bi bi-journal-x display-1 text-muted"></i>
          </div>
          <h4 className="text-muted">No professional entries yet</h4>
          <p className="text-muted mb-4">
            Start documenting your professional journey by creating your first entry.
          </p>
          <Link to="/professional/new" className="btn btn-primary btn-lg">
            <i className="bi bi-plus-circle me-2"></i>
            Create Your First Entry
          </Link>
        </div>
      ) : (
        <div className="row">
          {entries.map((entry) => (
            <div key={entry._id} className="col-12 mb-3">
              <div className="card h-100 shadow-sm entry-card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">{entry.title}</h5>
                    <small className="text-muted">
                      <i className="bi bi-calendar-event me-1"></i>
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </small>
                  </div>
                  <p className="card-text text-muted">
                    {entry.description.length > 150
                      ? `${entry.description.substring(0, 150)}...`
                      : entry.description
                    }
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">
                      <i className="bi bi-clock me-1"></i>
                      {new Date(entry.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                    <Link
                      to={`/professional/entry/${entry._id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="bi bi-eye me-1"></i>
                      View Full Entry
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-muted mb-0">
            <i className="bi bi-shield-check me-1"></i>
            All entries are private and secure
          </p>
        </div>
      )}
    </div>
  );
}
