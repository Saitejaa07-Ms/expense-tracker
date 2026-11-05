import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Unable to sign in");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 shadow"
      >
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in to manage your finances.
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
          placeholder="Password"
          className="w-full rounded-lg border p-3"
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
        />

        <button className="w-full rounded-lg bg-indigo-600 p-3 font-semibold text-white">
          Sign in
        </button>

        <p className="text-center text-sm">
          No account?{" "}
          <Link className="text-indigo-600" to="/register">
            Register
          </Link>
        </p>
      </form>
    </main>
  );
}
