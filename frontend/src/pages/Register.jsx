import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register(form.email, form.password);
      navigate("/");
    } catch (requestError) {
      const detail = requestError.response?.data?.detail;
      setError(
        typeof detail === "string" ? detail : "Unable to create account",
      );
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow"
      >
        <div>
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Start tracking your expenses today.
          </p>
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <input
          type="email"
          required
          placeholder="Email"
          className="w-full rounded-lg border p-3"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />

        <input
          type="password"
          required
          placeholder="Password (min 8 characters)"
          className="w-full rounded-lg border p-3"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />

        <input
          type="password"
          required
          placeholder="Confirm password"
          className="w-full rounded-lg border p-3"
          value={form.confirmPassword}
          onChange={(event) =>
            setForm({ ...form, confirmPassword: event.target.value })
          }
        />

        <button className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white">
          Create account
        </button>

        <p className="text-center text-sm">
          Already registered?{" "}
          <Link className="text-indigo-600" to="/login">
            Sign in
          </Link>
        </p>
      </form>
    </main>
  );
}
