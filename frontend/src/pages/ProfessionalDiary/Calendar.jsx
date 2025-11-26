import React, { useState } from "react";
import ProAPI from "../../api/professionalDiary";
import { Link } from "react-router-dom";

export default function Calendar() {
  const user = JSON.parse(localStorage.getItem("mydiary_user"));
  const [date, setDate] = useState("");
  const [entries, setEntries] = useState([]);

  const search = async () => {
    if (!date) return;
    const res = await ProAPI.getByDate(user._id, date);
    setEntries(res.data);
  };

  return (
    <div className="page">
      <h2>Search by Date</h2>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <button onClick={search} className="button">Search</button>

      <div className="entries-list">
        {entries.map((e) => (
          <Link key={e._id} to={`/professional/view/${e._id}`} className="entry-card">
            <h3>{e.title}</h3>
            <p>{new Date(e.date).toDateString()}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
