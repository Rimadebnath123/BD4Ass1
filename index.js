const express = require('express');
const { resolve } = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let db;

(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database, // Fixed typo in 'driver'
  });
})();

//Get All Restaurants
async function fetchAllRestaurants() {
  let query = 'SELECT * FROM restaurants';
  let response = await db.all(query, []);
  return { restaurants: response };
}

app.get('/restaurants', async (req, res) => {
  try {
    let results = await fetchAllRestaurants();
    if (results.restaurants.length === 0) {
      return res.status(404).json({ message: 'No Restaurants Found.' });
    }
    res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
//Get Restaurant by ID
async function fetchRestaurantById(id) {
  let query = 'SELECT * FROM restaurants WHERE id = ?';
  let response = await db.all(query, [id]);
  return { restaurants: response };
}

app.get('/restaurants/details/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let result = await fetchRestaurantById(id);

    if (result.restaurants === undefined) {
      return res.status(404).json({ message: 'Restaurant Not Found.' });
    }

    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
//Get Restaurants by Cuisine
async function fetchRestaurantsByCuisine(cuisine) {
  let query = 'SELECT * FROM restaurants WHERE cuisine = ?';
  let response = await db.all(query, [cuisine]);
  return { restaurants: response };
}

app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  try {
    const cuisine = req.params.cuisine;
    let result = await fetchRestaurantsByCuisine(cuisine);
    if (result.restaurants.length === 0) {
      return res
        .status(404)
        .json({ message: 'No Restaurants Found for this cuisine.' });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Function to filter restaurants based on query parameters
async function fetchRestaurantsByFilter(isVeg, hasOutdoorSeating, isLuxury) {
  let query = 'SELECT * FROM restaurants WHERE 1=1';
  let params = [];

  if (isVeg !== undefined) {
    query += ' AND isVeg = ?';
    params.push(isVeg);
  }
  if (hasOutdoorSeating !== undefined) {
    query += ' AND hasOutdoorSeating = ?';
    params.push(hasOutdoorSeating);
  }
  if (isLuxury !== undefined) {
    query += ' AND isLuxury = ?';
    params.push(isLuxury);
  }

  let response = await db.all(query, params);
  return { restaurants: response };
}

app.get('/restaurants/filter', async (req, res) => {
  try {
    let isVeg = req.query.isVeg;
    let hasOutdoorSeating = req.query.hasOutdoorSeating;
    let isLuxury = req.query.isLuxury;
    let result = await fetchRestaurantsByFilter(
      isVeg,
      hasOutdoorSeating,
      isLuxury
    );

    if (result.restaurants.length === 0) {
      return res.status(404).json({ message: 'No Restaurants Found.' });
    }

    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
//Get Restaurants Sorted by Rating
async function fetchRestaurantsSortedByRating() {
  let query = 'SELECT * FROM restaurants ORDER BY rating DESC';
  let response = await db.all(query);
  return { restaurants: response };
}

app.get('/restaurants/sort-by-rating', async (req, res) => {
  try {
    let result = await fetchRestaurantsSortedByRating();

    if (result.restaurants.length === 0) {
      return res.status(404).json({ message: 'No Restaurants Found.' });
    }

    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Get All Dishes
async function fetchAllDishes() {
  let query = 'SELECT * FROM dishes';
  let response = await db.all(query);
  return { dishes: response };
}
app.get('/dishes', async (req, res) => {
  try {
    let result = await fetchAllDishes();
    if (result.dishes.length === 0) {
      return res.status(404).json({ message: 'No Dishes Found.' });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
//Get Dish by ID
async function fetchDishById(id) {
  let query = 'SELECT * FROM dishes WHERE id = ?';
  let response = await db.all(query, [id]);
  return { dish: response };
}

app.get('/dishes/details/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let result = await fetchDishById(id);
    if (result.dish === undefined) {
      return res.status(404).json({ message: 'Dish Not Found.' });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Get Dishes by Filter
async function fetchDishesByFilter(isVeg) {
  let query = 'SELECT * FROM dishes WHERE 1=1';
  let params = [];
  if (isVeg !== undefined) {
    query += ' AND isVeg = ?';
    params.push(isVeg === 'true' ? 1 : 0);
  }
  let response = await db.all(query, params);
  return { dishes: response };
}

app.get('/dishes/filter', async (req, res) => {
  try {
    let isVeg = req.query.isVeg;
    let result = await fetchDishesByFilter(isVeg);
    if (result.dishes.length === 0) {
      return res.status(404).json({ message: 'No Dishes Found.' });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Get Dishes Sorted by Price
async function fetchDishesSortedByPrice() {
  let query = 'SELECT * FROM dishes ORDER BY price ';
  let response = await db.all(query);
  return { dishes: response };
}
app.get('/dishes/sort-by-price', async (req, res) => {
  try {
    let result = await fetchDishesSortedByPrice();
    if (result.dishes.length === 0) {
      return res.status(404).json({ message: 'No Dishes Found.' });
    }
    res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
