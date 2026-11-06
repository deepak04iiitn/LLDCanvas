import type { ProblemSolution } from '../types'
import { abstractCls, attr, cls, edge, enm, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('fs', 'InMemoryFileSystem', 40, 40, [
    attr('-', 'root', 'Directory'),
    attr('-', 'lock', 'ReentrantLock'),
  ], [
    method('+', 'mkdir', 'path, recursive = false', 'void'),
    method('+', 'createFile', 'path, content = ""', 'void'),
    method('+', 'readFile', 'path', 'string'),
    method('+', 'writeFile', 'path, content', 'void'),
    method('+', 'deleteFile', 'path', 'void'),
    method('+', 'rmdir', 'path, recursive = false', 'void'),
    method('+', 'list', 'path', 'List<string>'),
    method('+', 'move', 'src, dst', 'void'),
    method('+', 'size', 'path', 'long'),
    method('-', 'resolve', 'parts: List<string>', 'Node'),
  ], 'facade'),
  abstractCls('nd', 'FileSystemNode', 520, 40, [
    attr('#', 'name', 'string'),
    attr('#', 'parent', 'Directory?'),
  ], [
    method('+', 'size', '', 'long', { isAbstract: true }),
    method('+', 'isDirectory', '', 'bool', { isAbstract: true }),
    method('+', 'path', '', 'string'),
  ]),
  cls('fi', 'File', 400, 330, [
    attr('-', 'content', 'string'),
  ], [
    method('+', 'size', '', 'long'),
    method('+', 'read', '', 'string'),
    method('+', 'write', 'content', 'void'),
  ]),
  cls('di', 'Directory', 700, 330, [
    attr('-', 'children', 'Map<string, FileSystemNode>'),
  ], [
    method('+', 'size', '', 'long  // sum of children'),
    method('+', 'get', 'name', 'FileSystemNode?'),
    method('+', 'add', 'node', 'void'),
    method('+', 'remove', 'name', 'FileSystemNode'),
  ]),
  cls('pu', 'PathUtil', 40, 480, [], [
    method('+', 'split', 'path: string', 'List<string>', { isStatic: true }),
  ], 'utility'),
  enm('ec', 'FsErrorCode', 1000, 330, ['NOT_FOUND', 'ALREADY_EXISTS', 'NOT_A_DIRECTORY', 'IS_A_DIRECTORY', 'NOT_EMPTY', 'INVALID_PATH']),
  cls('er', 'FsError', 1000, 60, [
    attr('+', 'code', 'FsErrorCode'),
  ], [], 'exception'),
]

const edges = [
  edge('e1', 'fs', 'di', 'composition', 'right@70', 'left', { label: 'root', sourceMultiplicity: '1', targetMultiplicity: '1' }),
  edge('e2', 'fi', 'nd', 'inheritance', 'top', 'bottom@30'),
  edge('e3', 'di', 'nd', 'inheritance', 'top', 'bottom@70'),
  edge('e4', 'di', 'nd', 'composition', 'right', 'right', { label: 'children', sourceMultiplicity: '1', targetMultiplicity: '0..*' }),
  edge('e5', 'fs', 'pu', 'dependency', 'bottom', 'top', { label: 'parses with' }),
  edge('e6', 'fs', 'er', 'dependency', 'top', 'left', { label: 'throws' }),
  edge('e7', 'er', 'ec', 'association', 'bottom', 'top'),
]

const py = `from __future__ import annotations
from abc import ABC, abstractmethod
from threading import RLock
from typing import Dict, List, Optional


class FileSystemError(Exception):
    pass


class NotFoundError(FileSystemError):
    pass


class AlreadyExistsError(FileSystemError):
    pass


class NotADirectoryErr(FileSystemError):
    pass


class IsADirectoryErr(FileSystemError):
    pass


class DirectoryNotEmptyError(FileSystemError):
    pass


class InvalidPathError(FileSystemError):
    pass


class PathUtil:
    @staticmethod
    def split(path: str) -> List[str]:
        """Absolute path -> segments. Handles '//', '.', and '..' (clamped at root)."""
        if not path or not path.startswith("/"):
            raise InvalidPathError(f"path must be absolute: {path!r}")
        parts: List[str] = []
        for seg in path.split("/"):
            if seg in ("", "."):
                continue
            if seg == "..":
                if parts:
                    parts.pop()
                continue
            parts.append(seg)
        return parts


class FileSystemNode(ABC):
    def __init__(self, name: str, parent: Optional["Directory"] = None):
        self.name = name
        self.parent = parent

    @abstractmethod
    def size(self) -> int: ...

    @abstractmethod
    def is_directory(self) -> bool: ...

    def path(self) -> str:
        names: List[str] = []
        node: Optional[FileSystemNode] = self
        while node is not None and node.parent is not None:
            names.append(node.name)
            node = node.parent
        return "/" + "/".join(reversed(names))


class File(FileSystemNode):
    def __init__(self, name: str, parent: Optional["Directory"] = None, content: str = ""):
        super().__init__(name, parent)
        self.content = content

    def size(self) -> int:
        return len(self.content.encode("utf-8"))

    def is_directory(self) -> bool:
        return False


class Directory(FileSystemNode):
    def __init__(self, name: str, parent: Optional["Directory"] = None):
        super().__init__(name, parent)
        self.children: Dict[str, FileSystemNode] = {}

    def size(self) -> int:
        return sum(c.size() for c in self.children.values())  # recursive composite

    def is_directory(self) -> bool:
        return True

    def get(self, name: str) -> Optional[FileSystemNode]:
        return self.children.get(name)

    def add(self, node: FileSystemNode) -> None:
        node.parent = self
        self.children[node.name] = node

    def remove(self, name: str) -> FileSystemNode:
        node = self.children.pop(name)
        node.parent = None
        return node


class InMemoryFileSystem:
    """Facade over a Composite tree. Every operation walks the path in O(depth) dict lookups."""

    def __init__(self) -> None:
        self._root = Directory("")
        self._lock = RLock()

    # ---------- directories ----------
    def mkdir(self, path: str, recursive: bool = False) -> None:
        with self._lock:
            parts = PathUtil.split(path)
            if not parts:
                if recursive:
                    return
                raise AlreadyExistsError("/")
            cur = self._root
            for i, name in enumerate(parts):
                last = i == len(parts) - 1
                child = cur.get(name)
                if child is None:
                    if not last and not recursive:
                        raise NotFoundError(f"parent does not exist: {name}")
                    child = Directory(name)
                    cur.add(child)
                elif not child.is_directory():
                    raise NotADirectoryErr(child.path())
                elif last and not recursive:
                    raise AlreadyExistsError(child.path())
                cur = child  # type: ignore[assignment]

    def rmdir(self, path: str, recursive: bool = False) -> None:
        with self._lock:
            parts = PathUtil.split(path)
            if not parts:
                raise InvalidPathError("cannot remove root")
            node = self._resolve(parts)
            if not isinstance(node, Directory):
                raise NotADirectoryErr(path)
            if node.children and not recursive:
                raise DirectoryNotEmptyError(path)
            node.parent.remove(node.name)  # type: ignore[union-attr]  # detach the whole subtree

    def list(self, path: str = "/") -> List[str]:
        with self._lock:
            node = self._resolve(PathUtil.split(path))
            if isinstance(node, Directory):
                return sorted(node.children)
            return [node.name]

    # ---------- files ----------
    def create_file(self, path: str, content: str = "") -> None:
        with self._lock:
            parent, name = self._resolve_parent(path)
            if parent.get(name) is not None:
                raise AlreadyExistsError(path)
            parent.add(File(name, content=content))

    def read_file(self, path: str) -> str:
        with self._lock:
            return self._file(path).content

    def write_file(self, path: str, content: str) -> None:
        with self._lock:
            self._file(path).content = content

    def delete_file(self, path: str) -> None:
        with self._lock:
            f = self._file(path)
            f.parent.remove(f.name)  # type: ignore[union-attr]

    # ---------- move / rename / size ----------
    def move(self, src: str, dst: str) -> None:
        """Rename or move. If dst is an existing directory, src moves inside it."""
        with self._lock:
            sp, dp = PathUtil.split(src), PathUtil.split(dst)
            if not sp:
                raise InvalidPathError("cannot move root")
            node = self._resolve(sp)
            if sp == dp:
                return
            if dp[: len(sp)] == sp:
                raise InvalidPathError("cannot move a directory into itself")
            target = self._try_resolve(dp)
            if target is not None:
                if not isinstance(target, Directory):
                    raise AlreadyExistsError(dst)
                dest_parent, new_name = target, node.name
            else:
                dest_parent = self._as_dir(self._resolve(dp[:-1]), dst)
                new_name = dp[-1]
            if dest_parent is node.parent and new_name == node.name:
                return
            if dest_parent.get(new_name) is not None:
                raise AlreadyExistsError(f"{dest_parent.path().rstrip('/')}/{new_name}")
            node.parent.remove(node.name)  # type: ignore[union-attr]
            node.name = new_name
            dest_parent.add(node)

    def size(self, path: str) -> int:
        with self._lock:
            return self._resolve(PathUtil.split(path)).size()

    def exists(self, path: str) -> bool:
        with self._lock:
            return self._try_resolve(PathUtil.split(path)) is not None

    # ---------- helpers ----------
    def _try_resolve(self, parts: List[str]) -> Optional[FileSystemNode]:
        try:
            return self._resolve(parts)
        except NotFoundError:
            return None

    def _resolve(self, parts: List[str]) -> FileSystemNode:
        node: FileSystemNode = self._root
        for name in parts:  # O(depth)
            if not isinstance(node, Directory):
                raise NotADirectoryErr(node.path())
            nxt = node.get(name)
            if nxt is None:
                raise NotFoundError("/" + "/".join(parts))
            node = nxt
        return node

    def _resolve_parent(self, path: str):
        parts = PathUtil.split(path)
        if not parts:
            raise InvalidPathError("path refers to root")
        return self._as_dir(self._resolve(parts[:-1]), path), parts[-1]

    @staticmethod
    def _as_dir(node: FileSystemNode, path: str) -> Directory:
        if not isinstance(node, Directory):
            raise NotADirectoryErr(path)
        return node

    def _file(self, path: str) -> File:
        node = self._resolve(PathUtil.split(path))
        if not isinstance(node, File):
            raise IsADirectoryErr(path)
        return node


def demo() -> None:
    fs = InMemoryFileSystem()
    fs.mkdir("/home/alice/docs", recursive=True)
    fs.create_file("/home/alice/docs/a.txt", "hello")
    fs.create_file("/home/alice/b.txt", "world!")
    print(fs.list("/home/alice"))        # ['b.txt', 'docs']
    print(fs.size("/home"))              # 11
    fs.move("/home/alice/docs/a.txt", "/home/alice/a-renamed.txt")
    fs.move("/home/alice/b.txt", "/home/alice/docs")   # into directory
    print(fs.list("/home/alice"), fs.list("/home/alice/docs"))
    fs.rmdir("/home", recursive=True)
    print(fs.list("/"))


if __name__ == "__main__":
    demo()
`

