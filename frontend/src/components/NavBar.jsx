import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar({ user, onLogout }) {
	return (
		<nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
			<div className="container">
				<Link className="navbar-brand" to="/">MyDiary</Link>

				<div className="d-flex ms-auto align-items-center">
					{user ? (
						<>
							<div className="me-3 text-end">
								<div className="small text-muted">Welcome</div>
								<div className="fw-semibold">{user.name}</div>
							</div>
							<button className="btn btn-outline-secondary btn-sm" onClick={onLogout}>Logout</button>
						</>
					) : (
						<>
							<Link className="btn btn-link me-2" to="/login">Login</Link>
							<Link className="btn btn-primary btn-sm" to="/signup">Signup</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}