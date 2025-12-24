import React, { useState, useEffect } from "react";
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

  if (loading) return <div className="container py-4">Loading...</div>;
  if (error) return <div className="container py-4 alert alert-danger">{error}</div>;

  return (
    <div className="container py-4">
      <h2>Schedule</h2>

      {showCreate && (
        <div className="card p-3 mb-3">
          <input
            className="form-control mb-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input
            type="date"
            className="form-control mb-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="time"
            className="form-control mb-2"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <textarea
            className="form-control mb-2"
            placeholder="Notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button className="btn btn-primary me-2" onClick={handleSave}>
            Save
          </button>
          <button className="btn btn-secondary" onClick={() => setShowCreate(false)}>
            Cancel
          </button>
        </div>
      )}

      <button className="btn btn-primary mb-3" onClick={() => setShowCreate(true)}>
        + New Schedule
      </button>

      {items.map((item) => (
        <div key={item._id} className="list-group-item mb-2">
          <h5 style={{ textDecoration: item.completed ? "line-through" : "none" }}>
            {item.title}
          </h5>
          <p>{item.description}</p>
          <small>{new Date(item.date).toLocaleDateString()}</small>
          <div className="mt-2">
            <button
              className="btn btn-sm btn-outline-success me-2"
              onClick={() => toggleComplete(item._id)}
            >
              Toggle
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => deleteItem(item._id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
