import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProAPI from "../../api/professionalDiary";

export default function NewEntry() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("mydiary_user"));

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    mood: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await ProAPI.create({ ...form, userId: user._id });
    navigate("/professional");
  };

  return (
    <div className="page">
      <h2>New Professional Entry</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          placeholder="Category (Work/Study/Project...)"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <input
          placeholder="Mood"
          value={form.mood}
          onChange={(e) => setForm({ ...form, mood: e.target.value })}
        />

        <button className="button" type="submit">Save Entry</button>
      </form>
    </div>
  );
}
