import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Dashboard from './Dashboard.js';
import Categories from './Categories.js';

function App() {
  // Stav, který řídí aktuálně zobrazenou Route (obrazovku)
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  if (currentRoute === 'categories') {
    return <Categories onNavigateToDashboard={function() { setCurrentRoute('dashboard'); }} />;
  }

  return <Dashboard onNavigateToCategories={function() { setCurrentRoute('categories'); }} />;
}

ReactDOM.render(<App />, document.getElementById('root'));