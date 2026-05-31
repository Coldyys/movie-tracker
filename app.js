const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());

// Použití statiských souborů z public
app.use(express.static(path.join(__dirname, 'public')));

const MOVIES_FILE = path.join(__dirname, 'movies.json');
const CATEGORIES_FILE = path.join(__dirname, 'categories.json');

// Funkce pro práci s trvalým úložištěm
function loadData(filePath, fallbackData) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(fallbackData, null, 2), 'utf8');
      return fallbackData;
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return fallbackData;
  }
}

function saveData(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Inicializace dat
let categories = loadData(CATEGORIES_FILE, [
  { id: "1", name: "Netflix" },
  { id: "2", name: "HBO Max" },
  { id: "3", name: "Disney+" },
  { id: "4", name: "SkyShowtime" }
]);

let movies = loadData(MOVIES_FILE, [
  { id: "101", title: "Interstellar", year: 2014, categoryId: "1", status: "To Watch" }
]);

// Hlavní směrování na frontend
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Platformy
app.get('/category/list', function(req, res) {
  res.json({ categoryList: categories });
});

app.post('/category/create', function(req, res) {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: "dtoInIsNotValid", message: "Name is required." });
  }
  const newCategory = { id: String(Date.now()), name: name };
  categories.push(newCategory);
  saveData(CATEGORIES_FILE, categories);
  res.json(newCategory);
});

app.post('/category/delete', function(req, res) {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "dtoInIsNotValid", message: "ID is required." });
  }

  // Zjistí, jestli nějaký film nepoužívá tuto kategorii
  const isUsed = movies.some(function(m) { return m.categoryId === String(id); });
  if (isUsed) {
    return res.status(400).json({ 
      error: "categoryIsUsed", 
      message: "Tuto platformu nelze smazat, protože ji používá jeden nebo více filmů." 
    });
  }

  const initialLength = categories.length;
  categories = categories.filter(function(c) { return c.id !== String(id); });
  
  if (categories.length === initialLength) {
    return res.status(404).json({ error: "categoryNotFound", message: "Category not found." });
  }
  
  saveData(CATEGORIES_FILE, categories);
  res.json({ success: true });
});

// Filmy
app.get('/movie/list', function(req, res) {
  const categoryMap = {};
  categories.forEach(function(cat) {
    categoryMap[cat.id] = cat;
  });
  res.json({ itemList: movies, categoryMap: categoryMap });
});

app.post('/movie/create', function(req, res) {
  const { title, year, categoryId } = req.body;
  if (!title || !year || !categoryId) {
    return res.status(400).json({ error: "dtoInIsNotValid", message: "Title, year and categoryId are required." });
  }
  
  // Kontrola existence kategorie
  const categoryExists = categories.some(function(cat) { return cat.id === String(categoryId); });
  if (!categoryExists) {
    return res.status(400).json({ error: "categoryDoesNotExist", message: "The assigned category does not exist." });
  }
  
  const newMovie = {
    id: String(Date.now()),
    title: title,
    year: Number(year),
    categoryId: String(categoryId),
    status: "To Watch"
  };
  movies.push(newMovie);
  saveData(MOVIES_FILE, movies);
  res.json(newMovie);
});

app.post('/movie/update', function(req, res) {
  const { id, title, year, categoryId, status } = req.body;
  if (!id) {
    return res.status(400).json({ error: "dtoInIsNotValid", message: "Movie ID is required for update." });
  }
  
  const movieIndex = movies.findIndex(function(m) { return m.id === String(id); });
  if (movieIndex === -1) {
    return res.status(404).json({ error: "movieNotFound", message: "Movie not found." });
  }
  
  // Kontrola existence kategorie při úpravě
  if (categoryId) {
    const categoryExists = categories.some(function(cat) { return cat.id === String(categoryId); });
    if (!categoryExists) {
      return res.status(400).json({ error: "categoryDoesNotExist", message: "The assigned category does not exist." });
    }
  }
  
  const updatedMovie = { ...movies[movieIndex] };
  if (title !== undefined) updatedMovie.title = title;
  if (year !== undefined) updatedMovie.year = Number(year);
  if (categoryId !== undefined) updatedMovie.categoryId = String(categoryId);
  if (status !== undefined) updatedMovie.status = status;

  movies[movieIndex] = updatedMovie;
  saveData(MOVIES_FILE, movies);
  res.json(updatedMovie);
});

app.post('/movie/delete', function(req, res) {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "dtoInIsNotValid", message: "ID is required." });
  }
  
  const initialLength = movies.length;
  movies = movies.filter(function(m) { return m.id !== String(id); });
  if (movies.length === initialLength) {
    return res.status(404).json({ error: "movieNotFound", message: "Movie not found." });
  }
  
  saveData(MOVIES_FILE, movies);
  res.json({ success: true });
});

app.listen(PORT, function() {
  console.log('Server is running on port ' + PORT);
});