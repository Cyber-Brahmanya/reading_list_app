import { useState, useEffect } from "react";
import { BookOpen, Plus, Trash2, Library } from "lucide-react";

type Status = "want-to-read" | "reading" | "finished";

interface Book {
  id: string;
  title: string;
  status: Status;
}

const STATUS_LABELS: Record<Status, string> = {
  "want-to-read": "Want to Read",
  reading: "Reading",
  finished: "Finished",
};

const STATUS_ORDER: Status[] = ["want-to-read", "reading", "finished"];

const STATUS_STYLES: Record<Status, string> = {
  "want-to-read":
    "bg-amber-100 text-amber-800 border-amber-200",
  reading: "bg-blue-100 text-blue-800 border-blue-200",
  finished: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

const STATUS_DOT: Record<Status, string> = {
  "want-to-read": "bg-amber-500",
  reading: "bg-blue-500",
  finished: "bg-emerald-500",
};

type Filter = "all" | Status;

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "want-to-read", label: "Want to Read" },
  { key: "reading", label: "Reading" },
  { key: "finished", label: "Finished" },
];

const STORAGE_KEY = "reading-list-books";
const MAX_TITLE_LENGTH = 60;

function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b): b is Book =>
        typeof b?.id === "string" &&
        typeof b?.title === "string" &&
        STATUS_ORDER.includes(b.status)
    );
  } catch {
    return [];
  }
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<Status>("want-to-read");
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState("");

  useEffect(() => {
    setBooks(loadBooks());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }, [books]);

  function addBook(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_TITLE_LENGTH) {
      setError("Book title must be 60 characters or fewer.");
      return;
    }
    const normalized = trimmed.toLowerCase();
    if (books.some((b) => b.title.trim().toLowerCase() === normalized)) {
      setError("This book is already in your reading list.");
      return;
    }
    const book: Book = {
      id: crypto.randomUUID(),
      title: trimmed,
      status,
    };
    setBooks((prev) => [book, ...prev]);
    setTitle("");
    setStatus("want-to-read");
    setError("");
  }

  function changeStatus(id: string, newStatus: Status) {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
  }

  function deleteBook(id: string) {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }

  const filtered =
    filter === "all" ? books : books.filter((b) => b.status === filter);

  const counts = {
    all: books.length,
    "want-to-read": books.filter((b) => b.status === "want-to-read").length,
    reading: books.filter((b) => b.status === "reading").length,
    finished: books.filter((b) => b.status === "finished").length,
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-white">
            <Library size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Reading List</h1>
            <p className="text-sm text-stone-500">
              Track your books, one page at a time
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Add form */}
        <form
          onSubmit={addBook}
          className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3 shadow-sm"
        >
          <div className="flex items-center gap-2 text-stone-700 font-semibold text-sm">
            <Plus size={18} />
            Add a book
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={title}
              maxLength={MAX_TITLE_LENGTH}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="Book title..."
              className="flex-1 px-3 py-2.5 rounded-lg border border-stone-300 text-sm outline-none transition-colors focus:border-stone-800 focus:ring-1 focus:ring-stone-800 placeholder:text-stone-400"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="px-3 py-2.5 rounded-lg border border-stone-300 text-sm outline-none transition-colors focus:border-stone-800 focus:ring-1 focus:ring-stone-800 bg-white cursor-pointer"
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-stone-800 text-white text-sm font-medium hover:bg-stone-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Add to list
          </button>
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </form>

        {/* Summary */}
        {books.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-stone-800">{counts.all}</p>
              <p className="text-xs text-stone-500 mt-1">Total Books</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-blue-600">{counts.reading}</p>
              <p className="text-xs text-stone-500 mt-1">Currently Reading</p>
            </div>
            <div className="bg-white rounded-xl border border-stone-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-emerald-600">{counts.finished}</p>
              <p className="text-xs text-stone-500 mt-1">Finished</p>
            </div>
          </div>
        )}

        {/* Filters */}
        {books.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  filter === f.key
                    ? "bg-stone-800 text-white border-stone-800"
                    : "bg-white text-stone-600 border-stone-300 hover:border-stone-400"
                }`}
              >
                {f.label}
                <span
                  className={`ml-1.5 ${
                    filter === f.key ? "text-stone-300" : "text-stone-400"
                  }`}
                >
                  {counts[f.key]}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Book list / empty state */}
        {books.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-4">
              <BookOpen size={28} />
            </div>
            <p className="text-stone-500 text-sm">
              Your reading list is empty. Add your first book.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-400 text-sm">
              No books in this category.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((book) => (
              <div
                key={book.id}
                className="group bg-white rounded-xl border border-stone-200 p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-800 leading-snug break-words">
                    {book.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_STYLES[book.status]}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[book.status]}`}
                      />
                      {STATUS_LABELS[book.status]}
                    </span>
                  </div>
                  {/* Status switcher */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {STATUS_ORDER.map((s) => (
                      <button
                        key={s}
                        onClick={() => changeStatus(book.id, s)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                          book.status === s
                            ? "bg-stone-100 text-stone-400 border-stone-200 cursor-default"
                            : "bg-white text-stone-600 border-stone-300 hover:border-stone-400 hover:bg-stone-50"
                        }`}
                        disabled={book.status === s}
                      >
                        {STATUS_LABELS[s]}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => deleteBook(book.id)}
                  className="shrink-0 p-1.5 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Delete book"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
