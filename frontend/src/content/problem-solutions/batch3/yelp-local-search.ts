import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'YelpLocalSearchService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_businesss', 'Map<string, Business>'),
    attr('-', '_categories', 'Map<string, Category>'),
    attr('-', '_reviews', 'Map<string, Review>'),
    attr('-', '_photos', 'Map<string, Photo>'),
    attr('-', '_users', 'Map<string, User>'),
  ], [
    method('+', 'createBusiness', 'name: string', 'Business'),
    method('+', 'createCategory', 'name: string', 'Category'),
    method('+', 'createReview', 'name: string', 'Review'),
    method('+', 'createPhoto', 'name: string', 'Photo'),
    method('+', 'createUser', 'name: string', 'User'),
    method('+', 'getBusiness', 'id: string', 'Business'),
    method('+', 'getCategory', 'id: string', 'Category'),
    method('+', 'getReview', 'id: string', 'Review'),
    method('+', 'getPhoto', 'id: string', 'Photo'),
    method('+', 'getUser', 'id: string', 'User'),
    method('+', 'closeBusiness', 'id: string', 'Business'),
  ], 'facade'),
  cls('n1', 'Business', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Category', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Review', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Photo', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'User', GRID.x(2), GRID.y(1), [
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
  edge('e5', 'n0', 'n5', 'composition', 'right', 'left'),
]

