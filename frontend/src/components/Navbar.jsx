export default function Navbar({ email, onLogout }) {
  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <div>
          <h1 className="text-xl font-bold">Expense Tracker</h1>
          <p className="text-sm text-slate-500">{email}</p>
        </div>

        <button
          onClick={onLogout}
          className="rounded-lg bg-slate-900 px-4 py-2 text-white"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
