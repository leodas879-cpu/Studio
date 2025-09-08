
export const recipeRules = {
  "rules": [
    {
      "id": "R001",
      "type": "hard",
      "name": "Meat + Dairy Incompatibility",
      "categories_incompatible": ["meat", "dairy"],
      "reason": "In many dietary traditions (e.g., Kosher), meat and dairy cannot be cooked together. It may also cause digestion issues.",
      "substitutions": {
        "dairy": ["coconut milk", "oat milk", "almond milk (if no nut allergy)"]
      }
    },
    {
      "id": "R002",
      "type": "hard",
      "name": "Pork + Alcohol Incompatibility",
      "categories_incompatible": ["pork", "alcohol"],
      "reason": "In Halal and Kosher diets, pork and alcohol are strictly prohibited and cannot be combined.",
      "substitutions": {
        "pork": ["chicken", "beef", "lamb"],
        "alcohol": ["apple cider vinegar", "pomegranate juice", "grape juice"]
      }
    },
    {
      "id": "R003",
      "type": "hard",
      "name": "Allergen: Nuts",
      "ingredient_incompatible": ["almond", "cashew", "peanut", "hazelnut", "walnut", "pecan"],
      "reason": "Nuts are common allergens and can be life-threatening.",
      "substitutions": {
        "almond": ["sunflower seeds", "pumpkin seeds"],
        "cashew": ["tofu", "sunflower seeds"],
        "peanut": ["roasted chickpeas", "soy nuts"]
      }
    },
    {
      "id": "R004",
      "type": "soft",
      "name": "Seafood + Cheese (Flavor Clash)",
      "categories_incompatible": ["seafood", "cheese"],
      "reason": "Seafood and cheese are generally avoided together in many cuisines due to strong clashing flavors. Some exceptions exist (e.g., Italian seafood pasta with parmesan).",
      "substitutions": {
        "cheese": ["lemon zest", "olive oil", "herbs"]
      }
    },
    {
      "id": "R005",
      "type": "hard",
      "name": "Raw Meat + Raw Dairy (Food Safety)",
      "categories_incompatible": ["raw_meat", "raw_dairy"],
      "reason": "Combining raw meat and raw dairy increases risk of bacterial contamination (e.g., Salmonella, E. coli).",
      "substitutions": {}
    }
  ],
  "categories": {
    "meat": ["chicken", "beef", "lamb", "goat", "turkey"],
    "dairy": ["milk", "cheese", "butter", "cream", "yogurt"],
    "pork": ["pork", "bacon", "ham"],
    "alcohol": ["wine", "beer", "rum", "vodka"],
    "seafood": ["fish", "shrimp", "lobster", "crab", "oyster"],
    "cheese": ["parmesan", "mozzarella", "cheddar", "feta"],
    "raw_meat": ["raw chicken", "raw beef", "raw lamb"],
    "raw_dairy": ["raw milk", "unpasteurized cheese"],
    "nuts": ["almond", "cashew", "peanut", "hazelnut", "walnut", "almonds"]
  }
};

export type Rule = (typeof recipeRules)['rules'][0];
