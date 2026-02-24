import React, { useState, useEffect } from "react";
import ProAPI from "../api/professionalDiary";
import ScheduleAPI from "../api/schedule";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function CalendarCard() {
  const user = JSON.parse(localStorage.getItem("mydiary_user"));
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [diaryEntries, setDiaryEntries] = useState([]);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [daysWithDiaryEntries, setDaysWithDiaryEntries] = useState(new Set());
  const [daysWithSchedule, setDaysWithSchedule] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch diary entries and schedule items
  useEffect(() => {
    fetchData();
  }, [currentDate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Fetch all professional diary entries
      const { data: diaryData } = await ProAPI.getEntries();
      const diaryDaysSet = new Set();
      const entriesForMonth = [];

      diaryData.forEach((entry) => {
        const entryDate = new Date(entry.date);
        if (
          entryDate.getFullYear() === year &&
          entryDate.getMonth() === month
        ) {
          diaryDaysSet.add(entryDate.getDate());
          entriesForMonth.push(entry);
        }
      });

      setDiaryEntries(entriesForMonth);
      setDaysWithDiaryEntries(diaryDaysSet);

      // Fetch schedule items
      const { data: scheduleData } = await ScheduleAPI.getItems();
      const scheduleDaysSet = new Set();

      scheduleData.forEach((item) => {
        const itemDate = new Date(item.date);
        if (
          itemDate.getFullYear() === year &&
          itemDate.getMonth() === month
        ) {
          scheduleDaysSet.add(itemDate.getDate());
        }
      });

      setScheduleItems(scheduleData);
      setDaysWithSchedule(scheduleDaysSet);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const mondayStartIndex = (firstDay + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < mondayStartIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    if (day) {
      setSelectedDate(day);
    }
  };

  const getEntriesForSelectedDate = () => {
    if (!selectedDate) return [];
    return diaryEntries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getDate() === selectedDate;
    });
  };

  const getScheduleForDate = (day) => {
    if (!day) return [];
    return scheduleItems.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate.getDate() === day;
    });
  };

  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const calendarDays = getDaysInMonth();
  const selectedDateSchedule = selectedDate ? getScheduleForDate(selectedDate) : [];
  const selectedDateEntries = getEntriesForSelectedDate();

  if (loading) {
    return (
      <div className="calendar-card">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="calendar-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Calendar Section */}
      <div className="calendar-card__calendar">
        <div className="calendar-header">
          <h3 className="calendar-title">{monthName}</h3>
          <div className="calendar-nav">
            <button onClick={previousMonth} className="btn-nav" aria-label="Previous month">
              <i className="bi bi-chevron-left"></i>
            </button>
            <button onClick={nextMonth} className="btn-nav" aria-label="Next month">
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        <div className="calendar-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
            <div key={i} className="calendar-weekday">
              {day}
            </div>
          ))}

          {calendarDays.map((day, i) => {
            const hasDiaryEntry = day && daysWithDiaryEntries.has(day);
            const hasSchedule = day && daysWithSchedule.has(day);
            const isSelected = day === selectedDate;

            return (
              <motion.div
                key={i}
                className={`calendar-day ${isSelected ? "is-selected" : ""} ${
                  !day ? "is-empty" : ""
                } ${hasDiaryEntry ? "has-diary" : ""} ${
                  hasSchedule ? "has-schedule" : ""
                }`}
                onClick={() => handleDateClick(day)}
                whileHover={day ? { scale: 1.05 } : {}}
                whileTap={day ? { scale: 0.95 } : {}}
              >
                <span className="calendar-day__number">{day}</span>
                {hasDiaryEntry && <span className="calendar-day__indicator diary">📔</span>}
                {hasSchedule && <span className="calendar-day__indicator schedule">📅</span>}
              </motion.div>
            );
          })}
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-icon diary">📔</span>
            <span>Diary Entry</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon schedule">📅</span>
            <span>Scheduled</span>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="calendar-card__details">
        {selectedDate ? (
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h4 className="details-title">
              {new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                selectedDate
              ).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </h4>

            {/* Schedule Items for Selected Date */}
            {selectedDateSchedule.length > 0 && (
              <div className="details-section">
                <h5 className="section-title">📅 Scheduled</h5>
                <div className="items-list">
                  {selectedDateSchedule.map((item) => (
                    <div key={item._id} className="item-card schedule-card">
                      <div className="item-time">{item.time || "All day"}</div>
                      <div className="item-title">{item.title}</div>
                      {item.description && (
                        <div className="item-desc">{item.description}</div>
                      )}
                      <div className="item-priority">
                        <span className={`badge priority-${item.priority?.toLowerCase()}`}>
                          {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diary Entries for Selected Date */}
            {selectedDateEntries.length > 0 && (
              <div className="details-section">
                <h5 className="section-title">📔 Diary Entries</h5>
                <div className="items-list">
                  {selectedDateEntries.map((entry) => (
                    <Link
                      key={entry._id}
                      to={`/professional/view/${entry._id}`}
                      className="item-card diary-card"
                    >
                      <div className="item-title">{entry.title}</div>
                      {entry.content && (
                        <p className="item-excerpt">{entry.content.substring(0, 80)}...</p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {selectedDateSchedule.length === 0 && selectedDateEntries.length === 0 && (
              <div className="empty-state">
                <p>No events or entries for this date</p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="empty-state">
            <p>Select a date to view details</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}