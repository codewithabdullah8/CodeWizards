import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../contexts/ToastContext';
import API from '../api';
import PersonalAPI from '../api/personal';
import ProAPI from '../api/professionalDiary';
import ScheduleAPI from '../api/schedule';

export default function RecentEntries() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [recentEntries, setRecentEntries] = useState([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadRecentEntries();
  }, []);

  const loadRecentEntries = async () => {
    setLoadingEntries(true);
    try {
      const results = await Promise.allSettled([
        API.get('/diary'),
        PersonalAPI.getEntries(),
        ProAPI.getEntries(),
        ScheduleAPI.getItems(),
      ]);

      const [diaryResult, personalResult, professionalResult, scheduleResult] = results;
      const errors = [];
      const combined = [];

      const getTimestamp = (value) => {
        if (!value) return 0;
        const parsed = new Date(value).getTime();
        return Number.isNaN(parsed) ? 0 : parsed;
      };

      const normalizeEntries = (entries, source, overrides = {}) => {
        return (entries || []).map((entry) => {
          const displayDate = entry.date || entry.createdAt || entry.updatedAt;
          const sortTimestamp = getTimestamp(displayDate);
          const title = entry.title || '(Untitled)';
          const content = entry.content || entry.description || '';
          const id = entry._id || entry.id;

          return {
            ...entry,
            ...overrides,
            id,
            source,
            title,
            content,
            displayDate,
            sortTimestamp,
            entryKey: `${source}-${id || Math.random().toString(36).slice(2)}`,
          };
        });
      };

      if (diaryResult.status === 'fulfilled') {
        const diaryData = Array.isArray(diaryResult.value.data)
          ? diaryResult.value.data
          : (diaryResult.value.data.entries || []);
        combined.push(
          ...normalizeEntries(diaryData, 'diary', {
            sourceLabel: 'Diary',
            navigatePath: (entry) => `/entry/${entry._id || entry.id}`,
          })
        );
      } else {
        errors.push('Diary');
      }

      if (personalResult.status === 'fulfilled') {
        combined.push(
          ...normalizeEntries(personalResult.value.data, 'personal', {
            sourceLabel: 'Personal',
            navigatePath: () => '/personal',
          })
        );
      } else {
        errors.push('Personal');
      }

      if (professionalResult.status === 'fulfilled') {
        combined.push(
          ...normalizeEntries(professionalResult.value.data, 'professional', {
            sourceLabel: 'Professional',
            navigatePath: (entry) => `/professional/entry/${entry._id || entry.id}`,
          })
        );
      } else {
        errors.push('Professional');
      }

      if (scheduleResult.status === 'fulfilled') {
        combined.push(
          ...normalizeEntries(scheduleResult.value.data, 'schedule', {
            sourceLabel: 'Schedule',
            navigatePath: () => '/schedule',
          })
        );
      } else {
        errors.push('Schedule');
      }

      const finalEntries = combined
        .map((entry) => ({
          ...entry,
          navigatePath: typeof entry.navigatePath === 'function'
            ? entry.navigatePath(entry)
            : entry.navigatePath,
        }))
        .sort((a, b) => b.sortTimestamp - a.sortTimestamp);

      setRecentEntries(finalEntries);
      setError(errors.length === results.length ? 'Could not load recent entries' : '');

      if (errors.length && errors.length < results.length) {
        addToast('Some entries could not be loaded', 'warning');
      }
    } catch (err) {
      setError('Could not load recent entries');
      setRecentEntries([]);
      addToast('Failed to load recent entries', 'error');
    } finally {
      setLoadingEntries(false);
    }
  };

  const filteredEntries = recentEntries.filter((entry) => {
    const haystack = `${entry.title || ''} ${entry.content || ''} ${entry.sourceLabel || ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  const getSourceBadgeColor = (source) => {
    switch (source) {
      case 'personal':
        return 'success';
      case 'professional':
        return 'info';
      case 'schedule':
        return 'warning';
      case 'diary':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="container py-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0 fw-bold">
            <i className="bi bi-clock-history text-primary me-2"></i>
            Recent Entries
          </h2>
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-light border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              className="form-control border-start-0"
              placeholder="Search entries..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            {loadingEntries ? (
              <div className="row g-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="entry-card card border-0 shadow-sm p-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1 me-3">
                        <div className="placeholder-glow">
                          <span className="placeholder col-6"></span>
                          <span className="placeholder col-4"></span>
                          <span className="placeholder col-7"></span>
                          <span className="placeholder col-4"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-5">
                <i className="bi bi-exclamation-triangle display-1 text-muted mb-3"></i>
                <h5 className="text-muted">Unable to load entries</h5>
                <p className="text-muted">{error}</p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-journal-x display-1 text-muted mb-3"></i>
                <h5 className="text-muted">No entries found</h5>
                <p className="text-muted">
                  {query.trim() ? 'Try adjusting your search' : 'No recent entries available'}
                </p>
              </div>
            ) : (
              <div className="row g-3">
                {filteredEntries.map((entry, index) => (
                  <motion.div
                    key={entry.entryKey}
                    className="col-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.4 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <div
                      className="entry-card card border-0 shadow-sm p-3 cursor-pointer"
                      onClick={() => entry.navigatePath && navigate(entry.navigatePath)}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1 me-3">
                          <h6 className="fw-bold mb-2 text-primary">
                            {entry.title || '(Untitled)'}
                          </h6>
                          <p className="text-muted small mb-2" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {entry.content || 'No details available'}
                          </p>
                          <div className="d-flex align-items-center gap-3">
                            <small className="text-muted">
                              <i className="bi bi-calendar me-1"></i>
                              {entry.displayDate
                                ? new Date(entry.displayDate).toLocaleDateString()
                                : 'No date'}
                            </small>
                            {entry.sourceLabel && (
                              <span
                                className={`badge bg-${getSourceBadgeColor(entry.source)} bg-opacity-10 text-${getSourceBadgeColor(entry.source)}`}
                              >
                                <i className="bi bi-folder me-1"></i>
                                {entry.sourceLabel}
                              </span>
                            )}
                            {entry.musicKey && entry.musicKey !== 'none' && (
                              <span className="badge bg-success bg-opacity-10 text-success">
                                <i className="bi bi-music-note me-1"></i>
                                {entry.musicKey}
                              </span>
                            )}
                          </div>
                        </div>
                        <i className="bi bi-chevron-right text-muted"></i>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}