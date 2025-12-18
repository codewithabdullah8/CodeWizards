import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PersonalAPI from '../api/personal';

export default function Personal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const { data } = await PersonalAPI.getEntries();
      setEntries(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load entries');
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await PersonalAPI.deleteEntry(id);
      setEntries(entries.filter(e => e._id !== id));
    } catch (err) {
      alert('Failed to delete entry');
    }
  };

  if (loading) return <div className="container py-4">Loading...</div>;
  if (error) return <div className="container py-4 alert alert-danger">{error}</div>;

  return (
    <div className="container hero py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <h2>Personal Diary</h2>
          <Link to="/personal/new" className="btn btn-primary mb-3">+ New Entry</Link>
          {entries.length === 0 ? (
            <p>No entries yet. <Link to="/personal/new">Create your first entry</Link>.</p>
          ) : (
            <div className="list-group">
              {entries.map(entry => (
                <div key={entry._id} className="list-group-item">
                  <h5>{entry.title}</h5>
                  <p>{entry.content.substring(0, 100)}...</p>
                  <small className="text-muted">{new Date(entry.date).toLocaleDateString()}</small>
                  <div className="mt-2">
                    <Link to={`/personal/view/${entry._id}`} className="btn btn-sm btn-outline-primary">View</Link>
                    <button onClick={() => deleteEntry(entry._id)} className="btn btn-sm btn-outline-danger ms-2">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}