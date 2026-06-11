# Meal Model Folder

This folder contains everything related to the `Meal` Mongoose model, broken into multiple files for an over-engineered demonstration. Each file serves a distinct purpose:

- **index.js**  
  Orchestrates importing, assembling, and exporting the final `Meal` model.

- **mealSchema.js**  
  Contains the base `Meal` schema definition.

- **mealValidations.js**  
  Exports custom validators to keep the `mealSchema.js` more readable.

- **mealVirtuals.js**  
  Defines virtual properties for the schema (e.g., `fullDescription`).

- **mealHooks.js**  
  Contains pre- and post-save hooks or other middleware for the schema.

- **mealMethods.js**  
  Defines instance methods (e.g., `getMealSummary`, `toJSONSafe`).

- **mealStatics.js**  
  Defines static methods (e.g., `findByMealPlan`, `findByDateRange`, `searchByIngredient`).

- **mealIndexes.js**  
  Declares any indexes (compound or otherwise) applied to the schema.

With this setup, you can easily expand or remove any component without crowding a single file.

Happy coding!
