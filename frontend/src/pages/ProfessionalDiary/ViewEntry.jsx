import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ProAPI from "../../api/professionalDiary";

export default function ViewEntry() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [entry, setEntry] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    ProAPI.getOne(id).then(({ data }) => setEntry(data));
  }, [id]);

  const handleDelete = async () => {
    await ProAPI.deleteEntry(id);
    navigate("/professional");
  };

  if (!entry) return <div>Loading...</div>;

  return (
    <div className="container py-4">
  <div className="row justify-content-center">
    <div className="col-12 col-md-8">

      <div className="card shadow-sm">
        <div className="card-body">

          {/* Title */}
          <h3 className="text-primary mb-3">
            {entry?.title}
          </h3>

          {/* Meta info */}
          <p className="text-muted mb-2">
            {new Date(entry?.date).toLocaleDateString()}
          </p>

          {/* Divider */}
          <hr />

          {/* Content */}
          <p style={{ whiteSpace: "pre-line" }}>
            {entry?.content}
          </p>

          {/* Actions */}
          <div className="mt-4 d-flex gap-2">
            <button
              className="btn btn-outline-primary"
              onClick={() => window.history.back()}
            >
              Back
            </button>

            <button
              className="btn btn-outline-danger"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</div>

  );
}