const java = `import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

enum FsErrorCode { NOT_FOUND, ALREADY_EXISTS, NOT_A_DIRECTORY, IS_A_DIRECTORY, NOT_EMPTY, INVALID_PATH }

class FsError extends RuntimeException {
  final FsErrorCode code;
  FsError(FsErrorCode code, String message) { super(code + ": " + message); this.code = code; }
}

final class PathUtil {
  private PathUtil() {}
  /** Absolute path -> segments. Handles '//', '.', and '..' (clamped at root). */
  static List<String> split(String path) {
    if (path == null || !path.startsWith("/"))
      throw new FsError(FsErrorCode.INVALID_PATH, "path must be absolute: " + path);
    List<String> parts = new ArrayList<>();
    for (String seg : path.split("/")) {
      if (seg.isEmpty() || seg.equals(".")) continue;
      if (seg.equals("..")) { if (!parts.isEmpty()) parts.remove(parts.size() - 1); continue; }
      parts.add(seg);
    }
    return parts;
  }
}

abstract class FsNode {
  String name;
  Directory parent;
  FsNode(String name, Directory parent) { this.name = name; this.parent = parent; }
  abstract long size();
  abstract boolean isDirectory();
  String path() {
    Deque<String> names = new ArrayDeque<>();
    for (FsNode n = this; n != null && n.parent != null; n = n.parent) names.push(n.name);
    return "/" + String.join("/", names);
  }
}

final class File extends FsNode {
  private String content;
  File(String name, String content) { super(name, null); this.content = content; }
  String read() { return content; }
  void write(String c) { content = c; }
  @Override long size() { return content.getBytes(StandardCharsets.UTF_8).length; }
  @Override boolean isDirectory() { return false; }
}

final class Directory extends FsNode {
  final Map<String, FsNode> children = new HashMap<>();
  Directory(String name) { super(name, null); }
  @Override long size() { // recursive composite
    long total = 0;
    for (FsNode c : children.values()) total += c.size();
    return total;
  }
  @Override boolean isDirectory() { return true; }
  FsNode get(String name) { return children.get(name); }
  void add(FsNode n) { n.parent = this; children.put(n.name, n); }
  FsNode remove(String name) { FsNode n = children.remove(name); n.parent = null; return n; }
}

final class InMemoryFileSystem {
  private final Directory root = new Directory("");
  private final ReentrantLock lock = new ReentrantLock();

  void mkdir(String path, boolean recursive) {
    lock.lock();
    try {
      List<String> parts = PathUtil.split(path);
      if (parts.isEmpty()) {
        if (recursive) return;
        throw new FsError(FsErrorCode.ALREADY_EXISTS, "/");
      }
      Directory cur = root;
      for (int i = 0; i < parts.size(); i++) {
        String name = parts.get(i);
        boolean last = i == parts.size() - 1;
        FsNode child = cur.get(name);
        if (child == null) {
          if (!last && !recursive) throw new FsError(FsErrorCode.NOT_FOUND, "parent does not exist: " + name);
          child = new Directory(name);
          cur.add(child);
        } else if (!child.isDirectory()) {
          throw new FsError(FsErrorCode.NOT_A_DIRECTORY, child.path());
        } else if (last && !recursive) {
          throw new FsError(FsErrorCode.ALREADY_EXISTS, child.path());
        }
        cur = (Directory) child;
      }
    } finally { lock.unlock(); }
  }

  void rmdir(String path, boolean recursive) {
    lock.lock();
    try {
      List<String> parts = PathUtil.split(path);
      if (parts.isEmpty()) throw new FsError(FsErrorCode.INVALID_PATH, "cannot remove root");
      FsNode node = resolve(parts);
      if (!(node instanceof Directory d)) throw new FsError(FsErrorCode.NOT_A_DIRECTORY, path);
      if (!d.children.isEmpty() && !recursive) throw new FsError(FsErrorCode.NOT_EMPTY, path);
      d.parent.remove(d.name); // detaches the entire subtree in O(1)
    } finally { lock.unlock(); }
  }

  List<String> list(String path) {
    lock.lock();
    try {
      FsNode node = resolve(PathUtil.split(path));
      if (node instanceof Directory d) {
        List<String> names = new ArrayList<>(d.children.keySet());
        Collections.sort(names);
        return names;
      }
      return List.of(node.name);
    } finally { lock.unlock(); }
  }

  void createFile(String path, String content) {
    lock.lock();
    try {
      List<String> parts = PathUtil.split(path);
      if (parts.isEmpty()) throw new FsError(FsErrorCode.INVALID_PATH, "path refers to root");
      Directory parent = asDir(resolve(parts.subList(0, parts.size() - 1)), path);
      String name = parts.get(parts.size() - 1);
      if (parent.get(name) != null) throw new FsError(FsErrorCode.ALREADY_EXISTS, path);
      parent.add(new File(name, content));
    } finally { lock.unlock(); }
  }

  String readFile(String path) {
    lock.lock();
    try { return file(path).read(); } finally { lock.unlock(); }
  }

  void writeFile(String path, String content) {
    lock.lock();
    try { file(path).write(content); } finally { lock.unlock(); }
  }

  void deleteFile(String path) {
    lock.lock();
    try { File f = file(path); f.parent.remove(f.name); } finally { lock.unlock(); }
  }

  /** Rename or move. If dst is an existing directory, src moves inside it. */
  void move(String src, String dst) {
    lock.lock();
    try {
      List<String> sp = PathUtil.split(src), dp = PathUtil.split(dst);
      if (sp.isEmpty()) throw new FsError(FsErrorCode.INVALID_PATH, "cannot move root");
      FsNode node = resolve(sp);
      if (sp.equals(dp)) return;
      if (dp.size() >= sp.size() && dp.subList(0, sp.size()).equals(sp))
        throw new FsError(FsErrorCode.INVALID_PATH, "cannot move a directory into itself");
      FsNode target = tryResolve(dp);
      Directory destParent;
      String newName;
      if (target != null) {
        if (!(target instanceof Directory td)) throw new FsError(FsErrorCode.ALREADY_EXISTS, dst);
        destParent = td; newName = node.name;
      } else {
        destParent = asDir(resolve(dp.subList(0, dp.size() - 1)), dst);
        newName = dp.get(dp.size() - 1);
      }
      if (destParent == node.parent && newName.equals(node.name)) return;
      if (destParent.get(newName) != null) throw new FsError(FsErrorCode.ALREADY_EXISTS, newName);
      node.parent.remove(node.name);
      node.name = newName;
      destParent.add(node);
    } finally { lock.unlock(); }
  }

  long size(String path) {
    lock.lock();
    try { return resolve(PathUtil.split(path)).size(); } finally { lock.unlock(); }
  }

  boolean exists(String path) {
    lock.lock();
    try { return tryResolve(PathUtil.split(path)) != null; } finally { lock.unlock(); }
  }

  // ---- helpers (callers hold the lock) ----
  private FsNode tryResolve(List<String> parts) {
    try { return resolve(parts); }
    catch (FsError e) { if (e.code == FsErrorCode.NOT_FOUND) return null; throw e; }
  }

  private FsNode resolve(List<String> parts) { // O(depth)
    FsNode node = root;
    for (String name : parts) {
      if (!(node instanceof Directory d)) throw new FsError(FsErrorCode.NOT_A_DIRECTORY, node.path());
      FsNode next = d.get(name);
      if (next == null) throw new FsError(FsErrorCode.NOT_FOUND, "/" + String.join("/", parts));
      node = next;
    }
    return node;
  }

  private static Directory asDir(FsNode n, String path) {
    if (n instanceof Directory d) return d;
    throw new FsError(FsErrorCode.NOT_A_DIRECTORY, path);
  }

  private File file(String path) {
    FsNode n = resolve(PathUtil.split(path));
    if (n instanceof File f) return f;
    throw new FsError(FsErrorCode.IS_A_DIRECTORY, path);
  }
}
`