const py = `from __future__ import annotations

import logging
import threading
from typing import Dict, List

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s %(message)s")
log = logging.getLogger("yelp-local-search")


class Business:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Business.id is required")
        if not name or not name.strip():
            raise ValueError("Business.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Business.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Business {self.id} has invalid status={self.status}")
        log.info("[Business.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Business {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Business.close] id=%s -> CLOSED", self.id)


class Category:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Category.id is required")
        if not name or not name.strip():
            raise ValueError("Category.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Category.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Category {self.id} has invalid status={self.status}")
        log.info("[Category.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Category {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Category.close] id=%s -> CLOSED", self.id)


class Review:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Review.id is required")
        if not name or not name.strip():
            raise ValueError("Review.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Review.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Review {self.id} has invalid status={self.status}")
        log.info("[Review.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Review {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Review.close] id=%s -> CLOSED", self.id)


class Photo:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Photo.id is required")
        if not name or not name.strip():
            raise ValueError("Photo.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Photo.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Photo {self.id} has invalid status={self.status}")
        log.info("[Photo.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Photo {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Photo.close] id=%s -> CLOSED", self.id)


class User:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("User.id is required")
        if not name or not name.strip():
            raise ValueError("User.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[User.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"User {self.id} has invalid status={self.status}")
        log.info("[User.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"User {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[User.close] id=%s -> CLOSED", self.id)


class YelpLocalSearchService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._businesss: Dict[str, Business] = {}
        self._categories: Dict[str, Category] = {}
        self._reviews: Dict[str, Review] = {}
        self._photos: Dict[str, Photo] = {}
        self._users: Dict[str, User] = {}
        log.info("[YelpLocalSearchService.__init__] system ready; managing: Business, Category, Review, Photo, User")

    def create_business(self, name: str) -> Business:
        """UML: YelpLocalSearchService.create_business(name) -> Business"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Business name is required")
        with self._lock:
            item_id = f"BUS-{self._seq:04d}"
            self._seq += 1
            obj = Business(item_id, cleaned)
            obj.validate()
            self._businesss[item_id] = obj
            log.info("[YelpLocalSearchService.create_business] stored %s in _businesss (count=%s)", item_id, len(self._businesss))
            return obj

    def get_business(self, item_id: str) -> Business:
        with self._lock:
            obj = self._businesss.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Business id: {item_id}")
            log.info("[YelpLocalSearchService.get_business] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_category(self, name: str) -> Category:
        """UML: YelpLocalSearchService.create_category(name) -> Category"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Category name is required")
        with self._lock:
            item_id = f"CAT-{self._seq:04d}"
            self._seq += 1
            obj = Category(item_id, cleaned)
            obj.validate()
            self._categories[item_id] = obj
            log.info("[YelpLocalSearchService.create_category] stored %s in _categories (count=%s)", item_id, len(self._categories))
            return obj

    def get_category(self, item_id: str) -> Category:
        with self._lock:
            obj = self._categories.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Category id: {item_id}")
            log.info("[YelpLocalSearchService.get_category] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_review(self, name: str) -> Review:
        """UML: YelpLocalSearchService.create_review(name) -> Review"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Review name is required")
        with self._lock:
            item_id = f"REV-{self._seq:04d}"
            self._seq += 1
            obj = Review(item_id, cleaned)
            obj.validate()
            self._reviews[item_id] = obj
            log.info("[YelpLocalSearchService.create_review] stored %s in _reviews (count=%s)", item_id, len(self._reviews))
            return obj

    def get_review(self, item_id: str) -> Review:
        with self._lock:
            obj = self._reviews.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Review id: {item_id}")
            log.info("[YelpLocalSearchService.get_review] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_photo(self, name: str) -> Photo:
        """UML: YelpLocalSearchService.create_photo(name) -> Photo"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Photo name is required")
        with self._lock:
            item_id = f"PHO-{self._seq:04d}"
            self._seq += 1
            obj = Photo(item_id, cleaned)
            obj.validate()
            self._photos[item_id] = obj
            log.info("[YelpLocalSearchService.create_photo] stored %s in _photos (count=%s)", item_id, len(self._photos))
            return obj

    def get_photo(self, item_id: str) -> Photo:
        with self._lock:
            obj = self._photos.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Photo id: {item_id}")
            log.info("[YelpLocalSearchService.get_photo] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_user(self, name: str) -> User:
        """UML: YelpLocalSearchService.create_user(name) -> User"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("User name is required")
        with self._lock:
            item_id = f"USE-{self._seq:04d}"
            self._seq += 1
            obj = User(item_id, cleaned)
            obj.validate()
            self._users[item_id] = obj
            log.info("[YelpLocalSearchService.create_user] stored %s in _users (count=%s)", item_id, len(self._users))
            return obj

    def get_user(self, item_id: str) -> User:
        with self._lock:
            obj = self._users.get(item_id)
            if obj is None:
                raise KeyError(f"unknown User id: {item_id}")
            log.info("[YelpLocalSearchService.get_user] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_business(self, item_id: str) -> Business:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._businesss.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Business id: {item_id}")
            log.info("[YelpLocalSearchService.close_business] closing %s via Business.close()", item_id)
            obj.close()
            return obj

    def list_active_businesss(self) -> List[Business]:
        with self._lock:
            active = [o for o in self._businesss.values() if o.status == "ACTIVE"]
            log.info("[YelpLocalSearchService.list_active_businesss] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct YelpLocalSearchService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = YelpLocalSearchService()

    log.info("========== STEP 2: Create primary Business objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_business("alpha-business")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_business("beta-business")

    log.info("========== STEP 3: Create Category (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_category("sample-category")

    log.info("========== STEP 4: Create Review (UML class) ==========")
    system.create_review("sample-review")

    log.info("========== STEP 5: Create Photo (UML class) ==========")
    system.create_photo("sample-photo")

    log.info("========== STEP 6: Create User (UML class) ==========")
    system.create_user("sample-user")

    log.info("========== STEP 7: Inspect active Business list ==========")
    system.list_active_businesss()

    log.info("========== STEP 8: Close first Business ==========")
    system.close_business(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_business(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Business.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_business("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_business: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_businesss()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Business {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Business(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Business.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Business.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Business.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Business " + id + " invalid status");
    }
    System.out.println("[Business.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Business " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Business.close] id=" + id + " -> CLOSED");
  }
}


class Category {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Category(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Category.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Category.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Category.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Category " + id + " invalid status");
    }
    System.out.println("[Category.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Category " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Category.close] id=" + id + " -> CLOSED");
  }
}


class Review {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Review(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Review.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Review.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Review.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Review " + id + " invalid status");
    }
    System.out.println("[Review.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Review " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Review.close] id=" + id + " -> CLOSED");
  }
}


class Photo {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Photo(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Photo.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Photo.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Photo.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Photo " + id + " invalid status");
    }
    System.out.println("[Photo.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Photo " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Photo.close] id=" + id + " -> CLOSED");
  }
}


class User {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  User(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("User.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("User.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[User.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("User " + id + " invalid status");
    }
    System.out.println("[User.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("User " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[User.close] id=" + id + " -> CLOSED");
  }
}

public class YelpLocalSearchService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Business> businesss = new LinkedHashMap<>();
  private final Map<String, Category> categories = new LinkedHashMap<>();
  private final Map<String, Review> reviews = new LinkedHashMap<>();
  private final Map<String, Photo> photos = new LinkedHashMap<>();
  private final Map<String, User> users = new LinkedHashMap<>();

  public YelpLocalSearchService() {
    System.out.println("[YelpLocalSearchService.__init__] system ready");
  }

  public Business createBusiness(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Business name required");
    }
    lock.lock();
    try {
      String id = String.format("BUS-%04d", seq++);
      Business obj = new Business(id, name.trim());
      obj.validate();
      businesss.put(id, obj);
      System.out.println("[YelpLocalSearchService.createBusiness] stored " + id + " count=" + businesss.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Business getBusiness(String id) {
    lock.lock();
    try {
      Business obj = businesss.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Business id: " + id);
      }
      System.out.println("[YelpLocalSearchService.getBusiness] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Category createCategory(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Category name required");
    }
    lock.lock();
    try {
      String id = String.format("CAT-%04d", seq++);
      Category obj = new Category(id, name.trim());
      obj.validate();
      categories.put(id, obj);
      System.out.println("[YelpLocalSearchService.createCategory] stored " + id + " count=" + categories.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Category getCategory(String id) {
    lock.lock();
    try {
      Category obj = categories.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Category id: " + id);
      }
      System.out.println("[YelpLocalSearchService.getCategory] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Review createReview(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Review name required");
    }
    lock.lock();
    try {
      String id = String.format("REV-%04d", seq++);
      Review obj = new Review(id, name.trim());
      obj.validate();
      reviews.put(id, obj);
      System.out.println("[YelpLocalSearchService.createReview] stored " + id + " count=" + reviews.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Review getReview(String id) {
    lock.lock();
    try {
      Review obj = reviews.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Review id: " + id);
      }
      System.out.println("[YelpLocalSearchService.getReview] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Photo createPhoto(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Photo name required");
    }
    lock.lock();
    try {
      String id = String.format("PHO-%04d", seq++);
      Photo obj = new Photo(id, name.trim());
      obj.validate();
      photos.put(id, obj);
      System.out.println("[YelpLocalSearchService.createPhoto] stored " + id + " count=" + photos.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Photo getPhoto(String id) {
    lock.lock();
    try {
      Photo obj = photos.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Photo id: " + id);
      }
      System.out.println("[YelpLocalSearchService.getPhoto] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public User createUser(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("User name required");
    }
    lock.lock();
    try {
      String id = String.format("USE-%04d", seq++);
      User obj = new User(id, name.trim());
      obj.validate();
      users.put(id, obj);
      System.out.println("[YelpLocalSearchService.createUser] stored " + id + " count=" + users.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public User getUser(String id) {
    lock.lock();
    try {
      User obj = users.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown User id: " + id);
      }
      System.out.println("[YelpLocalSearchService.getUser] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Business closeBusiness(String id) {
    lock.lock();
    try {
      Business obj = businesss.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Business id: " + id);
      }
      System.out.println("[YelpLocalSearchService.closeBusiness] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Business> listActiveBusinesss() {
    lock.lock();
    try {
      List<Business> out = new ArrayList<>();
      for (Business o : businesss.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[YelpLocalSearchService.listActiveBusinesss] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct YelpLocalSearchService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    YelpLocalSearchService system = new YelpLocalSearchService();
    System.out.println("========== STEP 2: Create Business objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Business first = system.createBusiness("alpha-business");
    system.createBusiness("beta-business");
    System.out.println("========== STEP 3: Create Category ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createCategory("sample-category");
    System.out.println("========== STEP 4: Create Review ==========");
    system.createReview("sample-review");
    System.out.println("========== STEP 5: Create Photo ==========");
    system.createPhoto("sample-photo");
    System.out.println("========== STEP 6: Create User ==========");
    system.createUser("sample-user");
    System.out.println("========== Inspect active list ==========");
    system.listActiveBusinesss();
    System.out.println("========== Close first Business ==========");
    system.closeBusiness(first.getId());
    try {
      system.closeBusiness(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getBusiness("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Business {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Business.id required')
    }

    if (!name?.trim()) {
      throw new Error('Business.name required')
    }
    console.log(\`[Business.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Business \${this.id} invalid status\`)
    }
    console.log(\`[Business.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Business \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Business.close] id=\${this.id} -> CLOSED\`)
  }
}


class Category {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Category.id required')
    }

    if (!name?.trim()) {
      throw new Error('Category.name required')
    }
    console.log(\`[Category.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Category \${this.id} invalid status\`)
    }
    console.log(\`[Category.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Category \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Category.close] id=\${this.id} -> CLOSED\`)
  }
}


class Review {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Review.id required')
    }

    if (!name?.trim()) {
      throw new Error('Review.name required')
    }
    console.log(\`[Review.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Review \${this.id} invalid status\`)
    }
    console.log(\`[Review.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Review \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Review.close] id=\${this.id} -> CLOSED\`)
  }
}


class Photo {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Photo.id required')
    }

    if (!name?.trim()) {
      throw new Error('Photo.name required')
    }
    console.log(\`[Photo.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Photo \${this.id} invalid status\`)
    }
    console.log(\`[Photo.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Photo \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Photo.close] id=\${this.id} -> CLOSED\`)
  }
}


class User {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('User.id required')
    }

    if (!name?.trim()) {
      throw new Error('User.name required')
    }
    console.log(\`[User.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`User \${this.id} invalid status\`)
    }
    console.log(\`[User.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`User \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[User.close] id=\${this.id} -> CLOSED\`)
  }
}

class YelpLocalSearchService {
  private seq = 1
  private businesss = new Map<string, Business>()
  private categories = new Map<string, Category>()
  private reviews = new Map<string, Review>()
  private photos = new Map<string, Photo>()
  private users = new Map<string, User>()
  constructor() {
    console.log('[YelpLocalSearchService.__init__] system ready')
  }

  createBusiness(name: string): Business {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Business name required')
    }
    const id = \`BUS-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Business(id, cleaned)
    obj.validate()
    this.businesss.set(id, obj)
    console.log(\`[YelpLocalSearchService.createBusiness] stored \${id} count=\${this.businesss.size}\`)
    return obj
  }

  getBusiness(id: string): Business {
    const obj = this.businesss.get(id)
    if (!obj) {
      throw new Error(\`unknown Business id: \${id}\`)
    }
    console.log(\`[YelpLocalSearchService.getBusiness] found id=\${obj.id}\`)
    return obj
  }

  createCategory(name: string): Category {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Category name required')
    }
    const id = \`CAT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Category(id, cleaned)
    obj.validate()
    this.categories.set(id, obj)
    console.log(\`[YelpLocalSearchService.createCategory] stored \${id} count=\${this.categories.size}\`)
    return obj
  }

  getCategory(id: string): Category {
    const obj = this.categories.get(id)
    if (!obj) {
      throw new Error(\`unknown Category id: \${id}\`)
    }
    console.log(\`[YelpLocalSearchService.getCategory] found id=\${obj.id}\`)
    return obj
  }

  createReview(name: string): Review {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Review name required')
    }
    const id = \`REV-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Review(id, cleaned)
    obj.validate()
    this.reviews.set(id, obj)
    console.log(\`[YelpLocalSearchService.createReview] stored \${id} count=\${this.reviews.size}\`)
    return obj
  }

  getReview(id: string): Review {
    const obj = this.reviews.get(id)
    if (!obj) {
      throw new Error(\`unknown Review id: \${id}\`)
    }
    console.log(\`[YelpLocalSearchService.getReview] found id=\${obj.id}\`)
    return obj
  }

  createPhoto(name: string): Photo {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Photo name required')
    }
    const id = \`PHO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Photo(id, cleaned)
    obj.validate()
    this.photos.set(id, obj)
    console.log(\`[YelpLocalSearchService.createPhoto] stored \${id} count=\${this.photos.size}\`)
    return obj
  }

  getPhoto(id: string): Photo {
    const obj = this.photos.get(id)
    if (!obj) {
      throw new Error(\`unknown Photo id: \${id}\`)
    }
    console.log(\`[YelpLocalSearchService.getPhoto] found id=\${obj.id}\`)
    return obj
  }

  createUser(name: string): User {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('User name required')
    }
    const id = \`USE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new User(id, cleaned)
    obj.validate()
    this.users.set(id, obj)
    console.log(\`[YelpLocalSearchService.createUser] stored \${id} count=\${this.users.size}\`)
    return obj
  }

  getUser(id: string): User {
    const obj = this.users.get(id)
    if (!obj) {
      throw new Error(\`unknown User id: \${id}\`)
    }
    console.log(\`[YelpLocalSearchService.getUser] found id=\${obj.id}\`)
    return obj
  }

  closeBusiness(id: string): Business {
    const obj = this.getBusiness(id)
    console.log(\`[YelpLocalSearchService.closeBusiness] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveBusinesss(): Business[] {
    const active = [...this.businesss.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[YelpLocalSearchService.listActiveBusinesss] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct YelpLocalSearchService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new YelpLocalSearchService()
  console.log('========== STEP 2: Create Business objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createBusiness('alpha-business')
  system.createBusiness('beta-business')
  console.log('========== STEP 3: Create Category ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createCategory('sample-category')
  console.log('========== STEP 4: Create Review ==========')
  system.createReview('sample-review')
  console.log('========== STEP 5: Create Photo ==========')
  system.createPhoto('sample-photo')
  console.log('========== STEP 6: Create User ==========')
  system.createUser('sample-user')
  system.listActiveBusinesss()
  console.log('========== Close first Business ==========')
  system.closeBusiness(first.id)
  try {
    system.closeBusiness(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getBusiness('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Business {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Business(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Business requires id and name");
    }
    cout << "[Business.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Business invalid status");
    }
    cout << "[Business.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Business cannot close");
    }
    status_ = "CLOSED";
    cout << "[Business.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Category {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Category(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Category requires id and name");
    }
    cout << "[Category.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Category invalid status");
    }
    cout << "[Category.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Category cannot close");
    }
    status_ = "CLOSED";
    cout << "[Category.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Review {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Review(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Review requires id and name");
    }
    cout << "[Review.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Review invalid status");
    }
    cout << "[Review.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Review cannot close");
    }
    status_ = "CLOSED";
    cout << "[Review.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Photo {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Photo(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Photo requires id and name");
    }
    cout << "[Photo.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Photo invalid status");
    }
    cout << "[Photo.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Photo cannot close");
    }
    status_ = "CLOSED";
    cout << "[Photo.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class User {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  User(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("User requires id and name");
    }
    cout << "[User.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("User invalid status");
    }
    cout << "[User.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("User cannot close");
    }
    status_ = "CLOSED";
    cout << "[User.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class YelpLocalSearchService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Business> businesss_;
  unordered_map<string, Category> categories_;
  unordered_map<string, Review> reviews_;
  unordered_map<string, Photo> photos_;
  unordered_map<string, User> users_;
public:
  YelpLocalSearchService() {
    cout << "[YelpLocalSearchService.__init__] system ready" << endl;
  }

  Business createBusiness(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Business name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "BUS-%04d", seq_++);
    Business obj{buf, name};
    obj.validate();
    businesss_.emplace(obj.id(), obj);
    cout << "[YelpLocalSearchService.createBusiness] stored " << obj.id() << endl;
    return obj;
  }

  Business getBusiness(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = businesss_.find(id);
    if (it == businesss_.end()) {
      throw out_of_range("unknown Business id");
    }
    cout << "[YelpLocalSearchService.getBusiness] found " << id << endl;
    return it->second;
  }

  Category createCategory(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Category name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "CAT-%04d", seq_++);
    Category obj{buf, name};
    obj.validate();
    categories_.emplace(obj.id(), obj);
    cout << "[YelpLocalSearchService.createCategory] stored " << obj.id() << endl;
    return obj;
  }

  Category getCategory(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = categories_.find(id);
    if (it == categories_.end()) {
      throw out_of_range("unknown Category id");
    }
    cout << "[YelpLocalSearchService.getCategory] found " << id << endl;
    return it->second;
  }

  Review createReview(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Review name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "REV-%04d", seq_++);
    Review obj{buf, name};
    obj.validate();
    reviews_.emplace(obj.id(), obj);
    cout << "[YelpLocalSearchService.createReview] stored " << obj.id() << endl;
    return obj;
  }

  Review getReview(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = reviews_.find(id);
    if (it == reviews_.end()) {
      throw out_of_range("unknown Review id");
    }
    cout << "[YelpLocalSearchService.getReview] found " << id << endl;
    return it->second;
  }

  Photo createPhoto(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Photo name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PHO-%04d", seq_++);
    Photo obj{buf, name};
    obj.validate();
    photos_.emplace(obj.id(), obj);
    cout << "[YelpLocalSearchService.createPhoto] stored " << obj.id() << endl;
    return obj;
  }

  Photo getPhoto(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = photos_.find(id);
    if (it == photos_.end()) {
      throw out_of_range("unknown Photo id");
    }
    cout << "[YelpLocalSearchService.getPhoto] found " << id << endl;
    return it->second;
  }

  User createUser(const string& name) {
    if (name.empty()) {
      throw invalid_argument("User name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "USE-%04d", seq_++);
    User obj{buf, name};
    obj.validate();
    users_.emplace(obj.id(), obj);
    cout << "[YelpLocalSearchService.createUser] stored " << obj.id() << endl;
    return obj;
  }

  User getUser(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = users_.find(id);
    if (it == users_.end()) {
      throw out_of_range("unknown User id");
    }
    cout << "[YelpLocalSearchService.getUser] found " << id << endl;
    return it->second;
  }

  Business closeBusiness(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = businesss_.find(id);
    if (it == businesss_.end()) {
      throw out_of_range("unknown Business");
    }
    cout << "[YelpLocalSearchService.closeBusiness] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct YelpLocalSearchService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  YelpLocalSearchService system;
  cout << "========== STEP 2: Create Business ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createBusiness("alpha-business");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createBusiness("beta-business");
  system.createCategory("sample-category");
  system.createReview("sample-review");
  system.createPhoto("sample-photo");
  system.createUser("sample-user");
  system.closeBusiness(first.id());
  try {
    system.closeBusiness(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getBusiness("MISSING-ID");
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

type Business struct {
  ID     string
  Name   string
  Status string
}

func NewBusiness(id, name string) (*Business, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Business requires id and name")
  }
  obj := &Business{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Business.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Business) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Business invalid status")
  }
  fmt.Printf("[Business.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Business) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Business %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Business.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Category struct {
  ID     string
  Name   string
  Status string
}

func NewCategory(id, name string) (*Category, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Category requires id and name")
  }
  obj := &Category{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Category.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Category) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Category invalid status")
  }
  fmt.Printf("[Category.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Category) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Category %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Category.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Review struct {
  ID     string
  Name   string
  Status string
}

func NewReview(id, name string) (*Review, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Review requires id and name")
  }
  obj := &Review{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Review.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Review) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Review invalid status")
  }
  fmt.Printf("[Review.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Review) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Review %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Review.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Photo struct {
  ID     string
  Name   string
  Status string
}

func NewPhoto(id, name string) (*Photo, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Photo requires id and name")
  }
  obj := &Photo{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Photo.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Photo) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Photo invalid status")
  }
  fmt.Printf("[Photo.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Photo) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Photo %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Photo.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type User struct {
  ID     string
  Name   string
  Status string
}

func NewUser(id, name string) (*User, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("User requires id and name")
  }
  obj := &User{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[User.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *User) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("User invalid status")
  }
  fmt.Printf("[User.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *User) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("User %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[User.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type YelpLocalSearchService struct {
  mu  sync.Mutex
  seq int
  businesss map[string]*Business
  categories map[string]*Category
  reviews map[string]*Review
  photos map[string]*Photo
  users map[string]*User
}

func NewYelpLocalSearchService() *YelpLocalSearchService {
  fmt.Println("[YelpLocalSearchService.__init__] system ready")
  return &YelpLocalSearchService{
    seq: 1,
    businesss: map[string]*Business{},
    categories: map[string]*Category{},
    reviews: map[string]*Review{},
    photos: map[string]*Photo{},
    users: map[string]*User{},
  }
}

func (s *YelpLocalSearchService) CreateBusiness(name string) (*Business, error) {
  if name == "" {
    return nil, fmt.Errorf("Business name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("BUS-%04d", s.seq)
  s.seq++
  obj, err := NewBusiness(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.businesss[id] = obj
  fmt.Printf("[YelpLocalSearchService.CreateBusiness] stored %s\\n", id)
  return obj, nil
}

func (s *YelpLocalSearchService) GetBusiness(id string) (*Business, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.businesss[id]
  if !ok {
    return nil, fmt.Errorf("unknown Business id: %s", id)
  }
  fmt.Printf("[YelpLocalSearchService.GetBusiness] found %s\\n", id)
  return obj, nil
}

func (s *YelpLocalSearchService) CreateCategory(name string) (*Category, error) {
  if name == "" {
    return nil, fmt.Errorf("Category name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("CAT-%04d", s.seq)
  s.seq++
  obj, err := NewCategory(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.categories[id] = obj
  fmt.Printf("[YelpLocalSearchService.CreateCategory] stored %s\\n", id)
  return obj, nil
}

func (s *YelpLocalSearchService) GetCategory(id string) (*Category, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.categories[id]
  if !ok {
    return nil, fmt.Errorf("unknown Category id: %s", id)
  }
  fmt.Printf("[YelpLocalSearchService.GetCategory] found %s\\n", id)
  return obj, nil
}

func (s *YelpLocalSearchService) CreateReview(name string) (*Review, error) {
  if name == "" {
    return nil, fmt.Errorf("Review name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("REV-%04d", s.seq)
  s.seq++
  obj, err := NewReview(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.reviews[id] = obj
  fmt.Printf("[YelpLocalSearchService.CreateReview] stored %s\\n", id)
  return obj, nil
}

func (s *YelpLocalSearchService) GetReview(id string) (*Review, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.reviews[id]
  if !ok {
    return nil, fmt.Errorf("unknown Review id: %s", id)
  }
  fmt.Printf("[YelpLocalSearchService.GetReview] found %s\\n", id)
  return obj, nil
}

func (s *YelpLocalSearchService) CreatePhoto(name string) (*Photo, error) {
  if name == "" {
    return nil, fmt.Errorf("Photo name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PHO-%04d", s.seq)
  s.seq++
  obj, err := NewPhoto(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.photos[id] = obj
  fmt.Printf("[YelpLocalSearchService.CreatePhoto] stored %s\\n", id)
  return obj, nil
}

func (s *YelpLocalSearchService) GetPhoto(id string) (*Photo, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.photos[id]
  if !ok {
    return nil, fmt.Errorf("unknown Photo id: %s", id)
  }
  fmt.Printf("[YelpLocalSearchService.GetPhoto] found %s\\n", id)
  return obj, nil
}

func (s *YelpLocalSearchService) CreateUser(name string) (*User, error) {
  if name == "" {
    return nil, fmt.Errorf("User name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("USE-%04d", s.seq)
  s.seq++
  obj, err := NewUser(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.users[id] = obj
  fmt.Printf("[YelpLocalSearchService.CreateUser] stored %s\\n", id)
  return obj, nil
}

func (s *YelpLocalSearchService) GetUser(id string) (*User, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.users[id]
  if !ok {
    return nil, fmt.Errorf("unknown User id: %s", id)
  }
  fmt.Printf("[YelpLocalSearchService.GetUser] found %s\\n", id)
  return obj, nil
}

func (s *YelpLocalSearchService) CloseBusiness(id string) (*Business, error) {
  obj, err := s.GetBusiness(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[YelpLocalSearchService.CloseBusiness] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct YelpLocalSearchService ==========")
  system := NewYelpLocalSearchService()
  fmt.Println("========== STEP 2: Create Business ==========")
  first, _ := system.CreateBusiness("alpha-business")
  system.CreateBusiness("beta-business")
  system.CreateCategory("sample-category")
  system.CreateReview("sample-review")
  system.CreatePhoto("sample-photo")
  system.CreateUser("sample-user")
  system.CloseBusiness(first.ID)
  if _, err := system.CloseBusiness(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetBusiness("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Business {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Business(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Business requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Business.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Business invalid status");
    }
    Console.WriteLine("[Business.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Business " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Business.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Category {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Category(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Category requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Category.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Category invalid status");
    }
    Console.WriteLine("[Category.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Category " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Category.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Review {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Review(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Review requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Review.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Review invalid status");
    }
    Console.WriteLine("[Review.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Review " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Review.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Photo {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Photo(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Photo requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Photo.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Photo invalid status");
    }
    Console.WriteLine("[Photo.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Photo " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Photo.close] id=" + Id + " -> CLOSED");
  }
}


sealed class User {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public User(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("User requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[User.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("User invalid status");
    }
    Console.WriteLine("[User.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("User " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[User.close] id=" + Id + " -> CLOSED");
  }
}

sealed class YelpLocalSearchService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Business> _businesss = new();
  private readonly Dictionary<string, Category> _categories = new();
  private readonly Dictionary<string, Review> _reviews = new();
  private readonly Dictionary<string, Photo> _photos = new();
  private readonly Dictionary<string, User> _users = new();
  public YelpLocalSearchService() {
    Console.WriteLine("[YelpLocalSearchService.__init__] system ready");
  }

  public Business CreateBusiness(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Business name required");
    }
    lock (_gate) {
      var id = string.Format("BUS-{0:D4}", _seq++);
      var obj = new Business(id, name.Trim());
      obj.Validate();
      _businesss[id] = obj;
      Console.WriteLine("[YelpLocalSearchService.CreateBusiness] stored " + id);
      return obj;
    }
  }

  public Business GetBusiness(string id) {
    lock (_gate) {
      if (!_businesss.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Business id: " + id);
      }
      Console.WriteLine("[YelpLocalSearchService.GetBusiness] found " + id);
      return obj;
    }
  }

  public Category CreateCategory(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Category name required");
    }
    lock (_gate) {
      var id = string.Format("CAT-{0:D4}", _seq++);
      var obj = new Category(id, name.Trim());
      obj.Validate();
      _categories[id] = obj;
      Console.WriteLine("[YelpLocalSearchService.CreateCategory] stored " + id);
      return obj;
    }
  }

  public Category GetCategory(string id) {
    lock (_gate) {
      if (!_categories.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Category id: " + id);
      }
      Console.WriteLine("[YelpLocalSearchService.GetCategory] found " + id);
      return obj;
    }
  }

  public Review CreateReview(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Review name required");
    }
    lock (_gate) {
      var id = string.Format("REV-{0:D4}", _seq++);
      var obj = new Review(id, name.Trim());
      obj.Validate();
      _reviews[id] = obj;
      Console.WriteLine("[YelpLocalSearchService.CreateReview] stored " + id);
      return obj;
    }
  }

  public Review GetReview(string id) {
    lock (_gate) {
      if (!_reviews.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Review id: " + id);
      }
      Console.WriteLine("[YelpLocalSearchService.GetReview] found " + id);
      return obj;
    }
  }

  public Photo CreatePhoto(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Photo name required");
    }
    lock (_gate) {
      var id = string.Format("PHO-{0:D4}", _seq++);
      var obj = new Photo(id, name.Trim());
      obj.Validate();
      _photos[id] = obj;
      Console.WriteLine("[YelpLocalSearchService.CreatePhoto] stored " + id);
      return obj;
    }
  }

  public Photo GetPhoto(string id) {
    lock (_gate) {
      if (!_photos.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Photo id: " + id);
      }
      Console.WriteLine("[YelpLocalSearchService.GetPhoto] found " + id);
      return obj;
    }
  }

  public User CreateUser(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("User name required");
    }
    lock (_gate) {
      var id = string.Format("USE-{0:D4}", _seq++);
      var obj = new User(id, name.Trim());
      obj.Validate();
      _users[id] = obj;
      Console.WriteLine("[YelpLocalSearchService.CreateUser] stored " + id);
      return obj;
    }
  }

  public User GetUser(string id) {
    lock (_gate) {
      if (!_users.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown User id: " + id);
      }
      Console.WriteLine("[YelpLocalSearchService.GetUser] found " + id);
      return obj;
    }
  }

  public Business CloseBusiness(string id) {
    var obj = GetBusiness(id);
    Console.WriteLine("[YelpLocalSearchService.CloseBusiness] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct YelpLocalSearchService ==========");
    var system = new YelpLocalSearchService();
    Console.WriteLine("========== STEP 2: Create Business ==========");
    var first = system.CreateBusiness("alpha-business");
    system.CreateBusiness("beta-business");
    system.CreateCategory("sample-category");
    system.CreateReview("sample-review");
    system.CreatePhoto("sample-photo");
    system.CreateUser("sample-user");
    system.CloseBusiness(first.Id);
    try {
      system.CloseBusiness(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetBusiness("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const yelpLocalSearchSolution: ProblemSolution = {
  slug: 'yelp-local-search',
  title: 'Yelp / Local Business Search - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a location-based business discovery platform like Yelp — search nearby businesses, read reviews, and get recommendations. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Search businesses by category, name, and location (lat/lng + radius)',
      'View business details: hours, photos, contact, menu',
      'Read and write reviews with star ratings (1-5)',
      'Overall rating computed from all reviews',
      'Photo upload for businesses and reviews',
      'Business owner portal to manage their listing',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Search businesses by category, name, and location (lat/lng + radius)?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'View business details: hours, photos, contact, menu?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Read and write reviews with star ratings (1-5)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Overall rating computed from all reviews?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Photo upload for businesses and reviews?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. YelpLocalSearchService is the facade stereotype. Business, Category, Review, Photo, User are concrete domain classes with id/name/status and validate/close.',
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
          'Construct YelpLocalSearchService.',
          'createBusiness twice and create the related UML classes.',
          'closeBusiness once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'YelpLocalSearchService', responsibility: 'UML facade - orchestrates Yelp / Local Business Search.', keyMembers: ['create*', 'get*', 'closeBusiness'] },
    { name: 'Business', responsibility: 'UML class - domain object for Yelp / Local Business Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Category', responsibility: 'UML class - domain object for Yelp / Local Business Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Review', responsibility: 'UML class - domain object for Yelp / Local Business Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Photo', responsibility: 'UML class - domain object for Yelp / Local Business Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'User', responsibility: 'UML class - domain object for Yelp / Local Business Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from YelpLocalSearchService to Business, Category, Review, Photo, User. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on YelpLocalSearchService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'YelpLocalSearchService', responsibility: 'UML facade - orchestrates Yelp / Local Business Search.', keyMembers: ['create*', 'get*', 'closeBusiness'] },
    { name: 'Business', responsibility: 'UML class - domain object for Yelp / Local Business Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Category', responsibility: 'UML class - domain object for Yelp / Local Business Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Review', responsibility: 'UML class - domain object for Yelp / Local Business Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Photo', responsibility: 'UML class - domain object for Yelp / Local Business Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'User', responsibility: 'UML class - domain object for Yelp / Local Business Search.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'YelpLocalSearchService exposes create/get/close and owns composed collections.' },
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
      'main constructs YelpLocalSearchService, creates UML domain objects, closes the primary Business, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct YelpLocalSearchService.',
      'createBusiness for alpha and beta.',
      'create remaining UML classes.',
      'closeBusiness(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createBusiness("alpha..."); closeBusiness(id)',
        output: '[Business.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeBusiness(alreadyClosed) or getBusiness("MISSING-ID")',
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
