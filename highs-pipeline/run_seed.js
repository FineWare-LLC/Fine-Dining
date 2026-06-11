// Script to run the seed_database.mjs file
// This will populate the database with the scraped data from the HiGHS data directory

// Import the seed_database.mjs file using dynamic import
import('./seed_database.mjs')
    .then(() => {
        console.log('Database seeding completed');
    })
    .catch((error) => {
        console.error('Error seeding database:', error);
        process.exit(1);
    });