const ts = `type FsErrorCode =
  | 'NOT_FOUND' | 'ALREADY_EXISTS' | 'NOT_A_DIRECTORY' | 'IS_A_DIRECTORY' | 'NOT_EMPTY' | 'INVALID_PATH'

class FsError extends Error {
  constructor(public readonly code: FsErrorCode, message: string) { super(code + ': ' + message) }
}

const PathUtil = {
  /** Absolute path -> segments. Handles '//', '.', and '..' (clamped at root). */
  split(path: string): string[] {
    if (!path || !path.startsWith('/')) throw new FsError('INVALID_PATH', 'path must be absolute: ' + path)
    const parts: string[] = []
    for (const seg of path.split('/')) {
      if (seg === '' || seg === '.') continue
      if (seg === '..') { parts.pop(); continue }
      parts.push(seg)
    }
    return parts
  },
}

abstract class FileSystemNode {
  parent: Directory | null = null
  constructor(public name: string) {}
  abstract size(): number
  abstract isDirectory(): boolean
  path(): string {
    const names: string[] = []
    for (let n: FileSystemNode | null = this; n && n.parent; n = n.parent) names.unshift(n.name)
    return '/' + names.join('/')
  }
}

class File extends FileSystemNode {
  constructor(name: string, public content = '') { super(name) }
  size() { return new TextEncoder().encode(this.content).length }
  isDirectory() { return false }
}

class Directory extends FileSystemNode {
  readonly children = new Map<string, FileSystemNode>()
  size(): number { // recursive composite
    let total = 0
    for (const c of this.children.values()) total += c.size()
    return total
  }
  isDirectory() { return true }
  get(name: string) { return this.children.get(name) }
  add(node: FileSystemNode) { node.parent = this; this.children.set(node.name, node) }
  remove(name: string): FileSystemNode {
    const node = this.children.get(name)!
    this.children.delete(name)
    node.parent = null
    return node
  }
}

class InMemoryFileSystem {
  private root = new Directory('')

  mkdir(path: string, recursive = false): void {
    const parts = PathUtil.split(path)
    if (parts.length === 0) {
      if (recursive) return
      throw new FsError('ALREADY_EXISTS', '/')
    }
    let cur = this.root
    parts.forEach((name, i) => {
      const last = i === parts.length - 1
      let child = cur.get(name)
      if (!child) {
        if (!last && !recursive) throw new FsError('NOT_FOUND', 'parent does not exist: ' + name)
        child = new Directory(name)
        cur.add(child)
      } else if (!child.isDirectory()) {
        throw new FsError('NOT_A_DIRECTORY', child.path())
      } else if (last && !recursive) {
        throw new FsError('ALREADY_EXISTS', child.path())
      }
      cur = child as Directory
    })
  }

  rmdir(path: string, recursive = false): void {
    const parts = PathUtil.split(path)
    if (parts.length === 0) throw new FsError('INVALID_PATH', 'cannot remove root')
    const node = this.resolve(parts)
    if (!(node instanceof Directory)) throw new FsError('NOT_A_DIRECTORY', path)
    if (node.children.size > 0 && !recursive) throw new FsError('NOT_EMPTY', path)
    node.parent!.remove(node.name) // detaches the whole subtree in O(1)
  }

  list(path = '/'): string[] {
    const node = this.resolve(PathUtil.split(path))
    return node instanceof Directory ? [...node.children.keys()].sort() : [node.name]
  }

  createFile(path: string, content = ''): void {
    const [parent, name] = this.resolveParent(path)
    if (parent.get(name)) throw new FsError('ALREADY_EXISTS', path)
    parent.add(new File(name, content))
  }

  readFile(path: string): string { return this.file(path).content }
  writeFile(path: string, content: string): void { this.file(path).content = content }
  deleteFile(path: string): void { const f = this.file(path); f.parent!.remove(f.name) }

  /** Rename or move. If dst is an existing directory, src moves inside it. */
  move(src: string, dst: string): void {
    const sp = PathUtil.split(src)
    const dp = PathUtil.split(dst)
    if (sp.length === 0) throw new FsError('INVALID_PATH', 'cannot move root')
    const node = this.resolve(sp)
    if (sp.join('/') === dp.join('/')) return
    if (dp.length >= sp.length && sp.every((s, i) => s === dp[i])) {
      throw new FsError('INVALID_PATH', 'cannot move a directory into itself')
    }
    const target = this.tryResolve(dp)
    let destParent: Directory
    let newName: string
    if (target) {
      if (!(target instanceof Directory)) throw new FsError('ALREADY_EXISTS', dst)
      destParent = target
      newName = node.name
    } else {
      destParent = this.asDir(this.resolve(dp.slice(0, -1)), dst)
      newName = dp[dp.length - 1]
    }
    if (destParent === node.parent && newName === node.name) return
    if (destParent.get(newName)) throw new FsError('ALREADY_EXISTS', newName)
    node.parent!.remove(node.name)
    node.name = newName
    destParent.add(node)
  }

  size(path: string): number { return this.resolve(PathUtil.split(path)).size() }
  exists(path: string): boolean { return this.tryResolve(PathUtil.split(path)) !== null }

  private tryResolve(parts: string[]): FileSystemNode | null {
    try { return this.resolve(parts) }
    catch (e) { if (e instanceof FsError && e.code === 'NOT_FOUND') return null; throw e }
  }

  private resolve(parts: string[]): FileSystemNode { // O(depth)
    let node: FileSystemNode = this.root
    for (const name of parts) {
      if (!(node instanceof Directory)) throw new FsError('NOT_A_DIRECTORY', node.path())
      const next = node.get(name)
      if (!next) throw new FsError('NOT_FOUND', '/' + parts.join('/'))
      node = next
    }
    return node
  }

  private resolveParent(path: string): [Directory, string] {
    const parts = PathUtil.split(path)
    if (parts.length === 0) throw new FsError('INVALID_PATH', 'path refers to root')
    return [this.asDir(this.resolve(parts.slice(0, -1)), path), parts[parts.length - 1]]
  }

  private asDir(n: FileSystemNode, path: string): Directory {
    if (!(n instanceof Directory)) throw new FsError('NOT_A_DIRECTORY', path)
    return n
  }

  private file(path: string): File {
    const n = this.resolve(PathUtil.split(path))
    if (!(n instanceof File)) throw new FsError('IS_A_DIRECTORY', path)
    return n
  }
}

export { InMemoryFileSystem, FsError }
export type { FsErrorCode }
`

