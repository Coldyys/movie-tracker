import React, { useState, useEffect } from 'react';

function Categories(props) {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');

  useEffect(function() {
    fetchCategories();
  }, []);

  function fetchCategories() {
    fetch('/category/list')
      .then(function(res) { return res.json(); })
      .then(function(data) { setCategories(data.categoryList); });
  }

  function handleSubmit(e) {
    e.preventDefault();
    fetch('/category/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name })
    }).then(function() {
      setName('');
      fetchCategories();
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white mt-10 rounded-lg shadow-sm">
      <button onClick={props.onNavigateToDashboard} className="text-blue-600 hover:underline text-sm mb-4 block">
        &larr; Zpět na Dashboard
      </button>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Správa platforem (Kategorie)</h2>
      
      <form onSubmit={handleSubmit} className="flex space-x-3 mb-6">
        <input type="text" value={name} onChange={function(e) { setName(e.target.value); }} placeholder="Název platformy (např. HBO Max)" required className="border p-2 rounded-lg flex-1 focus:outline-blue-500" />
        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Přidat</button>
      </form>

      <ul className="divide-y text-gray-700">
        {categories.map(function(cat) {
          return <li key={cat.id} className="py-2 font-medium">&bull; {cat.name}</li>;
        })}
      </ul>
    </div>
  );
}

export default Categories;