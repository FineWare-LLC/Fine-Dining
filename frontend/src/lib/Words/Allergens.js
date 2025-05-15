
const ALL_POSSIBLE_ALLERGENS = [
    "Almonds", "Amaranth", "Anchovy", "Apple", "Apricot", "Artichoke", "Asparagus", "Avocado",
    "Banana", "Barley", "Basil", "Beef", "Beets", "Bell Pepper", "Black Beans", "Blueberry",
    "Broccoli", "Brussels Sprouts", "Buckwheat",
    "Cabbage", "Cantaloupe", "Carrot", "Cashews", "Cauliflower", "Celery", "Cheese", "Cherry",
    "Chicken", "Chickpeas", "Chives", "Chocolate", "Cilantro", "Cinnamon", "Clams", "Coconut",
    "Cod", "Coffee", "Corn", "Crab", "Cranberry", "Cucumber", "Cumin",
    "Date", "Dill",
    "Eggplant", "Eggs",
    "Fennel", "Fig", "Fish", "Flaxseed",
    "Garlic", "Ginger", "Gluten", "Grapes", "Green Beans", "Green Onion",
    "Haddock", "Halibut", "Hazelnuts", "Honey", "Honeydew",
    "Kale", "Kidney Beans", "Kiwi",
    "Lamb", "Leek", "Lemon", "Lentils", "Lettuce", "Lime", "Lobster", "Lupin",
    "Macadamia Nuts", "Mango", "Maple Syrup", "Milk", "Mint", "Mollusks", "Mushrooms", "Mustard",
    "Nectarine",
    "Oats", "Okra", "Olive", "Onion", "Orange", "Oregano",
    "Papaya", "Paprika", "Parsley", "Parsnip", "Passion Fruit", "Peaches", "Peanuts", "Pear",
    "Peas", "Pecans", "Pepper", "Pineapple", "Pistachios", "Plum", "Pork", "Potato",
    "Pumpkin", "Pumpkin Seeds",
    "Quinoa",
    "Radish", "Raspberry", "Red Onion", "Rice", "Rosemary", "Rye",
    "Saffron", "Sage", "Salmon", "Sardines", "Scallops", "Sesame", "Shallots", "Shellfish (Crustacean)",
    "Shrimp", "Soybeans", "Spinach", "Squash", "Strawberry", "Sugar", "Sulphites", "Sunflower Seeds",
    "Sweet Potato", "Swiss Chard",
    "Tangerine", "Tarragon", "Thyme", "Tilapia", "Tofu", "Tomato", "Tree Nuts", "Trout", "Tuna", "Turkey", "Turmeric", "Turnip",
    "Vanilla", "Veal",
    "Walnuts", "Watercress", "Watermelon", "Wheat", "Whey",
    "Yam", "Yeast",
    "Zucchini"
].sort(); // Ensure this base list is alphabetically sorted

// Define the set of common allergens
// Using a Set for efficient lookup (checking if an allergen is common)
const COMMON_ALLERGENS_SET = new Set([
    // Major allergens (US FDA Big 9 + others common globally)
    "Milk", "Eggs", "Fish", "Shellfish (Crustacean)", "Tree Nuts", "Peanuts", "Wheat", "Soybeans", "Sesame",
    // Other frequently cited allergens
    "Gluten", // Often grouped, related to Wheat, Barley, Rye
    "Celery",
    "Mustard",
    "Lupin",
    "Mollusks", // Another category of shellfish
    "Sulphites", // Often listed due to sensitivity reactions
    // Specific examples often listed separately
    "Cashews", // Example of Tree Nut
    "Walnuts", // Example of Tree Nut
    "Almonds", // Example of Tree Nut
    "Salmon", // Example of Fish
    "Shrimp", // Example of Shellfish (Crustacean)
    "Crab",   // Example of Shellfish (Crustacean)
    "Lobster" // Example of Shellfish (Crustacean)
]);


const sortedUncommon = ALL_POSSIBLE_ALLERGENS.filter(allergen => !COMMON_ALLERGENS_SET.has(allergen));

const ALLERGENS_LIST = [...COMMON_ALLERGENS_SET, ...sortedUncommon];

export default ALLERGENS_LIST;