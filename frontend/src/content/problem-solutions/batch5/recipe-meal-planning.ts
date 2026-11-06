import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'RecipeMealPlanningService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_recipes', 'Map<string, Recipe>'),
    attr('-', '_meal_plans', 'Map<string, MealPlan>'),
    attr('-', '_shopping_lists', 'Map<string, ShoppingList>'),
    attr('-', '_ingredients', 'Map<string, Ingredient>'),
  ], [
    method('+', 'createRecipe', 'name: string', 'Recipe'),
    method('+', 'createMealPlan', 'name: string', 'MealPlan'),
    method('+', 'createShoppingList', 'name: string', 'ShoppingList'),
    method('+', 'createIngredient', 'name: string', 'Ingredient'),
    method('+', 'getRecipe', 'id: string', 'Recipe'),
    method('+', 'getMealPlan', 'id: string', 'MealPlan'),
    method('+', 'getShoppingList', 'id: string', 'ShoppingList'),
    method('+', 'getIngredient', 'id: string', 'Ingredient'),
    method('+', 'closeRecipe', 'id: string', 'Recipe'),
  ], 'facade'),
  cls('n1', 'Recipe', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'MealPlan', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'ShoppingList', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Ingredient', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
]

const edges = [
  edge('e1', 'n0', 'n1', 'composition', 'right', 'left'),
  edge('e2', 'n0', 'n2', 'composition', 'right', 'left'),
  edge('e3', 'n0', 'n3', 'composition', 'right', 'left'),
  edge('e4', 'n0', 'n4', 'composition', 'right', 'left'),
]