const cpp = `#include <algorithm>
#include <memory>
#include <mutex>
#include <stdexcept>
#include <string>
#include <unordered_map>
#include <vector>

enum class Code { NotFound, AlreadyExists, NotADirectory, IsADirectory, NotEmpty, InvalidPath };

struct FsError : std::runtime_error {
  Code code;
  FsError(Code c, const std::string& m) : std::runtime_error(m), code(c) {}
};

class Directory;

class Node {
public:
  Node(std::string n, Directory* p) : name(std::move(n)), parent(p) {}
  virtual ~Node() = default;
  virtual long long size() const = 0;
  virtual bool isDirectory() const = 0;
  std::string name;
  Directory* parent;
};

class File : public Node {
public:
  File(std::string n, std::string c) : Node(std::move(n), nullptr), content(std::move(c)) {}
  long long size() const override { return (long long)content.size(); }
  bool isDirectory() const override { return false; }
  std::string content;
};

class Directory : public Node {
public:
  explicit Directory(std::string n) : Node(std::move(n), nullptr) {}
  long long size() const override {  // recursive composite
    long long total = 0;
    for (const auto& kv : children) total += kv.second->size();
    return total;
  }
  bool isDirectory() const override { return true; }
  Node* get(const std::string& n) const {
    auto it = children.find(n);
    return it == children.end() ? nullptr : it->second.get();
  }
  void add(std::unique_ptr<Node> node) {
    node->parent = this;
    std::string key = node->name;
    children[key] = std::move(node);
  }
  std::unique_ptr<Node> remove(const std::string& n) {
    auto it = children.find(n);
    auto owned = std::move(it->second);
    children.erase(it);
    owned->parent = nullptr;
    return owned;
  }
  std::unordered_map<std::string, std::unique_ptr<Node>> children;
};

class PathUtil {
public:
  // Absolute path -> segments. Handles "//", ".", and ".." (clamped at root).
  static std::vector<std::string> split(const std::string& path) {
    if (path.empty() || path[0] != '/') throw FsError(Code::InvalidPath, "path must be absolute: " + path);
    std::vector<std::string> parts;
    std::string seg;
    auto flush = [&] {
      if (seg.empty() || seg == ".") {}
      else if (seg == "..") { if (!parts.empty()) parts.pop_back(); }
      else parts.push_back(seg);
      seg.clear();
    };
    for (char c : path) { if (c == '/') flush(); else seg += c; }
    flush();
    return parts;
  }
};

class InMemoryFileSystem {
  Directory root_{""};
  std::mutex mu_;

  Node* resolve(const std::vector<std::string>& parts) const {  // O(depth)
    Node* node = const_cast<Directory*>(&root_);
    for (const auto& name : parts) {
      if (!node->isDirectory()) throw FsError(Code::NotADirectory, name);
      Node* next = static_cast<Directory*>(node)->get(name);
      if (!next) throw FsError(Code::NotFound, "/" + name);
      node = next;
    }
    return node;
  }
  Node* tryResolve(const std::vector<std::string>& parts) const {
    try { return resolve(parts); }
    catch (const FsError& e) { if (e.code == Code::NotFound) return nullptr; throw; }
  }
  static Directory* asDir(Node* n, const std::string& path) {
    if (!n->isDirectory()) throw FsError(Code::NotADirectory, path);
    return static_cast<Directory*>(n);
  }
  static std::vector<std::string> parentOf(const std::vector<std::string>& p) {
    return {p.begin(), p.end() - 1};
  }
  File* file(const std::string& path) const {
    Node* n = resolve(PathUtil::split(path));
    if (n->isDirectory()) throw FsError(Code::IsADirectory, path);
    return static_cast<File*>(n);
  }

public:
  void mkdir(const std::string& path, bool recursive = false) {
    std::lock_guard<std::mutex> g(mu_);
    auto parts = PathUtil::split(path);
    if (parts.empty()) {
      if (recursive) return;
      throw FsError(Code::AlreadyExists, "/");
    }
    Directory* cur = &root_;
    for (size_t i = 0; i < parts.size(); ++i) {
      bool last = i + 1 == parts.size();
      Node* child = cur->get(parts[i]);
      if (!child) {
        if (!last && !recursive) throw FsError(Code::NotFound, "parent does not exist: " + parts[i]);
        auto dir = std::make_unique<Directory>(parts[i]);
        child = dir.get();
        cur->add(std::move(dir));
      } else if (!child->isDirectory()) {
        throw FsError(Code::NotADirectory, parts[i]);
      } else if (last && !recursive) {
        throw FsError(Code::AlreadyExists, path);
      }
      cur = static_cast<Directory*>(child);
    }
  }

  void rmdir(const std::string& path, bool recursive = false) {
    std::lock_guard<std::mutex> g(mu_);
    auto parts = PathUtil::split(path);
    if (parts.empty()) throw FsError(Code::InvalidPath, "cannot remove root");
    Directory* d = asDir(resolve(parts), path);
    if (!d->children.empty() && !recursive) throw FsError(Code::NotEmpty, path);
    d->parent->remove(d->name);  // unique_ptr frees the entire subtree
  }

  std::vector<std::string> list(const std::string& path = "/") {
    std::lock_guard<std::mutex> g(mu_);
    Node* n = resolve(PathUtil::split(path));
    if (!n->isDirectory()) return {n->name};
    std::vector<std::string> out;
    for (const auto& kv : static_cast<Directory*>(n)->children) out.push_back(kv.first);
    std::sort(out.begin(), out.end());
    return out;
  }

  void createFile(const std::string& path, const std::string& content = "") {
    std::lock_guard<std::mutex> g(mu_);
    auto parts = PathUtil::split(path);
    if (parts.empty()) throw FsError(Code::InvalidPath, "path refers to root");
    Directory* parent = asDir(resolve(parentOf(parts)), path);
    if (parent->get(parts.back())) throw FsError(Code::AlreadyExists, path);
    parent->add(std::make_unique<File>(parts.back(), content));
  }

  std::string readFile(const std::string& path) {
    std::lock_guard<std::mutex> g(mu_); return file(path)->content;
  }
  void writeFile(const std::string& path, const std::string& content) {
    std::lock_guard<std::mutex> g(mu_); file(path)->content = content;
  }
  void deleteFile(const std::string& path) {
    std::lock_guard<std::mutex> g(mu_);
    File* f = file(path);
    f->parent->remove(f->name);
  }

  // Rename or move. If dst is an existing directory, src moves inside it.
  void move(const std::string& src, const std::string& dst) {
    std::lock_guard<std::mutex> g(mu_);
    auto sp = PathUtil::split(src), dp = PathUtil::split(dst);
    if (sp.empty()) throw FsError(Code::InvalidPath, "cannot move root");
    Node* node = resolve(sp);
    if (sp == dp) return;
    if (dp.size() >= sp.size() && std::equal(sp.begin(), sp.end(), dp.begin()))
      throw FsError(Code::InvalidPath, "cannot move a directory into itself");
    Node* target = tryResolve(dp);
    Directory* destParent; std::string newName;
    if (target) {
      if (!target->isDirectory()) throw FsError(Code::AlreadyExists, dst);
      destParent = static_cast<Directory*>(target); newName = node->name;
    } else {
      destParent = asDir(resolve(parentOf(dp)), dst); newName = dp.back();
    }
    if (destParent == node->parent && newName == node->name) return;
    if (destParent->get(newName)) throw FsError(Code::AlreadyExists, newName);
    auto owned = node->parent->remove(node->name);
    owned->name = newName;
    destParent->add(std::move(owned));
  }

  long long size(const std::string& path) {
    std::lock_guard<std::mutex> g(mu_); return resolve(PathUtil::split(path))->size();
  }
  bool exists(const std::string& path) {
    std::lock_guard<std::mutex> g(mu_); return tryResolve(PathUtil::split(path)) != nullptr;
  }
};
`

