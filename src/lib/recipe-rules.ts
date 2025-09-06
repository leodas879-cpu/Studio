export const recipeRules = {
  invalid_combinations: [
    ["milk", "chicken"],
    ["milk", "fish"],
    ["lemon", "milk"],
    ["vinegar", "milk"],
  ],
  preferred_combinations: [
    ["tomato", "onion", "garlic"],
    ["cumin", "coriander", "turmeric"],
  ],
  substitutes: {
    milk: ["soy milk", "almond milk", "cream", "yogurt"],
    chicken: ["paneer", "tofu"],
    bread: ["rice", "corn tortilla"],
  },
  cooking_methods: {
    rice: ["boil", "steam"],
    chicken: ["grill", "steam", "fry"],
    milk: ["boil", "simmer"],
  },
};
