# Food Chain Web Scraper

This module is part of the HiGHS meal optimization pipeline. It collects nutrition, price, and allergen information from major food chains and Walmart to create food databases.

## Overview

The web scraper is integrated into the existing data pipeline and works alongside the CSV data sources. It scrapes data from the following food chains:

- McDonald's
- Walmart
- Taco Bell
- Subway
- Burger King

For each food chain, the scraper collects the following information:
- Meal name
- Price
- Nutrition information (calories, protein, carbohydrates, fat, sodium)
- Allergens

## Running as a Microservice

Install dependencies and start the pipeline separately if you want to run it as
its own service:

```bash
npm install
npm start        # or: node src/main_pipeline.mjs
```

## Implementation Details

The scraper is implemented in the `src/fetcher/scraper.mjs` file and is integrated into the existing fetcher in `src/fetcher/index.mjs`. The implementation uses the following libraries:

- `cheerio`: For HTML parsing
- `node-fetch`: For making HTTP requests

The scraper follows these steps:
1. For each configured food chain, it fetches the main menu page
2. It extracts menu items and their prices
3. For each menu item, it fetches nutrition and allergen information
4. The collected data is normalized to match the expected format for the pipeline

## Configuration

Each food chain is configured with the following parameters:
- `name`: The name of the food chain
- `url`: The URL of the main menu page
- `menuSelector`: CSS selector for menu categories
- `itemSelector`: CSS selector for menu items
- `priceSelector`: CSS selector for item prices
- `nutritionUrlPattern`: URL pattern for nutrition pages
- `allergenSelector`: CSS selector for allergen information

## Adding New Food Chains

To add a new food chain, add a new configuration object to the `FOOD_CHAINS` array in `src/fetcher/scraper.mjs`. Make sure to inspect the HTML structure of the food chain's website to determine the appropriate CSS selectors.

## Limitations and Future Improvements

The current implementation has the following limitations:
- It uses simulated data for nutrition and allergens (in a real implementation, these would be scraped from the actual websites)
- It's limited to 10 items per food chain for testing purposes
- It doesn't handle pagination or dynamic loading of content

Future improvements could include:
- Implementing actual scraping of nutrition and allergen information
- Adding support for more food chains
- Handling pagination and dynamic content loading
- Adding error recovery and retry mechanisms
- Implementing rate limiting to avoid being blocked by websites

## Solver Data Loading

The solver at `src/solver/index.mjs` now streams the processed CSV using
`csv-parse` rather than reading the entire file into memory. Rows are processed
incrementally and appended to typed arrays. This reduces peak memory
consumption when working with large meal catalogs.

## Solver Auto-Tuning

Run the solver with the `--tune` flag to automatically benchmark a few solver
settings. The best configuration is saved to `src/tuner/config.json` and loaded
on subsequent runs.

```bash
node src/solver/index.mjs --tune
```

## Setup Script

The `setup.mjs` script prepares the directory structure for the HiGHS pipeline.
It no longer creates placeholder step files because those modules already exist
under `src/`. Running the script is only necessary if the `data/` or `src/`
folders are missing.

```bash
node setup.mjs
```