const goCode = `package memfs

import (
  "errors"
  "fmt"
  "sort"
  "strings"
  "sync"
)

var (
  ErrNotFound      = errors.New("not found")
  ErrAlreadyExists = errors.New("already exists")
  ErrNotADir       = errors.New("not a directory")
  ErrIsADir        = errors.New("is a directory")
  ErrNotEmpty      = errors.New("directory not empty")
  ErrInvalidPath   = errors.New("invalid path")
)

func fail(err error, detail string) error { return fmt.Errorf("%w: %s", err, detail) }

// SplitPath: absolute path -> segments. Handles "//", ".", and ".." (clamped at root).
func SplitPath(p string) ([]string, error) {
  if !strings.HasPrefix(p, "/") {
    return nil, fail(ErrInvalidPath, "path must be absolute: "+p)
  }
  var parts []string
  for _, seg := range strings.Split(p, "/") {
    switch seg {
    case "", ".":
    case "..":
      if len(parts) > 0 {
        parts = parts[:len(parts)-1]
      }
    default:
      parts = append(parts, seg)
    }
  }
  return parts, nil
}

type nodeBase struct {
  name   string
  parent *Directory
}

func (n *nodeBase) base() *nodeBase { return n }
func (n *nodeBase) Name() string    { return n.name }

// Node is the Composite interface implemented by *File and *Directory.
type Node interface {
  Name() string
  Size() int64
  IsDir() bool
  base() *nodeBase
}

type File struct {
  nodeBase
  content string
}

func (f *File) Size() int64 { return int64(len(f.content)) }
func (f *File) IsDir() bool { return false }

type Directory struct {
  nodeBase
  children map[string]Node
}

func newDir(name string) *Directory {
  return &Directory{nodeBase: nodeBase{name: name}, children: map[string]Node{}}
}

func (d *Directory) IsDir() bool { return true }

// Size is the recursive composite sum.
func (d *Directory) Size() int64 {
  var total int64
  for _, c := range d.children {
    total += c.Size()
  }
  return total
}

func (d *Directory) add(n Node) {
  b := n.base()
  b.parent = d
  d.children[b.name] = n
}

func (d *Directory) remove(name string) Node {
  n := d.children[name]
  delete(d.children, name)
  n.base().parent = nil
  return n
}

type InMemoryFileSystem struct {
  mu   sync.Mutex
  root *Directory
}

func New() *InMemoryFileSystem { return &InMemoryFileSystem{root: newDir("")} }

func (fs *InMemoryFileSystem) resolve(parts []string) (Node, error) { // O(depth)
  var node Node = fs.root
  for _, name := range parts {
    d, ok := node.(*Directory)
    if !ok {
      return nil, fail(ErrNotADir, node.Name())
    }
    next, ok := d.children[name]
    if !ok {
      return nil, fail(ErrNotFound, "/"+strings.Join(parts, "/"))
    }
    node = next
  }
  return node, nil
}

func (fs *InMemoryFileSystem) tryResolve(parts []string) (Node, error) {
  n, err := fs.resolve(parts)
  if errors.Is(err, ErrNotFound) {
    return nil, nil
  }
  return n, err
}

func (fs *InMemoryFileSystem) dirAt(parts []string, path string) (*Directory, error) {
  n, err := fs.resolve(parts)
  if err != nil {
    return nil, err
  }
  d, ok := n.(*Directory)
  if !ok {
    return nil, fail(ErrNotADir, path)
  }
  return d, nil
}

func (fs *InMemoryFileSystem) fileAt(path string) (*File, error) {
  parts, err := SplitPath(path)
  if err != nil {
    return nil, err
  }
  n, err := fs.resolve(parts)
  if err != nil {
    return nil, err
  }
  f, ok := n.(*File)
  if !ok {
    return nil, fail(ErrIsADir, path)
  }
  return f, nil
}

func (fs *InMemoryFileSystem) Mkdir(path string, recursive bool) error {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  parts, err := SplitPath(path)
  if err != nil {
    return err
  }
  if len(parts) == 0 {
    if recursive {
      return nil
    }
    return fail(ErrAlreadyExists, "/")
  }
  cur := fs.root
  for i, name := range parts {
    last := i == len(parts)-1
    child, exists := cur.children[name]
    switch {
    case !exists:
      if !last && !recursive {
        return fail(ErrNotFound, "parent does not exist: "+name)
      }
      d := newDir(name)
      cur.add(d)
      cur = d
    default:
      d, ok := child.(*Directory)
      if !ok {
        return fail(ErrNotADir, name)
      }
      if last && !recursive {
        return fail(ErrAlreadyExists, path)
      }
      cur = d
    }
  }
  return nil
}

func (fs *InMemoryFileSystem) Rmdir(path string, recursive bool) error {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  parts, err := SplitPath(path)
  if err != nil {
    return err
  }
  if len(parts) == 0 {
    return fail(ErrInvalidPath, "cannot remove root")
  }
  d, err := fs.dirAt(parts, path)
  if err != nil {
    return err
  }
  if len(d.children) > 0 && !recursive {
    return fail(ErrNotEmpty, path)
  }
  d.parent.remove(d.name) // GC reclaims the whole subtree
  return nil
}

func (fs *InMemoryFileSystem) List(path string) ([]string, error) {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  parts, err := SplitPath(path)
  if err != nil {
    return nil, err
  }
  n, err := fs.resolve(parts)
  if err != nil {
    return nil, err
  }
  d, ok := n.(*Directory)
  if !ok {
    return []string{n.Name()}, nil
  }
  names := make([]string, 0, len(d.children))
  for k := range d.children {
    names = append(names, k)
  }
  sort.Strings(names)
  return names, nil
}

func (fs *InMemoryFileSystem) CreateFile(path, content string) error {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  parts, err := SplitPath(path)
  if err != nil {
    return err
  }
  if len(parts) == 0 {
    return fail(ErrInvalidPath, "path refers to root")
  }
  parent, err := fs.dirAt(parts[:len(parts)-1], path)
  if err != nil {
    return err
  }
  name := parts[len(parts)-1]
  if _, exists := parent.children[name]; exists {
    return fail(ErrAlreadyExists, path)
  }
  parent.add(&File{nodeBase: nodeBase{name: name}, content: content})
  return nil
}

func (fs *InMemoryFileSystem) ReadFile(path string) (string, error) {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  f, err := fs.fileAt(path)
  if err != nil {
    return "", err
  }
  return f.content, nil
}

func (fs *InMemoryFileSystem) WriteFile(path, content string) error {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  f, err := fs.fileAt(path)
  if err != nil {
    return err
  }
  f.content = content
  return nil
}

func (fs *InMemoryFileSystem) DeleteFile(path string) error {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  f, err := fs.fileAt(path)
  if err != nil {
    return err
  }
  f.parent.remove(f.name)
  return nil
}

// Move renames or moves. If dst is an existing directory, src moves inside it.
func (fs *InMemoryFileSystem) Move(src, dst string) error {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  sp, err := SplitPath(src)
  if err != nil {
    return err
  }
  dp, err := SplitPath(dst)
  if err != nil {
    return err
  }
  if len(sp) == 0 {
    return fail(ErrInvalidPath, "cannot move root")
  }
  node, err := fs.resolve(sp)
  if err != nil {
    return err
  }
  if strings.Join(sp, "/") == strings.Join(dp, "/") {
    return nil
  }
  if len(dp) >= len(sp) && strings.Join(dp[:len(sp)], "/") == strings.Join(sp, "/") {
    return fail(ErrInvalidPath, "cannot move a directory into itself")
  }
  target, err := fs.tryResolve(dp)
  if err != nil {
    return err
  }
  var destParent *Directory
  var newName string
  if target != nil {
    td, ok := target.(*Directory)
    if !ok {
      return fail(ErrAlreadyExists, dst)
    }
    destParent, newName = td, node.Name()
  } else {
    destParent, err = fs.dirAt(dp[:len(dp)-1], dst)
    if err != nil {
      return err
    }
    newName = dp[len(dp)-1]
  }
  b := node.base()
  if destParent == b.parent && newName == b.name {
    return nil
  }
  if _, exists := destParent.children[newName]; exists {
    return fail(ErrAlreadyExists, newName)
  }
  b.parent.remove(b.name)
  b.name = newName
  destParent.add(node)
  return nil
}

func (fs *InMemoryFileSystem) Size(path string) (int64, error) {
  fs.mu.Lock()
  defer fs.mu.Unlock()
  parts, err := SplitPath(path)
  if err != nil {
    return 0, err
  }
  n, err := fs.resolve(parts)
  if err != nil {
    return 0, err
  }
  return n.Size(), nil
}
`

