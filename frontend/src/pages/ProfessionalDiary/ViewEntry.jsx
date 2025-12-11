import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ProAPI from "../../api/professionalDiary";

export default function ViewEntry() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);

  useEffect(() => {
    ProAPI.getOne(id).then(({ data }) => setEntry(data));
  }, [id]);

  const handleDelete = async () => {
    await ProAPI.delete(id);
    navigate("/professional");
  };

  if (!entry) return <div>Loading...</div>;

  return (
    <div className="page">
      <h2>{entry.title}</h2>
      <p>{entry.description}</p>
      <p><b>Category:</b> {entry.category}</p>
      <p><b>Mood:</b> {entry.mood}</p>
      <p><b>Date:</b> {new Date(entry.date).toDateString()}</p>

      <button onClick={handleDelete} className="button danger">
        Delete Entry
      </button>

      <Link to="/professional" className="button">Back</Link>
    </div>
  );
}
