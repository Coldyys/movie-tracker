import React, { useState, useEffect } from 'react';

function Dashboard(props) {
  const [movies, setMovies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Stavy pro inputy formuláře
  const [movieId, setMovieId] = useState('');
  const [title, setTitle] = useState('');
  const [year, setYear] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState('To Watch');

  // Načtení dat při namontování komponenty (Lifecycle)
  useEffect(function() {
    fetchData();
  }, []);

  function fetchData() {
    fetch('/category/list')
      .then(function(res) { return res.json(); })
      .then(function(data) { setCategories(data.categoryList); });

    fetch('/movie/list')
      .then(function(res) { return res.json(); })
      .then(function(data) { setMovies(data.itemList); });
  }

  function openCreateModal() {
    setMovieId('');
    setTitle('');
    setYear('');
    setCategoryId('');
    setStatus('To Watch');
    setIsModalOpen(true);
  }

  function openEditModal(movie) {
    setMovieId(movie.id);
    setTitle(movie.title);
    setYear(movie.year);
    setCategoryId(movie.categoryId);
    setStatus(movie.status);
    setIsModalOpen(true);
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    if (!categoryId) {
      alert('Musíte vybrat platnou platformu!');
      return;
    }

    const url = movieId ? '/movie/update' : '/movie/create';
    const payload = { title: title, year: Number(year), categoryId: categoryId };
    if (movieId) {
      payload.id = movieId;
      payload.status = status;
    }

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function() {
      setIsModalOpen(false);
      fetchData();
    });
  }

  function handleDelete(id) {
    if (window.confirm('Opravdu smazat tento film?')) {
      fetch('/movie/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id })
      }).then(function() {
        fetchData();
      });
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-lg shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">🎬 MovieTracker</h1>
          <p className="text-gray-500 text-sm">uuApp React Watchlist</p>
        </div>
        <div className="space-x-3">
          <button onClick={props.onNavigateToCategories} className="text-blue-600 hover:underline text-sm font-medium">
            Správa platforem &rarr;
          </button>
          <button onClick={openCreateModal} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition">
            + Přidat film
          </button>
        </div>
      </header>

      <main className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Můj Watchlist</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-400 text-sm">
              <th className="pb-3 font-medium">Název</th>
              <th className="pb-3 font-medium">Rok</th>
              <th className="pb-3 font-medium">Platforma</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Akce</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {movies.map(function(movie) {
              const cat = categories.find(function(c) { return c.id === movie.categoryId; });
              return (
                <tr key={movie.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 font-medium text-gray-800">{movie.title}</td>
                  <td className="py-4">{movie.year}</td>
                  <td className="py-4"><span className="bg-gray-200 px-2 py-1 rounded text-xs">{cat ? cat.name : 'Neznámá'}</span></td>
                  <td className="py-4">
                    <span className={`text-xs font-semibold ${movie.status === 'Watched' ? 'text-green-600' : 'text-orange-500'}`}>
                      {movie.status}
                    </span>
                  </td>
                  <td className="py-4 text-right space-x-3">
                    <button onClick={function() { openEditModal(movie); }} className="text-blue-600 hover:underline font-medium">Upravit</button>
                    <button onClick={function() { handleDelete(movie.id); }} className="text-red-600 hover:underline font-medium">Smazat</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </main>

      {/* Podmíněné vykreslení Modálního okna (Render Rule) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-4">{movieId ? 'Upravit film' : 'Nový film'}</h3>
            <form onSubmit={handleFormSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Název filmu *</label>
                <input type="text" value={title} onChange={function(e) { setTitle(e.target.value); }} required className="w-full border p-2 rounded-lg focus:outline-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Rok vydání *</label>
                <input type="number" value={year} onChange={function(e) { setYear(e.target.value); }} required className="w-full border p-2 rounded-lg focus:outline-blue-500" />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">Platforma *</label>
                <select value={categoryId} onChange={function(e) { setCategoryId(e.target.value); }} required className="w-full border p-2 rounded-lg focus:outline-blue-500">
                  <option value="" disabled>-- Vyber platformu --</option>
                  {categories.map(function(cat) {
                    return <option key={cat.id} value={cat.id}>{cat.name}</option>;
                  })}
                </select>
              </div>
              {movieId && (
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-1">Status</label>
                  <select value={status} onChange={function(e) { setStatus(e.target.value); }} className="w-full border p-2 rounded-lg focus:outline-blue-500">
                    <option value="To Watch">To Watch</option>
                    <option value="Watched">Watched</option>
                  </select>
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={function() { setIsModalOpen(false); }} className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50">Zrušit</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Uložit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;