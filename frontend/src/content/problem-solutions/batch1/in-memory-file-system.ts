import type { ProblemSolution } from '../types'
import { GRID, abstractCls, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('fs', 'FileSystem', GRID.x(0), GRID.y(0), [
    attr('-', 'root', 'Directory'),
  ], [
    method('+', 'mkdir', 'path: String', 'void'),
    method('+', 'createFile', 'path: String, content: String', 'void'),
    method('+', 'readFile', 'path: String', 'String'),
    method('+', 'updateFile', 'path: String, content: String', 'void'),
    method('+', 'delete', 'path: String', 'void'),
    method('+', 'list', 'path: String', 'List<String>'),
    method('+', 'move', 'src: String, dst: String', 'void'),
    method('+', 'size', 'path: String', 'int'),
    method('+', 'exists', 'path: String', 'boolean'),
  ]),
  abstractCls('node', 'FileSystemNode', GRID.x(2), GRID.y(0), [
    attr('#', 'name', 'String'),
    attr('#', 'parent', 'Directory?'),
  ], [
    method('+', 'getSize', '', 'int', { isAbstract: true }),
    method('+', 'isDirectory', '', 'boolean', { isAbstract: true }),
  ]),
  cls('dir', 'Directory', GRID.x(0), GRID.y(1), [
    attr('-', 'children', 'Map<String, FileSystemNode>'),
    attr('-', 'cachedSize', 'int?'),
  ], [
    method('+', 'getChild', 'name: String', 'FileSystemNode?'),
    method('+', 'addChild', 'node: FileSystemNode', 'void'),
    method('+', 'removeChild', 'name: String', 'FileSystemNode'),
    method('+', 'listNames', '', 'List<String>'),
    method('+', 'getSize', '', 'int'),
    method('+', 'invalidateSize', '', 'void'),
  ]),
  cls('file', 'File', GRID.x(2), GRID.y(1), [
    attr('-', 'content', 'String'),
  ], [
    method('+', 'getSize', '', 'int'),
    method('+', 'read', '', 'String'),
    method('+', 'write', 'content: String', 'void'),
  ]),
]

