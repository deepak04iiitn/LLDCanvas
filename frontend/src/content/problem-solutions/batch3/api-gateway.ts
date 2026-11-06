import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'ApiGatewayService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_routes', 'Map<string, Route>'),
    attr('-', '_service_registries', 'Map<string, ServiceRegistry>'),
    attr('-', '_auth_plugins', 'Map<string, AuthPlugin>'),
    attr('-', '_rate_limit_plugins', 'Map<string, RateLimitPlugin>'),
    attr('-', '_load_balancers', 'Map<string, LoadBalancer>'),
  ], [
    method('+', 'createRoute', 'name: string', 'Route'),
    method('+', 'createServiceRegistry', 'name: string', 'ServiceRegistry'),
    method('+', 'createAuthPlugin', 'name: string', 'AuthPlugin'),
    method('+', 'createRateLimitPlugin', 'name: string', 'RateLimitPlugin'),
    method('+', 'createLoadBalancer', 'name: string', 'LoadBalancer'),
    method('+', 'getRoute', 'id: string', 'Route'),
    method('+', 'getServiceRegistry', 'id: string', 'ServiceRegistry'),
    method('+', 'getAuthPlugin', 'id: string', 'AuthPlugin'),
    method('+', 'getRateLimitPlugin', 'id: string', 'RateLimitPlugin'),
    method('+', 'getLoadBalancer', 'id: string', 'LoadBalancer'),
    method('+', 'closeRoute', 'id: string', 'Route'),
  ], 'facade'),
  cls('n1', 'Route', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'ServiceRegistry', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'AuthPlugin', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'RateLimitPlugin', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'LoadBalancer', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("api-gateway")


class Route:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Route.id is required")
        if not name or not name.strip():
            raise ValueError("Route.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Route.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Route {self.id} has invalid status={self.status}")
        log.info("[Route.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Route {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Route.close] id=%s -> CLOSED", self.id)


class ServiceRegistry:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("ServiceRegistry.id is required")
        if not name or not name.strip():
            raise ValueError("ServiceRegistry.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[ServiceRegistry.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"ServiceRegistry {self.id} has invalid status={self.status}")
        log.info("[ServiceRegistry.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"ServiceRegistry {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[ServiceRegistry.close] id=%s -> CLOSED", self.id)


class AuthPlugin:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("AuthPlugin.id is required")
        if not name or not name.strip():
            raise ValueError("AuthPlugin.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[AuthPlugin.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"AuthPlugin {self.id} has invalid status={self.status}")
        log.info("[AuthPlugin.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"AuthPlugin {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[AuthPlugin.close] id=%s -> CLOSED", self.id)


class RateLimitPlugin:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("RateLimitPlugin.id is required")
        if not name or not name.strip():
            raise ValueError("RateLimitPlugin.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[RateLimitPlugin.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"RateLimitPlugin {self.id} has invalid status={self.status}")
        log.info("[RateLimitPlugin.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"RateLimitPlugin {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[RateLimitPlugin.close] id=%s -> CLOSED", self.id)


class LoadBalancer:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("LoadBalancer.id is required")
        if not name or not name.strip():
            raise ValueError("LoadBalancer.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[LoadBalancer.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"LoadBalancer {self.id} has invalid status={self.status}")
        log.info("[LoadBalancer.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"LoadBalancer {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[LoadBalancer.close] id=%s -> CLOSED", self.id)


class ApiGatewayService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._routes: Dict[str, Route] = {}
        self._service_registries: Dict[str, ServiceRegistry] = {}
        self._auth_plugins: Dict[str, AuthPlugin] = {}
        self._rate_limit_plugins: Dict[str, RateLimitPlugin] = {}
        self._load_balancers: Dict[str, LoadBalancer] = {}
        log.info("[ApiGatewayService.__init__] system ready; managing: Route, ServiceRegistry, AuthPlugin, RateLimitPlugin, LoadBalancer")

    def create_route(self, name: str) -> Route:
        """UML: ApiGatewayService.create_route(name) -> Route"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Route name is required")
        with self._lock:
            item_id = f"ROU-{self._seq:04d}"
            self._seq += 1
            obj = Route(item_id, cleaned)
            obj.validate()
            self._routes[item_id] = obj
            log.info("[ApiGatewayService.create_route] stored %s in _routes (count=%s)", item_id, len(self._routes))
            return obj

    def get_route(self, item_id: str) -> Route:
        with self._lock:
            obj = self._routes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Route id: {item_id}")
            log.info("[ApiGatewayService.get_route] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_service_registry(self, name: str) -> ServiceRegistry:
        """UML: ApiGatewayService.create_service_registry(name) -> ServiceRegistry"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("ServiceRegistry name is required")
        with self._lock:
            item_id = f"SER-{self._seq:04d}"
            self._seq += 1
            obj = ServiceRegistry(item_id, cleaned)
            obj.validate()
            self._service_registries[item_id] = obj
            log.info("[ApiGatewayService.create_service_registry] stored %s in _service_registries (count=%s)", item_id, len(self._service_registries))
            return obj

    def get_service_registry(self, item_id: str) -> ServiceRegistry:
        with self._lock:
            obj = self._service_registries.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ServiceRegistry id: {item_id}")
            log.info("[ApiGatewayService.get_service_registry] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_auth_plugin(self, name: str) -> AuthPlugin:
        """UML: ApiGatewayService.create_auth_plugin(name) -> AuthPlugin"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("AuthPlugin name is required")
        with self._lock:
            item_id = f"AUT-{self._seq:04d}"
            self._seq += 1
            obj = AuthPlugin(item_id, cleaned)
            obj.validate()
            self._auth_plugins[item_id] = obj
            log.info("[ApiGatewayService.create_auth_plugin] stored %s in _auth_plugins (count=%s)", item_id, len(self._auth_plugins))
            return obj

    def get_auth_plugin(self, item_id: str) -> AuthPlugin:
        with self._lock:
            obj = self._auth_plugins.get(item_id)
            if obj is None:
                raise KeyError(f"unknown AuthPlugin id: {item_id}")
            log.info("[ApiGatewayService.get_auth_plugin] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_rate_limit_plugin(self, name: str) -> RateLimitPlugin:
        """UML: ApiGatewayService.create_rate_limit_plugin(name) -> RateLimitPlugin"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("RateLimitPlugin name is required")
        with self._lock:
            item_id = f"RAT-{self._seq:04d}"
            self._seq += 1
            obj = RateLimitPlugin(item_id, cleaned)
            obj.validate()
            self._rate_limit_plugins[item_id] = obj
            log.info("[ApiGatewayService.create_rate_limit_plugin] stored %s in _rate_limit_plugins (count=%s)", item_id, len(self._rate_limit_plugins))
            return obj

    def get_rate_limit_plugin(self, item_id: str) -> RateLimitPlugin:
        with self._lock:
            obj = self._rate_limit_plugins.get(item_id)
            if obj is None:
                raise KeyError(f"unknown RateLimitPlugin id: {item_id}")
            log.info("[ApiGatewayService.get_rate_limit_plugin] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_load_balancer(self, name: str) -> LoadBalancer:
        """UML: ApiGatewayService.create_load_balancer(name) -> LoadBalancer"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("LoadBalancer name is required")
        with self._lock:
            item_id = f"LOA-{self._seq:04d}"
            self._seq += 1
            obj = LoadBalancer(item_id, cleaned)
            obj.validate()
            self._load_balancers[item_id] = obj
            log.info("[ApiGatewayService.create_load_balancer] stored %s in _load_balancers (count=%s)", item_id, len(self._load_balancers))
            return obj

    def get_load_balancer(self, item_id: str) -> LoadBalancer:
        with self._lock:
            obj = self._load_balancers.get(item_id)
            if obj is None:
                raise KeyError(f"unknown LoadBalancer id: {item_id}")
            log.info("[ApiGatewayService.get_load_balancer] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_route(self, item_id: str) -> Route:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._routes.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Route id: {item_id}")
            log.info("[ApiGatewayService.close_route] closing %s via Route.close()", item_id)
            obj.close()
            return obj

    def list_active_routes(self) -> List[Route]:
        with self._lock:
            active = [o for o in self._routes.values() if o.status == "ACTIVE"]
            log.info("[ApiGatewayService.list_active_routes] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct ApiGatewayService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = ApiGatewayService()

    log.info("========== STEP 2: Create primary Route objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_route("alpha-route")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_route("beta-route")

    log.info("========== STEP 3: Create ServiceRegistry (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_service_registry("sample-service_registry")

    log.info("========== STEP 4: Create AuthPlugin (UML class) ==========")
    system.create_auth_plugin("sample-auth_plugin")

    log.info("========== STEP 5: Create RateLimitPlugin (UML class) ==========")
    system.create_rate_limit_plugin("sample-rate_limit_plugin")

    log.info("========== STEP 6: Create LoadBalancer (UML class) ==========")
    system.create_load_balancer("sample-load_balancer")

    log.info("========== STEP 7: Inspect active Route list ==========")
    system.list_active_routes()

    log.info("========== STEP 8: Close first Route ==========")
    system.close_route(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_route(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Route.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_route("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_route: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_routes()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Route {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Route(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Route.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Route.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Route.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Route " + id + " invalid status");
    }
    System.out.println("[Route.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Route " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Route.close] id=" + id + " -> CLOSED");
  }
}


class ServiceRegistry {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  ServiceRegistry(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("ServiceRegistry.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ServiceRegistry.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[ServiceRegistry.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("ServiceRegistry " + id + " invalid status");
    }
    System.out.println("[ServiceRegistry.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("ServiceRegistry " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[ServiceRegistry.close] id=" + id + " -> CLOSED");
  }
}


class AuthPlugin {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  AuthPlugin(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("AuthPlugin.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("AuthPlugin.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[AuthPlugin.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("AuthPlugin " + id + " invalid status");
    }
    System.out.println("[AuthPlugin.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("AuthPlugin " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[AuthPlugin.close] id=" + id + " -> CLOSED");
  }
}


class RateLimitPlugin {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  RateLimitPlugin(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("RateLimitPlugin.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("RateLimitPlugin.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[RateLimitPlugin.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("RateLimitPlugin " + id + " invalid status");
    }
    System.out.println("[RateLimitPlugin.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("RateLimitPlugin " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[RateLimitPlugin.close] id=" + id + " -> CLOSED");
  }
}


class LoadBalancer {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  LoadBalancer(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("LoadBalancer.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("LoadBalancer.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[LoadBalancer.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("LoadBalancer " + id + " invalid status");
    }
    System.out.println("[LoadBalancer.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("LoadBalancer " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[LoadBalancer.close] id=" + id + " -> CLOSED");
  }
}

public class ApiGatewayService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Route> routes = new LinkedHashMap<>();
  private final Map<String, ServiceRegistry> service_registries = new LinkedHashMap<>();
  private final Map<String, AuthPlugin> auth_plugins = new LinkedHashMap<>();
  private final Map<String, RateLimitPlugin> rate_limit_plugins = new LinkedHashMap<>();
  private final Map<String, LoadBalancer> load_balancers = new LinkedHashMap<>();

  public ApiGatewayService() {
    System.out.println("[ApiGatewayService.__init__] system ready");
  }

  public Route createRoute(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Route name required");
    }
    lock.lock();
    try {
      String id = String.format("ROU-%04d", seq++);
      Route obj = new Route(id, name.trim());
      obj.validate();
      routes.put(id, obj);
      System.out.println("[ApiGatewayService.createRoute] stored " + id + " count=" + routes.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Route getRoute(String id) {
    lock.lock();
    try {
      Route obj = routes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Route id: " + id);
      }
      System.out.println("[ApiGatewayService.getRoute] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public ServiceRegistry createServiceRegistry(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ServiceRegistry name required");
    }
    lock.lock();
    try {
      String id = String.format("SER-%04d", seq++);
      ServiceRegistry obj = new ServiceRegistry(id, name.trim());
      obj.validate();
      service_registries.put(id, obj);
      System.out.println("[ApiGatewayService.createServiceRegistry] stored " + id + " count=" + service_registries.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public ServiceRegistry getServiceRegistry(String id) {
    lock.lock();
    try {
      ServiceRegistry obj = service_registries.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ServiceRegistry id: " + id);
      }
      System.out.println("[ApiGatewayService.getServiceRegistry] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public AuthPlugin createAuthPlugin(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("AuthPlugin name required");
    }
    lock.lock();
    try {
      String id = String.format("AUT-%04d", seq++);
      AuthPlugin obj = new AuthPlugin(id, name.trim());
      obj.validate();
      auth_plugins.put(id, obj);
      System.out.println("[ApiGatewayService.createAuthPlugin] stored " + id + " count=" + auth_plugins.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public AuthPlugin getAuthPlugin(String id) {
    lock.lock();
    try {
      AuthPlugin obj = auth_plugins.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown AuthPlugin id: " + id);
      }
      System.out.println("[ApiGatewayService.getAuthPlugin] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public RateLimitPlugin createRateLimitPlugin(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("RateLimitPlugin name required");
    }
    lock.lock();
    try {
      String id = String.format("RAT-%04d", seq++);
      RateLimitPlugin obj = new RateLimitPlugin(id, name.trim());
      obj.validate();
      rate_limit_plugins.put(id, obj);
      System.out.println("[ApiGatewayService.createRateLimitPlugin] stored " + id + " count=" + rate_limit_plugins.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public RateLimitPlugin getRateLimitPlugin(String id) {
    lock.lock();
    try {
      RateLimitPlugin obj = rate_limit_plugins.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown RateLimitPlugin id: " + id);
      }
      System.out.println("[ApiGatewayService.getRateLimitPlugin] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public LoadBalancer createLoadBalancer(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("LoadBalancer name required");
    }
    lock.lock();
    try {
      String id = String.format("LOA-%04d", seq++);
      LoadBalancer obj = new LoadBalancer(id, name.trim());
      obj.validate();
      load_balancers.put(id, obj);
      System.out.println("[ApiGatewayService.createLoadBalancer] stored " + id + " count=" + load_balancers.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public LoadBalancer getLoadBalancer(String id) {
    lock.lock();
    try {
      LoadBalancer obj = load_balancers.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown LoadBalancer id: " + id);
      }
      System.out.println("[ApiGatewayService.getLoadBalancer] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Route closeRoute(String id) {
    lock.lock();
    try {
      Route obj = routes.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Route id: " + id);
      }
      System.out.println("[ApiGatewayService.closeRoute] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Route> listActiveRoutes() {
    lock.lock();
    try {
      List<Route> out = new ArrayList<>();
      for (Route o : routes.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[ApiGatewayService.listActiveRoutes] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct ApiGatewayService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    ApiGatewayService system = new ApiGatewayService();
    System.out.println("========== STEP 2: Create Route objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Route first = system.createRoute("alpha-route");
    system.createRoute("beta-route");
    System.out.println("========== STEP 3: Create ServiceRegistry ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createServiceRegistry("sample-service_registry");
    System.out.println("========== STEP 4: Create AuthPlugin ==========");
    system.createAuthPlugin("sample-auth_plugin");
    System.out.println("========== STEP 5: Create RateLimitPlugin ==========");
    system.createRateLimitPlugin("sample-rate_limit_plugin");
    System.out.println("========== STEP 6: Create LoadBalancer ==========");
    system.createLoadBalancer("sample-load_balancer");
    System.out.println("========== Inspect active list ==========");
    system.listActiveRoutes();
    System.out.println("========== Close first Route ==========");
    system.closeRoute(first.getId());
    try {
      system.closeRoute(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getRoute("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Route {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Route.id required')
    }

    if (!name?.trim()) {
      throw new Error('Route.name required')
    }
    console.log(\`[Route.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Route \${this.id} invalid status\`)
    }
    console.log(\`[Route.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Route \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Route.close] id=\${this.id} -> CLOSED\`)
  }
}


class ServiceRegistry {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('ServiceRegistry.id required')
    }

    if (!name?.trim()) {
      throw new Error('ServiceRegistry.name required')
    }
    console.log(\`[ServiceRegistry.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`ServiceRegistry \${this.id} invalid status\`)
    }
    console.log(\`[ServiceRegistry.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`ServiceRegistry \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[ServiceRegistry.close] id=\${this.id} -> CLOSED\`)
  }
}


class AuthPlugin {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('AuthPlugin.id required')
    }

    if (!name?.trim()) {
      throw new Error('AuthPlugin.name required')
    }
    console.log(\`[AuthPlugin.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`AuthPlugin \${this.id} invalid status\`)
    }
    console.log(\`[AuthPlugin.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`AuthPlugin \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[AuthPlugin.close] id=\${this.id} -> CLOSED\`)
  }
}


class RateLimitPlugin {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('RateLimitPlugin.id required')
    }

    if (!name?.trim()) {
      throw new Error('RateLimitPlugin.name required')
    }
    console.log(\`[RateLimitPlugin.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`RateLimitPlugin \${this.id} invalid status\`)
    }
    console.log(\`[RateLimitPlugin.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`RateLimitPlugin \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[RateLimitPlugin.close] id=\${this.id} -> CLOSED\`)
  }
}


class LoadBalancer {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('LoadBalancer.id required')
    }

    if (!name?.trim()) {
      throw new Error('LoadBalancer.name required')
    }
    console.log(\`[LoadBalancer.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`LoadBalancer \${this.id} invalid status\`)
    }
    console.log(\`[LoadBalancer.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`LoadBalancer \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[LoadBalancer.close] id=\${this.id} -> CLOSED\`)
  }
}

class ApiGatewayService {
  private seq = 1
  private routes = new Map<string, Route>()
  private service_registries = new Map<string, ServiceRegistry>()
  private auth_plugins = new Map<string, AuthPlugin>()
  private rate_limit_plugins = new Map<string, RateLimitPlugin>()
  private load_balancers = new Map<string, LoadBalancer>()
  constructor() {
    console.log('[ApiGatewayService.__init__] system ready')
  }

  createRoute(name: string): Route {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Route name required')
    }
    const id = \`ROU-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Route(id, cleaned)
    obj.validate()
    this.routes.set(id, obj)
    console.log(\`[ApiGatewayService.createRoute] stored \${id} count=\${this.routes.size}\`)
    return obj
  }

  getRoute(id: string): Route {
    const obj = this.routes.get(id)
    if (!obj) {
      throw new Error(\`unknown Route id: \${id}\`)
    }
    console.log(\`[ApiGatewayService.getRoute] found id=\${obj.id}\`)
    return obj
  }

  createServiceRegistry(name: string): ServiceRegistry {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('ServiceRegistry name required')
    }
    const id = \`SER-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new ServiceRegistry(id, cleaned)
    obj.validate()
    this.service_registries.set(id, obj)
    console.log(\`[ApiGatewayService.createServiceRegistry] stored \${id} count=\${this.service_registries.size}\`)
    return obj
  }

  getServiceRegistry(id: string): ServiceRegistry {
    const obj = this.service_registries.get(id)
    if (!obj) {
      throw new Error(\`unknown ServiceRegistry id: \${id}\`)
    }
    console.log(\`[ApiGatewayService.getServiceRegistry] found id=\${obj.id}\`)
    return obj
  }

  createAuthPlugin(name: string): AuthPlugin {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('AuthPlugin name required')
    }
    const id = \`AUT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new AuthPlugin(id, cleaned)
    obj.validate()
    this.auth_plugins.set(id, obj)
    console.log(\`[ApiGatewayService.createAuthPlugin] stored \${id} count=\${this.auth_plugins.size}\`)
    return obj
  }

  getAuthPlugin(id: string): AuthPlugin {
    const obj = this.auth_plugins.get(id)
    if (!obj) {
      throw new Error(\`unknown AuthPlugin id: \${id}\`)
    }
    console.log(\`[ApiGatewayService.getAuthPlugin] found id=\${obj.id}\`)
    return obj
  }

  createRateLimitPlugin(name: string): RateLimitPlugin {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('RateLimitPlugin name required')
    }
    const id = \`RAT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new RateLimitPlugin(id, cleaned)
    obj.validate()
    this.rate_limit_plugins.set(id, obj)
    console.log(\`[ApiGatewayService.createRateLimitPlugin] stored \${id} count=\${this.rate_limit_plugins.size}\`)
    return obj
  }

  getRateLimitPlugin(id: string): RateLimitPlugin {
    const obj = this.rate_limit_plugins.get(id)
    if (!obj) {
      throw new Error(\`unknown RateLimitPlugin id: \${id}\`)
    }
    console.log(\`[ApiGatewayService.getRateLimitPlugin] found id=\${obj.id}\`)
    return obj
  }

  createLoadBalancer(name: string): LoadBalancer {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('LoadBalancer name required')
    }
    const id = \`LOA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new LoadBalancer(id, cleaned)
    obj.validate()
    this.load_balancers.set(id, obj)
    console.log(\`[ApiGatewayService.createLoadBalancer] stored \${id} count=\${this.load_balancers.size}\`)
    return obj
  }

  getLoadBalancer(id: string): LoadBalancer {
    const obj = this.load_balancers.get(id)
    if (!obj) {
      throw new Error(\`unknown LoadBalancer id: \${id}\`)
    }
    console.log(\`[ApiGatewayService.getLoadBalancer] found id=\${obj.id}\`)
    return obj
  }

  closeRoute(id: string): Route {
    const obj = this.getRoute(id)
    console.log(\`[ApiGatewayService.closeRoute] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveRoutes(): Route[] {
    const active = [...this.routes.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[ApiGatewayService.listActiveRoutes] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct ApiGatewayService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new ApiGatewayService()
  console.log('========== STEP 2: Create Route objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createRoute('alpha-route')
  system.createRoute('beta-route')
  console.log('========== STEP 3: Create ServiceRegistry ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createServiceRegistry('sample-service_registry')
  console.log('========== STEP 4: Create AuthPlugin ==========')
  system.createAuthPlugin('sample-auth_plugin')
  console.log('========== STEP 5: Create RateLimitPlugin ==========')
  system.createRateLimitPlugin('sample-rate_limit_plugin')
  console.log('========== STEP 6: Create LoadBalancer ==========')
  system.createLoadBalancer('sample-load_balancer')
  system.listActiveRoutes()
  console.log('========== Close first Route ==========')
  system.closeRoute(first.id)
  try {
    system.closeRoute(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getRoute('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Route {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Route(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Route requires id and name");
    }
    cout << "[Route.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Route invalid status");
    }
    cout << "[Route.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Route cannot close");
    }
    status_ = "CLOSED";
    cout << "[Route.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class ServiceRegistry {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  ServiceRegistry(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("ServiceRegistry requires id and name");
    }
    cout << "[ServiceRegistry.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("ServiceRegistry invalid status");
    }
    cout << "[ServiceRegistry.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("ServiceRegistry cannot close");
    }
    status_ = "CLOSED";
    cout << "[ServiceRegistry.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class AuthPlugin {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  AuthPlugin(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("AuthPlugin requires id and name");
    }
    cout << "[AuthPlugin.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("AuthPlugin invalid status");
    }
    cout << "[AuthPlugin.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("AuthPlugin cannot close");
    }
    status_ = "CLOSED";
    cout << "[AuthPlugin.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class RateLimitPlugin {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  RateLimitPlugin(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("RateLimitPlugin requires id and name");
    }
    cout << "[RateLimitPlugin.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("RateLimitPlugin invalid status");
    }
    cout << "[RateLimitPlugin.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("RateLimitPlugin cannot close");
    }
    status_ = "CLOSED";
    cout << "[RateLimitPlugin.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class LoadBalancer {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  LoadBalancer(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("LoadBalancer requires id and name");
    }
    cout << "[LoadBalancer.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("LoadBalancer invalid status");
    }
    cout << "[LoadBalancer.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("LoadBalancer cannot close");
    }
    status_ = "CLOSED";
    cout << "[LoadBalancer.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class ApiGatewayService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Route> routes_;
  unordered_map<string, ServiceRegistry> service_registries_;
  unordered_map<string, AuthPlugin> auth_plugins_;
  unordered_map<string, RateLimitPlugin> rate_limit_plugins_;
  unordered_map<string, LoadBalancer> load_balancers_;
public:
  ApiGatewayService() {
    cout << "[ApiGatewayService.__init__] system ready" << endl;
  }

  Route createRoute(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Route name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ROU-%04d", seq_++);
    Route obj{buf, name};
    obj.validate();
    routes_.emplace(obj.id(), obj);
    cout << "[ApiGatewayService.createRoute] stored " << obj.id() << endl;
    return obj;
  }

  Route getRoute(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = routes_.find(id);
    if (it == routes_.end()) {
      throw out_of_range("unknown Route id");
    }
    cout << "[ApiGatewayService.getRoute] found " << id << endl;
    return it->second;
  }

  ServiceRegistry createServiceRegistry(const string& name) {
    if (name.empty()) {
      throw invalid_argument("ServiceRegistry name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SER-%04d", seq_++);
    ServiceRegistry obj{buf, name};
    obj.validate();
    service_registries_.emplace(obj.id(), obj);
    cout << "[ApiGatewayService.createServiceRegistry] stored " << obj.id() << endl;
    return obj;
  }

  ServiceRegistry getServiceRegistry(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = service_registries_.find(id);
    if (it == service_registries_.end()) {
      throw out_of_range("unknown ServiceRegistry id");
    }
    cout << "[ApiGatewayService.getServiceRegistry] found " << id << endl;
    return it->second;
  }

  AuthPlugin createAuthPlugin(const string& name) {
    if (name.empty()) {
      throw invalid_argument("AuthPlugin name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "AUT-%04d", seq_++);
    AuthPlugin obj{buf, name};
    obj.validate();
    auth_plugins_.emplace(obj.id(), obj);
    cout << "[ApiGatewayService.createAuthPlugin] stored " << obj.id() << endl;
    return obj;
  }

  AuthPlugin getAuthPlugin(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = auth_plugins_.find(id);
    if (it == auth_plugins_.end()) {
      throw out_of_range("unknown AuthPlugin id");
    }
    cout << "[ApiGatewayService.getAuthPlugin] found " << id << endl;
    return it->second;
  }

  RateLimitPlugin createRateLimitPlugin(const string& name) {
    if (name.empty()) {
      throw invalid_argument("RateLimitPlugin name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "RAT-%04d", seq_++);
    RateLimitPlugin obj{buf, name};
    obj.validate();
    rate_limit_plugins_.emplace(obj.id(), obj);
    cout << "[ApiGatewayService.createRateLimitPlugin] stored " << obj.id() << endl;
    return obj;
  }

  RateLimitPlugin getRateLimitPlugin(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = rate_limit_plugins_.find(id);
    if (it == rate_limit_plugins_.end()) {
      throw out_of_range("unknown RateLimitPlugin id");
    }
    cout << "[ApiGatewayService.getRateLimitPlugin] found " << id << endl;
    return it->second;
  }

  LoadBalancer createLoadBalancer(const string& name) {
    if (name.empty()) {
      throw invalid_argument("LoadBalancer name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "LOA-%04d", seq_++);
    LoadBalancer obj{buf, name};
    obj.validate();
    load_balancers_.emplace(obj.id(), obj);
    cout << "[ApiGatewayService.createLoadBalancer] stored " << obj.id() << endl;
    return obj;
  }

  LoadBalancer getLoadBalancer(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = load_balancers_.find(id);
    if (it == load_balancers_.end()) {
      throw out_of_range("unknown LoadBalancer id");
    }
    cout << "[ApiGatewayService.getLoadBalancer] found " << id << endl;
    return it->second;
  }

  Route closeRoute(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = routes_.find(id);
    if (it == routes_.end()) {
      throw out_of_range("unknown Route");
    }
    cout << "[ApiGatewayService.closeRoute] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct ApiGatewayService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  ApiGatewayService system;
  cout << "========== STEP 2: Create Route ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createRoute("alpha-route");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createRoute("beta-route");
  system.createServiceRegistry("sample-service_registry");
  system.createAuthPlugin("sample-auth_plugin");
  system.createRateLimitPlugin("sample-rate_limit_plugin");
  system.createLoadBalancer("sample-load_balancer");
  system.closeRoute(first.id());
  try {
    system.closeRoute(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getRoute("MISSING-ID");
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

type Route struct {
  ID     string
  Name   string
  Status string
}

func NewRoute(id, name string) (*Route, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Route requires id and name")
  }
  obj := &Route{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Route.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Route) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Route invalid status")
  }
  fmt.Printf("[Route.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Route) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Route %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Route.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type ServiceRegistry struct {
  ID     string
  Name   string
  Status string
}

func NewServiceRegistry(id, name string) (*ServiceRegistry, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("ServiceRegistry requires id and name")
  }
  obj := &ServiceRegistry{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[ServiceRegistry.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *ServiceRegistry) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("ServiceRegistry invalid status")
  }
  fmt.Printf("[ServiceRegistry.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *ServiceRegistry) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("ServiceRegistry %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[ServiceRegistry.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type AuthPlugin struct {
  ID     string
  Name   string
  Status string
}

func NewAuthPlugin(id, name string) (*AuthPlugin, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("AuthPlugin requires id and name")
  }
  obj := &AuthPlugin{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[AuthPlugin.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *AuthPlugin) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("AuthPlugin invalid status")
  }
  fmt.Printf("[AuthPlugin.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *AuthPlugin) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("AuthPlugin %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[AuthPlugin.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type RateLimitPlugin struct {
  ID     string
  Name   string
  Status string
}

func NewRateLimitPlugin(id, name string) (*RateLimitPlugin, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("RateLimitPlugin requires id and name")
  }
  obj := &RateLimitPlugin{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[RateLimitPlugin.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *RateLimitPlugin) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("RateLimitPlugin invalid status")
  }
  fmt.Printf("[RateLimitPlugin.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *RateLimitPlugin) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("RateLimitPlugin %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[RateLimitPlugin.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type LoadBalancer struct {
  ID     string
  Name   string
  Status string
}

func NewLoadBalancer(id, name string) (*LoadBalancer, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("LoadBalancer requires id and name")
  }
  obj := &LoadBalancer{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[LoadBalancer.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *LoadBalancer) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("LoadBalancer invalid status")
  }
  fmt.Printf("[LoadBalancer.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *LoadBalancer) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("LoadBalancer %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[LoadBalancer.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type ApiGatewayService struct {
  mu  sync.Mutex
  seq int
  routes map[string]*Route
  service_registries map[string]*ServiceRegistry
  auth_plugins map[string]*AuthPlugin
  rate_limit_plugins map[string]*RateLimitPlugin
  load_balancers map[string]*LoadBalancer
}

func NewApiGatewayService() *ApiGatewayService {
  fmt.Println("[ApiGatewayService.__init__] system ready")
  return &ApiGatewayService{
    seq: 1,
    routes: map[string]*Route{},
    service_registries: map[string]*ServiceRegistry{},
    auth_plugins: map[string]*AuthPlugin{},
    rate_limit_plugins: map[string]*RateLimitPlugin{},
    load_balancers: map[string]*LoadBalancer{},
  }
}

func (s *ApiGatewayService) CreateRoute(name string) (*Route, error) {
  if name == "" {
    return nil, fmt.Errorf("Route name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ROU-%04d", s.seq)
  s.seq++
  obj, err := NewRoute(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.routes[id] = obj
  fmt.Printf("[ApiGatewayService.CreateRoute] stored %s\\n", id)
  return obj, nil
}

func (s *ApiGatewayService) GetRoute(id string) (*Route, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.routes[id]
  if !ok {
    return nil, fmt.Errorf("unknown Route id: %s", id)
  }
  fmt.Printf("[ApiGatewayService.GetRoute] found %s\\n", id)
  return obj, nil
}

func (s *ApiGatewayService) CreateServiceRegistry(name string) (*ServiceRegistry, error) {
  if name == "" {
    return nil, fmt.Errorf("ServiceRegistry name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SER-%04d", s.seq)
  s.seq++
  obj, err := NewServiceRegistry(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.service_registries[id] = obj
  fmt.Printf("[ApiGatewayService.CreateServiceRegistry] stored %s\\n", id)
  return obj, nil
}

func (s *ApiGatewayService) GetServiceRegistry(id string) (*ServiceRegistry, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.service_registries[id]
  if !ok {
    return nil, fmt.Errorf("unknown ServiceRegistry id: %s", id)
  }
  fmt.Printf("[ApiGatewayService.GetServiceRegistry] found %s\\n", id)
  return obj, nil
}

func (s *ApiGatewayService) CreateAuthPlugin(name string) (*AuthPlugin, error) {
  if name == "" {
    return nil, fmt.Errorf("AuthPlugin name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("AUT-%04d", s.seq)
  s.seq++
  obj, err := NewAuthPlugin(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.auth_plugins[id] = obj
  fmt.Printf("[ApiGatewayService.CreateAuthPlugin] stored %s\\n", id)
  return obj, nil
}

func (s *ApiGatewayService) GetAuthPlugin(id string) (*AuthPlugin, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.auth_plugins[id]
  if !ok {
    return nil, fmt.Errorf("unknown AuthPlugin id: %s", id)
  }
  fmt.Printf("[ApiGatewayService.GetAuthPlugin] found %s\\n", id)
  return obj, nil
}

func (s *ApiGatewayService) CreateRateLimitPlugin(name string) (*RateLimitPlugin, error) {
  if name == "" {
    return nil, fmt.Errorf("RateLimitPlugin name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("RAT-%04d", s.seq)
  s.seq++
  obj, err := NewRateLimitPlugin(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.rate_limit_plugins[id] = obj
  fmt.Printf("[ApiGatewayService.CreateRateLimitPlugin] stored %s\\n", id)
  return obj, nil
}

func (s *ApiGatewayService) GetRateLimitPlugin(id string) (*RateLimitPlugin, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.rate_limit_plugins[id]
  if !ok {
    return nil, fmt.Errorf("unknown RateLimitPlugin id: %s", id)
  }
  fmt.Printf("[ApiGatewayService.GetRateLimitPlugin] found %s\\n", id)
  return obj, nil
}

func (s *ApiGatewayService) CreateLoadBalancer(name string) (*LoadBalancer, error) {
  if name == "" {
    return nil, fmt.Errorf("LoadBalancer name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("LOA-%04d", s.seq)
  s.seq++
  obj, err := NewLoadBalancer(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.load_balancers[id] = obj
  fmt.Printf("[ApiGatewayService.CreateLoadBalancer] stored %s\\n", id)
  return obj, nil
}

func (s *ApiGatewayService) GetLoadBalancer(id string) (*LoadBalancer, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.load_balancers[id]
  if !ok {
    return nil, fmt.Errorf("unknown LoadBalancer id: %s", id)
  }
  fmt.Printf("[ApiGatewayService.GetLoadBalancer] found %s\\n", id)
  return obj, nil
}

func (s *ApiGatewayService) CloseRoute(id string) (*Route, error) {
  obj, err := s.GetRoute(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[ApiGatewayService.CloseRoute] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct ApiGatewayService ==========")
  system := NewApiGatewayService()
  fmt.Println("========== STEP 2: Create Route ==========")
  first, _ := system.CreateRoute("alpha-route")
  system.CreateRoute("beta-route")
  system.CreateServiceRegistry("sample-service_registry")
  system.CreateAuthPlugin("sample-auth_plugin")
  system.CreateRateLimitPlugin("sample-rate_limit_plugin")
  system.CreateLoadBalancer("sample-load_balancer")
  system.CloseRoute(first.ID)
  if _, err := system.CloseRoute(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetRoute("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Route {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Route(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Route requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Route.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Route invalid status");
    }
    Console.WriteLine("[Route.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Route " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Route.close] id=" + Id + " -> CLOSED");
  }
}


sealed class ServiceRegistry {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public ServiceRegistry(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ServiceRegistry requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[ServiceRegistry.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("ServiceRegistry invalid status");
    }
    Console.WriteLine("[ServiceRegistry.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("ServiceRegistry " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[ServiceRegistry.close] id=" + Id + " -> CLOSED");
  }
}


sealed class AuthPlugin {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public AuthPlugin(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("AuthPlugin requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[AuthPlugin.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("AuthPlugin invalid status");
    }
    Console.WriteLine("[AuthPlugin.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("AuthPlugin " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[AuthPlugin.close] id=" + Id + " -> CLOSED");
  }
}


sealed class RateLimitPlugin {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public RateLimitPlugin(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("RateLimitPlugin requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[RateLimitPlugin.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("RateLimitPlugin invalid status");
    }
    Console.WriteLine("[RateLimitPlugin.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("RateLimitPlugin " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[RateLimitPlugin.close] id=" + Id + " -> CLOSED");
  }
}


sealed class LoadBalancer {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public LoadBalancer(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("LoadBalancer requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[LoadBalancer.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("LoadBalancer invalid status");
    }
    Console.WriteLine("[LoadBalancer.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("LoadBalancer " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[LoadBalancer.close] id=" + Id + " -> CLOSED");
  }
}

sealed class ApiGatewayService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Route> _routes = new();
  private readonly Dictionary<string, ServiceRegistry> _service_registries = new();
  private readonly Dictionary<string, AuthPlugin> _auth_plugins = new();
  private readonly Dictionary<string, RateLimitPlugin> _rate_limit_plugins = new();
  private readonly Dictionary<string, LoadBalancer> _load_balancers = new();
  public ApiGatewayService() {
    Console.WriteLine("[ApiGatewayService.__init__] system ready");
  }

  public Route CreateRoute(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Route name required");
    }
    lock (_gate) {
      var id = string.Format("ROU-{0:D4}", _seq++);
      var obj = new Route(id, name.Trim());
      obj.Validate();
      _routes[id] = obj;
      Console.WriteLine("[ApiGatewayService.CreateRoute] stored " + id);
      return obj;
    }
  }

  public Route GetRoute(string id) {
    lock (_gate) {
      if (!_routes.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Route id: " + id);
      }
      Console.WriteLine("[ApiGatewayService.GetRoute] found " + id);
      return obj;
    }
  }

  public ServiceRegistry CreateServiceRegistry(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ServiceRegistry name required");
    }
    lock (_gate) {
      var id = string.Format("SER-{0:D4}", _seq++);
      var obj = new ServiceRegistry(id, name.Trim());
      obj.Validate();
      _service_registries[id] = obj;
      Console.WriteLine("[ApiGatewayService.CreateServiceRegistry] stored " + id);
      return obj;
    }
  }

  public ServiceRegistry GetServiceRegistry(string id) {
    lock (_gate) {
      if (!_service_registries.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown ServiceRegistry id: " + id);
      }
      Console.WriteLine("[ApiGatewayService.GetServiceRegistry] found " + id);
      return obj;
    }
  }

  public AuthPlugin CreateAuthPlugin(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("AuthPlugin name required");
    }
    lock (_gate) {
      var id = string.Format("AUT-{0:D4}", _seq++);
      var obj = new AuthPlugin(id, name.Trim());
      obj.Validate();
      _auth_plugins[id] = obj;
      Console.WriteLine("[ApiGatewayService.CreateAuthPlugin] stored " + id);
      return obj;
    }
  }

  public AuthPlugin GetAuthPlugin(string id) {
    lock (_gate) {
      if (!_auth_plugins.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown AuthPlugin id: " + id);
      }
      Console.WriteLine("[ApiGatewayService.GetAuthPlugin] found " + id);
      return obj;
    }
  }

  public RateLimitPlugin CreateRateLimitPlugin(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("RateLimitPlugin name required");
    }
    lock (_gate) {
      var id = string.Format("RAT-{0:D4}", _seq++);
      var obj = new RateLimitPlugin(id, name.Trim());
      obj.Validate();
      _rate_limit_plugins[id] = obj;
      Console.WriteLine("[ApiGatewayService.CreateRateLimitPlugin] stored " + id);
      return obj;
    }
  }

  public RateLimitPlugin GetRateLimitPlugin(string id) {
    lock (_gate) {
      if (!_rate_limit_plugins.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown RateLimitPlugin id: " + id);
      }
      Console.WriteLine("[ApiGatewayService.GetRateLimitPlugin] found " + id);
      return obj;
    }
  }

  public LoadBalancer CreateLoadBalancer(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("LoadBalancer name required");
    }
    lock (_gate) {
      var id = string.Format("LOA-{0:D4}", _seq++);
      var obj = new LoadBalancer(id, name.Trim());
      obj.Validate();
      _load_balancers[id] = obj;
      Console.WriteLine("[ApiGatewayService.CreateLoadBalancer] stored " + id);
      return obj;
    }
  }

  public LoadBalancer GetLoadBalancer(string id) {
    lock (_gate) {
      if (!_load_balancers.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown LoadBalancer id: " + id);
      }
      Console.WriteLine("[ApiGatewayService.GetLoadBalancer] found " + id);
      return obj;
    }
  }

  public Route CloseRoute(string id) {
    var obj = GetRoute(id);
    Console.WriteLine("[ApiGatewayService.CloseRoute] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct ApiGatewayService ==========");
    var system = new ApiGatewayService();
    Console.WriteLine("========== STEP 2: Create Route ==========");
    var first = system.CreateRoute("alpha-route");
    system.CreateRoute("beta-route");
    system.CreateServiceRegistry("sample-service_registry");
    system.CreateAuthPlugin("sample-auth_plugin");
    system.CreateRateLimitPlugin("sample-rate_limit_plugin");
    system.CreateLoadBalancer("sample-load_balancer");
    system.CloseRoute(first.Id);
    try {
      system.CloseRoute(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetRoute("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const apiGatewaySolution: ProblemSolution = {
  slug: 'api-gateway',
  title: 'API Gateway - Complete LLD Guide',
  overview: {
    introduction: [
      'Design an API Gateway that handles routing, authentication, rate limiting, load balancing, and observability for microservices. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Route incoming requests to the correct microservice based on path/method',
      'Authenticate requests via API keys, JWT, or OAuth 2.0',
      'Rate limiting per client and per endpoint',
      'Load balance across multiple instances of each service',
      'Request/response transformation (header injection, body rewrite)',
      'Circuit breaker to stop routing to unhealthy services',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Route incoming requests to the correct microservice based on path/method?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Authenticate requests via API keys, JWT, or OAuth 2.0?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Rate limiting per client and per endpoint?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Load balance across multiple instances of each service?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Request/response transformation (header injection, body rewrite)?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. ApiGatewayService is the facade stereotype. Route, ServiceRegistry, AuthPlugin, RateLimitPlugin, LoadBalancer are concrete domain classes with id/name/status and validate/close.',
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
          'Construct ApiGatewayService.',
          'createRoute twice and create the related UML classes.',
          'closeRoute once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'ApiGatewayService', responsibility: 'UML facade - orchestrates API Gateway.', keyMembers: ['create*', 'get*', 'closeRoute'] },
    { name: 'Route', responsibility: 'UML class - domain object for API Gateway.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ServiceRegistry', responsibility: 'UML class - domain object for API Gateway.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'AuthPlugin', responsibility: 'UML class - domain object for API Gateway.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'RateLimitPlugin', responsibility: 'UML class - domain object for API Gateway.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'LoadBalancer', responsibility: 'UML class - domain object for API Gateway.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from ApiGatewayService to Route, ServiceRegistry, AuthPlugin, RateLimitPlugin, LoadBalancer. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on ApiGatewayService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'ApiGatewayService', responsibility: 'UML facade - orchestrates API Gateway.', keyMembers: ['create*', 'get*', 'closeRoute'] },
    { name: 'Route', responsibility: 'UML class - domain object for API Gateway.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ServiceRegistry', responsibility: 'UML class - domain object for API Gateway.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'AuthPlugin', responsibility: 'UML class - domain object for API Gateway.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'RateLimitPlugin', responsibility: 'UML class - domain object for API Gateway.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'LoadBalancer', responsibility: 'UML class - domain object for API Gateway.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'ApiGatewayService exposes create/get/close and owns composed collections.' },
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
      'main constructs ApiGatewayService, creates UML domain objects, closes the primary Route, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct ApiGatewayService.',
      'createRoute for alpha and beta.',
      'create remaining UML classes.',
      'closeRoute(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createRoute("alpha..."); closeRoute(id)',
        output: '[Route.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeRoute(alreadyClosed) or getRoute("MISSING-ID")',
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
