import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ScheduleAPI from '../api/schedule';

export default function Schedule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data } = await ScheduleAPI.getItems();
      setItems(data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load schedule items');
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await ScheduleAPI.deleteItem(id);
      setItems(items.filter(i => i._id !== id));
    } catch (err) {
      alert('Failed to delete item');
    }
  };

  const toggleComplete = async (id) => {
    try {
      const { data } = await ScheduleAPI.toggleComplete(id);
      setItems(items.map(i => i._id === id ? data : i));
    } catch (err) {
      alert('Failed to update item');
    }
  };

  if (loading) return <div className="container py-4">Loading...</div>;
  if (error) return <div className="container py-4 alert alert-danger">{error}</div>;

  return (
    <div className="container hero py-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8">
          <h2>Schedule</h2>
          <Link to="/schedule/new" className="btn btn-primary mb-3">+ New Item</Link>
          {items.length === 0 ? (
            <p>No items yet. <Link to="/schedule/new">Create your first item</Link>.</p>
          ) : (
            <div className="list-group">
              {items.map(item => (
                <div key={item._id} className="list-group-item">
                  <h5 className={item.completed ? 'text-decoration-line-through' : ''}>{item.title}</h5>
                  <p>{item.description}</p>
                  <small className="text-muted">
                    {new Date(item.date).toLocaleDateString()} {item.time && `at ${item.time}`}
                  </small>
                  <div className="mt-2">
                    <button onClick={() => toggleComplete(item._id)} className={`btn btn-sm ${item.completed ? 'btn-outline-secondary' : 'btn-outline-success'}`}>
                      {item.completed ? 'Mark Incomplete' : 'Mark Complete'}
                    </button>
                    <Link to={`/schedule/view/${item._id}`} className="btn btn-sm btn-outline-primary ms-2">View</Link>
                    <button onClick={() => deleteItem(item._id)} className="btn btn-sm btn-outline-danger ms-2">Delete</button>
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