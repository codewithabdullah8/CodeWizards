import React, { useEffect, useState } from "react";
import ProAPI from "../../api/professionalDiary";

export default function MoodTracker() {
  const user = JSON.parse(localStorage.getItem("mydiary_user"));
  const [data, setData] = useState([]);

  useEffect(() => {
    ProAPI.getAll(user._id).then(({ data }) => setData(data));
  }, []);

  const moodCount = data.reduce((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page">
      <h2>Mood Tracker</h2>

      <div className="stats">
        {Object.keys(moodCount).map((mood) => (
          <div key={mood} className="stat-box">
            <h3>{mood}</h3>
            <p>{moodCount[mood]} entries</p>
          </div>
        ))}
      </div>
    </div>
  );
}