const csharp = `using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

public enum FsErrorCode { NotFound, AlreadyExists, NotADirectory, IsADirectory, NotEmpty, InvalidPath }

public sealed class FsException : Exception {
  public FsErrorCode Code { get; }
  public FsException(FsErrorCode code, string message) : base($"{code}: {message}") { Code = code; }
}

public static class PathUtil {
  // Absolute path -> segments. Handles "//", ".", and ".." (clamped at root).
  public static List<string> Split(string path) {
    if (string.IsNullOrEmpty(path) || path[0] != '/')
      throw new FsException(FsErrorCode.InvalidPath, "path must be absolute: " + path);
    var parts = new List<string>();
    foreach (var seg in path.Split('/')) {
      if (seg.Length == 0 || seg == ".") continue;
      if (seg == "..") { if (parts.Count > 0) parts.RemoveAt(parts.Count - 1); continue; }
      parts.Add(seg);
    }
    return parts;
  }
}

public abstract class FileSystemNode {
  public string Name { get; internal set; }
  public Directory? Parent { get; internal set; }
  protected FileSystemNode(string name) { Name = name; }
  public abstract long Size();
  public abstract bool IsDirectory { get; }
  public string Path() {
    var names = new List<string>();
    for (FileSystemNode? n = this; n is not null && n.Parent is not null; n = n.Parent) names.Insert(0, n.Name);
    return "/" + string.Join("/", names);
  }
}

public sealed class File : FileSystemNode {
  public string Content { get; set; }
  public File(string name, string content) : base(name) { Content = content; }
  public override long Size() => Encoding.UTF8.GetByteCount(Content);
  public override bool IsDirectory => false;
}

public sealed class Directory : FileSystemNode {
  public Dictionary<string, FileSystemNode> Children { get; } = new();
  public Directory(string name) : base(name) {}
  public override long Size() => Children.Values.Sum(c => c.Size()); // recursive composite
  public override bool IsDirectory => true;
  public FileSystemNode? Get(string name) => Children.GetValueOrDefault(name);
  public void Add(FileSystemNode n) { n.Parent = this; Children[n.Name] = n; }
  public FileSystemNode Remove(string name) {
    var n = Children[name];
    Children.Remove(name);
    n.Parent = null;
    return n;
  }
}

public sealed class InMemoryFileSystem {
  readonly Directory _root = new("");
  readonly object _gate = new();

  public void Mkdir(string path, bool recursive = false) {
    lock (_gate) {
      var parts = PathUtil.Split(path);
      if (parts.Count == 0) {
        if (recursive) return;
        throw new FsException(FsErrorCode.AlreadyExists, "/");
      }
      var cur = _root;
      for (int i = 0; i < parts.Count; i++) {
        bool last = i == parts.Count - 1;
        var child = cur.Get(parts[i]);
        if (child is null) {
          if (!last && !recursive) throw new FsException(FsErrorCode.NotFound, "parent does not exist: " + parts[i]);
          child = new Directory(parts[i]);
          cur.Add(child);
        } else if (!child.IsDirectory) {
          throw new FsException(FsErrorCode.NotADirectory, child.Path());
        } else if (last && !recursive) {
          throw new FsException(FsErrorCode.AlreadyExists, child.Path());
        }
        cur = (Directory)child;
      }
    }
  }

  public void Rmdir(string path, bool recursive = false) {
    lock (_gate) {
      var parts = PathUtil.Split(path);
      if (parts.Count == 0) throw new FsException(FsErrorCode.InvalidPath, "cannot remove root");
      var d = AsDir(Resolve(parts), path);
      if (d.Children.Count > 0 && !recursive) throw new FsException(FsErrorCode.NotEmpty, path);
      d.Parent!.Remove(d.Name); // detaches the whole subtree
    }
  }

  public IReadOnlyList<string> List(string path = "/") {
    lock (_gate) {
      var node = Resolve(PathUtil.Split(path));
      return node is Directory d
        ? d.Children.Keys.OrderBy(k => k, StringComparer.Ordinal).ToList()
        : new List<string> { node.Name };
    }
  }

  public void CreateFile(string path, string content = "") {
    lock (_gate) {
      var parts = PathUtil.Split(path);
      if (parts.Count == 0) throw new FsException(FsErrorCode.InvalidPath, "path refers to root");
      var parent = AsDir(Resolve(parts.Take(parts.Count - 1).ToList()), path);
      var name = parts[^1];
      if (parent.Get(name) is not null) throw new FsException(FsErrorCode.AlreadyExists, path);
      parent.Add(new File(name, content));
    }
  }

  public string ReadFile(string path) { lock (_gate) return FileAt(path).Content; }
  public void WriteFile(string path, string content) { lock (_gate) FileAt(path).Content = content; }
  public void DeleteFile(string path) { lock (_gate) { var f = FileAt(path); f.Parent!.Remove(f.Name); } }

  // Rename or move. If dst is an existing directory, src moves inside it.
  public void Move(string src, string dst) {
    lock (_gate) {
      var sp = PathUtil.Split(src);
      var dp = PathUtil.Split(dst);
      if (sp.Count == 0) throw new FsException(FsErrorCode.InvalidPath, "cannot move root");
      var node = Resolve(sp);
      if (sp.SequenceEqual(dp)) return;
      if (dp.Count >= sp.Count && dp.Take(sp.Count).SequenceEqual(sp))
        throw new FsException(FsErrorCode.InvalidPath, "cannot move a directory into itself");
      var target = TryResolve(dp);
      Directory destParent;
      string newName;
      if (target is not null) {
        if (target is not Directory td) throw new FsException(FsErrorCode.AlreadyExists, dst);
        destParent = td; newName = node.Name;
      } else {
        destParent = AsDir(Resolve(dp.Take(dp.Count - 1).ToList()), dst);
        newName = dp[^1];
      }
      if (ReferenceEquals(destParent, node.Parent) && newName == node.Name) return;
      if (destParent.Get(newName) is not null) throw new FsException(FsErrorCode.AlreadyExists, newName);
      node.Parent!.Remove(node.Name);
      node.Name = newName;
      destParent.Add(node);
    }
  }

  public long Size(string path) { lock (_gate) return Resolve(PathUtil.Split(path)).Size(); }
  public bool Exists(string path) { lock (_gate) return TryResolve(PathUtil.Split(path)) is not null; }

  // ---- helpers (callers hold the lock) ----
  FileSystemNode? TryResolve(List<string> parts) {
    try { return Resolve(parts); }
    catch (FsException e) when (e.Code == FsErrorCode.NotFound) { return null; }
  }

  FileSystemNode Resolve(List<string> parts) { // O(depth)
    FileSystemNode node = _root;
    foreach (var name in parts) {
      if (node is not Directory d) throw new FsException(FsErrorCode.NotADirectory, node.Path());
      node = d.Get(name) ?? throw new FsException(FsErrorCode.NotFound, "/" + string.Join("/", parts));
    }
    return node;
  }

  static Directory AsDir(FileSystemNode n, string path) =>
    n as Directory ?? throw new FsException(FsErrorCode.NotADirectory, path);

  File FileAt(string path) =>
    Resolve(PathUtil.Split(path)) as File ?? throw new FsException(FsErrorCode.IsADirectory, path);
}
`