const py = `from __future__ import annotations

import logging
import threading
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s %(message)s")
log = logging.getLogger("recipe-meal-planning")


class Recipe:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Recipe.id is required")
        if not name or not name.strip():
            raise ValueError("Recipe.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Recipe.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Recipe {self.id} has invalid status={self.status}")
        log.info("[Recipe.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Recipe {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Recipe.close] id=%s -> CLOSED", self.id)


class MealPlan:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("MealPlan.id is required")
        if not name or not name.strip():
            raise ValueError("MealPlan.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[MealPlan.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"MealPlan {self.id} has invalid status={self.status}")
        log.info("[MealPlan.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"MealPlan {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[MealPlan.close] id=%s -> CLOSED", self.id)


class ShoppingList:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("ShoppingList.id is required")
        if not name or not name.strip():
            raise ValueError("ShoppingList.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[ShoppingList.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"ShoppingList {self.id} has invalid status={self.status}")
        log.info("[ShoppingList.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"ShoppingList {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[ShoppingList.close] id=%s -> CLOSED", self.id)


class Ingredient:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Ingredient.id is required")
        if not name or not name.strip():
            raise ValueError("Ingredient.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Ingredient.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Ingredient {self.id} has invalid status={self.status}")
        log.info("[Ingredient.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Ingredient {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Ingredient.close] id=%s -> CLOSED", self.id)


class RecipeMealPlanningService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._recipes: Dict[str, Recipe] = {}
        self._meal_plans: Dict[str, MealPlan] = {}
        self._shopping_lists: Dict[str, ShoppingList] = {}
        self._ingredients: Dict[str, Ingredient] = {}
        log.info("[RecipeMealPlanningService.__init__] system ready; managing: Recipe, MealPlan, ShoppingList, Ingredient")

    def create_recipe(self, name: str) -> Recipe:
        """UML: RecipeMealPlanningService.create_recipe(name) -> Recipe"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Recipe name is required")
        with self._lock:
            item_id = f"REC-{self._seq:04d}"
            self._seq += 1
            obj = Recipe(item_id, cleaned)
            obj.validate()
            self._recipes[item_id] = obj
            log.info("[RecipeMealPlanningService.create_recipe] stored %s in _recipes (count=%s)", item_id, len(self._recipes))
            return obj

    def get_recipe(self, item_id: str) -> Recipe:
        with self._lock:
            obj = self._recipes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Recipe id: {item_id}")
            log.info("[RecipeMealPlanningService.get_recipe] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_meal_plan(self, name: str) -> MealPlan:
        """UML: RecipeMealPlanningService.create_meal_plan(name) -> MealPlan"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("MealPlan name is required")
        with self._lock:
            item_id = f"MEA-{self._seq:04d}"
            self._seq += 1
            obj = MealPlan(item_id, cleaned)
            obj.validate()
            self._meal_plans[item_id] = obj
            log.info("[RecipeMealPlanningService.create_meal_plan] stored %s in _meal_plans (count=%s)", item_id, len(self._meal_plans))
            return obj

    def get_meal_plan(self, item_id: str) -> MealPlan:
        with self._lock:
            obj = self._meal_plans.get(item_id)
            if obj is None:
                raise KeyError(f"unknown MealPlan id: {item_id}")
            log.info("[RecipeMealPlanningService.get_meal_plan] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_shopping_list(self, name: str) -> ShoppingList:
        """UML: RecipeMealPlanningService.create_shopping_list(name) -> ShoppingList"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("ShoppingList name is required")
        with self._lock:
            item_id = f"SHO-{self._seq:04d}"
            self._seq += 1
            obj = ShoppingList(item_id, cleaned)
            obj.validate()
            self._shopping_lists[item_id] = obj
            log.info("[RecipeMealPlanningService.create_shopping_list] stored %s in _shopping_lists (count=%s)", item_id, len(self._shopping_lists))
            return obj

    def get_shopping_list(self, item_id: str) -> ShoppingList:
        with self._lock:
            obj = self._shopping_lists.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ShoppingList id: {item_id}")
            log.info("[RecipeMealPlanningService.get_shopping_list] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_ingredient(self, name: str) -> Ingredient:
        """UML: RecipeMealPlanningService.create_ingredient(name) -> Ingredient"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Ingredient name is required")
        with self._lock:
            item_id = f"ING-{self._seq:04d}"
            self._seq += 1
            obj = Ingredient(item_id, cleaned)
            obj.validate()
            self._ingredients[item_id] = obj
            log.info("[RecipeMealPlanningService.create_ingredient] stored %s in _ingredients (count=%s)", item_id, len(self._ingredients))
            return obj

    def get_ingredient(self, item_id: str) -> Ingredient:
        with self._lock:
            obj = self._ingredients.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Ingredient id: {item_id}")
            log.info("[RecipeMealPlanningService.get_ingredient] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_recipe(self, item_id: str) -> Recipe:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._recipes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Recipe id: {item_id}")
            log.info("[RecipeMealPlanningService.close_recipe] closing %s via Recipe.close()", item_id)
            obj.close()
            return obj

    def list_active_recipes(self) -> List[Recipe]:
        with self._lock:
            active = [o for o in self._recipes.values() if o.status == "ACTIVE"]
            log.info("[RecipeMealPlanningService.list_active_recipes] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct RecipeMealPlanningService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = RecipeMealPlanningService()

    log.info("========== STEP 2: Create primary Recipe objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_recipe("alpha-recipe")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_recipe("beta-recipe")

    log.info("========== STEP 3: Create MealPlan (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_meal_plan("sample-meal_plan")

    log.info("========== STEP 4: Create ShoppingList (UML class) ==========")
    system.create_shopping_list("sample-shopping_list")

    log.info("========== STEP 5: Create Ingredient (UML class) ==========")
    system.create_ingredient("sample-ingredient")

    log.info("========== STEP 6: Inspect active Recipe list ==========")
    system.list_active_recipes()

    log.info("========== STEP 7: Close first Recipe ==========")
    system.close_recipe(first.id)

    log.info("========== STEP 8: Expected failure - close again ==========")
    try:
        system.close_recipe(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Recipe.close: %s", err)

    log.info("========== STEP 9: Expected failure - missing id ==========")
    try:
        system.get_recipe("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_recipe: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_recipes()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Recipe {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Recipe(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Recipe.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Recipe.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Recipe.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("Recipe " + id + " invalid status");
    }
    System.out.println("[Recipe.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Recipe " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Recipe.close] id=" + id + " -> CLOSED");
  }
}


class MealPlan {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  MealPlan(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("MealPlan.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("MealPlan.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[MealPlan.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("MealPlan " + id + " invalid status");
    }
    System.out.println("[MealPlan.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("MealPlan " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[MealPlan.close] id=" + id + " -> CLOSED");
  }
}


class ShoppingList {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  ShoppingList(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("ShoppingList.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ShoppingList.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[ShoppingList.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("ShoppingList " + id + " invalid status");
    }
    System.out.println("[ShoppingList.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("ShoppingList " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[ShoppingList.close] id=" + id + " -> CLOSED");
  }
}


class Ingredient {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Ingredient(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Ingredient.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Ingredient.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Ingredient.__init__] created id=" + this.id + " name=" + this.name);
  }

  String getId() {
    return id;
  }

  String getName() {
    return name;
  }

  String getStatus() {
    return status;
  }

  void validate() {
    if (!status.equals("ACTIVE") && !status.equals("CLOSED")) {
      throw new IllegalStateException("Ingredient " + id + " invalid status");
    }
    System.out.println("[Ingredient.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Ingredient " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Ingredient.close] id=" + id + " -> CLOSED");
  }
}

public class RecipeMealPlanningService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Recipe> recipes = new LinkedHashMap<>();
  private final Map<String, MealPlan> meal_plans = new LinkedHashMap<>();
  private final Map<String, ShoppingList> shopping_lists = new LinkedHashMap<>();
  private final Map<String, Ingredient> ingredients = new LinkedHashMap<>();

  public RecipeMealPlanningService() {
    System.out.println("[RecipeMealPlanningService.__init__] system ready");
  }

  public Recipe createRecipe(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Recipe name required");
    }
    lock.lock();
    try {
      String id = String.format("REC-%04d", seq++);
      Recipe obj = new Recipe(id, name.trim());
      obj.validate();
      recipes.put(id, obj);
      System.out.println("[RecipeMealPlanningService.createRecipe] stored " + id + " count=" + recipes.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Recipe getRecipe(String id) {
    lock.lock();
    try {
      Recipe obj = recipes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Recipe id: " + id);
      }
      System.out.println("[RecipeMealPlanningService.getRecipe] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public MealPlan createMealPlan(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("MealPlan name required");
    }
    lock.lock();
    try {
      String id = String.format("MEA-%04d", seq++);
      MealPlan obj = new MealPlan(id, name.trim());
      obj.validate();
      meal_plans.put(id, obj);
      System.out.println("[RecipeMealPlanningService.createMealPlan] stored " + id + " count=" + meal_plans.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public MealPlan getMealPlan(String id) {
    lock.lock();
    try {
      MealPlan obj = meal_plans.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown MealPlan id: " + id);
      }
      System.out.println("[RecipeMealPlanningService.getMealPlan] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public ShoppingList createShoppingList(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ShoppingList name required");
    }
    lock.lock();
    try {
      String id = String.format("SHO-%04d", seq++);
      ShoppingList obj = new ShoppingList(id, name.trim());
      obj.validate();
      shopping_lists.put(id, obj);
      System.out.println("[RecipeMealPlanningService.createShoppingList] stored " + id + " count=" + shopping_lists.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public ShoppingList getShoppingList(String id) {
    lock.lock();
    try {
      ShoppingList obj = shopping_lists.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ShoppingList id: " + id);
      }
      System.out.println("[RecipeMealPlanningService.getShoppingList] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Ingredient createIngredient(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Ingredient name required");
    }
    lock.lock();
    try {
      String id = String.format("ING-%04d", seq++);
      Ingredient obj = new Ingredient(id, name.trim());
      obj.validate();
      ingredients.put(id, obj);
      System.out.println("[RecipeMealPlanningService.createIngredient] stored " + id + " count=" + ingredients.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Ingredient getIngredient(String id) {
    lock.lock();
    try {
      Ingredient obj = ingredients.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Ingredient id: " + id);
      }
      System.out.println("[RecipeMealPlanningService.getIngredient] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Recipe closeRecipe(String id) {
    lock.lock();
    try {
      Recipe obj = recipes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Recipe id: " + id);
      }
      System.out.println("[RecipeMealPlanningService.closeRecipe] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Recipe> listActiveRecipes() {
    lock.lock();
    try {
      List<Recipe> out = new ArrayList<>();
      for (Recipe o : recipes.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[RecipeMealPlanningService.listActiveRecipes] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct RecipeMealPlanningService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    RecipeMealPlanningService system = new RecipeMealPlanningService();
    System.out.println("========== STEP 2: Create Recipe objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Recipe first = system.createRecipe("alpha-recipe");
    system.createRecipe("beta-recipe");
    System.out.println("========== STEP 3: Create MealPlan ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createMealPlan("sample-meal_plan");
    System.out.println("========== STEP 4: Create ShoppingList ==========");
    system.createShoppingList("sample-shopping_list");
    System.out.println("========== STEP 5: Create Ingredient ==========");
    system.createIngredient("sample-ingredient");
    System.out.println("========== Inspect active list ==========");
    system.listActiveRecipes();
    System.out.println("========== Close first Recipe ==========");
    system.closeRecipe(first.getId());
    try {
      system.closeRecipe(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getRecipe("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Recipe {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Recipe.id required')
    }

    if (!name?.trim()) {
      throw new Error('Recipe.name required')
    }
    console.log(\`[Recipe.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Recipe \${this.id} invalid status\`)
    }
    console.log(\`[Recipe.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Recipe \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Recipe.close] id=\${this.id} -> CLOSED\`)
  }
}


class MealPlan {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('MealPlan.id required')
    }

    if (!name?.trim()) {
      throw new Error('MealPlan.name required')
    }
    console.log(\`[MealPlan.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`MealPlan \${this.id} invalid status\`)
    }
    console.log(\`[MealPlan.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`MealPlan \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[MealPlan.close] id=\${this.id} -> CLOSED\`)
  }
}


class ShoppingList {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('ShoppingList.id required')
    }

    if (!name?.trim()) {
      throw new Error('ShoppingList.name required')
    }
    console.log(\`[ShoppingList.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`ShoppingList \${this.id} invalid status\`)
    }
    console.log(\`[ShoppingList.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`ShoppingList \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[ShoppingList.close] id=\${this.id} -> CLOSED\`)
  }
}


class Ingredient {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Ingredient.id required')
    }

    if (!name?.trim()) {
      throw new Error('Ingredient.name required')
    }
    console.log(\`[Ingredient.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Ingredient \${this.id} invalid status\`)
    }
    console.log(\`[Ingredient.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Ingredient \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Ingredient.close] id=\${this.id} -> CLOSED\`)
  }
}

class RecipeMealPlanningService {
  private seq = 1
  private recipes = new Map<string, Recipe>()
  private meal_plans = new Map<string, MealPlan>()
  private shopping_lists = new Map<string, ShoppingList>()
  private ingredients = new Map<string, Ingredient>()
  constructor() {
    console.log('[RecipeMealPlanningService.__init__] system ready')
  }

  createRecipe(name: string): Recipe {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Recipe name required')
    }
    const id = \`REC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Recipe(id, cleaned)
    obj.validate()
    this.recipes.set(id, obj)
    console.log(\`[RecipeMealPlanningService.createRecipe] stored \${id} count=\${this.recipes.size}\`)
    return obj
  }

  getRecipe(id: string): Recipe {
    const obj = this.recipes.get(id)
    if (!obj) {
      throw new Error(\`unknown Recipe id: \${id}\`)
    }
    console.log(\`[RecipeMealPlanningService.getRecipe] found id=\${obj.id}\`)
    return obj
  }

  createMealPlan(name: string): MealPlan {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('MealPlan name required')
    }
    const id = \`MEA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new MealPlan(id, cleaned)
    obj.validate()
    this.meal_plans.set(id, obj)
    console.log(\`[RecipeMealPlanningService.createMealPlan] stored \${id} count=\${this.meal_plans.size}\`)
    return obj
  }

  getMealPlan(id: string): MealPlan {
    const obj = this.meal_plans.get(id)
    if (!obj) {
      throw new Error(\`unknown MealPlan id: \${id}\`)
    }
    console.log(\`[RecipeMealPlanningService.getMealPlan] found id=\${obj.id}\`)
    return obj
  }

  createShoppingList(name: string): ShoppingList {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('ShoppingList name required')
    }
    const id = \`SHO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new ShoppingList(id, cleaned)
    obj.validate()
    this.shopping_lists.set(id, obj)
    console.log(\`[RecipeMealPlanningService.createShoppingList] stored \${id} count=\${this.shopping_lists.size}\`)
    return obj
  }

  getShoppingList(id: string): ShoppingList {
    const obj = this.shopping_lists.get(id)
    if (!obj) {
      throw new Error(\`unknown ShoppingList id: \${id}\`)
    }
    console.log(\`[RecipeMealPlanningService.getShoppingList] found id=\${obj.id}\`)
    return obj
  }

  createIngredient(name: string): Ingredient {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Ingredient name required')
    }
    const id = \`ING-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Ingredient(id, cleaned)
    obj.validate()
    this.ingredients.set(id, obj)
    console.log(\`[RecipeMealPlanningService.createIngredient] stored \${id} count=\${this.ingredients.size}\`)
    return obj
  }

  getIngredient(id: string): Ingredient {
    const obj = this.ingredients.get(id)
    if (!obj) {
      throw new Error(\`unknown Ingredient id: \${id}\`)
    }
    console.log(\`[RecipeMealPlanningService.getIngredient] found id=\${obj.id}\`)
    return obj
  }

  closeRecipe(id: string): Recipe {
    const obj = this.getRecipe(id)
    console.log(\`[RecipeMealPlanningService.closeRecipe] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveRecipes(): Recipe[] {
    const active = [...this.recipes.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[RecipeMealPlanningService.listActiveRecipes] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct RecipeMealPlanningService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new RecipeMealPlanningService()
  console.log('========== STEP 2: Create Recipe objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createRecipe('alpha-recipe')
  system.createRecipe('beta-recipe')
  console.log('========== STEP 3: Create MealPlan ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createMealPlan('sample-meal_plan')
  console.log('========== STEP 4: Create ShoppingList ==========')
  system.createShoppingList('sample-shopping_list')
  console.log('========== STEP 5: Create Ingredient ==========')
  system.createIngredient('sample-ingredient')
  system.listActiveRecipes()
  console.log('========== Close first Recipe ==========')
  system.closeRecipe(first.id)
  try {
    system.closeRecipe(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getRecipe('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Recipe {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Recipe(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Recipe requires id and name");
    }
    cout << "[Recipe.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("Recipe invalid status");
    }
    cout << "[Recipe.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Recipe cannot close");
    }
    status_ = "CLOSED";
    cout << "[Recipe.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class MealPlan {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  MealPlan(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("MealPlan requires id and name");
    }
    cout << "[MealPlan.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("MealPlan invalid status");
    }
    cout << "[MealPlan.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("MealPlan cannot close");
    }
    status_ = "CLOSED";
    cout << "[MealPlan.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class ShoppingList {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  ShoppingList(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("ShoppingList requires id and name");
    }
    cout << "[ShoppingList.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("ShoppingList invalid status");
    }
    cout << "[ShoppingList.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("ShoppingList cannot close");
    }
    status_ = "CLOSED";
    cout << "[ShoppingList.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Ingredient {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Ingredient(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Ingredient requires id and name");
    }
    cout << "[Ingredient.__init__] created id=" << id_ << " name=" << name_ << endl;
  }

  const string& id() const {
    return id_;
  }

  const string& name() const {
    return name_;
  }

  const string& status() const {
    return status_;
  }

  void validate() const {
    if (status_ != "ACTIVE" && status_ != "CLOSED") {
      throw runtime_error("Ingredient invalid status");
    }
    cout << "[Ingredient.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Ingredient cannot close");
    }
    status_ = "CLOSED";
    cout << "[Ingredient.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class RecipeMealPlanningService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Recipe> recipes_;
  unordered_map<string, MealPlan> meal_plans_;
  unordered_map<string, ShoppingList> shopping_lists_;
  unordered_map<string, Ingredient> ingredients_;
public:
  RecipeMealPlanningService() {
    cout << "[RecipeMealPlanningService.__init__] system ready" << endl;
  }

  Recipe createRecipe(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Recipe name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "REC-%04d", seq_++);
    Recipe obj{buf, name};
    obj.validate();
    recipes_.emplace(obj.id(), obj);
    cout << "[RecipeMealPlanningService.createRecipe] stored " << obj.id() << endl;
    return obj;
  }

  Recipe getRecipe(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = recipes_.find(id);
    if (it == recipes_.end()) {
      throw out_of_range("unknown Recipe id");
    }
    cout << "[RecipeMealPlanningService.getRecipe] found " << id << endl;
    return it->second;
  }

  MealPlan createMealPlan(const string& name) {
    if (name.empty()) {
      throw invalid_argument("MealPlan name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "MEA-%04d", seq_++);
    MealPlan obj{buf, name};
    obj.validate();
    meal_plans_.emplace(obj.id(), obj);
    cout << "[RecipeMealPlanningService.createMealPlan] stored " << obj.id() << endl;
    return obj;
  }

  MealPlan getMealPlan(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = meal_plans_.find(id);
    if (it == meal_plans_.end()) {
      throw out_of_range("unknown MealPlan id");
    }
    cout << "[RecipeMealPlanningService.getMealPlan] found " << id << endl;
    return it->second;
  }

  ShoppingList createShoppingList(const string& name) {
    if (name.empty()) {
      throw invalid_argument("ShoppingList name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SHO-%04d", seq_++);
    ShoppingList obj{buf, name};
    obj.validate();
    shopping_lists_.emplace(obj.id(), obj);
    cout << "[RecipeMealPlanningService.createShoppingList] stored " << obj.id() << endl;
    return obj;
  }

  ShoppingList getShoppingList(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = shopping_lists_.find(id);
    if (it == shopping_lists_.end()) {
      throw out_of_range("unknown ShoppingList id");
    }
    cout << "[RecipeMealPlanningService.getShoppingList] found " << id << endl;
    return it->second;
  }

  Ingredient createIngredient(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Ingredient name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ING-%04d", seq_++);
    Ingredient obj{buf, name};
    obj.validate();
    ingredients_.emplace(obj.id(), obj);
    cout << "[RecipeMealPlanningService.createIngredient] stored " << obj.id() << endl;
    return obj;
  }

  Ingredient getIngredient(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = ingredients_.find(id);
    if (it == ingredients_.end()) {
      throw out_of_range("unknown Ingredient id");
    }
    cout << "[RecipeMealPlanningService.getIngredient] found " << id << endl;
    return it->second;
  }

  Recipe closeRecipe(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = recipes_.find(id);
    if (it == recipes_.end()) {
      throw out_of_range("unknown Recipe");
    }
    cout << "[RecipeMealPlanningService.closeRecipe] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct RecipeMealPlanningService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  RecipeMealPlanningService system;
  cout << "========== STEP 2: Create Recipe ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createRecipe("alpha-recipe");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createRecipe("beta-recipe");
  system.createMealPlan("sample-meal_plan");
  system.createShoppingList("sample-shopping_list");
  system.createIngredient("sample-ingredient");
  system.closeRecipe(first.id());
  try {
    system.closeRecipe(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getRecipe("MISSING-ID");
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  return 0;
}
`

