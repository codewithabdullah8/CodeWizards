import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProAPI from "../../api/professionalDiary";

export default function NewEntry() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    ProAPI.createEntry({ title, description })
      .then(() => navigate("/professional"))
      .catch(() => alert("Failed to create entry"));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>New Professional Entry</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <br /><br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <br /><br />

        <button type="submit">Save</button>
      </form>
    </div>
  );
}
