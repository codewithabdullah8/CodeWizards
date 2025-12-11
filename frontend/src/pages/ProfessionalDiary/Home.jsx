import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProAPI from "../../api/professionalDiary";

export default function Home() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("mydiary_user"));
    if (!user) return;

    ProAPI.getAll(user._id).then(({ data }) => setEntries(data));
  }, []);

  return (
    <div className="page">
      <h2>Professional Diary</h2>

      <Link to="/professional/new" className="button">+ New Entry</Link>

      <div className="entries-list">
        {entries.map((e) => (
          <Link key={e._id} to={`/professional/view/${e._id}`} className="entry-card">
            <h3>{e.title}</h3>
            <p>{new Date(e.date).toDateString()}</p>
            <span>{e.category}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
