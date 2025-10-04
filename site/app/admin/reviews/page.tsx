"use client";

import { useState, useEffect } from "react";

type Review = {
  id: string;
  name: string;
  text: string;
  rating: number;
  position: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", text: "", rating: 5 });

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setLoading(true);
    const res = await fetch("/api/admin/reviews");
    if (res.ok) {
      const data = await res.json();
      setReviews(data);
    }
    setLoading(false);
  }

  async function handleSave() {
    if (!formData.name || !formData.text) return alert("Name und Text sind erforderlich");
    
    const payload = { ...formData };
    let res;
    
    if (editingId) {
      res = await fetch(`/api/admin/reviews/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    if (res.ok) {
      setFormData({ name: "", text: "", rating: 5 });
      setEditingId(null);
      loadReviews();
    } else {
      alert("Fehler beim Speichern");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Wirklich löschen?")) return;
    const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    if (res.ok) loadReviews();
  }

  async function handleToggleVisible(id: string, isVisible: boolean) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible: !isVisible }),
    });
    if (res.ok) loadReviews();
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const updated = [...reviews];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    await updatePositions(updated);
  }

  async function handleMoveDown(index: number) {
    if (index === reviews.length - 1) return;
    const updated = [...reviews];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    await updatePositions(updated);
  }

  async function updatePositions(updated: Review[]) {
    const positions = updated.map((r, i) => ({ id: r.id, position: i }));
    const res = await fetch("/api/admin/reviews/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positions }),
    });
    if (res.ok) loadReviews();
  }

  function startEdit(review: Review) {
    setEditingId(review.id);
    setFormData({ name: review.name, text: review.text, rating: review.rating });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({ name: "", text: "", rating: 5 });
  }

  if (loading) return <div className="p-6">Lädt...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Bewertungen verwalten</h1>

      <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Bewertung bearbeiten" : "Neue Bewertung"}</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder="Max Mustermann"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Bewertungstext</label>
            <textarea
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              className="w-full border rounded px-3 py-2"
              rows={4}
              placeholder="Tolle Erfahrung mit den Alpakas..."
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Sterne (1-5)</label>
            <input
              type="number"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) || 5 })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {editingId ? "Aktualisieren" : "Erstellen"}
            </button>
            {editingId && (
              <button onClick={cancelEdit} className="px-4 py-2 border rounded hover:bg-gray-100">
                Abbrechen
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Bestehende Bewertungen ({reviews.length}/5)</h2>
        {reviews.length === 0 && <p className="text-gray-500">Keine Bewertungen vorhanden.</p>}
        {reviews.map((review, index) => (
          <div key={review.id} className="p-4 border rounded-lg bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{review.name}</span>
                  <div className="flex text-yellow-500">
                    {Array.from({ length: review.rating }, (_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  {!review.isVisible && (
                    <span className="text-xs bg-gray-200 px-2 py-1 rounded">Versteckt</span>
                  )}
                </div>
                <p className="text-gray-700">{review.text}</p>
                <p className="text-xs text-gray-400 mt-2">Position: {review.position}</p>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMoveDown(index)}
                  disabled={index === reviews.length - 1}
                  className="px-2 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  onClick={() => handleToggleVisible(review.id, review.isVisible)}
                  className="px-2 py-1 text-sm border rounded hover:bg-gray-100"
                >
                  {review.isVisible ? "👁️" : "🚫"}
                </button>
                <button
                  onClick={() => startEdit(review)}
                  className="px-2 py-1 text-sm bg-blue-100 rounded hover:bg-blue-200"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="px-2 py-1 text-sm bg-red-100 rounded hover:bg-red-200"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
