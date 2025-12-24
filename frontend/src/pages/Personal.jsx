import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PersonalAPI from '../api/personal';

export default function Personal() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);



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
          {selectedEntry && (
  <div className="card mb-3">
    <div className="card-body">
      <h5 className="card-title">{selectedEntry.title}</h5>
      <p className="card-text">{selectedEntry.content}</p>

      <button
        className="btn btn-secondary btn-sm"
        onClick={() => setSelectedEntry(null)}
      >
        Close
      </button>
    </div>
  </div>
)}

          {showCreate && (
  <div className="card p-3 mb-3">
    <h5>Create New Entry</h5>

    <form
      onSubmit={async (e) => {
        e.preventDefault();

        const form = e.target;
        const payload = {
          title: form.title.value,
          content: form.content.value,
        };

        try {
          const { data } = await PersonalAPI.createEntry(payload);
          setEntries([data, ...entries]);
          setShowCreate(false);
          form.reset();
        } catch (err) {
          alert("Failed to create entry");
        }
      }}
    >
      <div className="mb-2">
        <input
          name="title"
          className="form-control"
          placeholder="Title"
          required
        />
      </div>

      <div className="mb-2">
        <textarea
          name="content"
          className="form-control"
          placeholder="Write your entry..."
          rows="4"
          required
        />
      </div>

      <div className="d-flex gap-2">
        <button className="btn btn-success" type="submit">
          Save
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setShowCreate(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}

          <button
  className="btn btn-primary mb-3"
  onClick={() => setShowCreate(true)}
>
  + New Entry
</button>

          {entries.length === 0 ? (
            <p>
  No entries yet.{" "}
  <button
    className="btn btn-link p-0"
    onClick={() => setShowCreate(true)}
  >
    Create your first entry
  </button>.
</p>

          ) : (
            <div className="list-group">
              {entries.map(entry => (
                <div key={entry._id} className="list-group-item">
                  <h5>{entry.title}</h5>
                  <p>{entry.content.substring(0, 100)}...</p>
                  <small className="text-muted">{new Date(entry.date).toLocaleDateString()}</small>
                  <div className="mt-2">
                   <button
  className="btn btn-sm btn-outline-primary"
   onClick={() => setSelectedEntry(entry)}
>
  View
</button>


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