const edges = [
  edge('e1', 'fs', 'dir', 'composition', 'bottom', 'top', { label: 'root', sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e2', 'dir', 'node', 'inheritance', 'right@25', 'bottom@30'),
  edge('e3', 'file', 'node', 'inheritance', 'top', 'bottom@70'),
  edge('e4', 'dir', 'node', 'composition', 'right@70', 'left', { label: 'children', sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
]

const py = `"""In-Memory File System — medium-level LLD interview reference (Python)."""
from __future__ import annotations
from abc import ABC, abstractmethod
from threading import RLock
from typing import Dict, List, Optional, Tuple


class FileSystemError(Exception):
    pass


class FileSystemNode(ABC):
    def __init__(self, name: str):
        self.name = name
        self.parent: Optional[Directory] = None

    @abstractmethod
    def get_size(self) -> int:
        ...

    @abstractmethod
    def is_directory(self) -> bool:
        ...


class File(FileSystemNode):
    def __init__(self, name: str, content: str = ""):
        super().__init__(name)
        self._content = content

    def get_size(self) -> int:
        return len(self._content)

    def is_directory(self) -> bool:
        return False

    def read(self) -> str:
        return self._content

    def write(self, content: str) -> None:
        self._content = content
        if self.parent is not None:
            self.parent.invalidate_size()  # every ancestor's cached size is now stale


class Directory(FileSystemNode):
    def __init__(self, name: str):
        super().__init__(name)
        self._children: Dict[str, FileSystemNode] = {}
        self._cached_size: Optional[int] = None

    def is_directory(self) -> bool:
        return True

    def get_child(self, name: str) -> Optional[FileSystemNode]:
        return self._children.get(name)

    def add_child(self, node: FileSystemNode) -> None:
        if node.name in self._children:
            raise FileSystemError("'%s' already exists" % node.name)
        self._children[node.name] = node
        node.parent = self
        self.invalidate_size()

    def remove_child(self, name: str) -> FileSystemNode:
        node = self._children.pop(name)
        node.parent = None
        self.invalidate_size()
        return node

    def list_names(self) -> List[str]:
        return sorted(self._children)

    def get_size(self) -> int:
        if self._cached_size is None:
            self._cached_size = sum(c.get_size() for c in self._children.values())
        return self._cached_size

    def invalidate_size(self) -> None:
        d: Optional[Directory] = self
        while d is not None:  # walk up the parent chain: O(depth)
            d._cached_size = None
            d = d.parent


class FileSystem:
    """Absolute paths only ('/a/b/c.txt'). Every public call holds one coarse lock."""

    def __init__(self) -> None:
        self._root = Directory("")
        self._lock = RLock()

    # ---- public API -------------------------------------------------------

    def mkdir(self, path: str) -> None:
        """Like 'mkdir -p': creates missing parents; fine if the directory already exists."""
        with self._lock:
            node: Directory = self._root
            for seg in self._split(path):
                child = node.get_child(seg)
                if child is None:
                    child = Directory(seg)
                    node.add_child(child)
                elif not child.is_directory():
                    raise FileSystemError("'%s' is a file" % seg)
                node = child  # type: ignore[assignment]

    def create_file(self, path: str, content: str = "") -> None:
        with self._lock:
            parent, name = self._parent_and_name(path)
            if parent.get_child(name) is not None:
                raise FileSystemError("'%s' already exists" % path)
            parent.add_child(File(name, content))

    def read_file(self, path: str) -> str:
        with self._lock:
            return self._file(path).read()

    def update_file(self, path: str, content: str) -> None:
        with self._lock:
            self._file(path).write(content)

    def delete(self, path: str) -> None:
        """Deletes a file, or a directory with everything under it."""
        with self._lock:
            node = self._resolve(path)
            if node.parent is None:
                raise FileSystemError("cannot delete the root")
            node.parent.remove_child(node.name)

    def list(self, path: str) -> List[str]:
        with self._lock:
            node = self._resolve(path)
            return node.list_names() if isinstance(node, Directory) else [node.name]

    def move(self, src: str, dst: str) -> None:
        """Rename/move: dst is the full new path and must not exist."""
        with self._lock:
            node = self._resolve(src)
            if node.parent is None:
                raise FileSystemError("cannot move the root")
            new_parent, new_name = self._parent_and_name(dst)
            if new_parent.get_child(new_name) is not None:
                raise FileSystemError("'%s' already exists" % dst)
            p: Optional[Directory] = new_parent
            while p is not None:  # a directory cannot move into itself or its descendants
                if p is node:
                    raise FileSystemError("cannot move a directory into itself")
                p = p.parent
            node.parent.remove_child(node.name)
            node.name = new_name
            new_parent.add_child(node)

    def size(self, path: str) -> int:
        with self._lock:
            return self._resolve(path).get_size()

    def exists(self, path: str) -> bool:
        with self._lock:
            try:
                self._resolve(path)
                return True
            except FileSystemError:
                return False

    # ---- path resolution: O(depth) ----------------------------------------

    @staticmethod
    def _split(path: str) -> List[str]:
        if not path.startswith("/"):
            raise FileSystemError("path must be absolute: " + path)
        segments = [s for s in path.split("/") if s]
        if any(s in (".", "..") for s in segments):
            raise FileSystemError("'.' and '..' are not supported")
        return segments

    def _resolve(self, path: str) -> FileSystemNode:
        node: FileSystemNode = self._root
        for seg in self._split(path):
            if not isinstance(node, Directory):
                raise FileSystemError("not a directory in path: " + path)
            child = node.get_child(seg)
            if child is None:
                raise FileSystemError("no such file or directory: " + path)
            node = child
        return node

    def _parent_and_name(self, path: str) -> Tuple[Directory, str]:
        segments = self._split(path)
        if not segments:
            raise FileSystemError("path must name a file or directory")
        parent = self._resolve("/" + "/".join(segments[:-1]))
        if not isinstance(parent, Directory):
            raise FileSystemError("parent is not a directory: " + path)
        return parent, segments[-1]

    def _file(self, path: str) -> File:
        node = self._resolve(path)
        if not isinstance(node, File):
            raise FileSystemError("'%s' is a directory" % path)
        return node


if __name__ == "__main__":
    fs = FileSystem()
    fs.mkdir("/home/alice/docs")
    fs.create_file("/home/alice/docs/notes.txt", "hello world")   # 11
    fs.create_file("/home/alice/todo.txt", "buy milk")            # 8
    print("ls /home/alice  ->", fs.list("/home/alice"))           # ['docs', 'todo.txt']
    print("size /home      ->", fs.size("/home"))                 # 19

    fs.update_file("/home/alice/todo.txt", "buy milk and eggs")   # 17
    print("size /home      ->", fs.size("/home"))                 # 28

    fs.move("/home/alice/docs", "/home/archive")
    print("ls /home        ->", fs.list("/home"))                 # ['alice', 'archive']
    print("size /home/alice->", fs.size("/home/alice"))           # 17
    print("read            ->", fs.read_file("/home/archive/notes.txt"))

    fs.delete("/home/archive")
    print("exists notes    ->", fs.exists("/home/archive/notes.txt"))  # False
    print("size /          ->", fs.size("/"))                     # 17

    try:
        fs.create_file("/missing/x.txt", "oops")
    except FileSystemError as exc:
        print("error:", exc)
`

const java = `// In-Memory File System — medium-level LLD interview reference (Java 17+)
import java.util.*;

class FileSystemException extends RuntimeException {
  FileSystemException(String message) {
    super(message);
  }
}

abstract class FileSystemNode {
  String name;
  Directory parent;
  FileSystemNode(String name) {
    this.name = name;
  }

  abstract int getSize();
  abstract boolean isDirectory();
}

class File extends FileSystemNode {
  private String content;
  File(String name, String content) {
    super(name); this.content = content;
  }

  int getSize() {
    return content.length();
  }

  boolean isDirectory() {
    return false;
  }

  String read() {
    return content;
  }

  void write(String content) {
    this.content = content;
    if (parent != null) {
      parent.invalidateSize(); // every ancestor's cached size is now stale
    }
  }
}

class Directory extends FileSystemNode {
  private final Map<String, FileSystemNode> children = new TreeMap<>(); // sorted names for listing
  private Integer cachedSize = null;

  Directory(String name) {
    super(name);
  }

  boolean isDirectory() {
    return true;
  }

  FileSystemNode getChild(String name) {
    return children.get(name);
  }

  void addChild(FileSystemNode node) {
    if (children.containsKey(node.name)) {
      throw new FileSystemException("'" + node.name + "' already exists");
    }
    children.put(node.name, node);
    node.parent = this;
    invalidateSize();
  }

  FileSystemNode removeChild(String name) {
    FileSystemNode node = children.remove(name);
    node.parent = null;
    invalidateSize();
    return node;
  }

  List<String> listNames() {
    return new ArrayList<>(children.keySet());
  }

  int getSize() {
    if (cachedSize == null) {
      int total = 0;
      for (FileSystemNode c : children.values()) {
        total += c.getSize();
      }
      cachedSize = total;
    }
    return cachedSize;
  }

  void invalidateSize() {
    for (Directory d = this; d != null; d = d.parent) {
      d.cachedSize = null; // O(depth)
    }
  }
}

/** Absolute paths only ("/a/b/c.txt"). Every public call holds the instance monitor. */

class FileSystem {
  private final Directory root = new Directory("");

  synchronized void mkdir(String path) { // like "mkdir -p"
    Directory node = root;
    for (String seg : split(path)) {
      FileSystemNode child = node.getChild(seg);
      if (child == null) {
        child = new Directory(seg);
        node.addChild(child);
      } else if (!child.isDirectory()) {
        throw new FileSystemException("'" + seg + "' is a file");
      }
      node = (Directory) child;
    }
  }

  synchronized void createFile(String path, String content) {
    Directory parent = parentOf(path);
    String name = nameOf(path);
    if (parent.getChild(name) {
      != null) throw new FileSystemException("'" + path + "' already exists");
    }
    parent.addChild(new File(name, content));
  }

  synchronized String readFile(String path) {
    return file(path).read();
  }

  synchronized void updateFile(String path, String content) {
    file(path).write(content);
  }

  /** Deletes a file, or a directory with everything under it. */
  synchronized void delete(String path) {
    FileSystemNode node = resolve(path);
    if (node.parent == null) {
      throw new FileSystemException("cannot delete the root");
    }
    node.parent.removeChild(node.name);
  }

  synchronized List<String> list(String path) {
    FileSystemNode node = resolve(path);
    return node instanceof Directory d ? d.listNames() : List.of(node.name);
  }

  /** Rename/move: dst is the full new path and must not exist. */
  synchronized void move(String src, String dst) {
    FileSystemNode node = resolve(src);
    if (node.parent == null) {
      throw new FileSystemException("cannot move the root");
    }
    Directory newParent = parentOf(dst);
    String newName = nameOf(dst);
    if (newParent.getChild(newName) {
      != null) throw new FileSystemException("'" + dst + "' already exists");
    }
    for (Directory p = newParent; p != null; p = p.parent) // a directory cannot move into itself
      if (p == node) {
        throw new FileSystemException("cannot move a directory into itself");
      }
    node.parent.removeChild(node.name);
    node.name = newName;
    newParent.addChild(node);
  }

  synchronized int size(String path) {
    return resolve(path).getSize();
  }

  synchronized boolean exists(String path) {
    try {
      resolve(path);
      return true;
    } catch (FileSystemException e) {
      return false;
    }
  }

  // ---- path resolution: O(depth) ----

  private static List<String> split(String path) {
    if (path == null || !path.startsWith("/")) {
      throw new FileSystemException("path must be absolute: " + path);
    }
    List<String> segments = new ArrayList<>();
    for (String s : path.split("/")) {
      if (s.isEmpty()) {
        continue;
      }
      if (s.equals(".") || s.equals("..")) {
        throw new FileSystemException("'.' and '..' are not supported");
      }
      segments.add(s);
    }
    return segments;
  }

  private FileSystemNode resolve(String path) {
    FileSystemNode node = root;
    for (String seg : split(path)) {
      if (!(node instanceof Directory dir)) {
        throw new FileSystemException("not a directory in path: " + path);
      }
      node = dir.getChild(seg);
      if (node == null) {
        throw new FileSystemException("no such file or directory: " + path);
      }
    }
    return node;
  }

  private Directory parentOf(String path) {
    List<String> segments = split(path);
    if (segments.isEmpty()) {
      throw new FileSystemException("path must name a file or directory");
    }
    FileSystemNode parent = resolve("/" + String.join("/", segments.subList(0, segments.size() - 1)));
    if (!(parent instanceof Directory dir)) {
      throw new FileSystemException("parent is not a directory: " + path);
    }
    return dir;
  }

  private String nameOf(String path) {
    List<String> segments = split(path);
    return segments.get(segments.size() - 1);
  }

  private File file(String path) {
    FileSystemNode node = resolve(path);
    if (!(node instanceof File f)) {
      throw new FileSystemException("'" + path + "' is a directory");
    }
    return f;
  }
}

public class Main {
  public static void main(String[] args) {
    FileSystem fs = new FileSystem();
    fs.mkdir("/home/alice/docs");
    fs.createFile("/home/alice/docs/notes.txt", "hello world");  // 11
    fs.createFile("/home/alice/todo.txt", "buy milk");           // 8
    System.out.println("ls /home/alice  -> " + fs.list("/home/alice"));   // [docs, todo.txt]
    System.out.println("size /home      -> " + fs.size("/home"));          // 19

    fs.updateFile("/home/alice/todo.txt", "buy milk and eggs");  // 17
    System.out.println("size /home      -> " + fs.size("/home"));          // 28

    fs.move("/home/alice/docs", "/home/archive");
    System.out.println("ls /home        -> " + fs.list("/home"));          // [alice, archive]
    System.out.println("size /home/alice-> " + fs.size("/home/alice"));    // 17
    System.out.println("read            -> " + fs.readFile("/home/archive/notes.txt"));

    fs.delete("/home/archive");
    System.out.println("exists notes    -> " + fs.exists("/home/archive/notes.txt")); // false
    System.out.println("size /          -> " + fs.size("/"));              // 17

    try {
      fs.createFile("/missing/x.txt", "oops");
    } catch (FileSystemException e) {
      System.out.println("error: " + e.getMessage());
    }
  }
}
`

const ts = `// In-Memory File System — medium-level LLD interview reference (TypeScript)
// Single-threaded runtime, so no locking is needed.

class FileSystemError extends Error {}

abstract class FileSystemNode {
  parent: Directory | null = null
  constructor(public name: string) {}
  abstract getSize(): number
  abstract isDirectory(): boolean
}

class FileNode extends FileSystemNode {
  constructor(name: string, private content = '') {
    super(name)
  }

  getSize(): number { return this.content.length }
  isDirectory(): boolean { return false }
  read(): string { return this.content }
  write(content: string): void {
    this.content = content
    this.parent?.invalidateSize() // every ancestor's cached size is now stale
  }
}

class Directory extends FileSystemNode {
  private children = new Map<string, FileSystemNode>()
  private cachedSize: number | null = null

  isDirectory(): boolean { return true }
  getChild(name: string): FileSystemNode | undefined { return this.children.get(name) }

  addChild(node: FileSystemNode): void {
    if (this.children.has(node.name)) {
      throw new FileSystemError("'" + node.name + "' already exists")
    }
    this.children.set(node.name, node)
    node.parent = this
    this.invalidateSize()
  }

  removeChild(name: string): FileSystemNode {
    const node = this.children.get(name)!
    this.children.delete(name)
    node.parent = null
    this.invalidateSize()
    return node
  }

  listNames(): string[] { return [...this.children.keys()].sort() }

  getSize(): number {
    if (this.cachedSize === null) {
      let total = 0
      for (const c of this.children.values()) {
        total += c.getSize()
      }
      this.cachedSize = total
    }
    return this.cachedSize
  }

  invalidateSize(): void {
    for (let d: Directory | null = this; d !== null; d = d.parent) {
      d.cachedSize = null // O(depth)
    }
  }
}

// Absolute paths only ('/a/b/c.txt').

class FileSystem {
  private root = new Directory('')

  mkdir(path: string): void { // like 'mkdir -p'
    let node = this.root
    for (const seg of this.split(path)) {
      let child = node.getChild(seg)
      if (!child) {
        child = new Directory(seg)
        node.addChild(child)
      } else if (!child.isDirectory()) {
        throw new FileSystemError("'" + seg + "' is a file")
      }
      node = child as Directory
    }
  }

  createFile(path: string, content = ''): void {
    const [parent, name] = this.parentAndName(path)
    if (parent.getChild(name)) {
      throw new FileSystemError("'" + path + "' already exists")
    }
    parent.addChild(new FileNode(name, content))
  }

  readFile(path: string): string { return this.file(path).read() }
  updateFile(path: string, content: string): void { this.file(path).write(content) }

  // Deletes a file, or a directory with everything under it.
  delete(path: string): void {
    const node = this.resolve(path)
    if (!node.parent) {
      throw new FileSystemError('cannot delete the root')
    }
    node.parent.removeChild(node.name)
  }

  list(path: string): string[] {
    const node = this.resolve(path)
    return node instanceof Directory ? node.listNames() : [node.name]
  }

  // Rename/move: dst is the full new path and must not exist.
  move(src: string, dst: string): void {
    const node = this.resolve(src)
    if (!node.parent) {
      throw new FileSystemError('cannot move the root')
    }
    const [newParent, newName] = this.parentAndName(dst)
    if (newParent.getChild(newName)) {
      throw new FileSystemError("'" + dst + "' already exists")
    }

    for (let p: Directory | null = newParent; p !== null; p = p.parent) { // no moving a directory into itself
      if (p === node) {
        throw new FileSystemError('cannot move a directory into itself')
      }
    }
    node.parent.removeChild(node.name)
    node.name = newName
    newParent.addChild(node)
  }

  size(path: string): number { return this.resolve(path).getSize() }

  exists(path: string): boolean {
    try {
      this.resolve(path)
      return true
    } catch {
      return false
    }
  }

  // ---- path resolution: O(depth) ----

  private split(path: string): string[] {
    if (!path.startsWith('/')) {
      throw new FileSystemError('path must be absolute: ' + path)
    }
    const segments = path.split('/').filter(s => s.length > 0)
    if (segments.some(s => s === '.' || s === '..')) {
      throw new FileSystemError("'.' and '..' are not supported")
    }
    return segments
  }

  private resolve(path: string): FileSystemNode {
    let node: FileSystemNode = this.root
    for (const seg of this.split(path)) {
      if (!(node instanceof Directory)) {
        throw new FileSystemError('not a directory in path: ' + path)
      }
      const child = node.getChild(seg)
      if (!child) {
        throw new FileSystemError('no such file or directory: ' + path)
      }
      node = child
    }
    return node
  }

  private parentAndName(path: string): [Directory, string] {
    const segments = this.split(path)
    if (segments.length === 0) {
      throw new FileSystemError('path must name a file or directory')
    }
    const parent = this.resolve('/' + segments.slice(0, -1).join('/'))
    if (!(parent instanceof Directory)) {
      throw new FileSystemError('parent is not a directory: ' + path)
    }
    return [parent, segments[segments.length - 1]]
  }

  private file(path: string): FileNode {
    const node = this.resolve(path)
    if (!(node instanceof FileNode)) {
      throw new FileSystemError("'" + path + "' is a directory")
    }
    return node
  }
}

// Demo
const fs = new FileSystem()
fs.mkdir('/home/alice/docs')
fs.createFile('/home/alice/docs/notes.txt', 'hello world') // 11
fs.createFile('/home/alice/todo.txt', 'buy milk')          // 8
console.log('ls /home/alice  ->', fs.list('/home/alice'))  // [ 'docs', 'todo.txt' ]
console.log('size /home      ->', fs.size('/home'))        // 19

fs.updateFile('/home/alice/todo.txt', 'buy milk and eggs') // 17
console.log('size /home      ->', fs.size('/home'))        // 28

fs.move('/home/alice/docs', '/home/archive')
console.log('ls /home        ->', fs.list('/home'))        // [ 'alice', 'archive' ]
console.log('size /home/alice->', fs.size('/home/alice'))  // 17
console.log('read            ->', fs.readFile('/home/archive/notes.txt'))

fs.delete('/home/archive')
console.log('exists notes    ->', fs.exists('/home/archive/notes.txt')) // false
console.log('size /          ->', fs.size('/'))            // 17

try {
  fs.createFile('/missing/x.txt', 'oops')
} catch (e) {
  console.log('error:', (e as Error).message)
}

export { FileSystem, Directory, FileNode, FileSystemError }
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

// In-Memory File System — medium-level LLD interview reference (C++17)

class Directory;

class FileSystemNode {
public:
  string name;
  Directory* parent = nullptr;
  explicit FileSystemNode(string n) : name(move(n)) {}
  virtual ~FileSystemNode() = default;
  virtual long getSize() = 0;
  virtual bool isDirectory() const = 0;
};

class Directory : public FileSystemNode {
  map<string, unique_ptr<FileSystemNode>> children_;  // sorted names for listing
  long cachedSize_ = -1;                                             // -1 means "not computed"
public:
  using FileSystemNode::FileSystemNode;
  bool isDirectory() const override {
    return true;
  }

  FileSystemNode* getChild(const string& n) {
    auto it = children_.find(n);
    return it == children_.end() ? nullptr : it->second.get();
  }

  void addChild(unique_ptr<FileSystemNode> node) {
    if (children_.count(node->name)) {
      throw runtime_error("'" + node->name + "' already exists");
    }
    node->parent = this;
    string key = node->name;
    children_[key] = move(node);
    invalidateSize();
  }

  unique_ptr<FileSystemNode> removeChild(const string& n) {
    auto it = children_.find(n);
    unique_ptr<FileSystemNode> node = move(it->second);
    children_.erase(it);
    node->parent = nullptr;
    invalidateSize();
    return node;
  }

  vector<string> listNames() const {
    vector<string> out;
    for (auto& kv : children_) {
      out.push_back(kv.first);
    }
    return out;
  }

  long getSize() override {
    if (cachedSize_ < 0) {
      long total = 0;
      for (auto& kv : children_) {
        total += kv.second->getSize();
      }
      cachedSize_ = total;
    }
    return cachedSize_;
  }

  void invalidateSize() {
    for (Directory* d = this; d != nullptr; d = d->parent) {
      d->cachedSize_ = -1;  // O(depth)
    }
  }
};

class File : public FileSystemNode {
  string content_;
public:
  File(string n, string content) : FileSystemNode(move(n)), content_(move(content)) {}
  long getSize() override {
    return static_cast<long>(content_.size());
  }

  bool isDirectory() const override {
    return false;
  }

  const string& read() const {
    return content_;
  }

  void write(string content) {
    content_ = move(content);
    if (parent) {
      parent->invalidateSize();  // every ancestor's cached size is now stale
    }
  }
};

// Absolute paths only ("/a/b/c.txt"). Every public call holds one coarse lock.

class FileSystem {
  unique_ptr<Directory> root_ = make_unique<Directory>("");
  mutex mu_;

  static vector<string> split(const string& path) {
    if (path.empty() || path[0] != '/') {
      throw runtime_error("path must be absolute: " + path);
    }
    vector<string> segments;
    stringstream ss(path);
    string seg;
    while (getline(ss, seg, '/')) {
      if (seg.empty()) {
        continue;
      }
      if (seg == "." || seg == "..") {
        throw runtime_error("'.' and '..' are not supported");
      }
      segments.push_back(seg);
    }
    return segments;
  }

  FileSystemNode* resolveSegments(const vector<string>& segments, const string& path) {
    FileSystemNode* node = root_.get();
    for (auto& seg : segments) {
      if (!node->isDirectory()) {
        throw runtime_error("not a directory in path: " + path);
      }
      node = static_cast<Directory*>(node)->getChild(seg);
      if (!node) {
        throw runtime_error("no such file or directory: " + path);
      }
    }
    return node;
  }

  FileSystemNode* resolve(const string& path) {
    return resolveSegments(split(path), path);
  }

  pair<Directory*, string> parentAndName(const string& path) {
    auto segments = split(path);
    if (segments.empty()) {
      throw runtime_error("path must name a file or directory");
    }

    string name = segments.back();
    segments.pop_back();
    FileSystemNode* parent = resolveSegments(segments, path);
    if (!parent->isDirectory()) {
      throw runtime_error("parent is not a directory: " + path);
    }
    return {static_cast<Directory*>(parent), name};
  }

  File* file(const string& path) {
    FileSystemNode* node = resolve(path);
    if (node->isDirectory()) {
      throw runtime_error("'" + path + "' is a directory");
    }
    return static_cast<File*>(node);
  }

public:
  void mkdir(const string& path) {  // like "mkdir -p"
    lock_guard<mutex> lock(mu_);
    Directory* node = root_.get();
    for (auto& seg : split(path)) {
      FileSystemNode* child = node->getChild(seg);
      if (!child) {
        node->addChild(make_unique<Directory>(seg));
        child = node->getChild(seg);
      } else if (!child->isDirectory()) {
        throw runtime_error("'" + seg + "' is a file");
      }
      node = static_cast<Directory*>(child);
    }
  }

  void createFile(const string& path, const string& content = "") {
    lock_guard<mutex> lock(mu_);
    auto [parent, name] = parentAndName(path);
    if (parent->getChild(name)) {
      throw runtime_error("'" + path + "' already exists");
    }
    parent->addChild(make_unique<File>(name, content));
  }

  string readFile(const string& path) {
    lock_guard<mutex> lock(mu_);
    return file(path)->read();
  }

  void updateFile(const string& path, const string& content) {
    lock_guard<mutex> lock(mu_);
    file(path)->write(content);
  }

  // Deletes a file, or a directory with everything under it.
  void remove(const string& path) {
    lock_guard<mutex> lock(mu_);
    FileSystemNode* node = resolve(path);
    if (!node->parent) {
      throw runtime_error("cannot delete the root");
    }
    node->parent->removeChild(node->name);  // the returned unique_ptr is destroyed here
  }

  vector<string> list(const string& path) {
    lock_guard<mutex> lock(mu_);
    FileSystemNode* node = resolve(path);
    if (node->isDirectory()) {
      return static_cast<Directory*>(node)->listNames();
    }
    return {node->name};
  }

  // Rename/move: dst is the full new path and must not exist.
  void move(const string& src, const string& dst) {
    lock_guard<mutex> lock(mu_);
    FileSystemNode* node = resolve(src);
    if (!node->parent) {
      throw runtime_error("cannot move the root");
    }

    auto [newParent, newName] = parentAndName(dst);
    if (newParent->getChild(newName)) {
      throw runtime_error("'" + dst + "' already exists");
    }
    for (Directory* p = newParent; p != nullptr; p = p->parent)  // no moving a directory into itself
      if (p == node) {
        throw runtime_error("cannot move a directory into itself");
      }

    auto owned = node->parent->removeChild(node->name);
    owned->name = newName;
    newParent->addChild(move(owned));
  }

  long size(const string& path) {
    lock_guard<mutex> lock(mu_);
    return resolve(path)->getSize();
  }

  bool exists(const string& path) {
    lock_guard<mutex> lock(mu_);
    try {
      resolve(path);
      return true;
    } catch (const runtime_error&) {
      return false;
    }
  }
};

void print(const string& label, const vector<string>& names) {
  cout << label << " ->";
  for (auto& n : names) {
    cout << " " << n;
  }
  cout << endl;
}

int main() {
  FileSystem fs;
  fs.mkdir("/home/alice/docs");
  fs.createFile("/home/alice/docs/notes.txt", "hello world");  // 11
  fs.createFile("/home/alice/todo.txt", "buy milk");           // 8
  print("ls /home/alice", fs.list("/home/alice"));             // docs todo.txt
  cout << "size /home -> " << fs.size("/home") << endl;  // 19

  fs.updateFile("/home/alice/todo.txt", "buy milk and eggs");  // 17
  cout << "size /home -> " << fs.size("/home") << endl;  // 28

  fs.move("/home/alice/docs", "/home/archive");
  print("ls /home", fs.list("/home"));                         // alice archive
  cout << "size /home/alice -> " << fs.size("/home/alice") << endl;  // 17
  cout << "read -> " << fs.readFile("/home/archive/notes.txt") << endl;

  fs.remove("/home/archive");
  cout << "exists notes -> " << (fs.exists("/home/archive/notes.txt") ? "true" : "false") << endl;
  cout << "size / -> " << fs.size("/") << endl;      // 17

  try {
    fs.createFile("/missing/x.txt", "oops");
  } catch (const exception& e) {
    cout << "error: " << e.what() << endl;
  }
}
`

const goCode = `// In-Memory File System — medium-level LLD interview reference (Go)
package main

import (
  "errors"
  "fmt"
  "sort"
  "strings"
  "sync"
)

type Node interface {
  Name() string
  Size() int
  IsDir() bool
  parentDir() *Directory
  setParent(*Directory)
  rename(string)
}

type base struct {
  name   string
  parent *Directory
}

func (b *base) Name() string {
  return b.name
}

func (b *base) parentDir() *Directory {
  return b.parent
}

func (b *base) setParent(d *Directory) {
  b.parent = d
}

func (b *base) rename(n string) {
  b.name = n
}

type File struct {
  base
  content string
}

func NewFile(name, content string) *File { return &File{base: base{name: name}, content: content} }
func (f *File) Size() int {
  return len(f.content)
}

func (f *File) IsDir() bool {
  return false
}

func (f *File) Read() string {
  return f.content
}

func (f *File) Write(content string) {
  f.content = content
  if f.parent != nil {
    f.parent.invalidate() // every ancestor's cached size is now stale
  }
}

type Directory struct {
  base
  children map[string]Node
  cached   int // -1 means "not computed"
}

func NewDirectory(name string) *Directory {
  return &Directory{base: base{name: name}, children: map[string]Node{}, cached: -1}
}

func (d *Directory) IsDir() bool {
  return true
}

func (d *Directory) Child(name string) (Node, bool) {
  n, ok := d.children[name]
  return n, ok
}

func (d *Directory) Add(n Node) error {
  if _, ok := d.children[n.Name()]; ok {
    return fmt.Errorf("'%s' already exists", n.Name())
  }
  d.children[n.Name()] = n
  n.setParent(d)
  d.invalidate()
  return nil
}

func (d *Directory) Remove(name string) Node {
  n := d.children[name]
  delete(d.children, name)
  n.setParent(nil)
  d.invalidate()
  return n
}

func (d *Directory) Names() []string {
  names := make([]string, 0, len(d.children))
  for n := range d.children {
    names = append(names, n)
  }
  sort.Strings(names)
  return names
}

func (d *Directory) Size() int {
  if d.cached < 0 {
    total := 0
    for _, c := range d.children {
      total += c.Size()
    }
    d.cached = total
  }
  return d.cached
}

func (d *Directory) invalidate() {
  for cur := d; cur != nil; cur = cur.parent { // O(depth)
    cur.cached = -1
  }
}

// FileSystem supports absolute paths only ("/a/b/c.txt"). Every public call holds one coarse lock.

type FileSystem struct {
  mu   sync.Mutex
  root *Directory
}

func NewFileSystem() *FileSystem { return &FileSystem{root: NewDirectory("")} }

func split(path string) ([]string, error) {
  if !strings.HasPrefix(path, "/") {
    return nil, errors.New("path must be absolute: " + path)
  }
  var segments []string
  for _, s := range strings.Split(path, "/") {
    if s == "" {
      continue
    }
    if s == "." || s == ".." {
      return nil, errors.New("'.' and '..' are not supported")
    }
    segments = append(segments, s)
  }
  return segments, nil
}

func (fs *FileSystem) resolveSegments(segments []string, path string) (Node, error) {
  var node Node = fs.root
  for _, seg := range segments {
    dir, ok := node.(*Directory)
    if !ok {
      return nil, errors.New("not a directory in path: " + path)
    }
    child, found := dir.Child(seg)
    if !found {
      return nil, errors.New("no such file or directory: " + path)
    }
    node = child
  }
  return node, nil
}

func (fs *FileSystem) resolve(path string) (Node, error) {
  segments, err := split(path)
  if err != nil {
    return nil, err
  }
  return fs.resolveSegments(segments, path)
}

func (fs *FileSystem) parentAndName(path string) (*Directory, string, error) {
  segments, err := split(path)
  if err != nil {
    return nil, "", err
  }
  if len(segments) == 0 {
    return nil, "", errors.New("path must name a file or directory")
  }
  parent, err := fs.resolveSegments(segments[:len(segments)-1], path)
  if err != nil {
    return nil, "", err
  }
  dir, ok := parent.(*Directory)
  if !ok {
    return nil, "", errors.New("parent is not a directory: " + path)
  }
  return dir, segments[len(segments)-1], nil
}

func (fs *FileSystem) file(path string) (*File, error) {
  node, err := fs.resolve(path)
  if err != nil {
    return nil, err
  }
  f, ok := node.(*File)
  if !ok {
    return nil, fmt.Errorf("'%s' is a directory", path)
  }
  return f, nil
}

// Mkdir is like "mkdir -p": creates missing parents; fine if the directory already exists.
func (fs *FileSystem) Mkdir(path string) error {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  segments, err := split(path)
  if err != nil {
    return err
  }
  cur := fs.root
  for _, seg := range segments {
    child, ok := cur.Child(seg)
    if !ok {
      d := NewDirectory(seg)
      if err := cur.Add(d); err != nil {
        return err
      }
      cur = d
      continue
    }
    dir, isDir := child.(*Directory)
    if !isDir {
      return fmt.Errorf("'%s' is a file", seg)
    }
    cur = dir
  }
  return nil
}

func (fs *FileSystem) CreateFile(path, content string) error {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  parent, name, err := fs.parentAndName(path)
  if err != nil {
    return err
  }
  if _, exists := parent.Child(name); exists {
    return fmt.Errorf("'%s' already exists", path)
  }
  return parent.Add(NewFile(name, content))
}

func (fs *FileSystem) ReadFile(path string) (string, error) {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  f, err := fs.file(path)
  if err != nil {
    return "", err
  }
  return f.Read(), nil
}

func (fs *FileSystem) UpdateFile(path, content string) error {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  f, err := fs.file(path)
  if err != nil {
    return err
  }
  f.Write(content)
  return nil
}

// Delete removes a file, or a directory with everything under it.
func (fs *FileSystem) Delete(path string) error {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  node, err := fs.resolve(path)
  if err != nil {
    return err
  }
  parent := node.parentDir()
  if parent == nil {
    return errors.New("cannot delete the root")
  }
  parent.Remove(node.Name())
  return nil
}

func (fs *FileSystem) List(path string) ([]string, error) {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  node, err := fs.resolve(path)
  if err != nil {
    return nil, err
  }
  if dir, ok := node.(*Directory); ok {
    return dir.Names(), nil
  }
  return []string{node.Name()}, nil
}

// Move renames/moves: dst is the full new path and must not exist.
func (fs *FileSystem) Move(src, dst string) error {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  node, err := fs.resolve(src)
  if err != nil {
    return err
  }
  oldParent := node.parentDir()
  if oldParent == nil {
    return errors.New("cannot move the root")
  }
  newParent, newName, err := fs.parentAndName(dst)
  if err != nil {
    return err
  }
  if _, exists := newParent.Child(newName); exists {
    return fmt.Errorf("'%s' already exists", dst)
  }
  for p := newParent; p != nil; p = p.parent { // no moving a directory into itself
    if Node(p) == node {
      return errors.New("cannot move a directory into itself")
    }
  }
  oldParent.Remove(node.Name())
  node.rename(newName)
  return newParent.Add(node)
}

func (fs *FileSystem) Size(path string) (int, error) {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  node, err := fs.resolve(path)
  if err != nil {
    return 0, err
  }
  return node.Size(), nil
}

func (fs *FileSystem) Exists(path string) bool {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  _, err := fs.resolve(path)
  return err == nil
}

func must(err error) {
  if err != nil {
    panic(err)
  }
}

func main() {
  fs := NewFileSystem()
  must(fs.Mkdir("/home/alice/docs"))
  must(fs.CreateFile("/home/alice/docs/notes.txt", "hello world")) // 11
  must(fs.CreateFile("/home/alice/todo.txt", "buy milk"))          // 8
  names, _ := fs.List("/home/alice")
  fmt.Println("ls /home/alice  ->", names) // [docs todo.txt]
  n, _ := fs.Size("/home")
  fmt.Println("size /home      ->", n) // 19

  must(fs.UpdateFile("/home/alice/todo.txt", "buy milk and eggs")) // 17
  n, _ = fs.Size("/home")
  fmt.Println("size /home      ->", n) // 28

  must(fs.Move("/home/alice/docs", "/home/archive"))
  names, _ = fs.List("/home")
  fmt.Println("ls /home        ->", names) // [alice archive]
  n, _ = fs.Size("/home/alice")
  fmt.Println("size /home/alice->", n) // 17
  text, _ := fs.ReadFile("/home/archive/notes.txt")
  fmt.Println("read            ->", text)

  must(fs.Delete("/home/archive"))
  fmt.Println("exists notes    ->", fs.Exists("/home/archive/notes.txt")) // false
  n, _ = fs.Size("/")
  fmt.Println("size /          ->", n) // 17

  if err := fs.CreateFile("/missing/x.txt", "oops"); err != nil {
    fmt.Println("error:", err)
  }
}
`

const csharp = `// In-Memory File System — medium-level LLD interview reference (C# 10+)
using System;
using System.Collections.Generic;
using System.Linq;

public class FileSystemException : Exception {
  public FileSystemException(string message) : base(message) {}
}

public abstract class FileSystemNode {
  public string Name { get; set; }
  public Directory? Parent { get; set; }
  protected FileSystemNode(string name) {
    Name = name;
  }

  public abstract int GetSize();
  public abstract bool IsDirectory { get; }
}

public sealed class FileNode : FileSystemNode {
  private string _content;
  public FileNode(string name, string content) : base(name) {
    _content = content;
  }

  public override int GetSize() {
    return _content.Length;
  }

  public override bool IsDirectory => false;
  public string Read() {
    return _content;
  }

  public void Write(string content) {
    _content = content;
    Parent?.InvalidateSize(); // every ancestor's cached size is now stale
  }
}

public sealed class Directory : FileSystemNode {
  private readonly SortedDictionary<string, FileSystemNode> _children = new(StringComparer.Ordinal);
  private int? _cachedSize;

  public Directory(string name) : base(name) {}
  public override bool IsDirectory => true;

  public FileSystemNode? GetChild(string name) {
    return _children.GetValueOrDefault(name);
  }

  public void AddChild(FileSystemNode node) {
    if (_children.ContainsKey(node.Name)) {
      throw new FileSystemException("'" + node.Name + "' already exists");
    }
    _children[node.Name] = node;
    node.Parent = this;
    InvalidateSize();
  }

  public FileSystemNode RemoveChild(string name) {
    var node = _children[name];
    _children.Remove(name);
    node.Parent = null;
    InvalidateSize();
    return node;
  }

  public List<string> ListNames() {
    return _children.Keys.ToList();
  }

  public override int GetSize() {
    _cachedSize ??= _children.Values.Sum(c => c.GetSize());
    return _cachedSize.Value;
  }

  public void InvalidateSize() {
    for (Directory? d = this; d != null; d = d.Parent) {
      d._cachedSize = null; // O(depth)
    }
  }
}

// Absolute paths only ("/a/b/c.txt"). Every public call holds one coarse lock.
public sealed class FileSystem {
  private readonly Directory _root = new("");
  private readonly object _gate = new();

  public void Mkdir(string path) { // like "mkdir -p"
    lock (_gate) {
      var node = _root;
      foreach (var seg in Split(path)) {
        var child = node.GetChild(seg);
        if (child is null) {
          child = new Directory(seg);
          node.AddChild(child);
        } else if (!child.IsDirectory) {
          throw new FileSystemException("'" + seg + "' is a file");
        }
        node = (Directory)child;
      }
    }
  }

  public void CreateFile(string path, string content = "") {
    lock (_gate) {
      var (parent, name) = ParentAndName(path);
      if (parent.GetChild(name) {
        is not null) throw new FileSystemException("'" + path + "' already exists");
      }
      parent.AddChild(new FileNode(name, content));
    }
  }

  public string ReadFile(string path) {
    lock (_gate) return File(path).Read();
  }

  public void UpdateFile(string path, string content) {
    lock (_gate) File(path).Write(content);
  }

  /// <summary>Deletes a file, or a directory with everything under it.</summary>
  public void Delete(string path) {
    lock (_gate) {
      var node = Resolve(path);
      if (node.Parent is null) {
        throw new FileSystemException("cannot delete the root");
      }
      node.Parent.RemoveChild(node.Name);
    }
  }

  public List<string> List(string path) {
    lock (_gate) {
      var node = Resolve(path);
      return node is Directory d ? d.ListNames() : new List<string> { node.Name };
    }
  }

  /// <summary>Rename/move: dst is the full new path and must not exist.</summary>
  public void Move(string src, string dst) {
    lock (_gate) {
      var node = Resolve(src);
      if (node.Parent is null) {
        throw new FileSystemException("cannot move the root");
      }
      var (newParent, newName) = ParentAndName(dst);
      if (newParent.GetChild(newName) {
        is not null) throw new FileSystemException("'" + dst + "' already exists");
      }
      for (Directory? p = newParent; p != null; p = p.Parent) // no moving a directory into itself
        if (ReferenceEquals(p, node)) {
          throw new FileSystemException("cannot move a directory into itself");
        }
      node.Parent.RemoveChild(node.Name);
      node.Name = newName;
      newParent.AddChild(node);
    }
  }

  public int Size(string path) {
    lock (_gate) return Resolve(path).GetSize();
  }

  public bool Exists(string path) {
    lock (_gate) {
      try {
        Resolve(path); return true;
      }
      catch (FileSystemException) {
        return false;
      }
    }
  }

  // ---- path resolution: O(depth) ----

  private static List<string> Split(string path) {
    if (!path.StartsWith("/")) {
      throw new FileSystemException("path must be absolute: " + path);
    }
    var segments = path.Split('/', StringSplitOptions.RemoveEmptyEntries).ToList();
    if (segments.Any(s => s == "." || s == "..")) {
      throw new FileSystemException("'.' and '..' are not supported");
    }
    return segments;
  }

  private FileSystemNode Resolve(string path) {
    FileSystemNode node = _root;
    foreach (var seg in Split(path)) {
      if (node is not Directory dir) {
        throw new FileSystemException("not a directory in path: " + path);
      }
      node = dir.GetChild(seg) ?? throw new FileSystemException("no such file or directory: " + path);
    }
    return node;
  }

  private (Directory, string) ParentAndName(string path) {
    var segments = Split(path);
    if (segments.Count == 0) {
      throw new FileSystemException("path must name a file or directory");
    }
    var parent = Resolve("/" + string.Join("/", segments.Take(segments.Count - 1)));
    if (parent is not Directory dir) {
      throw new FileSystemException("parent is not a directory: " + path);
    }
    return (dir, segments[^1]);
  }

  private FileNode File(string path) {
    if (Resolve(path) {
      is not FileNode f) throw new FileSystemException("'" + path + "' is a directory");
    }
    return f;
  }
}

public static class Program {
  public static void Main() {
    var fs = new FileSystem();
    fs.Mkdir("/home/alice/docs");
    fs.CreateFile("/home/alice/docs/notes.txt", "hello world");   // 11
    fs.CreateFile("/home/alice/todo.txt", "buy milk");            // 8
    Console.WriteLine("ls /home/alice  -> [" + string.Join(", ", fs.List("/home/alice")) + "]"); // [docs, todo.txt]
    Console.WriteLine("size /home      -> " + fs.Size("/home"));  // 19

    fs.UpdateFile("/home/alice/todo.txt", "buy milk and eggs");   // 17
    Console.WriteLine("size /home      -> " + fs.Size("/home"));  // 28

    fs.Move("/home/alice/docs", "/home/archive");
    Console.WriteLine("ls /home        -> [" + string.Join(", ", fs.List("/home")) + "]");        // [alice, archive]
    Console.WriteLine("size /home/alice-> " + fs.Size("/home/alice"));                            // 17
    Console.WriteLine("read            -> " + fs.ReadFile("/home/archive/notes.txt"));

    fs.Delete("/home/archive");
    Console.WriteLine("exists notes    -> " + fs.Exists("/home/archive/notes.txt"));              // False
    Console.WriteLine("size /          -> " + fs.Size("/"));                                      // 17

    try {
      fs.CreateFile("/missing/x.txt", "oops");
    } catch (FileSystemException e) {
      Console.WriteLine("error: " + e.Message);
    }
  }
}
`

export const inMemoryFileSystemSolution: ProblemSolution = {
  slug: 'in-memory-file-system',
  title: 'Design an In-Memory File System — Complete LLD Guide',
  overview: {
    introduction: [
      'An in-memory file system is a tree of named things. Some of those things hold data (files), some hold other things (directories), and you navigate them with slash-separated paths. Every operating system, cloud drive, and IDE has one at its core, which makes this problem instantly familiar — and a perfect vehicle for one of the cleanest patterns in the Gang of Four catalog: Composite.',
      'In an interview, the question tests whether you can treat part and whole uniformly. The weak solution scatters if (isDirectory) checks across every method and quietly duplicates traversal logic. The strong solution defines a single FileSystemNode abstraction with File and Directory beneath it, so that “what is your size?” has one answer whether the node is a leaf or a subtree. From there the rest of the problem — resolving paths in O(depth), computing recursive sizes, moving subtrees — falls out almost for free.',
      'This tutorial follows the natural interview order: clarify the semantics of paths, delete, and move; identify the entities; recognize Composite; design path resolution as a walk down the tree; and then address the performance requirement of the problem — repeated directory-size queries — with a cache that is invalidated up the parent chain on any mutation. We implement the whole design in six languages with a demo that creates directories, writes files, moves a subtree, and deletes it.',
      'We stay inside the practice brief: create, read, update, and delete files; create and recursively delete directories; list contents; move or rename; compute recursive directory size; resolve absolute paths in O(depth). We do not add permissions, symbolic links, relative paths, timestamps, or disk persistence, but we show where each would plug in.',
    ],
    constraints: [
      'The file system is a tree with a single root directory “/”.',
      'Paths are absolute (“/a/b/c.txt”) and are resolved segment by segment: O(depth), not O(total nodes).',
      'Files hold content; directories hold named children; sibling names are unique within a directory.',
      'Deleting a directory removes everything beneath it.',
      'Directory size is the sum of all file sizes beneath it, and repeated queries should be fast.',
      'The structure must handle on the order of 100,000 files.',
    ],
    assumptions: [
      'File size is the number of characters in its content (a stand-in for bytes).',
      'mkdir behaves like “mkdir -p”: it creates missing intermediate directories and is a no-op if the directory exists.',
      'createFile requires the parent directory to exist and fails if the path already exists; updateFile requires an existing file.',
      'move takes a full destination path, fails if it already exists, and refuses to move a directory into itself or a descendant. This rename-style semantics avoids the “move into directory” ambiguity of the Unix mv command.',
      'Only absolute paths are supported; “.” and “..” segments are rejected.',
      'One coarse lock around every public operation keeps the tree consistent for concurrent callers.',
    ],
    clarificationQuestions: [
      {
        question: 'Do we need relative paths, “.” and “..”, or symbolic links?',
        why: 'They require a current-working-directory concept and cycle handling. Ruling them out keeps path resolution to a simple loop.',
      },
      {
        question: 'Should createFile create missing parent directories automatically?',
        why: 'It changes where failures happen. We make mkdir -p explicit and require parents to exist for files, mirroring most APIs.',
      },
      {
        question: 'What does delete do to a non-empty directory — fail, or remove recursively?',
        why: 'The brief says recursive. Confirm it, and note that in a real system you might require an explicit recursive flag.',
      },
      {
        question: 'When moving onto an existing path, overwrite, merge, or fail?',
        why: 'Overwrite and merge add significant complexity. Failing is simplest and safest for a first version.',
      },
      {
        question: 'How often is directory size queried compared to how often files change?',
        why: 'If reads dominate, caching sizes pays off. If writes dominate, recomputing each time may be fine. The answer justifies the invalidation design.',
      },
      {
        question: 'Is the file system accessed concurrently?',
        why: 'If yes, you need at least a coarse lock; a read-write lock is an upgrade when reads dominate.',
      },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'The first two minutes: restate and list the verbs',
        paragraphs: [
          'Restate: “A tree of files and directories addressed by absolute paths, with create, read, update, delete, list, move, and size operations.” The verbs are mkdir, create, read, update, delete, list, move, and size. They all take a path, so the first design question is really “how do I turn a path into a node?”',
          'Spend thirty seconds on the clarification questions, especially the semantics of delete and move. These are the places where interviewers deliberately leave the problem fuzzy to see whether you notice. Write your decisions on the board: mkdir -p, rename-style move, recursive delete.',
        ],
        callout: {
          title: 'Interview tip',
          body: 'Say “Composite” within the first few minutes and tie it to the requirement: “files and directories must answer getSize the same way, so they share a base type.” That one sentence is what the problem is designed to elicit.',
        },
      },
      {
        heading: 'From requirements to nouns',
        paragraphs: [
          'Underline the nouns: file system, file, directory, path, name, content, size, root. File and directory are clearly classes. “Path” is just a string we parse; making it a class is optional. “Root” is simply the top Directory. The file system itself is the façade that owns the root and exposes operations that take paths.',
          'Notice the shared properties: both files and directories have a name, a parent, and a size. That commonality is the signal to create a common abstraction.',
        ],
        numbered: [
          'Create the abstract FileSystemNode with name, parent, getSize, isDirectory.',
          'Create File (leaf) with content.',
          'Create Directory (composite) with a map of children.',
          'Create FileSystem (façade) that owns the root and resolves paths.',
        ],
      },
      {
        heading: 'Composite: treat the leaf and the tree the same',
        paragraphs: [
          'Composite means the client holds a reference to a node and does not care whether it is a single object or a group. Here, getSize is the textbook example. A File returns the length of its content. A Directory returns the sum of getSize over its children — and some of those children are directories, which recurse. No instanceof check appears in the size code.',
          'Where the two types must differ (read only makes sense for files, listNames only for directories), the FileSystem façade does one type check at the boundary and reports a clear error. The tree internals stay uniform.',
        ],
      },
      {
        heading: 'Path resolution in O(depth)',
        paragraphs: [
          'A path like /home/alice/todo.txt becomes the segment list [home, alice, todo.txt] after splitting on slash and discarding empty parts. Starting at the root, resolve looks up each segment in the current directory’s child map. Each lookup is O(1), so the total cost is O(depth), independent of how many other nodes exist. This directly satisfies the non-functional requirement and is the reason children are stored in a hash map, not a list.',
          'Most operations need either the node itself (read, delete, size, list) or its parent and final name (create, move). We implement two helpers: resolve(path) returns the node; parentAndName(path) resolves all but the last segment and returns the parent directory plus the final name. Every public method is a few lines on top of those two.',
        ],
      },
      {
        heading: 'Recursive size, and making it fast',
        paragraphs: [
          'Computing a directory’s size by walking its entire subtree is correct and simple, but repeated queries on a large tree are O(n) each. The hint in the problem suggests caching. Each directory stores an optional cachedSize. getSize returns the cache if present; otherwise it sums its children (which use their own caches) and stores the result.',
          'The hard part is invalidation. Any mutation — adding or removing a child, or writing to a file — changes the size of that node’s parent and every ancestor above it. So we walk up the parent chain clearing caches: O(depth). That is why every node keeps a parent pointer. The result is a classic trade: mutations cost O(depth) and repeated size queries cost O(1) until the next change.',
        ],
        callout: {
          title: 'Why invalidate instead of update?',
          body: 'Incrementally adjusting ancestor sizes by a delta is faster, but it is easy to get wrong during moves and overwrites. Invalidation is a one-liner that is obviously correct; mention the delta approach as the optimization if mutations dominate.',
        },
      },
      {
        heading: 'Move, delete, and the sharp edges',
        paragraphs: [
          'Move is detach-and-attach: remove the node from its old parent (invalidating that chain), rename it, and add it to the new parent (invalidating that chain). Because directories move as whole subtrees, a million-file directory moves in O(depth), not O(size). The two edge cases to defend are the destination already existing (we fail) and moving a directory into itself or a descendant — which would create a cycle and detach a branch from the tree. We detect it by walking from the destination parent up to the root and failing if we meet the node being moved.',
          'Delete is similar: find the node, refuse to delete the root, and remove it from its parent. In garbage-collected languages the subtree becomes unreachable and is reclaimed; in C++ the unique_ptr destructor frees it recursively.',
        ],
      },
      {
        heading: 'Step-by-step path to the final diagram',
        paragraphs: [
          'Draw FileSystemNode (abstract) at the top right with File and Directory under it. Add a composition arrow from Directory back to FileSystemNode labeled children with multiplicity 0..*. Draw FileSystem on the left owning a root Directory. Then walk through resolving /home/alice/todo.txt and updating it to show the cache invalidation.',
        ],
        numbered: [
          'Clarify path rules and delete/move semantics.',
          'Define the Composite: node, file, directory.',
          'Write resolve and parentAndName.',
          'Implement create, read, update, list.',
          'Implement getSize recursively, then add the cache and invalidation.',
          'Implement delete and move with the cycle check.',
        ],
      },
    ],
    entities: [
      { name: 'FileSystem', responsibility: 'Façade: owns the root, parses and resolves paths, enforces file-versus-directory rules, serializes access.', keyMembers: ['mkdir', 'createFile', 'move', 'size'] },
      { name: 'FileSystemNode', responsibility: 'Composite component: name, parent, size, type.', keyMembers: ['name', 'parent', 'getSize'] },
      { name: 'File', responsibility: 'Leaf holding content; its size is its length.', keyMembers: ['read', 'write'] },
      { name: 'Directory', responsibility: 'Composite holding named children and a cached recursive size.', keyMembers: ['getChild', 'addChild', 'removeChild', 'invalidateSize'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption:
    'The Composite: FileSystemNode is the shared abstraction; File is the leaf and Directory is the composite whose children are again FileSystemNodes (the self-referential composition edge). FileSystem is the façade that owns the root directory. Spacing follows the 340×260 grid so the two edges from Directory stay distinguishable.',
  designExplanation: {
    sections: [
      {
        heading: 'Architecture in one paragraph',
        paragraphs: [
          'Think of two layers. The bottom layer is the Composite tree: nodes know their parent, directories know their children, and getSize recurses uniformly. The top layer is the FileSystem façade: it turns path strings into nodes, enforces which operations are legal on which kind of node, and holds the lock. Nothing in the tree knows about paths, and nothing in the façade knows how sizes are computed.',
        ],
      },
      {
        heading: 'Why nodes keep a parent pointer',
        paragraphs: [
          'A parent pointer costs one reference per node and buys three things. First, cache invalidation can walk up without any path context. Second, delete and move can detach a node knowing only the node (find it once, then ask its parent to remove it). Third, the cycle check for move can walk from the destination up to the root. Without parent pointers, each of these would require re-resolving a path or maintaining extra indexes.',
          'The cost is that parent and children must stay consistent. We centralize that in Directory.addChild and removeChild, which are the only places that set or clear the parent field.',
        ],
      },
      {
        heading: 'Directory: children as a map',
        paragraphs: [
          'A map from name to node makes lookup O(1), enforces unique sibling names for free, and matches how paths are resolved. For listing we return the names sorted, which gives deterministic output: Java uses a TreeMap, C# a SortedDictionary, C++ a std::map, and the other languages sort on demand. If listing performance mattered more than lookup order, sort-on-demand is the alternative.',
        ],
      },
      {
        heading: 'The size cache lifecycle',
        paragraphs: [
          'A directory’s cache starts empty. The first getSize computes and stores the sum, which in turn populates caches in every subdirectory it visited. Any later getSize on that directory or any directory beneath it is O(1). Mutations clear the cache on the changed directory and all of its ancestors; siblings and unrelated subtrees keep theirs. That selective invalidation is why repeated queries after a small edit are cheap.',
          'The invariant we rely on is: if a directory’s cache is valid, then all of its descendants’ caches are valid and correct. Invalidation always runs bottom-up, so it never leaves a valid parent over an invalid child.',
        ],
      },
      {
        heading: 'What we deliberately did not do',
        paragraphs: [
          'We did not add permissions, ownership, timestamps, hard or soft links, relative paths, globbing, or persistence. We did not use a read-write lock, which would be the first upgrade if reads dominate. We did not store file content as bytes or chunk large files. Each of these is a clean extension: attributes live on FileSystemNode, links are a new node type, and a read-write lock replaces the coarse lock.',
        ],
      },
    ],
    classResponsibilities: [
      { name: 'FileSystem', responsibility: 'Path parsing, resolve, type checks at the boundary, coarse locking.', keyMembers: ['resolve', 'parentAndName', 'move'] },
      { name: 'FileSystemNode', responsibility: 'Common identity and tree linkage.', keyMembers: ['name', 'parent'] },
      { name: 'File', responsibility: 'Content storage; invalidates ancestor sizes on write.', keyMembers: ['write', 'getSize'] },
      { name: 'Directory', responsibility: 'Child map, uniqueness, size cache, invalidation.', keyMembers: ['addChild', 'removeChild', 'getSize', 'invalidateSize'] },
    ],
    patterns: [
      {
        name: 'Composite',
        why: 'Files and directories must be treated uniformly, especially for recursive operations like size.',
        howApplied: 'FileSystemNode is the component, File the leaf, Directory the composite whose children are FileSystemNodes.',
      },
      {
        name: 'Façade',
        why: 'Callers want path-based operations, not tree manipulation.',
        howApplied: 'FileSystem exposes mkdir, createFile, readFile, updateFile, delete, list, move, size, exists.',
      },
      {
        name: 'Proxy-style caching (lightweight)',
        why: 'Directory size is expensive to recompute and read far more often than it changes.',
        howApplied: 'Each Directory memoizes its size and invalidates it up the parent chain on mutation.',
      },
    ],
    decisions: [
      {
        decision: 'Children stored in a hash/tree map keyed by name.',
        rationale: 'O(1) or O(log n) lookup per segment makes path resolution O(depth).',
        alternativeRejected: 'A list of children scanned linearly, which makes resolution O(depth × fan-out).',
        tradeoff: 'Slightly more memory per directory.',
      },
      {
        decision: 'Cache directory size and invalidate up the parent chain.',
        rationale: 'Repeated size queries become O(1); mutations cost O(depth).',
        alternativeRejected: 'Recomputing every time, or maintaining incremental deltas (faster but error-prone during moves).',
        tradeoff: 'Parent pointers and a small invariant to maintain.',
      },
      {
        decision: 'Rename-style move with a fail-if-exists rule.',
        rationale: 'Avoids the ambiguity of “move into this directory” and the complexity of overwrite or merge.',
        alternativeRejected: 'Unix mv semantics where an existing directory destination means move inside it.',
        tradeoff: 'Callers wanting “move into” must construct the full path.',
      },
      {
        decision: 'One coarse lock in the façade.',
        rationale: 'Simple and correct: multi-step operations like move touch several nodes and caches.',
        alternativeRejected: 'Per-node locks, which risk deadlocks during moves, or a read-write lock (a good upgrade).',
        tradeoff: 'Readers block each other; acceptable for an in-memory interview version.',
      },
    ],
    solid: {
      paragraphs: [
        'Single Responsibility: nodes manage structure and size, FileSystem manages paths and policy. Path parsing never leaks into the tree.',
        'Open/Closed: a new node type such as a symbolic link extends FileSystemNode; existing code that calls getSize and walks children does not change.',
        'Liskov Substitution: any FileSystemNode can stand in where a node is expected; getSize works identically for leaves and composites.',
        'Interface Segregation: the node interface is tiny (name, parent, size, isDirectory). File-only operations like read stay on File.',
        'Dependency Inversion: Directory depends on the FileSystemNode abstraction, not on concrete File, which is what lets the tree nest arbitrarily.',
      ],
    },
    extensibility: [
      'Permissions and ownership: add fields to FileSystemNode and check them in the façade.',
      'Timestamps: update modified time inside File.write and Directory.addChild.',
      'Symbolic links: a new node type that resolves to another path, with cycle detection.',
      'Relative paths: add a current directory to a session object and resolve against it.',
      'Search (find/grep): a visitor over the tree.',
      'Persistence: serialize the tree with a visitor and rebuild it on startup.',
    ],
  },
  implementationIntro: [
    'Each implementation has FileSystemNode, File, Directory, and the FileSystem façade with mkdir, createFile, readFile, updateFile, delete, list, move, size, and exists. Names differ slightly where a language reserves them (the TypeScript file class is FileNode, C# uses FileNode, and the C++ delete operation is called remove). The demo builds a small tree, writes and updates files, checks directory sizes, moves a subtree, deletes it, and shows a rejected path.',
  ],
  implementations: {
    python: py,
    java,
    typescript: ts,
    cpp,
    go: goCode,
    csharp,
  },
  executionFlow: {
    narrative: [
      'mkdir("/home/alice/docs") splits the path into [home, alice, docs]. Starting at the root, each missing segment is created as a Directory and attached to its parent, so we end up with /home/alice/docs. createFile("/home/alice/docs/notes.txt", "hello world") resolves the parent (/home/alice/docs) and the final name, checks the name is free, and adds a File of size 11. A second file, /home/alice/todo.txt, adds 8 bytes.',
      'size("/home") walks the tree once: docs has 11, alice is 11 + 8 = 19, home is 19. Each directory stores its result. Updating todo.txt to “buy milk and eggs” writes the content and calls invalidateSize on alice, home, and the root; the next size("/home") recomputes only those and returns 28, reusing docs’s cache.',
      'move("/home/alice/docs", "/home/archive") resolves the source node, resolves the new parent (/home) and name (archive), checks it is free and that /home is not inside docs, then detaches docs from alice, renames it, and attaches it to home. Both parent chains are invalidated. Listing /home now shows [alice, archive], alice’s size is 17, and the notes file is readable under its new path. Finally delete("/home/archive") removes the subtree, exists on the old file path returns false, and the root size is 17.',
    ],
    steps: [
      'split(path): require a leading slash, drop empty segments, reject “.” and “..”.',
      'resolve(path): from the root, look up each segment in the current directory’s child map; fail if missing or if an intermediate node is a file.',
      'parentAndName(path): resolve all segments but the last; require the parent to be a directory.',
      'create / update / read: operate on the resolved node after a file-versus-directory check.',
      'getSize: files return length; directories return the cached or freshly computed sum.',
      'Any mutation calls invalidateSize on the affected directory, which clears caches up to the root.',
      'move: detach, rename, attach, with existence and cycle checks first.',
    ],
    examples: [
      {
        title: 'Recursive size with caching',
        input: 'files: docs/notes.txt (11), alice/todo.txt (8); size("/home") twice',
        output: '19 then 19 (second call O(1))',
        explanation: 'The first call fills caches for docs, alice, and home. The second reads home’s cache directly.',
      },
      {
        title: 'Update invalidates ancestors',
        input: 'updateFile("/home/alice/todo.txt", "buy milk and eggs"); size("/home")',
        output: '28',
        explanation: 'File.write clears caches on alice, home, and root. docs keeps its cache, so only the changed branch is recomputed.',
      },
      {
        title: 'Move a subtree',
        input: 'move("/home/alice/docs", "/home/archive")',
        output: 'ls /home → [alice, archive]; size("/home/alice") → 17',
        explanation: 'The directory is detached from alice and attached to home. Its children move with it unchanged; only two ancestor chains are invalidated.',
      },
      {
        title: 'Missing parent',
        input: 'createFile("/missing/x.txt", "oops")',
        output: 'Error: no such file or directory: /missing',
        explanation: 'parentAndName resolves /missing, which does not exist. No state changes.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you support relative paths and a current working directory?',
      answer: 'Introduce a Session (or Shell) object that holds a reference to the file system and a current Directory. Relative paths resolve starting from that directory instead of the root, and “.” and “..” segments are handled during resolution: “.” is skipped, “..” moves to the parent (stopping at the root). The tree itself does not change; only resolve gains a starting point.',
    },
    {
      question: 'How would you add symbolic links without infinite loops?',
      answer: 'Add a SymbolicLink node that stores a target path. When resolve meets a link in the middle of a path it follows it. To prevent cycles, count link traversals during a single resolution and fail past a limit (Linux uses 40), and make sure size computation does not follow links.',
    },
    {
      question: 'What if directory size queries are rare but writes are constant?',
      answer: 'Then caching adds overhead for little gain. Drop the cache and compute recursively on demand, or keep it but update ancestors incrementally by adding a delta instead of invalidating. Measure first; the right answer depends on the read-to-write ratio you clarified at the start.',
    },
    {
      question: 'How would you make this thread-safe with high read concurrency?',
      answer: 'Replace the coarse lock with a read-write lock: read, list, size, and exists take the read side; create, update, delete, move, and mkdir take the write side. Note that getSize mutates the cache, so either the cache needs its own synchronization or size must take the write lock. A simpler alternative is making cache fields atomic.',
    },
    {
      question: 'How would you implement find or grep?',
      answer: 'Use the Visitor pattern: define an accept method on FileSystemNode that calls visitFile or visitDirectory on a visitor. A FindVisitor collects nodes whose names match; a GrepVisitor scans file content. The Composite already provides the traversal structure, so the visitor adds behavior without touching node classes.',
    },
    {
      question: 'How would you persist the file system to disk?',
      answer: 'Serialize with a visitor that writes each node’s type, name, and content in a depth-first order, then rebuild by reading the stream and calling mkdir and createFile. For crash safety, write to a temporary file and rename it atomically, or use a write-ahead log of mutations.',
    },
    {
      question: 'Why use a map for children instead of a list?',
      answer: 'Path resolution looks up one name per segment. With a map that is O(1) (or O(log n) for a sorted map) per segment, giving O(depth) overall as required. A list would make each segment O(fan-out), and it would not enforce unique names.',
    },
    {
      question: 'How do you test this?',
      answer: 'Unit tests per operation with exact error cases (missing parent, duplicate name, directory versus file). Property-style tests for size: after any random sequence of creates, updates, moves, and deletes, the cached directory size equals a brute-force recursive sum. Add a move test that attempts to move a directory into itself and expects failure.',
    },
  ],
  extras: {
    edgeCases: {
      paragraphs: [
        'The tricky cases are paths and moves. Paths with trailing or doubled slashes should normalize to the same node. The root cannot be deleted or moved. Moving a directory into itself or a descendant must fail. Treating a file as a directory in the middle of a path (for example /a.txt/b) must fail clearly rather than crash.',
      ],
      bullets: [
        '“/” resolves to the root; “//a///b/” resolves like “/a/b”.',
        'createFile on an existing path fails; mkdir on an existing directory succeeds.',
        'mkdir through an existing file segment fails.',
        'move to the same path fails because the destination exists.',
        'Size of an empty directory is 0, and deleting a file reduces ancestor sizes on the next query.',
      ],
    },
    commonMistakes: {
      paragraphs: [
        'Typical mistakes: scattering isDirectory checks through every method instead of using polymorphism, scanning all nodes to resolve a path, forgetting to update or clear the parent pointer during move, invalidating only the immediate parent instead of every ancestor, allowing a directory to move into its own subtree, and caching size without invalidating after file writes. Another common one is deleting by name from the wrong parent after a rename.',
      ],
    },
    complexity: [
      'Path resolution: O(depth) map lookups.',
      'Create, read, update, delete, move: O(depth) for resolution plus O(depth) for cache invalidation.',
      'Directory size: O(1) when cached; O(n) over the affected subtree after invalidation, amortized across queries.',
      'List: O(k log k) for k children when sorting; O(k) with a sorted map.',
      'Memory: O(n) nodes plus one cached integer per directory.',
    ],
    testing: {
      paragraphs: [
        'Build helper functions that create small trees, and always compare cached size against a brute-force recomputation. Test error paths as thoroughly as success paths, since most bugs in file systems are in edge-case rejection.',
      ],
      numbered: [
        'Path parsing: leading slash required, empty segments ignored, “.” and “..” rejected.',
        'mkdir -p creates all missing parents; mkdir through a file fails.',
        'createFile fails for duplicate names and missing parents.',
        'update then size shows ancestor sizes change.',
        'move preserves subtree contents and sizes; move into itself fails; move onto existing fails.',
        'delete removes the subtree and reduces ancestor sizes; deleting the root fails.',
      ],
    },
    extensions: [
      'Relative paths and a working directory.',
      'Symbolic links with cycle protection.',
      'Permissions, ownership, and timestamps.',
      'Visitor-based search and traversal.',
      'Read-write locking and persistence.',
    ],
    takeaways: [
      'Composite lets files and directories answer getSize the same way, which removes type checks from the core.',
      'Store children in a map so path resolution is O(depth).',
      'Keep a parent pointer on every node to support invalidation, delete, and move.',
      'Cache directory size and invalidate up the ancestor chain on every mutation.',
      'Decide and state move and delete semantics up front; guard against moving a directory into itself.',
    ],
  },
}
