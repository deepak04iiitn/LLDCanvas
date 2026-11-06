import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'OnlineAuctionSystemService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_auctions', 'Map<string, Auction>'),
    attr('-', '_items', 'Map<string, Item>'),
    attr('-', '_bids', 'Map<string, Bid>'),
    attr('-', '_proxy_bids', 'Map<string, ProxyBid>'),
  ], [
    method('+', 'createAuction', 'name: string', 'Auction'),
    method('+', 'createItem', 'name: string', 'Item'),
    method('+', 'createBid', 'name: string', 'Bid'),
    method('+', 'createProxyBid', 'name: string', 'ProxyBid'),
    method('+', 'getAuction', 'id: string', 'Auction'),
    method('+', 'getItem', 'id: string', 'Item'),
    method('+', 'getBid', 'id: string', 'Bid'),
    method('+', 'getProxyBid', 'id: string', 'ProxyBid'),
    method('+', 'closeAuction', 'id: string', 'Auction'),
  ], 'facade'),
  cls('n1', 'Auction', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Item', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'Bid', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'ProxyBid', GRID.x(1), GRID.y(1), [
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
log = logging.getLogger("online-auction-system")


class Auction:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Auction.id is required")
        if not name or not name.strip():
            raise ValueError("Auction.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Auction.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Auction {self.id} has invalid status={self.status}")
        log.info("[Auction.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Auction {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Auction.close] id=%s -> CLOSED", self.id)


class Item:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Item.id is required")
        if not name or not name.strip():
            raise ValueError("Item.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Item.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Item {self.id} has invalid status={self.status}")
        log.info("[Item.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Item {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Item.close] id=%s -> CLOSED", self.id)


class Bid:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Bid.id is required")
        if not name or not name.strip():
            raise ValueError("Bid.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Bid.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Bid {self.id} has invalid status={self.status}")
        log.info("[Bid.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Bid {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Bid.close] id=%s -> CLOSED", self.id)


class ProxyBid:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("ProxyBid.id is required")
        if not name or not name.strip():
            raise ValueError("ProxyBid.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[ProxyBid.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"ProxyBid {self.id} has invalid status={self.status}")
        log.info("[ProxyBid.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"ProxyBid {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[ProxyBid.close] id=%s -> CLOSED", self.id)


class OnlineAuctionSystemService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._auctions: Dict[str, Auction] = {}
        self._items: Dict[str, Item] = {}
        self._bids: Dict[str, Bid] = {}
        self._proxy_bids: Dict[str, ProxyBid] = {}
        log.info("[OnlineAuctionSystemService.__init__] system ready; managing: Auction, Item, Bid, ProxyBid")

    def create_auction(self, name: str) -> Auction:
        """UML: OnlineAuctionSystemService.create_auction(name) -> Auction"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Auction name is required")
        with self._lock:
            item_id = f"AUC-{self._seq:04d}"
            self._seq += 1
            obj = Auction(item_id, cleaned)
            obj.validate()
            self._auctions[item_id] = obj
            log.info("[OnlineAuctionSystemService.create_auction] stored %s in _auctions (count=%s)", item_id, len(self._auctions))
            return obj

    def get_auction(self, item_id: str) -> Auction:
        with self._lock:
            obj = self._auctions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Auction id: {item_id}")
            log.info("[OnlineAuctionSystemService.get_auction] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_item(self, name: str) -> Item:
        """UML: OnlineAuctionSystemService.create_item(name) -> Item"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Item name is required")
        with self._lock:
            item_id = f"ITE-{self._seq:04d}"
            self._seq += 1
            obj = Item(item_id, cleaned)
            obj.validate()
            self._items[item_id] = obj
            log.info("[OnlineAuctionSystemService.create_item] stored %s in _items (count=%s)", item_id, len(self._items))
            return obj

    def get_item(self, item_id: str) -> Item:
        with self._lock:
            obj = self._items.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Item id: {item_id}")
            log.info("[OnlineAuctionSystemService.get_item] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_bid(self, name: str) -> Bid:
        """UML: OnlineAuctionSystemService.create_bid(name) -> Bid"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Bid name is required")
        with self._lock:
            item_id = f"BID-{self._seq:04d}"
            self._seq += 1
            obj = Bid(item_id, cleaned)
            obj.validate()
            self._bids[item_id] = obj
            log.info("[OnlineAuctionSystemService.create_bid] stored %s in _bids (count=%s)", item_id, len(self._bids))
            return obj

    def get_bid(self, item_id: str) -> Bid:
        with self._lock:
            obj = self._bids.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Bid id: {item_id}")
            log.info("[OnlineAuctionSystemService.get_bid] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_proxy_bid(self, name: str) -> ProxyBid:
        """UML: OnlineAuctionSystemService.create_proxy_bid(name) -> ProxyBid"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("ProxyBid name is required")
        with self._lock:
            item_id = f"PRO-{self._seq:04d}"
            self._seq += 1
            obj = ProxyBid(item_id, cleaned)
            obj.validate()
            self._proxy_bids[item_id] = obj
            log.info("[OnlineAuctionSystemService.create_proxy_bid] stored %s in _proxy_bids (count=%s)", item_id, len(self._proxy_bids))
            return obj

    def get_proxy_bid(self, item_id: str) -> ProxyBid:
        with self._lock:
            obj = self._proxy_bids.get(item_id)
            if obj is None:
                raise KeyError(f"unknown ProxyBid id: {item_id}")
            log.info("[OnlineAuctionSystemService.get_proxy_bid] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_auction(self, item_id: str) -> Auction:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._auctions.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Auction id: {item_id}")
            log.info("[OnlineAuctionSystemService.close_auction] closing %s via Auction.close()", item_id)
            obj.close()
            return obj

    def list_active_auctions(self) -> List[Auction]:
        with self._lock:
            active = [o for o in self._auctions.values() if o.status == "ACTIVE"]
            log.info("[OnlineAuctionSystemService.list_active_auctions] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct OnlineAuctionSystemService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = OnlineAuctionSystemService()

    log.info("========== STEP 2: Create primary Auction objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_auction("alpha-auction")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_auction("beta-auction")

    log.info("========== STEP 3: Create Item (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_item("sample-item")

    log.info("========== STEP 4: Create Bid (UML class) ==========")
    system.create_bid("sample-bid")

    log.info("========== STEP 5: Create ProxyBid (UML class) ==========")
    system.create_proxy_bid("sample-proxy_bid")

    log.info("========== STEP 6: Inspect active Auction list ==========")
    system.list_active_auctions()

    log.info("========== STEP 7: Close first Auction ==========")
    system.close_auction(first.id)

    log.info("========== STEP 8: Expected failure - close again ==========")
    try:
        system.close_auction(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Auction.close: %s", err)

    log.info("========== STEP 9: Expected failure - missing id ==========")
    try:
        system.get_auction("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_auction: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_auctions()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Auction {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Auction(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Auction.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Auction.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Auction.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Auction " + id + " invalid status");
    }
    System.out.println("[Auction.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Auction " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Auction.close] id=" + id + " -> CLOSED");
  }
}


class Item {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Item(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Item.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Item.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Item.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Item " + id + " invalid status");
    }
    System.out.println("[Item.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Item " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Item.close] id=" + id + " -> CLOSED");
  }
}


class Bid {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Bid(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Bid.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Bid.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Bid.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Bid " + id + " invalid status");
    }
    System.out.println("[Bid.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Bid " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Bid.close] id=" + id + " -> CLOSED");
  }
}


class ProxyBid {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  ProxyBid(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("ProxyBid.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ProxyBid.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[ProxyBid.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("ProxyBid " + id + " invalid status");
    }
    System.out.println("[ProxyBid.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("ProxyBid " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[ProxyBid.close] id=" + id + " -> CLOSED");
  }
}

public class OnlineAuctionSystemService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Auction> auctions = new LinkedHashMap<>();
  private final Map<String, Item> items = new LinkedHashMap<>();
  private final Map<String, Bid> bids = new LinkedHashMap<>();
  private final Map<String, ProxyBid> proxy_bids = new LinkedHashMap<>();

  public OnlineAuctionSystemService() {
    System.out.println("[OnlineAuctionSystemService.__init__] system ready");
  }

  public Auction createAuction(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Auction name required");
    }
    lock.lock();
    try {
      String id = String.format("AUC-%04d", seq++);
      Auction obj = new Auction(id, name.trim());
      obj.validate();
      auctions.put(id, obj);
      System.out.println("[OnlineAuctionSystemService.createAuction] stored " + id + " count=" + auctions.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Auction getAuction(String id) {
    lock.lock();
    try {
      Auction obj = auctions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Auction id: " + id);
      }
      System.out.println("[OnlineAuctionSystemService.getAuction] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Item createItem(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Item name required");
    }
    lock.lock();
    try {
      String id = String.format("ITE-%04d", seq++);
      Item obj = new Item(id, name.trim());
      obj.validate();
      items.put(id, obj);
      System.out.println("[OnlineAuctionSystemService.createItem] stored " + id + " count=" + items.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Item getItem(String id) {
    lock.lock();
    try {
      Item obj = items.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Item id: " + id);
      }
      System.out.println("[OnlineAuctionSystemService.getItem] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Bid createBid(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Bid name required");
    }
    lock.lock();
    try {
      String id = String.format("BID-%04d", seq++);
      Bid obj = new Bid(id, name.trim());
      obj.validate();
      bids.put(id, obj);
      System.out.println("[OnlineAuctionSystemService.createBid] stored " + id + " count=" + bids.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Bid getBid(String id) {
    lock.lock();
    try {
      Bid obj = bids.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Bid id: " + id);
      }
      System.out.println("[OnlineAuctionSystemService.getBid] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public ProxyBid createProxyBid(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("ProxyBid name required");
    }
    lock.lock();
    try {
      String id = String.format("PRO-%04d", seq++);
      ProxyBid obj = new ProxyBid(id, name.trim());
      obj.validate();
      proxy_bids.put(id, obj);
      System.out.println("[OnlineAuctionSystemService.createProxyBid] stored " + id + " count=" + proxy_bids.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public ProxyBid getProxyBid(String id) {
    lock.lock();
    try {
      ProxyBid obj = proxy_bids.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown ProxyBid id: " + id);
      }
      System.out.println("[OnlineAuctionSystemService.getProxyBid] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Auction closeAuction(String id) {
    lock.lock();
    try {
      Auction obj = auctions.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Auction id: " + id);
      }
      System.out.println("[OnlineAuctionSystemService.closeAuction] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Auction> listActiveAuctions() {
    lock.lock();
    try {
      List<Auction> out = new ArrayList<>();
      for (Auction o : auctions.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[OnlineAuctionSystemService.listActiveAuctions] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct OnlineAuctionSystemService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    OnlineAuctionSystemService system = new OnlineAuctionSystemService();
    System.out.println("========== STEP 2: Create Auction objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Auction first = system.createAuction("alpha-auction");
    system.createAuction("beta-auction");
    System.out.println("========== STEP 3: Create Item ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createItem("sample-item");
    System.out.println("========== STEP 4: Create Bid ==========");
    system.createBid("sample-bid");
    System.out.println("========== STEP 5: Create ProxyBid ==========");
    system.createProxyBid("sample-proxy_bid");
    System.out.println("========== Inspect active list ==========");
    system.listActiveAuctions();
    System.out.println("========== Close first Auction ==========");
    system.closeAuction(first.getId());
    try {
      system.closeAuction(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getAuction("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Auction {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Auction.id required')
    }

    if (!name?.trim()) {
      throw new Error('Auction.name required')
    }
    console.log(\`[Auction.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Auction \${this.id} invalid status\`)
    }
    console.log(\`[Auction.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Auction \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Auction.close] id=\${this.id} -> CLOSED\`)
  }
}


class Item {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Item.id required')
    }

    if (!name?.trim()) {
      throw new Error('Item.name required')
    }
    console.log(\`[Item.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Item \${this.id} invalid status\`)
    }
    console.log(\`[Item.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Item \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Item.close] id=\${this.id} -> CLOSED\`)
  }
}


class Bid {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Bid.id required')
    }

    if (!name?.trim()) {
      throw new Error('Bid.name required')
    }
    console.log(\`[Bid.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Bid \${this.id} invalid status\`)
    }
    console.log(\`[Bid.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Bid \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Bid.close] id=\${this.id} -> CLOSED\`)
  }
}


class ProxyBid {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('ProxyBid.id required')
    }

    if (!name?.trim()) {
      throw new Error('ProxyBid.name required')
    }
    console.log(\`[ProxyBid.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`ProxyBid \${this.id} invalid status\`)
    }
    console.log(\`[ProxyBid.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`ProxyBid \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[ProxyBid.close] id=\${this.id} -> CLOSED\`)
  }
}

class OnlineAuctionSystemService {
  private seq = 1
  private auctions = new Map<string, Auction>()
  private items = new Map<string, Item>()
  private bids = new Map<string, Bid>()
  private proxy_bids = new Map<string, ProxyBid>()
  constructor() {
    console.log('[OnlineAuctionSystemService.__init__] system ready')
  }

  createAuction(name: string): Auction {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Auction name required')
    }
    const id = \`AUC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Auction(id, cleaned)
    obj.validate()
    this.auctions.set(id, obj)
    console.log(\`[OnlineAuctionSystemService.createAuction] stored \${id} count=\${this.auctions.size}\`)
    return obj
  }

  getAuction(id: string): Auction {
    const obj = this.auctions.get(id)
    if (!obj) {
      throw new Error(\`unknown Auction id: \${id}\`)
    }
    console.log(\`[OnlineAuctionSystemService.getAuction] found id=\${obj.id}\`)
    return obj
  }

  createItem(name: string): Item {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Item name required')
    }
    const id = \`ITE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Item(id, cleaned)
    obj.validate()
    this.items.set(id, obj)
    console.log(\`[OnlineAuctionSystemService.createItem] stored \${id} count=\${this.items.size}\`)
    return obj
  }

  getItem(id: string): Item {
    const obj = this.items.get(id)
    if (!obj) {
      throw new Error(\`unknown Item id: \${id}\`)
    }
    console.log(\`[OnlineAuctionSystemService.getItem] found id=\${obj.id}\`)
    return obj
  }

  createBid(name: string): Bid {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Bid name required')
    }
    const id = \`BID-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Bid(id, cleaned)
    obj.validate()
    this.bids.set(id, obj)
    console.log(\`[OnlineAuctionSystemService.createBid] stored \${id} count=\${this.bids.size}\`)
    return obj
  }

  getBid(id: string): Bid {
    const obj = this.bids.get(id)
    if (!obj) {
      throw new Error(\`unknown Bid id: \${id}\`)
    }
    console.log(\`[OnlineAuctionSystemService.getBid] found id=\${obj.id}\`)
    return obj
  }

  createProxyBid(name: string): ProxyBid {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('ProxyBid name required')
    }
    const id = \`PRO-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new ProxyBid(id, cleaned)
    obj.validate()
    this.proxy_bids.set(id, obj)
    console.log(\`[OnlineAuctionSystemService.createProxyBid] stored \${id} count=\${this.proxy_bids.size}\`)
    return obj
  }

  getProxyBid(id: string): ProxyBid {
    const obj = this.proxy_bids.get(id)
    if (!obj) {
      throw new Error(\`unknown ProxyBid id: \${id}\`)
    }
    console.log(\`[OnlineAuctionSystemService.getProxyBid] found id=\${obj.id}\`)
    return obj
  }

  closeAuction(id: string): Auction {
    const obj = this.getAuction(id)
    console.log(\`[OnlineAuctionSystemService.closeAuction] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveAuctions(): Auction[] {
    const active = [...this.auctions.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[OnlineAuctionSystemService.listActiveAuctions] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct OnlineAuctionSystemService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new OnlineAuctionSystemService()
  console.log('========== STEP 2: Create Auction objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createAuction('alpha-auction')
  system.createAuction('beta-auction')
  console.log('========== STEP 3: Create Item ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createItem('sample-item')
  console.log('========== STEP 4: Create Bid ==========')
  system.createBid('sample-bid')
  console.log('========== STEP 5: Create ProxyBid ==========')
  system.createProxyBid('sample-proxy_bid')
  system.listActiveAuctions()
  console.log('========== Close first Auction ==========')
  system.closeAuction(first.id)
  try {
    system.closeAuction(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getAuction('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Auction {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Auction(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Auction requires id and name");
    }
    cout << "[Auction.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Auction invalid status");
    }
    cout << "[Auction.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Auction cannot close");
    }
    status_ = "CLOSED";
    cout << "[Auction.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Item {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Item(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Item requires id and name");
    }
    cout << "[Item.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Item invalid status");
    }
    cout << "[Item.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Item cannot close");
    }
    status_ = "CLOSED";
    cout << "[Item.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Bid {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Bid(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Bid requires id and name");
    }
    cout << "[Bid.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Bid invalid status");
    }
    cout << "[Bid.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Bid cannot close");
    }
    status_ = "CLOSED";
    cout << "[Bid.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class ProxyBid {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  ProxyBid(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("ProxyBid requires id and name");
    }
    cout << "[ProxyBid.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("ProxyBid invalid status");
    }
    cout << "[ProxyBid.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("ProxyBid cannot close");
    }
    status_ = "CLOSED";
    cout << "[ProxyBid.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class OnlineAuctionSystemService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Auction> auctions_;
  unordered_map<string, Item> items_;
  unordered_map<string, Bid> bids_;
  unordered_map<string, ProxyBid> proxy_bids_;
public:
  OnlineAuctionSystemService() {
    cout << "[OnlineAuctionSystemService.__init__] system ready" << endl;
  }

  Auction createAuction(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Auction name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "AUC-%04d", seq_++);
    Auction obj{buf, name};
    obj.validate();
    auctions_.emplace(obj.id(), obj);
    cout << "[OnlineAuctionSystemService.createAuction] stored " << obj.id() << endl;
    return obj;
  }

  Auction getAuction(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = auctions_.find(id);
    if (it == auctions_.end()) {
      throw out_of_range("unknown Auction id");
    }
    cout << "[OnlineAuctionSystemService.getAuction] found " << id << endl;
    return it->second;
  }

  Item createItem(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Item name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "ITE-%04d", seq_++);
    Item obj{buf, name};
    obj.validate();
    items_.emplace(obj.id(), obj);
    cout << "[OnlineAuctionSystemService.createItem] stored " << obj.id() << endl;
    return obj;
  }

  Item getItem(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = items_.find(id);
    if (it == items_.end()) {
      throw out_of_range("unknown Item id");
    }
    cout << "[OnlineAuctionSystemService.getItem] found " << id << endl;
    return it->second;
  }

  Bid createBid(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Bid name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "BID-%04d", seq_++);
    Bid obj{buf, name};
    obj.validate();
    bids_.emplace(obj.id(), obj);
    cout << "[OnlineAuctionSystemService.createBid] stored " << obj.id() << endl;
    return obj;
  }

  Bid getBid(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = bids_.find(id);
    if (it == bids_.end()) {
      throw out_of_range("unknown Bid id");
    }
    cout << "[OnlineAuctionSystemService.getBid] found " << id << endl;
    return it->second;
  }

  ProxyBid createProxyBid(const string& name) {
    if (name.empty()) {
      throw invalid_argument("ProxyBid name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PRO-%04d", seq_++);
    ProxyBid obj{buf, name};
    obj.validate();
    proxy_bids_.emplace(obj.id(), obj);
    cout << "[OnlineAuctionSystemService.createProxyBid] stored " << obj.id() << endl;
    return obj;
  }

  ProxyBid getProxyBid(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = proxy_bids_.find(id);
    if (it == proxy_bids_.end()) {
      throw out_of_range("unknown ProxyBid id");
    }
    cout << "[OnlineAuctionSystemService.getProxyBid] found " << id << endl;
    return it->second;
  }

  Auction closeAuction(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = auctions_.find(id);
    if (it == auctions_.end()) {
      throw out_of_range("unknown Auction");
    }
    cout << "[OnlineAuctionSystemService.closeAuction] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct OnlineAuctionSystemService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  OnlineAuctionSystemService system;
  cout << "========== STEP 2: Create Auction ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createAuction("alpha-auction");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createAuction("beta-auction");
  system.createItem("sample-item");
  system.createBid("sample-bid");
  system.createProxyBid("sample-proxy_bid");
  system.closeAuction(first.id());
  try {
    system.closeAuction(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getAuction("MISSING-ID");
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

type Auction struct {
  ID     string
  Name   string
  Status string
}

func NewAuction(id, name string) (*Auction, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Auction requires id and name")
  }
  obj := &Auction{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Auction.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Auction) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Auction invalid status")
  }
  fmt.Printf("[Auction.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Auction) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Auction %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Auction.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Item struct {
  ID     string
  Name   string
  Status string
}

func NewItem(id, name string) (*Item, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Item requires id and name")
  }
  obj := &Item{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Item.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Item) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Item invalid status")
  }
  fmt.Printf("[Item.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Item) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Item %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Item.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Bid struct {
  ID     string
  Name   string
  Status string
}

func NewBid(id, name string) (*Bid, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Bid requires id and name")
  }
  obj := &Bid{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Bid.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Bid) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Bid invalid status")
  }
  fmt.Printf("[Bid.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Bid) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Bid %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Bid.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type ProxyBid struct {
  ID     string
  Name   string
  Status string
}

func NewProxyBid(id, name string) (*ProxyBid, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("ProxyBid requires id and name")
  }
  obj := &ProxyBid{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[ProxyBid.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *ProxyBid) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("ProxyBid invalid status")
  }
  fmt.Printf("[ProxyBid.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *ProxyBid) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("ProxyBid %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[ProxyBid.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type OnlineAuctionSystemService struct {
  mu  sync.Mutex
  seq int
  auctions map[string]*Auction
  items map[string]*Item
  bids map[string]*Bid
  proxy_bids map[string]*ProxyBid
}

func NewOnlineAuctionSystemService() *OnlineAuctionSystemService {
  fmt.Println("[OnlineAuctionSystemService.__init__] system ready")
  return &OnlineAuctionSystemService{
    seq: 1,
    auctions: map[string]*Auction{},
    items: map[string]*Item{},
    bids: map[string]*Bid{},
    proxy_bids: map[string]*ProxyBid{},
  }
}

func (s *OnlineAuctionSystemService) CreateAuction(name string) (*Auction, error) {
  if name == "" {
    return nil, fmt.Errorf("Auction name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("AUC-%04d", s.seq)
  s.seq++
  obj, err := NewAuction(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.auctions[id] = obj
  fmt.Printf("[OnlineAuctionSystemService.CreateAuction] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineAuctionSystemService) GetAuction(id string) (*Auction, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.auctions[id]
  if !ok {
    return nil, fmt.Errorf("unknown Auction id: %s", id)
  }
  fmt.Printf("[OnlineAuctionSystemService.GetAuction] found %s\\n", id)
  return obj, nil
}

func (s *OnlineAuctionSystemService) CreateItem(name string) (*Item, error) {
  if name == "" {
    return nil, fmt.Errorf("Item name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("ITE-%04d", s.seq)
  s.seq++
  obj, err := NewItem(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.items[id] = obj
  fmt.Printf("[OnlineAuctionSystemService.CreateItem] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineAuctionSystemService) GetItem(id string) (*Item, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.items[id]
  if !ok {
    return nil, fmt.Errorf("unknown Item id: %s", id)
  }
  fmt.Printf("[OnlineAuctionSystemService.GetItem] found %s\\n", id)
  return obj, nil
}

func (s *OnlineAuctionSystemService) CreateBid(name string) (*Bid, error) {
  if name == "" {
    return nil, fmt.Errorf("Bid name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("BID-%04d", s.seq)
  s.seq++
  obj, err := NewBid(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.bids[id] = obj
  fmt.Printf("[OnlineAuctionSystemService.CreateBid] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineAuctionSystemService) GetBid(id string) (*Bid, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.bids[id]
  if !ok {
    return nil, fmt.Errorf("unknown Bid id: %s", id)
  }
  fmt.Printf("[OnlineAuctionSystemService.GetBid] found %s\\n", id)
  return obj, nil
}

func (s *OnlineAuctionSystemService) CreateProxyBid(name string) (*ProxyBid, error) {
  if name == "" {
    return nil, fmt.Errorf("ProxyBid name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PRO-%04d", s.seq)
  s.seq++
  obj, err := NewProxyBid(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.proxy_bids[id] = obj
  fmt.Printf("[OnlineAuctionSystemService.CreateProxyBid] stored %s\\n", id)
  return obj, nil
}

func (s *OnlineAuctionSystemService) GetProxyBid(id string) (*ProxyBid, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.proxy_bids[id]
  if !ok {
    return nil, fmt.Errorf("unknown ProxyBid id: %s", id)
  }
  fmt.Printf("[OnlineAuctionSystemService.GetProxyBid] found %s\\n", id)
  return obj, nil
}

func (s *OnlineAuctionSystemService) CloseAuction(id string) (*Auction, error) {
  obj, err := s.GetAuction(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[OnlineAuctionSystemService.CloseAuction] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct OnlineAuctionSystemService ==========")
  system := NewOnlineAuctionSystemService()
  fmt.Println("========== STEP 2: Create Auction ==========")
  first, _ := system.CreateAuction("alpha-auction")
  system.CreateAuction("beta-auction")
  system.CreateItem("sample-item")
  system.CreateBid("sample-bid")
  system.CreateProxyBid("sample-proxy_bid")
  system.CloseAuction(first.ID)
  if _, err := system.CloseAuction(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetAuction("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Auction {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Auction(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Auction requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Auction.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Auction invalid status");
    }
    Console.WriteLine("[Auction.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Auction " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Auction.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Item {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Item(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Item requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Item.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Item invalid status");
    }
    Console.WriteLine("[Item.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Item " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Item.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Bid {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Bid(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Bid requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Bid.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Bid invalid status");
    }
    Console.WriteLine("[Bid.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Bid " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Bid.close] id=" + Id + " -> CLOSED");
  }
}


sealed class ProxyBid {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public ProxyBid(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ProxyBid requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[ProxyBid.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("ProxyBid invalid status");
    }
    Console.WriteLine("[ProxyBid.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("ProxyBid " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[ProxyBid.close] id=" + Id + " -> CLOSED");
  }
}

sealed class OnlineAuctionSystemService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Auction> _auctions = new();
  private readonly Dictionary<string, Item> _items = new();
  private readonly Dictionary<string, Bid> _bids = new();
  private readonly Dictionary<string, ProxyBid> _proxy_bids = new();
  public OnlineAuctionSystemService() {
    Console.WriteLine("[OnlineAuctionSystemService.__init__] system ready");
  }

  public Auction CreateAuction(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Auction name required");
    }
    lock (_gate) {
      var id = string.Format("AUC-{0:D4}", _seq++);
      var obj = new Auction(id, name.Trim());
      obj.Validate();
      _auctions[id] = obj;
      Console.WriteLine("[OnlineAuctionSystemService.CreateAuction] stored " + id);
      return obj;
    }
  }

  public Auction GetAuction(string id) {
    lock (_gate) {
      if (!_auctions.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Auction id: " + id);
      }
      Console.WriteLine("[OnlineAuctionSystemService.GetAuction] found " + id);
      return obj;
    }
  }

  public Item CreateItem(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Item name required");
    }
    lock (_gate) {
      var id = string.Format("ITE-{0:D4}", _seq++);
      var obj = new Item(id, name.Trim());
      obj.Validate();
      _items[id] = obj;
      Console.WriteLine("[OnlineAuctionSystemService.CreateItem] stored " + id);
      return obj;
    }
  }

  public Item GetItem(string id) {
    lock (_gate) {
      if (!_items.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Item id: " + id);
      }
      Console.WriteLine("[OnlineAuctionSystemService.GetItem] found " + id);
      return obj;
    }
  }

  public Bid CreateBid(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Bid name required");
    }
    lock (_gate) {
      var id = string.Format("BID-{0:D4}", _seq++);
      var obj = new Bid(id, name.Trim());
      obj.Validate();
      _bids[id] = obj;
      Console.WriteLine("[OnlineAuctionSystemService.CreateBid] stored " + id);
      return obj;
    }
  }

  public Bid GetBid(string id) {
    lock (_gate) {
      if (!_bids.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Bid id: " + id);
      }
      Console.WriteLine("[OnlineAuctionSystemService.GetBid] found " + id);
      return obj;
    }
  }

  public ProxyBid CreateProxyBid(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("ProxyBid name required");
    }
    lock (_gate) {
      var id = string.Format("PRO-{0:D4}", _seq++);
      var obj = new ProxyBid(id, name.Trim());
      obj.Validate();
      _proxy_bids[id] = obj;
      Console.WriteLine("[OnlineAuctionSystemService.CreateProxyBid] stored " + id);
      return obj;
    }
  }

  public ProxyBid GetProxyBid(string id) {
    lock (_gate) {
      if (!_proxy_bids.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown ProxyBid id: " + id);
      }
      Console.WriteLine("[OnlineAuctionSystemService.GetProxyBid] found " + id);
      return obj;
    }
  }

  public Auction CloseAuction(string id) {
    var obj = GetAuction(id);
    Console.WriteLine("[OnlineAuctionSystemService.CloseAuction] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct OnlineAuctionSystemService ==========");
    var system = new OnlineAuctionSystemService();
    Console.WriteLine("========== STEP 2: Create Auction ==========");
    var first = system.CreateAuction("alpha-auction");
    system.CreateAuction("beta-auction");
    system.CreateItem("sample-item");
    system.CreateBid("sample-bid");
    system.CreateProxyBid("sample-proxy_bid");
    system.CloseAuction(first.Id);
    try {
      system.CloseAuction(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetAuction("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const onlineAuctionSystemSolution: ProblemSolution = {
  slug: 'online-auction-system',
  title: 'Online Auction System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design an online auction platform like eBay supporting bidding, auto-bid increments, and auction closing. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'List an item for auction with a starting price and end time',
      'Place a bid higher than the current highest bid',
      'Support proxy/auto-bidding up to a max amount',
      'Notify outbid users in real time',
      'Automatically close the auction at end time and declare a winner',
      'Extend auction end time on last-minute bids (anti-sniping)',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'List an item for auction with a starting price and end time?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Place a bid higher than the current highest bid?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Support proxy/auto-bidding up to a max amount?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Notify outbid users in real time?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Automatically close the auction at end time and declare a winner?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. OnlineAuctionSystemService is the facade stereotype. Auction, Item, Bid, ProxyBid are concrete domain classes with id/name/status and validate/close.',
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
          'Construct OnlineAuctionSystemService.',
          'createAuction twice and create the related UML classes.',
          'closeAuction once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'OnlineAuctionSystemService', responsibility: 'UML facade - orchestrates Online Auction System.', keyMembers: ['create*', 'get*', 'closeAuction'] },
    { name: 'Auction', responsibility: 'UML class - domain object for Online Auction System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Item', responsibility: 'UML class - domain object for Online Auction System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Bid', responsibility: 'UML class - domain object for Online Auction System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ProxyBid', responsibility: 'UML class - domain object for Online Auction System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from OnlineAuctionSystemService to Auction, Item, Bid, ProxyBid. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on OnlineAuctionSystemService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'OnlineAuctionSystemService', responsibility: 'UML facade - orchestrates Online Auction System.', keyMembers: ['create*', 'get*', 'closeAuction'] },
    { name: 'Auction', responsibility: 'UML class - domain object for Online Auction System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Item', responsibility: 'UML class - domain object for Online Auction System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Bid', responsibility: 'UML class - domain object for Online Auction System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'ProxyBid', responsibility: 'UML class - domain object for Online Auction System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'OnlineAuctionSystemService exposes create/get/close and owns composed collections.' },
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
      'main constructs OnlineAuctionSystemService, creates UML domain objects, closes the primary Auction, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct OnlineAuctionSystemService.',
      'createAuction for alpha and beta.',
      'create remaining UML classes.',
      'closeAuction(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createAuction("alpha..."); closeAuction(id)',
        output: '[Auction.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeAuction(alreadyClosed) or getAuction("MISSING-ID")',
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