export const inMemoryFileSystemSolution: ProblemSolution = {
  slug: 'in-memory-file-system',
  title: 'In-Memory File System - Solution',
  overview: {
    introduction:
      'Design an in-memory file system with absolute paths that supports creating, reading, updating and deleting files; creating and removing directories (including recursive forms); listing contents; moving or renaming entries; and computing the total size of a directory recursively. The interview is about recognizing the Composite pattern (files and directories are both nodes), writing a robust path walker, and defining precise semantics for the awkward cases - moving into a directory, deleting non-empty directories, and moving a directory into itself.',
    constraints: [
      'All paths are absolute and start with "/"; the root always exists and cannot be deleted or moved.',
      'File CRUD: create (fails if exists), read, write (fails if missing), delete.',
      'mkdir supports a recursive mode (like mkdir -p); rmdir supports a recursive mode and otherwise rejects non-empty directories.',
      'Directory size is the recursive sum of its files’ sizes.',
      'Path resolution must be O(depth), not a search over the whole tree.',
    ],
    assumptions: [
      'File content is a string; its size is its UTF-8 byte length.',
      'Names are case-sensitive and unique within a directory; "." and ".." in a path are normalized and ".." is clamped at root.',
      'Move/rename semantics follow Unix mv: if the destination is an existing directory the source goes inside it; if the destination exists and is a file, the move fails.',
      'Permissions, symlinks, timestamps and persistence are out of scope.',
      'Coarse locking is acceptable; operations on one tree are linearizable.',
    ],
    clarificationQuestions: [
      'Should writing to a missing path create the file, or must create be explicit?',
      'Should moving onto an existing file overwrite it or fail?',
      'Do we need relative paths, symlinks, or permissions?',
      'How should list present directories vs files (suffix, type field)?',
      'Is size cached, or recomputed on demand?',
    ],
  },
  interviewApproach: {
    howToThink:
      'Files and directories share behavior: both have a name, a parent, a path and a size. A directory contains more nodes - a textbook Composite. Put structure in the nodes, put path parsing and validation in one place, and expose a facade that walks the tree one segment at a time.',
    breakdown: [
      'Define FileSystemNode with name, parent, size() and isDirectory().',
      'Implement File (content, size = byte length) and Directory (name → child map, size = sum of children).',
      'Write PathUtil.split to normalize absolute paths into segments.',
      'Implement a single resolve(parts) walker used by every operation (O(depth)).',
      'Implement create/read/write/delete, mkdir/rmdir, list.',
      'Implement move carefully (into-directory, rename, collision, self-containment) and size.',
    ],
    entities: [
      { name: 'InMemoryFileSystem', responsibility: 'Facade: path-based API, locking, error semantics.' },
      { name: 'FileSystemNode', responsibility: 'Abstract component: name, parent, size, isDirectory, path.' },
      { name: 'File', responsibility: 'Leaf holding content.' },
      { name: 'Directory', responsibility: 'Composite holding a name → node map; recursive size.' },
      { name: 'PathUtil', responsibility: 'Parse and normalize absolute paths.' },
      { name: 'FsError / FsErrorCode', responsibility: 'Typed failures: not found, exists, not a directory, etc.' },
    ],
    relationships: [
      'File and Directory inherit from FileSystemNode.',
      'Directory composes zero or more FileSystemNodes (children), and each node knows its parent.',
      'InMemoryFileSystem composes exactly one root Directory.',
      'InMemoryFileSystem depends on PathUtil for parsing and throws FsError.',
    ],
    patternsAndOop: [
      'Composite: treat files and directories uniformly, especially for size().',
      'Facade: one class presents the path-based API and hides tree traversal.',
      'Polymorphism: size() is implemented differently by leaf and composite.',
      'Encapsulation: only the facade mutates the tree, keeping parent pointers consistent.',
      'Fail-fast typed errors instead of null/boolean returns.',
    ],
    stepByStep: [
      'Clarify path rules, overwrite semantics and recursion requirements.',
      'Sketch the Composite and the root directory.',
      'Implement PathUtil.split and resolve(parts).',
      'Implement file operations on top of resolveParent.',
      'Implement mkdir/rmdir/list.',
      'Implement move with explicit rules, then discuss size caching and concurrency.',
    ],
  },
  uml: { nodes, edges },
  designExplanation: {
    summary:
      'A uniform node abstraction removes special cases: size, path and parent handling work for any node. The facade owns normalization, locking and semantics. Because every operation resolves a path by following one dictionary lookup per segment, cost depends on path depth rather than the number of files in the system.',
    classResponsibilities: [
      { name: 'InMemoryFileSystem', responsibility: 'Entry point; ensures atomic operations and consistent parent pointers.' },
      { name: 'FileSystemNode', responsibility: 'Common contract and path reconstruction through parent links.' },
      { name: 'File', responsibility: 'Stores content; size is its encoded length.' },
      { name: 'Directory', responsibility: 'O(1) child lookup/add/remove; recursive size.' },
      { name: 'PathUtil', responsibility: 'Single source of truth for path syntax (absolute-only, "." and "..").' },
      { name: 'FsError', responsibility: 'Machine-checkable error codes for callers and tests.' },
    ],
    interfacesAndAbstractions: [
      'FileSystemNode is the Composite component; clients never branch on concrete type for size().',
      'The facade is the only mutator, so invariants (unique names, correct parent, no cycles) live in one place.',
    ],
    relationships: [
      'Inheritance File/Directory→FileSystemNode (is-a node).',
      'Composition Directory→children and Facade→root: removing a directory removes its subtree.',
      'Dependency Facade→PathUtil/FsError: utilities used per call.',
    ],
    solid: [
      'SRP: parsing, node behavior and API/locking are separate.',
      'OCP: add a Symlink node type without changing Directory or the walker (resolve can handle it).',
      'LSP: File and Directory are substitutable wherever a node is required (size, path).',
      'ISP: the node interface is minimal; file-specific read/write stay on File.',
      'DIP: callers use the facade and never touch tree internals.',
    ],
    patterns: [
      { name: 'Composite', why: 'Recursive size and uniform path/parent logic over leaves and containers.' },
      { name: 'Facade', why: 'Path-based API hides traversal, validation and locking.' },
    ],
    decisions: [
      {
        decision: 'Children stored in a hash map keyed by name.',
        rationale: 'O(1) per path segment gives O(depth) resolution.',
        tradeoff: 'list() must sort for deterministic output; a sorted map would sort for free but cost O(log k) per step.',
      },
      {
        decision: 'Directory size computed recursively on demand.',
        rationale: 'Simple and always correct; matches the stated requirement.',
        tradeoff: 'O(subtree) per call; cache aggregate sizes and update ancestors on writes for O(depth) updates and O(1) reads.',
      },
      {
        decision: 'Move follows Unix mv rules with an explicit self-containment check.',
        rationale: 'Prevents cycles and surprising overwrites while supporting rename and move in one method.',
        tradeoff: 'Overwrite-on-collision is not allowed; add an overwrite flag if required.',
      },
      {
        decision: 'One coarse lock per file system.',
        rationale: 'Operations like move touch two directories; a single lock avoids lock-ordering deadlocks.',
        tradeoff: 'Serializes all operations; use a reader-writer lock or hierarchical locking for scale.',
      },
    ],
    extensibility:
      'Symlinks: add a Link node resolved during the walk with a hop limit. Permissions/ownership: attributes on FileSystemNode checked by the facade. Timestamps: set in write/create. Watchers: Observer on mutations. Size cache: store aggregate size on Directory and propagate deltas upward.',
  },
  implementations: {
    python: py,
    java,
    typescript: ts,
    cpp,
    go: goCode,
    csharp,
  },
  executionFlow: {
    steps: [
      'PathUtil.split normalizes "/a//b/./c/../d" into ["a", "b", "d"] and rejects relative paths.',
      'resolve(parts) starts at root and follows one child lookup per segment, failing with NOT_FOUND or NOT_A_DIRECTORY.',
      'File operations resolve the parent directory, then add/read/write/remove the leaf.',
      'rmdir resolves the directory, checks emptiness (unless recursive), and detaches it from its parent in one step.',
      'move resolves source, validates the destination (into-directory vs rename, collisions, self-containment), then detaches and re-attaches the node.',
      'size() asks the node: File returns its byte length; Directory sums its children recursively.',
    ],
    examples: [
      {
        title: 'Create, size, and move into a directory',
        input: 'mkdir("/home/alice/docs", recursive); createFile("/home/alice/docs/a.txt","hello"); createFile("/home/alice/b.txt","world!"); size("/home"); move("/home/alice/b.txt","/home/alice/docs")',
        output: 'size("/home") = 11; list("/home/alice/docs") = ["a.txt", "b.txt"]',
        explanation:
          'The directory size is 5 + 6 bytes. Because the destination is an existing directory, b.txt keeps its name and moves inside it.',
      },
      {
        title: 'Rejecting an invalid move',
        input: 'move("/home", "/home/alice/docs")',
        output: 'INVALID_PATH: cannot move a directory into itself',
        explanation:
          'The destination path starts with the source path, which would detach a subtree and attach it under itself, creating a cycle. The check happens before any mutation.',
      },
    ],
  },
  followUps: [
    {
      question: 'How would you make directory size O(1)?',
      answer:
        'Cache the aggregate size on each Directory. On create/write/delete/move, compute the delta and add it to every ancestor (O(depth)). Reads become O(1); updates stay O(depth).',
    },
    {
      question: 'How do you support symbolic links?',
      answer:
        'Add a Link node holding a target path. During resolve, when a segment is a Link, resolve its target and continue, tracking hops to detect cycles (limit like 40). Decide whether the final component should be followed (stat) or not (lstat).',
    },
    {
      question: 'How would you scale locking?',
      answer:
        'Use a read-write lock for read-heavy workloads, or lock hierarchically (lock parent directories in a consistent order, like root to leaf) so unrelated subtrees proceed in parallel. Move needs both source and destination parents locked in a global order.',
    },
    {
      question: 'How would you implement find/glob?',
      answer:
        'Add a visitor over the composite (DFS) with a predicate. For globs, split the pattern into segments and match level by level, expanding * only at the matching depth.',
    },
    {
      question: 'What if files are huge?',
      answer:
        'Store content in chunks or a blob store and keep metadata in the node. Directory size uses stored lengths, so nothing needs to be loaded to compute totals.',
    },
    {
      question: 'How do you make list output distinguish files and directories?',
      answer:
        'Return entries with a type (name, isDirectory, size) instead of bare names, or suffix directories with "/". The Composite already provides isDirectory().',
    },
  ],
  extras: {
    edgeCases: [
      'Operating on the root (rmdir "/", move "/", create file "/").',
      'Intermediate path component is a file (NOT_A_DIRECTORY).',
      'mkdir on an existing directory without recursive (error) versus with recursive (no-op).',
      'Move onto an existing file or into its own subtree.',
      'Move to the same path or into the same directory (no-op).',
      'Paths with // , ./ and ../ segments; relative paths (rejected).',
      'Reading or writing a directory path (IS_A_DIRECTORY).',
    ],
    commonMistakes: [
      'Splitting the path but forgetting to ignore empty segments, creating "" children.',
      'Not keeping parent pointers updated on move, breaking path() and later removals.',
      'Allowing a directory to be moved into its own descendant.',
      'Recursively deleting by walking and removing each child when detaching one pointer suffices.',
      'Searching the whole tree for each path instead of walking segment by segment.',
    ],
    complexity:
      'resolve, create, read, write, delete, rmdir (detach), and move are O(depth) (plus O(k log k) to list a directory with k entries). size is O(subtree) recomputed, or O(1) with a cached aggregate. Memory is O(N) for N nodes plus content.',
    testing: [
      'PathUtil tests: normalization, relative path rejection, "..", and root.',
      'CRUD tests for files, including duplicate create and write to missing path.',
      'mkdir/rmdir recursion matrix (empty, non-empty, with and without recursive flag).',
      'Move matrix: rename, move into directory, collision, same path, into itself.',
      'Size tests across nested directories before and after move/delete.',
    ],
    extensions: [
      'Symlinks, permissions, timestamps and ownership.',
      'Cached directory sizes and quotas.',
      'Glob/find via a visitor; watchers via Observer.',
      'Persistence/snapshots and copy-on-write clones.',
    ],
    takeaways: [
      'Files and directories ⇒ Composite.',
      'Centralize path normalization and a single resolve() walker.',
      'Define move semantics explicitly and validate before mutating.',
      'Know how to trade recursive size for a cached aggregate.',
    ],
  },
}
