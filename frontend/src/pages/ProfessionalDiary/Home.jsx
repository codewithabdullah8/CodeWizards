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
        setError("Failed to load professional diary");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Professional Diary</h2>

      <Link to="/professional/new">
        <button style={{ marginBottom: "15px" }}>+ New Entry</button>
      </Link>

      {entries.length === 0 ? (
        <p>No professional entries yet.</p>
      ) : (
        entries.map((e) => (
          <div
            key={e._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginBottom: "10px",
              borderRadius: "6px",
            }}
          >
            <h4>{e.title}</h4>
            <p>{e.description}</p>
            <small>
              {new Date(e.date).toLocaleDateString()}
            </small>
          </div>
        ))
      )}
    </div>
  );
}
