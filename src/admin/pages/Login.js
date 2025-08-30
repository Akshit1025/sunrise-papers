import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { auth } from "../../firebaseConfig";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state && location.state.from) || "/admin";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center vh-100"
      style={{ margin: 0, padding: 0 }}
    >
      <div className="container">
        <div className="row justify-content-center align-items-center">
          <div className="col-md-5">
            <div className="card border-0 shadow p-4 rounded-4">
              <h3 className="text-center mb-4 fw-bold">Member Login</h3>

              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="input-group mb-3">
                  <span className="input-group-text bg-light">
                    <i className="fas fa-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Password */}
                <div className="input-group mb-4">
                  <span className="input-group-text bg-light">
                    <i className="fas fa-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn btn-outline-dark w-100 rounded-pill fw-bold"
                  disabled={submitting}
                >
                  {submitting ? "Signing in..." : "LOGIN"}
                </button>
              </form>

              {/* Back to Website */}
              <div className="text-center mt-4">
                <Link to="/" className="text-decoration-none text-muted">
                  ← Back to Main Website
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
