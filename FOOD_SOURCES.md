# Food database sources

`foods.txt` is tab-separated, one food per line, no header:
`name<TAB>kcal<TAB>protein<TAB>carbs<TAB>fat<TAB>source<TAB>aliases<TAB>serving` (serving is `grams|label`, optional). Values are per 100 g (or per 100 ml for drinks).

Total: 75,133 foods. File size: 5.74 MB (1.85 MB gzipped).

| Code | Count | Source | Licence |
|---|---:|---|---|
| `IN` | 540 | IFCT 2017, Indian Food Composition Tables (NIN / ICMR) | existing entry, not changed in this build |
| `US` | 5,934 | USDA SR Legacy, via npm `tempo-food-db` (TempoLife) | CC-BY-4.0 (TempoLife compilation), USDA data in the public domain |
| `TL` | 452 | TempoLife common foods, via npm `tempo-food-db` | CC-BY-4.0 |
| `FNDDS` | 5,254 | USDA FNDDS 2021–2023 (Survey foods), FoodData Central release 2024-10-31 | Public domain / CC0 1.0 |
| `FDN` | 223 | USDA Foundation Foods, FoodData Central release 2026-04-30 | Public domain / CC0 1.0 |
| `ON` | 8,518 | OpenNutrition 2025.1: everyday and prepared foods | ODbL 1.0 + modified DbCL 1.0 |
| `ONR` | 4,080 | OpenNutrition 2025.1: restaurant menu items | ODbL 1.0 + modified DbCL 1.0 |
| `ONB` | 50,000 | OpenNutrition 2025.1: branded grocery products. These are the first 50,000 that pass the checks, in dataset order, which is roughly by popularity. Partly derived from Open Food Facts. | ODbL 1.0 + modified DbCL 1.0. Open Food Facts portions are ODbL. |
| `RC` | 132 | Restaurant components (build-your-own ingredients) for chains in Blacksburg / Christiansburg, VA, from each chain's official nutrition guide. See "Restaurant components" below. | Factual data from the chains' published nutrition guides; not affiliated with or endorsed by the chains. |

## Details

### USDA FNDDS 2021–2023 and Foundation Foods (`FNDDS`, `FDN`)
- Publisher: U.S. Department of Agriculture, Agricultural Research Service, FoodData Central. https://fdc.nal.usda.gov/
- Original files: `FoodData_Central_survey_food_json_2024-10-31.zip` and `FoodData_Central_foundation_food_json_2026-04-30.zip`.
- Retrieved from an unmodified mirror of the original USDA archives on GitHub: https://github.com/PRIYAN-A-1/FOOD-NUTRITION-DATASET- (`food_nutrition_dataset/sources/usda_fndds.zip`, `usda_foundation.zip`). The SHA-256 hashes match those listed in that repo's SOURCES.md:
  - FNDDS: `dfb06ae7ddc397ccd570b91c14b75438ab2ba39f64f22d321f61d4a52a77f3eb`
  - Foundation: `186e988ec542e913f51ef62b86a47758e8cdd0d1dc3889e7b055581f3c09c77a`
- Licence: public domain (CC0 1.0). Attribution is not required, but it is good practice.
- Attribution text: "U.S. Department of Agriculture, Agricultural Research Service. FoodData Central (FNDDS 2021–2023; Foundation Foods). fdc.nal.usda.gov". USDA does not endorse this app.
- Fields used: Energy (208). For Foundation Foods, Atwater energy (957 or 958) is used when 208 is missing. Also protein (203), carbohydrate (205, or 205.2 as a fallback), fat (204, or 298 as a fallback) and alcohol (221, used only in the energy check). For FNDDS, the WWEIA category words are added as aliases.

