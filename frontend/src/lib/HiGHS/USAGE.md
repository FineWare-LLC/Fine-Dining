# Using the Food Chain Web Scraper and Database Seeding

This document provides instructions for using the web scraper to collect data from food chains and Walmart, and for seeding the database with realistic meal data.

## Overview

The implementation consists of several components:

1. **Web Scraper**: Collects nutrition, price, and allergen information from major food chains and Walmart.
2. **Data Pipeline**: Processes the scraped data and prepares it for database import.
3. **Database Seeding**: Imports the processed data into the database for use by the application.

## Running the Web Scraper

To run the web scraper and collect data from food chains and Walmart:

```bash
cd frontend/src/lib/HiGHS
npm install  # Install dependencies
node test_scraper.mjs
```

This will:
- Run the web scraper to collect data from food chains and Walmart
- Save the scraped data to `data/raw/scraped_data_test.json` for inspection

## Running the Full Pipeline

To run the full data processing pipeline:

If the `data` or `src` folders are missing (for example after a clean clone),
run `node setup.mjs` once to recreate the required directories.

```bash
cd frontend/src/lib/HiGHS
npm install  # Install dependencies
node src/main_pipeline.mjs
```

This will:
- Fetch data from various sources, including the web scraper
- Normalize the data to a consistent format
- Enrich the data with calculated fields
- Sample the data if needed
- Write the processed data to CSV files in `data/processed/`

## Seeding the Database

To seed the database with the processed data:

```bash
cd frontend/src/lib/HiGHS
npm install  # Install dependencies
npm install dotenv  # Required for environment variables
node seed_database.mjs
```

This will:
- Connect to MongoDB
- Read the processed CSV file
- Create a test user (if it doesn't exist)
- Create a meal plan for the test user
- Create meals in the meal plan based on the processed data
- Update the meal plan with the total calories

## Customizing the Implementation

### Adding New Food Chains

To add a new food chain to the web scraper:

1. Open `src/fetcher/scraper.mjs`
2. Add a new configuration object to the `FOOD_CHAINS` array:

```javascript
{
  name: 'New Chain',
  url: 'https://www.newchain.com/menu',
  menuSelector: '.menu-item',
  itemSelector: '.item-name',
  priceSelector: '.item-price',
  nutritionUrlPattern: 'https://www.newchain.com/menu/item/ITEM_ID',
  allergenSelector: '.allergens-list',
}
```

### Modifying the Database Seeding

To customize the database seeding:

1. Open `seed_database.mjs`
2. Modify the `findOrCreateTestUser` function to change user properties
3. Modify the `createMealPlan` function to change meal plan properties
4. Modify the `createMeals` function to change how meals are created

## Troubleshooting

### Web Scraper Issues

- If the web scraper is not collecting data from a food chain, check the selectors in the configuration object.
- If the web scraper is collecting data but the data is incomplete, check the enrichItemWithNutritionAndAllergens function.

### Database Seeding Issues

- If the database seeding fails with validation errors, check the required fields for the models.
- If the database seeding succeeds but the data is not visible in the application, check the database connection and queries.

## Conclusion

The web scraper and database seeding implementation provides a way to collect realistic meal data from food chains and Walmart, and to import that data into the database for use by the application. This data can be used for meal planning, optimization, and other features of the Fine Dining application.