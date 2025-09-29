import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api';

const MP3_FIRST = {
  calm: ['/music/calm.mp3', '/music/calm.wav'],
  focus: ['/music/focus.mp3', '/music/focus.wav'],
  rain: ['/music/rain.mp3', '/music/rain.wav'],
  none: [null],
};

export default function DiaryEntry() {
  const { id } = useParams();
  const [entry, setEntry] = useState(null);
  const [error, setError] = useState('');
  const audioRef = useRef(null);
  const [autoPlayFailed, setAutoPlayFailed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/diary/' + id)
      .then(({ data }) => setEntry(data))
      .catch(() => setError('Not found'));
  }, [id]);

  useEffect(() => {
    if (!entry) return;

    const candidates = MP3_FIRST[entry.musicKey || 'none'];
    const audio = audioRef.current;

    if (!candidates || !audio || !candidates[0]) return;

    async function tryPlay(urls) {
      for (const src of urls) {
        try {
          audio.src = src;
          audio.loop = true;
          await audio.play();
          return;
        } catch (e) {}
      }
      setAutoPlayFailed(true);
    }

    tryPlay(candidates);
  }, [entry]);

  if (error) {
    return (
      <div className="container hero">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="container hero">
        <div className="text-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container hero">
      <div className="card p-4">
        <div className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0">{entry.title}</h3>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        <small className="text-muted">
          {new Date(entry.createdAt).toLocaleString()}
        </small>

        <p className="mt-3">{entry.content}</p>

        {entry.musicKey !== 'none' && (
          <div className="mt-3">
            <audio ref={audioRef} controls style={{ width: '100%' }} />

            {autoPlayFailed && (
              <div className="alert alert-info mt-2 py-2">
                Autoplay was blocked or the file type isn't supported. <br />
                Click play or replace with an MP3 in <code>/public/music</code>.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