### OpenNutrition (`ON`, `ONR`, `ONB`)
- Publisher: OpenNutrition. https://www.opennutrition.app
- File: `opennutrition-dataset-2025.1.zip` (`opennutrition_foods.tsv`, 326,759 rows), retrieved from the GitHub copy that ships the dataset: https://github.com/deadletterq/mcp-opennutrition (`data/opennutrition-dataset-2025.1.zip`).
- Licence: Open Database License (ODbL) 1.0 for the database (http://opendatacommons.org/licenses/odbl/1.0/). A *modified* Database Contents License 1.0 covers the contents.
- **Attribution requirements (strict):**
  - "OpenNutrition" must be shown with a link to https://www.opennutrition.app on every page or screen where its data is displayed, such as the food search results and food detail screens.
  - The same attribution must also appear in any app-store listing, on the app's website, and in the app's about or legal section.
  - A single consolidated credit, for example only on an About page, does **not** satisfy the licence.
- Open Food Facts attribution is required for the parts of OpenNutrition that come from Open Food Facts, which are mostly the branded products (`ONB`): "(c) Open Food Facts contributors", linked to https://world.openfoodfacts.org
- **Share-alike:** the combined `foods.txt` is a Derivative Database of OpenNutrition. Anyone who redistributes it, for example in the public GitHub repo, must offer it under the ODbL 1.0. In practice:
  - Put a note in the repo that says "foods.txt is made available under the Open Database License 1.0".
  - Keep this file next to it.
  - The CC-BY-4.0 and public-domain parts can be combined with ODbL as long as their attribution is kept.
- Attribution text: "Food data includes OpenNutrition (https://www.opennutrition.app), licensed under ODbL 1.0, and (c) Open Food Facts contributors (https://world.openfoodfacts.org), ODbL."

### Existing entries (unchanged)
- `US` and `TL` come from npm `tempo-food-db` by TempoLife, under CC-BY-4.0. Attribution text: "Includes data from tempo-food-db by TempoLife (CC-BY-4.0); USDA SR Legacy (public domain)".
- `IN` comes from IFCT 2017, National Institute of Nutrition, ICMR, India. Please check its redistribution terms separately; this build did not change these entries.

## Processing
- **Duplicates:** an entry is dropped when its name matches an earlier entry after lowercasing and removing punctuation. The priority order is: existing file, then FNDDS, Foundation, OpenNutrition everyday/prepared, restaurant, and branded.
- **Plausibility checks.** An entry is dropped if any of these hold:
  - kcal is missing.
  - Protein, carbs or fat is missing.
  - Any value is negative.
  - kcal is above 950.
  - Protein + carbs + fat is above 105 g per 100 g.
  - kcal is inconsistent with 4/4/9 Atwater factors, plus 7 kcal/g for alcohol where known. An entry is kept when the difference is no more than 30 kcal, or when kcal / estimate is between 0.7 and 1.3.
- **Names:**
  - ALL-CAPS words of 4 or more letters are recased; common acronyms such as BBQ, NFS and IHOP are kept.
  - OpenNutrition everyday and prepared names are converted from Title Case to sentence case. Cuisine and place adjectives stay capitalised.
  - Brand and restaurant names keep their original casing.
- **Aliases:** OpenNutrition alternate names are reduced to unique words that are not already in the name, at most 90 characters (50 for branded products).
- **Numbers:** kcal is rounded to an integer and macros to 1 decimal.
- Build script: `/tmp/claude-0/fooddb/scripts/build.py` (`python3 -I build.py 50000`).

## Drop counts in this build
- **FNDDS:** 172 duplicates, 5 failed the Atwater check, 1 had no kcal.
- **Foundation:** 88 duplicates, 42 had no kcal, 10 had a negative value.
- **OpenNutrition everyday/prepared:**
  - 461 duplicates
  - 115 failed the Atwater check
  - 37 had macros summing to more than 105 g
  - 4 had kcal above 950
- **OpenNutrition restaurant:**
  - 1 duplicate
  - 44 failed the Atwater check
  - 54 had macros summing to more than 105 g
  - 3 had kcal above 950
- **OpenNutrition branded (counted up to the 50,000 cutoff):**
  - 3,161 duplicates
  - 1,097 failed the Atwater check
  - 148 had macros summing to more than 105 g
  - 27 had kcal above 950

## Restaurant components (`RC`)
Added 2026-10-21. Individual ingredients so a build-your-own order (e.g. a Qdoba bowl of rice + chicken + black beans + queso + salsa) can be logged piece by piece.
- **Names:** `<Ingredient> by <Restaurant>`. Aliases always include `component ingredient build your own`, the category (protein, rice, beans, salsa, sauce, topping, bread, cheese, dressing, side, ...) and the restaurant name.
- **Conversion:** the chain's per-serving calories, protein, carbohydrate and fat are scaled to per 100 g using the serving weight the chain publishes. The official serving goes in the serving column. Where a chain gives only ounces, 1 oz = 28.35 g (rounded to the gram). Items with no published weight (e.g. "1 tortilla" with no grams, sauces "per container") were skipped.
- **Volume servings:** three Chipotle items are published in fluid ounces (Tomatillo-Green Chili Salsa, Tomatillo-Red Chili Salsa, Chipotle-Honey Vinaigrette, 2 fl oz) and Panera half & half (1 fl oz). These are stored as 1 ml = 1 g (59 g and 30 g).
- **Checks:** every row passes 4P + 4C + 9F within 25% of the published kcal (only Qdoba Sour Cream, 28 g, is above 20%, at 22%, because of rounding on a small portion). Rows whose name already existed (after lowercasing and removing punctuation) were skipped, and near-identical items already present as OpenNutrition restaurant rows (Qdoba queso and guacamole cups, most Panda Express entrées and sides) were left out.
- **Rounding:** published values were rounded by the chains, so small items (salsas, lettuce) carry large relative rounding error.

| Chain | Rows | Source (retrieved 2026-10-21) | Notes |
|---|---:|---|---|
| Chipotle | 22 | https://www.chipotle.com/content/dam/chipotle/menu/nutrition/US-Nutrition-Facts-Paper-Menu-3-2025.pdf | US paper nutrition menu (print codes OCT-2024). Tortillas skipped (no weight). |
| Qdoba | 36 | https://assets.ctfassets.net/0tc4847zqy12/bQFJBCmsAk4ww4qzdfAOm/65d8b143afc183a155450c442408f2f3/Nutrition-Brochure-Published-on-02-26-2026-QDOBA-Mexican-Eats.pdf | Nutrition brochure published 2026-02-26. Seasoned Potatoes skipped (published kcal inconsistent with macros). |
| Panera Bread | 5 | https://www.panerabread.com/content/dam/panerabread/documents/c8-26-nutrition-guide.pdf | Effective 2026-09-02. Only bread slices, cream cheese container and half & half have published weights. 5 bread rows already existed. |
| Panda Express | 4 | https://www.pandaexpress.com/nutritioninformation | Christiansburg (Peppers Ferry Rd). Most entrées and sides already existed as ONR rows. |
| Bruegger's | 56 | https://www.brueggers.com/wp-content/uploads/2022/12/PDF-BRU-Nutritonal-Guide-2022-12-27.pdf | Data as of 2022-12-01 (latest published guide found). Location: Turner Place at Lavery Hall, Virginia Tech campus (VT Dining). Pastrami, turkey sausage and sriracha skipped (oz and g disagree). |
| Chick-fil-A | 9 | https://www.chick-fil-a.com/nutrition-allergens | Only items not already in the file. Sauces skipped: per-container values with no weight. |