const goCode = `package main

import (
  "fmt"
  "sync"
)

type Recipe struct {
  ID     string
  Name   string
  Status string
}

func NewRecipe(id, name string) (*Recipe, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Recipe requires id and name")
  }
  obj := &Recipe{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Recipe.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Recipe) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Recipe invalid status")
  }
  fmt.Printf("[Recipe.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Recipe) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Recipe %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Recipe.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type MealPlan struct {
  ID     string
  Name   string
  Status string
}

func NewMealPlan(id, name string) (*MealPlan, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("MealPlan requires id and name")
  }
  obj := &MealPlan{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[MealPlan.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *MealPlan) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("MealPlan invalid status")
  }
  fmt.Printf("[MealPlan.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *MealPlan) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("MealPlan %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[MealPlan.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type ShoppingList struct {
  ID     string
  Name   string
  Status string
}

func NewShoppingList(id, name string) (*ShoppingList, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("ShoppingList requires id and name")
  }
  obj := &ShoppingList{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[ShoppingList.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *ShoppingList) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("ShoppingList invalid status")
  }
  fmt.Printf("[ShoppingList.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *ShoppingList) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("ShoppingList %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[ShoppingList.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Ingredient struct {
  ID     string
  Name   string
  Status string
}

func NewIngredient(id, name string) (*Ingredient, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Ingredient requires id and name")
  }
  obj := &Ingredient{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Ingredient.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Ingredient) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Ingredient invalid status")
  }
  fmt.Printf("[Ingredient.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Ingredient) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Ingredient %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Ingredient.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type RecipeMealPlanningService struct {
  mu  sync.Mutex
  seq int
  recipes map[string]*Recipe
  meal_plans map[string]*MealPlan
  shopping_lists map[string]*ShoppingList
  ingredients map[string]*Ingredient
}

func NewRecipeMealPlanningService() *RecipeMealPlanningService {
  fmt.Println("[RecipeMealPlanningService.__init__] system ready")
  return &RecipeMealPlanningService{
    seq: 1,
    recipes: map[string]*Recipe{},
    meal_plans: map[string]*MealPlan{},
    shopping_lists: map[string]*ShoppingList{},
    ingredients: map[string]*Ingredient{},
  }
}

func (s *RecipeMealPlanningService) CreateRecipe(name string) (*Recipe, error) {
  if name == "" {
    return nil, fmt.Errorf("Recipe name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("REC-%04d", s.seq)
  s.seq++
  obj, err := NewRecipe(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.recipes[id] = obj
  fmt.Printf("[RecipeMealPlanningService.CreateRecipe] stored %s\\n", id)
  return obj, nil
}

func (s *RecipeMealPlanningService) GetRecipe(id string) (*Recipe, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.recipes[id]
  if !ok {
    return nil, fmt.Errorf("unknown Recipe id: %s", id)
  }
  fmt.Printf("[RecipeMealPlanningService.GetRecipe] found %s\\n", id)
  return obj, nil
}

func (s *RecipeMealPlanningService) CreateMealPlan(name string) (*MealPlan, error) {
  if name == "" {
    return nil, fmt.Errorf("MealPlan name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("MEA-%04d", s.seq)
  s.seq++
  obj, err := NewMealPlan(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.meal_plans[id] = obj
  fmt.Printf("[RecipeMealPlanningService.CreateMealPlan] stored %s\\n", id)
  return obj, nil
}

func (s *RecipeMealPlanningService) GetMealPlan(id string) (*MealPlan, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.meal_plans[id]
  if !ok {
    return nil, fmt.Errorf("unknown MealPlan id: %s", id)
  }
  fmt.Printf("[RecipeMealPlanningService.GetMealPlan] found %s\\n", id)
  return obj, nil
}

func (s *RecipeMealPlanningService) CreateShoppingList(name string) (*ShoppingList, error) {
  if name == "" {
    return nil, fmt.Errorf("ShoppingList name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SHO-%04d", s.seq)
  s.seq++
  obj, err := NewShoppingList(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.shopping_lists[id] = obj
  fmt.Printf("[RecipeMealPlanningService.CreateShoppingList] stored %s\\n", id)
  return obj, nil
}

func (s *RecipeMealPlanningService) GetShoppingList(id string) (*ShoppingList, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.shopping_lists[id]
  if !ok {
    return nil, fmt.Errorf("unknown ShoppingList id: %s", id)
  }
  fmt.Printf("[RecipeMealPlanningService.GetShoppingList] found %s\\n", id)
  return obj, nil
}

func (s *RecipeMealPlanningService) CreateIngredient(name string) (*Ingredient, error) {
  if name == "" {
    return nil, fmt.Errorf("Ingredient name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ING-%04d", s.seq)
  s.seq++
  obj, err := NewIngredient(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.ingredients[id] = obj
  fmt.Printf("[RecipeMealPlanningService.CreateIngredient] stored %s\\n", id)
  return obj, nil
}

func (s *RecipeMealPlanningService) GetIngredient(id string) (*Ingredient, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.ingredients[id]
  if !ok {
    return nil, fmt.Errorf("unknown Ingredient id: %s", id)
  }
  fmt.Printf("[RecipeMealPlanningService.GetIngredient] found %s\\n", id)
  return obj, nil
}

func (s *RecipeMealPlanningService) CloseRecipe(id string) (*Recipe, error) {
  obj, err := s.GetRecipe(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[RecipeMealPlanningService.CloseRecipe] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct RecipeMealPlanningService ==========")
  system := NewRecipeMealPlanningService()
  fmt.Println("========== STEP 2: Create Recipe ==========")
  first, _ := system.CreateRecipe("alpha-recipe")
  system.CreateRecipe("beta-recipe")
  system.CreateMealPlan("sample-meal_plan")
  system.CreateShoppingList("sample-shopping_list")
  system.CreateIngredient("sample-ingredient")
  system.CloseRecipe(first.ID)
  if _, err := system.CloseRecipe(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetRecipe("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Recipe {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Recipe(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Recipe requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Recipe.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Recipe invalid status");
    }
    Console.WriteLine("[Recipe.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Recipe " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Recipe.close] id=" + Id + " -> CLOSED");
  }
}


sealed class MealPlan {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public MealPlan(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("MealPlan requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[MealPlan.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("MealPlan invalid status");
    }
    Console.WriteLine("[MealPlan.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("MealPlan " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[MealPlan.close] id=" + Id + " -> CLOSED");
  }
}


sealed class ShoppingList {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public ShoppingList(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ShoppingList requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[ShoppingList.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("ShoppingList invalid status");
    }
    Console.WriteLine("[ShoppingList.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("ShoppingList " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[ShoppingList.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Ingredient {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Ingredient(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Ingredient requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Ingredient.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Ingredient invalid status");
    }
    Console.WriteLine("[Ingredient.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Ingredient " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Ingredient.close] id=" + Id + " -> CLOSED");
  }
}

sealed class RecipeMealPlanningService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Recipe> _recipes = new();
  private readonly Dictionary<string, MealPlan> _meal_plans = new();
  private readonly Dictionary<string, ShoppingList> _shopping_lists = new();
  private readonly Dictionary<string, Ingredient> _ingredients = new();
  public RecipeMealPlanningService() {
    Console.WriteLine("[RecipeMealPlanningService.__init__] system ready");
  }

  public Recipe CreateRecipe(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Recipe name required");
    }
    lock (_gate) {
      var id = string.Format("REC-{0:D4}", _seq++);
      var obj = new Recipe(id, name.Trim());
      obj.Validate();
      _recipes[id] = obj;
      Console.WriteLine("[RecipeMealPlanningService.CreateRecipe] stored " + id);
      return obj;
    }
  }

  public Recipe GetRecipe(string id) {
    lock (_gate) {
      if (!_recipes.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Recipe id: " + id);
      }
      Console.WriteLine("[RecipeMealPlanningService.GetRecipe] found " + id);
      return obj;
    }
  }

  public MealPlan CreateMealPlan(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("MealPlan name required");
    }
    lock (_gate) {
      var id = string.Format("MEA-{0:D4}", _seq++);
      var obj = new MealPlan(id, name.Trim());
      obj.Validate();
      _meal_plans[id] = obj;
      Console.WriteLine("[RecipeMealPlanningService.CreateMealPlan] stored " + id);
      return obj;
    }
  }

  public MealPlan GetMealPlan(string id) {
    lock (_gate) {
      if (!_meal_plans.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown MealPlan id: " + id);
      }
      Console.WriteLine("[RecipeMealPlanningService.GetMealPlan] found " + id);
      return obj;
    }
  }

  public ShoppingList CreateShoppingList(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ShoppingList name required");
    }
    lock (_gate) {
      var id = string.Format("SHO-{0:D4}", _seq++);
      var obj = new ShoppingList(id, name.Trim());
      obj.Validate();
      _shopping_lists[id] = obj;
      Console.WriteLine("[RecipeMealPlanningService.CreateShoppingList] stored " + id);
      return obj;
    }
  }

  public ShoppingList GetShoppingList(string id) {
    lock (_gate) {
      if (!_shopping_lists.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown ShoppingList id: " + id);
      }
      Console.WriteLine("[RecipeMealPlanningService.GetShoppingList] found " + id);
      return obj;
    }
  }

  public Ingredient CreateIngredient(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Ingredient name required");
    }
    lock (_gate) {
      var id = string.Format("ING-{0:D4}", _seq++);
      var obj = new Ingredient(id, name.Trim());
      obj.Validate();
      _ingredients[id] = obj;
      Console.WriteLine("[RecipeMealPlanningService.CreateIngredient] stored " + id);
      return obj;
    }
  }

  public Ingredient GetIngredient(string id) {
    lock (_gate) {
      if (!_ingredients.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Ingredient id: " + id);
      }
      Console.WriteLine("[RecipeMealPlanningService.GetIngredient] found " + id);
      return obj;
    }
  }

  public Recipe CloseRecipe(string id) {
    var obj = GetRecipe(id);
    Console.WriteLine("[RecipeMealPlanningService.CloseRecipe] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct RecipeMealPlanningService ==========");
    var system = new RecipeMealPlanningService();
    Console.WriteLine("========== STEP 2: Create Recipe ==========");
    var first = system.CreateRecipe("alpha-recipe");
    system.CreateRecipe("beta-recipe");
    system.CreateMealPlan("sample-meal_plan");
    system.CreateShoppingList("sample-shopping_list");
    system.CreateIngredient("sample-ingredient");
    system.CloseRecipe(first.Id);
    try {
      system.CloseRecipe(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetRecipe("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const recipeMealPlanningSolution: ProblemSolution = {
  slug: 'recipe-meal-planning',
  title: 'Recipe & Meal Planning App - Complete LLD Guide',
  overview: {
    introduction: [
      'Design an app for browsing recipes, planning weekly meals, and auto-generating a shopping list. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Browse and search recipes by ingredient, cuisine, or dietary tag',
      'Add a recipe to a weekly meal plan calendar',
      'Scale recipe ingredient quantities based on serving size',
      'Auto-generate a consolidated shopping list from a week\'s meal plan',
      'Mark shopping list items as purchased',
      'Save favorite recipes',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Browse and search recipes by ingredient, cuisine, or dietary tag?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Add a recipe to a weekly meal plan calendar?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Scale recipe ingredient quantities based on serving size?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Auto-generate a consolidated shopping list from a week\'s meal plan?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Mark shopping list items as purchased?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. RecipeMealPlanningService is the facade stereotype. Recipe, MealPlan, ShoppingList, Ingredient are concrete domain classes with id/name/status and validate/close.',
          'Composition edges mean the facade stores and lifetime-owns those objects in maps - reflected directly in the code fields.',
        ],
        callout: {
          title: 'Beginner tip',
          body: 'If a class appears on the UML, it must appear in the code with the same name. Do not invent a generic Record type that the diagram never shows.',
        },
      },
      {
        heading: 'Build the demo around the facade API',
        paragraphs: [
          'Call create methods for each UML type, then exercise close on the primary entity and show the two failure paths the diagram implies: illegal state and missing id.',
        ],
        numbered: [
          'Construct RecipeMealPlanningService.',
          'createRecipe twice and create the related UML classes.',
          'closeRecipe once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'RecipeMealPlanningService', responsibility: 'UML facade - orchestrates Recipe & Meal Planning App.', keyMembers: ['create*', 'get*', 'closeRecipe'] },
    { name: 'Recipe', responsibility: 'UML class - domain object for Recipe & Meal Planning App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'MealPlan', responsibility: 'UML class - domain object for Recipe & Meal Planning App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ShoppingList', responsibility: 'UML class - domain object for Recipe & Meal Planning App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Ingredient', responsibility: 'UML class - domain object for Recipe & Meal Planning App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from RecipeMealPlanningService to Recipe, MealPlan, ShoppingList, Ingredient. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on RecipeMealPlanningService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
        ],
      },
      {
        heading: 'Validation lives on the domain class',
        paragraphs: [
          'validate() and close() sit on each domain type exactly as in the UML method compartments, so invariants stay next to the data they protect.',
        ],
      },
    ],
    classResponsibilities: [
    { name: 'RecipeMealPlanningService', responsibility: 'UML facade - orchestrates Recipe & Meal Planning App.', keyMembers: ['create*', 'get*', 'closeRecipe'] },
    { name: 'Recipe', responsibility: 'UML class - domain object for Recipe & Meal Planning App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'MealPlan', responsibility: 'UML class - domain object for Recipe & Meal Planning App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ShoppingList', responsibility: 'UML class - domain object for Recipe & Meal Planning App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Ingredient', responsibility: 'UML class - domain object for Recipe & Meal Planning App.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'RecipeMealPlanningService exposes create/get/close and owns composed collections.' },
      { name: 'Composition', why: 'UML filled diamonds mean ownership.', howApplied: 'Domain instances live in facade maps and are not shared elsewhere in the demo.' },
    ],
    decisions: [
      {
        decision: 'Identical class names across UML and all six languages',
        rationale: 'Beginners can map diagram boxes to code without renaming.',
      },
    ],
    solid: {
      paragraphs: [
        'SRP: domain classes validate themselves; the facade only orchestrates. DIP: callers depend on the facade API, not on map internals.',
      ],
    },
    extensibility: [
      'Add new UML classes as new composed types on the facade.',
      'Replace in-memory maps with repositories without changing domain method names.',
    ],
  },
  implementationIntro: [
    'Every language implements the same UML types. Read the logs in main() top to bottom - each line names the class and method that just ran.',
  ],
  implementations: { python: py, java, typescript: ts, cpp, go: goCode, csharp },
  executionFlow: {
    narrative: [
      'main constructs RecipeMealPlanningService, creates UML domain objects, closes the primary Recipe, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct RecipeMealPlanningService.',
      'createRecipe for alpha and beta.',
      'create remaining UML classes.',
      'closeRecipe(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createRecipe("alpha..."); closeRecipe(id)',
        output: '[Recipe.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeRecipe(alreadyClosed) or getRecipe("MISSING-ID")',
        output: '[main] expected failure: ...',
        explanation: 'Illegal transitions and missing ids throw; main catches and logs them.',
      },
    ],
  },
  followUps: [
    {
      question: 'How do you prove the code matches the UML?',
      answer: 'Every class box name appears as a type; every facade method in the diagram is callable in main; composition is a real owned map.',
    },
    {
      question: 'Where should new behavior go?',
      answer: 'If the UML shows the method on a domain class, implement it there. Only orchestration belongs on the facade.',
    },
    {
      question: 'How do you keep beginners oriented?',
      answer: 'Log ClassName.methodName on every important step so the console narrates the diagram.',
    },
    {
      question: 'What about inheritance on the UML?',
      answer: 'When a later problem shows a generalization edge, introduce a base type and subclasses with the same names - do not flatten them into one Record.',
    },
    {
      question: 'How do you test this?',
      answer: 'Unit-test domain validate/close; integration-test the facade create/get/close paths including the two failure cases in main.',
    },
  ],
  extras: {
    edgeCases: { paragraphs: ['Empty names, double-close, and unknown ids.'] },
    commonMistakes: {
      paragraphs: ['Inventing a Record class not on the UML, and putting domain validation only in the facade.'],
    },
    complexity: ['Map operations are O(1) average for create/get.'],
    testing: { paragraphs: ['Happy create/close, double-close, missing get.'] },
    extensions: ['Persistence', 'Extra UML associations', 'Domain events'],
    takeaways: ['UML names == code names', 'Facade owns composition', 'Logged main teaches the design'],
  },
}
