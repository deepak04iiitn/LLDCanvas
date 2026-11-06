import type { ProblemSolution } from '../types'
import { GRID, attr, cls, edge, method, resetUmlIds } from '../uml'

resetUmlIds()

const nodes = [
  cls('n0', 'HospitalAppointmentSchedulingService', GRID.x(0), GRID.y(0), [
    attr('-', '_lock', 'Lock'),
    attr('-', '_seq', 'int'),
    attr('-', '_doctors', 'Map<string, Doctor>'),
    attr('-', '_specialties', 'Map<string, Specialty>'),
    attr('-', '_availability_slots', 'Map<string, AvailabilitySlot>'),
    attr('-', '_appointments', 'Map<string, Appointment>'),
    attr('-', '_patients', 'Map<string, Patient>'),
  ], [
    method('+', 'createDoctor', 'name: string', 'Doctor'),
    method('+', 'createSpecialty', 'name: string', 'Specialty'),
    method('+', 'createAvailabilitySlot', 'name: string', 'AvailabilitySlot'),
    method('+', 'createAppointment', 'name: string', 'Appointment'),
    method('+', 'createPatient', 'name: string', 'Patient'),
    method('+', 'getDoctor', 'id: string', 'Doctor'),
    method('+', 'getSpecialty', 'id: string', 'Specialty'),
    method('+', 'getAvailabilitySlot', 'id: string', 'AvailabilitySlot'),
    method('+', 'getAppointment', 'id: string', 'Appointment'),
    method('+', 'getPatient', 'id: string', 'Patient'),
    method('+', 'closeDoctor', 'id: string', 'Doctor'),
  ], 'facade'),
  cls('n1', 'Doctor', GRID.x(1), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n2', 'Specialty', GRID.x(2), GRID.y(0), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n3', 'AvailabilitySlot', GRID.x(0), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n4', 'Appointment', GRID.x(1), GRID.y(1), [
    attr('-', 'id', 'string'),
    attr('-', 'name', 'string'),
    attr('-', 'status', 'string'),
  ], [
    method('+', 'validate', '', 'void'),
    method('+', 'close', '', 'void'),
  ]),
  cls('n5', 'Patient', GRID.x(2), GRID.y(1), [
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
log = logging.getLogger("hospital-appointment-scheduling")


class Doctor:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Doctor.id is required")
        if not name or not name.strip():
            raise ValueError("Doctor.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Doctor.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Doctor {self.id} has invalid status={self.status}")
        log.info("[Doctor.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Doctor {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Doctor.close] id=%s -> CLOSED", self.id)


class Specialty:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Specialty.id is required")
        if not name or not name.strip():
            raise ValueError("Specialty.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Specialty.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Specialty {self.id} has invalid status={self.status}")
        log.info("[Specialty.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Specialty {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Specialty.close] id=%s -> CLOSED", self.id)


class AvailabilitySlot:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("AvailabilitySlot.id is required")
        if not name or not name.strip():
            raise ValueError("AvailabilitySlot.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[AvailabilitySlot.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"AvailabilitySlot {self.id} has invalid status={self.status}")
        log.info("[AvailabilitySlot.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"AvailabilitySlot {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[AvailabilitySlot.close] id=%s -> CLOSED", self.id)


class Appointment:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Appointment.id is required")
        if not name or not name.strip():
            raise ValueError("Appointment.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Appointment.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Appointment {self.id} has invalid status={self.status}")
        log.info("[Appointment.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Appointment {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Appointment.close] id=%s -> CLOSED", self.id)


class Patient:
    """Domain object shown on the UML diagram."""

    def __init__(self, item_id: str, name: str) -> None:
        if not item_id or not item_id.strip():
            raise ValueError("Patient.id is required")
        if not name or not name.strip():
            raise ValueError("Patient.name is required")
        self.id = item_id.strip()
        self.name = name.strip()
        self.status = "ACTIVE"
        log.info("[Patient.__init__] created id=%s name=%s", self.id, self.name)

    def validate(self) -> None:
        if self.status not in {"ACTIVE", "CLOSED"}:
            raise ValueError(f"Patient {self.id} has invalid status={self.status}")
        log.info("[Patient.validate] id=%s status=%s ok", self.id, self.status)

    def close(self) -> None:
        self.validate()
        if self.status != "ACTIVE":
            raise RuntimeError(f"Patient {self.id} cannot close from {self.status}")
        self.status = "CLOSED"
        log.info("[Patient.close] id=%s -> CLOSED", self.id)


class HospitalAppointmentSchedulingService:
    """Facade on the UML diagram - the only entry point callers use."""

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._seq = 1
        self._doctors: Dict[str, Doctor] = {}
        self._specialties: Dict[str, Specialty] = {}
        self._availability_slots: Dict[str, AvailabilitySlot] = {}
        self._appointments: Dict[str, Appointment] = {}
        self._patients: Dict[str, Patient] = {}
        log.info("[HospitalAppointmentSchedulingService.__init__] system ready; managing: Doctor, Specialty, AvailabilitySlot, Appointment, Patient")

    def create_doctor(self, name: str) -> Doctor:
        """UML: HospitalAppointmentSchedulingService.create_doctor(name) -> Doctor"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Doctor name is required")
        with self._lock:
            item_id = f"DOC-{self._seq:04d}"
            self._seq += 1
            obj = Doctor(item_id, cleaned)
            obj.validate()
            self._doctors[item_id] = obj
            log.info("[HospitalAppointmentSchedulingService.create_doctor] stored %s in _doctors (count=%s)", item_id, len(self._doctors))
            return obj

    def get_doctor(self, item_id: str) -> Doctor:
        with self._lock:
            obj = self._doctors.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Doctor id: {item_id}")
            log.info("[HospitalAppointmentSchedulingService.get_doctor] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_specialty(self, name: str) -> Specialty:
        """UML: HospitalAppointmentSchedulingService.create_specialty(name) -> Specialty"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Specialty name is required")
        with self._lock:
            item_id = f"SPE-{self._seq:04d}"
            self._seq += 1
            obj = Specialty(item_id, cleaned)
            obj.validate()
            self._specialties[item_id] = obj
            log.info("[HospitalAppointmentSchedulingService.create_specialty] stored %s in _specialties (count=%s)", item_id, len(self._specialties))
            return obj

    def get_specialty(self, item_id: str) -> Specialty:
        with self._lock:
            obj = self._specialties.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Specialty id: {item_id}")
            log.info("[HospitalAppointmentSchedulingService.get_specialty] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_availability_slot(self, name: str) -> AvailabilitySlot:
        """UML: HospitalAppointmentSchedulingService.create_availability_slot(name) -> AvailabilitySlot"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("AvailabilitySlot name is required")
        with self._lock:
            item_id = f"AVA-{self._seq:04d}"
            self._seq += 1
            obj = AvailabilitySlot(item_id, cleaned)
            obj.validate()
            self._availability_slots[item_id] = obj
            log.info("[HospitalAppointmentSchedulingService.create_availability_slot] stored %s in _availability_slots (count=%s)", item_id, len(self._availability_slots))
            return obj

    def get_availability_slot(self, item_id: str) -> AvailabilitySlot:
        with self._lock:
            obj = self._availability_slots.get(item_id)
            if obj is None:
                raise KeyError(f"unknown AvailabilitySlot id: {item_id}")
            log.info("[HospitalAppointmentSchedulingService.get_availability_slot] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_appointment(self, name: str) -> Appointment:
        """UML: HospitalAppointmentSchedulingService.create_appointment(name) -> Appointment"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Appointment name is required")
        with self._lock:
            item_id = f"APP-{self._seq:04d}"
            self._seq += 1
            obj = Appointment(item_id, cleaned)
            obj.validate()
            self._appointments[item_id] = obj
            log.info("[HospitalAppointmentSchedulingService.create_appointment] stored %s in _appointments (count=%s)", item_id, len(self._appointments))
            return obj

    def get_appointment(self, item_id: str) -> Appointment:
        with self._lock:
            obj = self._appointments.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Appointment id: {item_id}")
            log.info("[HospitalAppointmentSchedulingService.get_appointment] found id=%s name=%s", obj.id, obj.name)
            return obj


    def create_patient(self, name: str) -> Patient:
        """UML: HospitalAppointmentSchedulingService.create_patient(name) -> Patient"""
        cleaned = (name or "").strip()
        if not cleaned:
            raise ValueError("Patient name is required")
        with self._lock:
            item_id = f"PAT-{self._seq:04d}"
            self._seq += 1
            obj = Patient(item_id, cleaned)
            obj.validate()
            self._patients[item_id] = obj
            log.info("[HospitalAppointmentSchedulingService.create_patient] stored %s in _patients (count=%s)", item_id, len(self._patients))
            return obj

    def get_patient(self, item_id: str) -> Patient:
        with self._lock:
            obj = self._patients.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Patient id: {item_id}")
            log.info("[HospitalAppointmentSchedulingService.get_patient] found id=%s name=%s", obj.id, obj.name)
            return obj

    def close_doctor(self, item_id: str) -> Doctor:
        """Happy-path domain action used in the demo walkthrough."""
        with self._lock:
            obj = self._doctors.get(item_id)
            if obj is None:
                raise KeyError(f"unknown Doctor id: {item_id}")
            log.info("[HospitalAppointmentSchedulingService.close_doctor] closing %s via Doctor.close()", item_id)
            obj.close()
            return obj

    def list_active_doctors(self) -> List[Doctor]:
        with self._lock:
            active = [o for o in self._doctors.values() if o.status == "ACTIVE"]
            log.info("[HospitalAppointmentSchedulingService.list_active_doctors] count=%s ids=%s", len(active), [o.id for o in active])
            return active


def main() -> None:
    log.info("========== STEP 1: Construct HospitalAppointmentSchedulingService (UML facade) ==========")
    log.info("Expected: empty maps; facade constructed")
    system = HospitalAppointmentSchedulingService()

    log.info("========== STEP 2: Create primary Doctor objects ==========")
    log.info("Expected: primary UML object created ACTIVE")
    first = system.create_doctor("alpha-doctor")
    log.info("Observed: id=%s status=%s", first.id, first.status)
    second = system.create_doctor("beta-doctor")

    log.info("========== STEP 3: Create Specialty (UML class) ==========")
    log.info("Expected: second primary object ACTIVE")
    system.create_specialty("sample-specialty")

    log.info("========== STEP 4: Create AvailabilitySlot (UML class) ==========")
    system.create_availability_slot("sample-availability_slot")

    log.info("========== STEP 5: Create Appointment (UML class) ==========")
    system.create_appointment("sample-appointment")

    log.info("========== STEP 6: Create Patient (UML class) ==========")
    system.create_patient("sample-patient")

    log.info("========== STEP 7: Inspect active Doctor list ==========")
    system.list_active_doctors()

    log.info("========== STEP 8: Close first Doctor ==========")
    system.close_doctor(first.id)

    log.info("========== STEP 9: Expected failure - close again ==========")
    try:
        system.close_doctor(first.id)
    except RuntimeError as err:
        log.error("[main] expected failure from Doctor.close: %s", err)

    log.info("========== STEP 10: Expected failure - missing id ==========")
    try:
        system.get_doctor("MISSING-ID")
    except KeyError as err:
        log.error("[main] expected failure from get_doctor: %s", err)

    log.info("========== DONE: remaining active %s ==========", [o.id for o in system.list_active_doctors()])


if __name__ == "__main__":
    main()
`

const java = `import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

class Doctor {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Doctor(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Doctor.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Doctor.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Doctor.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Doctor " + id + " invalid status");
    }
    System.out.println("[Doctor.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Doctor " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Doctor.close] id=" + id + " -> CLOSED");
  }
}


class Specialty {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Specialty(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Specialty.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Specialty.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Specialty.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Specialty " + id + " invalid status");
    }
    System.out.println("[Specialty.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Specialty " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Specialty.close] id=" + id + " -> CLOSED");
  }
}


class AvailabilitySlot {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  AvailabilitySlot(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("AvailabilitySlot.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("AvailabilitySlot.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[AvailabilitySlot.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("AvailabilitySlot " + id + " invalid status");
    }
    System.out.println("[AvailabilitySlot.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("AvailabilitySlot " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[AvailabilitySlot.close] id=" + id + " -> CLOSED");
  }
}


class Appointment {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Appointment(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Appointment.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Appointment.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Appointment.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Appointment " + id + " invalid status");
    }
    System.out.println("[Appointment.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Appointment " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Appointment.close] id=" + id + " -> CLOSED");
  }
}


class Patient {
  private final String id;
  private final String name;
  private String status = "ACTIVE";
  Patient(String id, String name) {
    if (id == null || id.isBlank()) {
      throw new IllegalArgumentException("Patient.id required");
    }
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Patient.name required");
    }
    this.id = id.trim(); this.name = name.trim();
    System.out.println("[Patient.__init__] created id=" + this.id + " name=" + this.name);
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
      throw new IllegalStateException("Patient " + id + " invalid status");
    }
    System.out.println("[Patient.validate] id=" + id + " status=" + status + " ok");
  }

  void close() {
    validate();
    if (!status.equals("ACTIVE")) {
      throw new IllegalStateException("Patient " + id + " cannot close from " + status);
    }
    status = "CLOSED";
    System.out.println("[Patient.close] id=" + id + " -> CLOSED");
  }
}

public class HospitalAppointmentSchedulingService {
  private final ReentrantLock lock = new ReentrantLock();
  private int seq = 1;
  private final Map<String, Doctor> doctors = new LinkedHashMap<>();
  private final Map<String, Specialty> specialties = new LinkedHashMap<>();
  private final Map<String, AvailabilitySlot> availability_slots = new LinkedHashMap<>();
  private final Map<String, Appointment> appointments = new LinkedHashMap<>();
  private final Map<String, Patient> patients = new LinkedHashMap<>();

  public HospitalAppointmentSchedulingService() {
    System.out.println("[HospitalAppointmentSchedulingService.__init__] system ready");
  }

  public Doctor createDoctor(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Doctor name required");
    }
    lock.lock();
    try {
      String id = String.format("DOC-%04d", seq++);
      Doctor obj = new Doctor(id, name.trim());
      obj.validate();
      doctors.put(id, obj);
      System.out.println("[HospitalAppointmentSchedulingService.createDoctor] stored " + id + " count=" + doctors.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Doctor getDoctor(String id) {
    lock.lock();
    try {
      Doctor obj = doctors.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Doctor id: " + id);
      }
      System.out.println("[HospitalAppointmentSchedulingService.getDoctor] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Specialty createSpecialty(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Specialty name required");
    }
    lock.lock();
    try {
      String id = String.format("SPE-%04d", seq++);
      Specialty obj = new Specialty(id, name.trim());
      obj.validate();
      specialties.put(id, obj);
      System.out.println("[HospitalAppointmentSchedulingService.createSpecialty] stored " + id + " count=" + specialties.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Specialty getSpecialty(String id) {
    lock.lock();
    try {
      Specialty obj = specialties.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Specialty id: " + id);
      }
      System.out.println("[HospitalAppointmentSchedulingService.getSpecialty] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public AvailabilitySlot createAvailabilitySlot(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("AvailabilitySlot name required");
    }
    lock.lock();
    try {
      String id = String.format("AVA-%04d", seq++);
      AvailabilitySlot obj = new AvailabilitySlot(id, name.trim());
      obj.validate();
      availability_slots.put(id, obj);
      System.out.println("[HospitalAppointmentSchedulingService.createAvailabilitySlot] stored " + id + " count=" + availability_slots.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public AvailabilitySlot getAvailabilitySlot(String id) {
    lock.lock();
    try {
      AvailabilitySlot obj = availability_slots.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown AvailabilitySlot id: " + id);
      }
      System.out.println("[HospitalAppointmentSchedulingService.getAvailabilitySlot] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Appointment createAppointment(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Appointment name required");
    }
    lock.lock();
    try {
      String id = String.format("APP-%04d", seq++);
      Appointment obj = new Appointment(id, name.trim());
      obj.validate();
      appointments.put(id, obj);
      System.out.println("[HospitalAppointmentSchedulingService.createAppointment] stored " + id + " count=" + appointments.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Appointment getAppointment(String id) {
    lock.lock();
    try {
      Appointment obj = appointments.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Appointment id: " + id);
      }
      System.out.println("[HospitalAppointmentSchedulingService.getAppointment] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Patient createPatient(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Patient name required");
    }
    lock.lock();
    try {
      String id = String.format("PAT-%04d", seq++);
      Patient obj = new Patient(id, name.trim());
      obj.validate();
      patients.put(id, obj);
      System.out.println("[HospitalAppointmentSchedulingService.createPatient] stored " + id + " count=" + patients.size());
      return obj;
    } finally { lock.unlock(); }
  }

  public Patient getPatient(String id) {
    lock.lock();
    try {
      Patient obj = patients.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Patient id: " + id);
      }
      System.out.println("[HospitalAppointmentSchedulingService.getPatient] found id=" + obj.getId());
      return obj;
    } finally { lock.unlock(); }
  }

  public Doctor closeDoctor(String id) {
    lock.lock();
    try {
      Doctor obj = doctors.get(id);
      if (obj == null) {
        throw new NoSuchElementException("unknown Doctor id: " + id);
      }
      System.out.println("[HospitalAppointmentSchedulingService.closeDoctor] closing " + id);
      obj.close();
      return obj;
    } finally { lock.unlock(); }
  }

  public List<Doctor> listActiveDoctors() {
    lock.lock();
    try {
      List<Doctor> out = new ArrayList<>();
      for (Doctor o : doctors.values()) {
        if (o.getStatus().equals("ACTIVE")) {
          out.add(o);
        }
      }
      System.out.println("[HospitalAppointmentSchedulingService.listActiveDoctors] count=" + out.size());
      return out;
    } finally { lock.unlock(); }
  }

  public static void main(String[] args) {
    System.out.println("========== STEP 1: Construct HospitalAppointmentSchedulingService ==========");
    System.out.println("Expected: empty maps; facade constructed");
    HospitalAppointmentSchedulingService system = new HospitalAppointmentSchedulingService();
    System.out.println("========== STEP 2: Create Doctor objects ==========");
    System.out.println("Expected: primary UML object created ACTIVE");
    Doctor first = system.createDoctor("alpha-doctor");
    system.createDoctor("beta-doctor");
    System.out.println("========== STEP 3: Create Specialty ==========");
    System.out.println("Expected: second primary object ACTIVE");
    system.createSpecialty("sample-specialty");
    System.out.println("========== STEP 4: Create AvailabilitySlot ==========");
    system.createAvailabilitySlot("sample-availability_slot");
    System.out.println("========== STEP 5: Create Appointment ==========");
    system.createAppointment("sample-appointment");
    System.out.println("========== STEP 6: Create Patient ==========");
    system.createPatient("sample-patient");
    System.out.println("========== Inspect active list ==========");
    system.listActiveDoctors();
    System.out.println("========== Close first Doctor ==========");
    system.closeDoctor(first.getId());
    try {
      system.closeDoctor(first.getId());
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
    try {
      system.getDoctor("MISSING-ID");
    }
    catch (RuntimeException err) {
      System.out.println("[main] expected failure: " + err.getMessage());
    }
  }
}
`

const ts = `
class Doctor {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Doctor.id required')
    }

    if (!name?.trim()) {
      throw new Error('Doctor.name required')
    }
    console.log(\`[Doctor.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Doctor \${this.id} invalid status\`)
    }
    console.log(\`[Doctor.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Doctor \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Doctor.close] id=\${this.id} -> CLOSED\`)
  }
}


class Specialty {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Specialty.id required')
    }

    if (!name?.trim()) {
      throw new Error('Specialty.name required')
    }
    console.log(\`[Specialty.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Specialty \${this.id} invalid status\`)
    }
    console.log(\`[Specialty.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Specialty \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Specialty.close] id=\${this.id} -> CLOSED\`)
  }
}


class AvailabilitySlot {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('AvailabilitySlot.id required')
    }

    if (!name?.trim()) {
      throw new Error('AvailabilitySlot.name required')
    }
    console.log(\`[AvailabilitySlot.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`AvailabilitySlot \${this.id} invalid status\`)
    }
    console.log(\`[AvailabilitySlot.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`AvailabilitySlot \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[AvailabilitySlot.close] id=\${this.id} -> CLOSED\`)
  }
}


class Appointment {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Appointment.id required')
    }

    if (!name?.trim()) {
      throw new Error('Appointment.name required')
    }
    console.log(\`[Appointment.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Appointment \${this.id} invalid status\`)
    }
    console.log(\`[Appointment.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Appointment \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Appointment.close] id=\${this.id} -> CLOSED\`)
  }
}


class Patient {
  status: 'ACTIVE' | 'CLOSED' = 'ACTIVE'
  constructor(public readonly id: string, public readonly name: string) {
    if (!id?.trim()) {
      throw new Error('Patient.id required')
    }

    if (!name?.trim()) {
      throw new Error('Patient.name required')
    }
    console.log(\`[Patient.__init__] created id=\${this.id} name=\${this.name}\`)
  }

  validate(): void {
    if (this.status !== 'ACTIVE' && this.status !== 'CLOSED') {
      throw new Error(\`Patient \${this.id} invalid status\`)
    }
    console.log(\`[Patient.validate] id=\${this.id} status=\${this.status} ok\`)
  }

  close(): void {
    this.validate()
    if (this.status !== 'ACTIVE') {
      throw new Error(\`Patient \${this.id} cannot close from \${this.status}\`)
    }
    this.status = 'CLOSED'
    console.log(\`[Patient.close] id=\${this.id} -> CLOSED\`)
  }
}

class HospitalAppointmentSchedulingService {
  private seq = 1
  private doctors = new Map<string, Doctor>()
  private specialties = new Map<string, Specialty>()
  private availability_slots = new Map<string, AvailabilitySlot>()
  private appointments = new Map<string, Appointment>()
  private patients = new Map<string, Patient>()
  constructor() {
    console.log('[HospitalAppointmentSchedulingService.__init__] system ready')
  }

  createDoctor(name: string): Doctor {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Doctor name required')
    }
    const id = \`DOC-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Doctor(id, cleaned)
    obj.validate()
    this.doctors.set(id, obj)
    console.log(\`[HospitalAppointmentSchedulingService.createDoctor] stored \${id} count=\${this.doctors.size}\`)
    return obj
  }

  getDoctor(id: string): Doctor {
    const obj = this.doctors.get(id)
    if (!obj) {
      throw new Error(\`unknown Doctor id: \${id}\`)
    }
    console.log(\`[HospitalAppointmentSchedulingService.getDoctor] found id=\${obj.id}\`)
    return obj
  }

  createSpecialty(name: string): Specialty {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Specialty name required')
    }
    const id = \`SPE-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Specialty(id, cleaned)
    obj.validate()
    this.specialties.set(id, obj)
    console.log(\`[HospitalAppointmentSchedulingService.createSpecialty] stored \${id} count=\${this.specialties.size}\`)
    return obj
  }

  getSpecialty(id: string): Specialty {
    const obj = this.specialties.get(id)
    if (!obj) {
      throw new Error(\`unknown Specialty id: \${id}\`)
    }
    console.log(\`[HospitalAppointmentSchedulingService.getSpecialty] found id=\${obj.id}\`)
    return obj
  }

  createAvailabilitySlot(name: string): AvailabilitySlot {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('AvailabilitySlot name required')
    }
    const id = \`AVA-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new AvailabilitySlot(id, cleaned)
    obj.validate()
    this.availability_slots.set(id, obj)
    console.log(\`[HospitalAppointmentSchedulingService.createAvailabilitySlot] stored \${id} count=\${this.availability_slots.size}\`)
    return obj
  }

  getAvailabilitySlot(id: string): AvailabilitySlot {
    const obj = this.availability_slots.get(id)
    if (!obj) {
      throw new Error(\`unknown AvailabilitySlot id: \${id}\`)
    }
    console.log(\`[HospitalAppointmentSchedulingService.getAvailabilitySlot] found id=\${obj.id}\`)
    return obj
  }

  createAppointment(name: string): Appointment {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Appointment name required')
    }
    const id = \`APP-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Appointment(id, cleaned)
    obj.validate()
    this.appointments.set(id, obj)
    console.log(\`[HospitalAppointmentSchedulingService.createAppointment] stored \${id} count=\${this.appointments.size}\`)
    return obj
  }

  getAppointment(id: string): Appointment {
    const obj = this.appointments.get(id)
    if (!obj) {
      throw new Error(\`unknown Appointment id: \${id}\`)
    }
    console.log(\`[HospitalAppointmentSchedulingService.getAppointment] found id=\${obj.id}\`)
    return obj
  }

  createPatient(name: string): Patient {
    const cleaned = (name ?? '').trim()
    if (!cleaned) {
      throw new Error('Patient name required')
    }
    const id = \`PAT-\${String(this.seq++).padStart(4, '0')}\`
    const obj = new Patient(id, cleaned)
    obj.validate()
    this.patients.set(id, obj)
    console.log(\`[HospitalAppointmentSchedulingService.createPatient] stored \${id} count=\${this.patients.size}\`)
    return obj
  }

  getPatient(id: string): Patient {
    const obj = this.patients.get(id)
    if (!obj) {
      throw new Error(\`unknown Patient id: \${id}\`)
    }
    console.log(\`[HospitalAppointmentSchedulingService.getPatient] found id=\${obj.id}\`)
    return obj
  }

  closeDoctor(id: string): Doctor {
    const obj = this.getDoctor(id)
    console.log(\`[HospitalAppointmentSchedulingService.closeDoctor] closing \${id}\`)
    obj.close()
    return obj
  }

  listActiveDoctors(): Doctor[] {
    const active = [...this.doctors.values()].filter(o => o.status === 'ACTIVE')
    console.log(\`[HospitalAppointmentSchedulingService.listActiveDoctors] count=\${active.length}\`)
    return active
  }
}

function main(): void {
  console.log('========== STEP 1: Construct HospitalAppointmentSchedulingService ==========')
  console.log('Expected: empty maps; facade constructed')
  const system = new HospitalAppointmentSchedulingService()
  console.log('========== STEP 2: Create Doctor objects ==========')
  console.log('Expected: primary UML object created ACTIVE')
  const first = system.createDoctor('alpha-doctor')
  system.createDoctor('beta-doctor')
  console.log('========== STEP 3: Create Specialty ==========')
  console.log('Expected: second primary object ACTIVE')
  system.createSpecialty('sample-specialty')
  console.log('========== STEP 4: Create AvailabilitySlot ==========')
  system.createAvailabilitySlot('sample-availability_slot')
  console.log('========== STEP 5: Create Appointment ==========')
  system.createAppointment('sample-appointment')
  console.log('========== STEP 6: Create Patient ==========')
  system.createPatient('sample-patient')
  system.listActiveDoctors()
  console.log('========== Close first Doctor ==========')
  system.closeDoctor(first.id)
  try {
    system.closeDoctor(first.id);
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
  try {
    system.getDoctor('MISSING-ID');
  } catch (err) {
    console.log('[main] expected failure:', (err as Error).message);
  }
}

main()
`

const cpp = `#include <bits/stdc++.h>
using namespace std;

class Doctor {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Doctor(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Doctor requires id and name");
    }
    cout << "[Doctor.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Doctor invalid status");
    }
    cout << "[Doctor.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Doctor cannot close");
    }
    status_ = "CLOSED";
    cout << "[Doctor.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Specialty {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Specialty(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Specialty requires id and name");
    }
    cout << "[Specialty.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Specialty invalid status");
    }
    cout << "[Specialty.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Specialty cannot close");
    }
    status_ = "CLOSED";
    cout << "[Specialty.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class AvailabilitySlot {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  AvailabilitySlot(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("AvailabilitySlot requires id and name");
    }
    cout << "[AvailabilitySlot.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("AvailabilitySlot invalid status");
    }
    cout << "[AvailabilitySlot.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("AvailabilitySlot cannot close");
    }
    status_ = "CLOSED";
    cout << "[AvailabilitySlot.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Appointment {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Appointment(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Appointment requires id and name");
    }
    cout << "[Appointment.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Appointment invalid status");
    }
    cout << "[Appointment.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Appointment cannot close");
    }
    status_ = "CLOSED";
    cout << "[Appointment.close] id=" << id_ << " -> CLOSED" << endl;
  }
};


class Patient {
  string id_;
  string name_;
  string status_ = "ACTIVE";
public:
  Patient(string id, string name) : id_(move(id)), name_(move(name)) {
    if (id_.empty() || name_.empty()) {
      throw invalid_argument("Patient requires id and name");
    }
    cout << "[Patient.__init__] created id=" << id_ << " name=" << name_ << endl;
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
      throw runtime_error("Patient invalid status");
    }
    cout << "[Patient.validate] id=" << id_ << " ok" << endl;
  }

  void close() {
    validate();
    if (status_ != "ACTIVE") {
      throw runtime_error("Patient cannot close");
    }
    status_ = "CLOSED";
    cout << "[Patient.close] id=" << id_ << " -> CLOSED" << endl;
  }
};

class HospitalAppointmentSchedulingService {
  mutex mu_;
  int seq_ = 1;
  unordered_map<string, Doctor> doctors_;
  unordered_map<string, Specialty> specialties_;
  unordered_map<string, AvailabilitySlot> availability_slots_;
  unordered_map<string, Appointment> appointments_;
  unordered_map<string, Patient> patients_;
public:
  HospitalAppointmentSchedulingService() {
    cout << "[HospitalAppointmentSchedulingService.__init__] system ready" << endl;
  }

  Doctor createDoctor(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Doctor name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "DOC-%04d", seq_++);
    Doctor obj{buf, name};
    obj.validate();
    doctors_.emplace(obj.id(), obj);
    cout << "[HospitalAppointmentSchedulingService.createDoctor] stored " << obj.id() << endl;
    return obj;
  }

  Doctor getDoctor(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = doctors_.find(id);
    if (it == doctors_.end()) {
      throw out_of_range("unknown Doctor id");
    }
    cout << "[HospitalAppointmentSchedulingService.getDoctor] found " << id << endl;
    return it->second;
  }

  Specialty createSpecialty(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Specialty name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "SPE-%04d", seq_++);
    Specialty obj{buf, name};
    obj.validate();
    specialties_.emplace(obj.id(), obj);
    cout << "[HospitalAppointmentSchedulingService.createSpecialty] stored " << obj.id() << endl;
    return obj;
  }

  Specialty getSpecialty(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = specialties_.find(id);
    if (it == specialties_.end()) {
      throw out_of_range("unknown Specialty id");
    }
    cout << "[HospitalAppointmentSchedulingService.getSpecialty] found " << id << endl;
    return it->second;
  }

  AvailabilitySlot createAvailabilitySlot(const string& name) {
    if (name.empty()) {
      throw invalid_argument("AvailabilitySlot name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "AVA-%04d", seq_++);
    AvailabilitySlot obj{buf, name};
    obj.validate();
    availability_slots_.emplace(obj.id(), obj);
    cout << "[HospitalAppointmentSchedulingService.createAvailabilitySlot] stored " << obj.id() << endl;
    return obj;
  }

  AvailabilitySlot getAvailabilitySlot(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = availability_slots_.find(id);
    if (it == availability_slots_.end()) {
      throw out_of_range("unknown AvailabilitySlot id");
    }
    cout << "[HospitalAppointmentSchedulingService.getAvailabilitySlot] found " << id << endl;
    return it->second;
  }

  Appointment createAppointment(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Appointment name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "APP-%04d", seq_++);
    Appointment obj{buf, name};
    obj.validate();
    appointments_.emplace(obj.id(), obj);
    cout << "[HospitalAppointmentSchedulingService.createAppointment] stored " << obj.id() << endl;
    return obj;
  }

  Appointment getAppointment(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = appointments_.find(id);
    if (it == appointments_.end()) {
      throw out_of_range("unknown Appointment id");
    }
    cout << "[HospitalAppointmentSchedulingService.getAppointment] found " << id << endl;
    return it->second;
  }

  Patient createPatient(const string& name) {
    if (name.empty()) {
      throw invalid_argument("Patient name required");
    }

    lock_guard<mutex> g(mu_);
    char buf[32];
    snprintf(buf, sizeof(buf), "PAT-%04d", seq_++);
    Patient obj{buf, name};
    obj.validate();
    patients_.emplace(obj.id(), obj);
    cout << "[HospitalAppointmentSchedulingService.createPatient] stored " << obj.id() << endl;
    return obj;
  }

  Patient getPatient(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = patients_.find(id);
    if (it == patients_.end()) {
      throw out_of_range("unknown Patient id");
    }
    cout << "[HospitalAppointmentSchedulingService.getPatient] found " << id << endl;
    return it->second;
  }

  Doctor closeDoctor(const string& id) {
    lock_guard<mutex> g(mu_);
    auto it = doctors_.find(id);
    if (it == doctors_.end()) {
      throw out_of_range("unknown Doctor");
    }
    cout << "[HospitalAppointmentSchedulingService.closeDoctor] closing " << id << endl;
    it->second.close();
    return it->second;
  }
};

int main() {
  cout << "========== STEP 1: Construct HospitalAppointmentSchedulingService ==========" << endl;
  cout << "Expected: empty maps; facade constructed" << endl;
  HospitalAppointmentSchedulingService system;
  cout << "========== STEP 2: Create Doctor ==========" << endl;
  cout << "Expected: primary UML object created ACTIVE" << endl;
  auto first = system.createDoctor("alpha-doctor");
  cout << "Observed: id=" << first.id() << " status=" << first.status() << endl;
  system.createDoctor("beta-doctor");
  system.createSpecialty("sample-specialty");
  system.createAvailabilitySlot("sample-availability_slot");
  system.createAppointment("sample-appointment");
  system.createPatient("sample-patient");
  system.closeDoctor(first.id());
  try {
    system.closeDoctor(first.id());
  }
  catch (const exception& err) {
    cout << "[main] expected failure: " << err.what() << endl;
  }
  try {
    system.getDoctor("MISSING-ID");
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

type Doctor struct {
  ID     string
  Name   string
  Status string
}

func NewDoctor(id, name string) (*Doctor, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Doctor requires id and name")
  }
  obj := &Doctor{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Doctor.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Doctor) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Doctor invalid status")
  }
  fmt.Printf("[Doctor.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Doctor) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Doctor %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Doctor.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Specialty struct {
  ID     string
  Name   string
  Status string
}

func NewSpecialty(id, name string) (*Specialty, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Specialty requires id and name")
  }
  obj := &Specialty{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Specialty.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Specialty) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Specialty invalid status")
  }
  fmt.Printf("[Specialty.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Specialty) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Specialty %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Specialty.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type AvailabilitySlot struct {
  ID     string
  Name   string
  Status string
}

func NewAvailabilitySlot(id, name string) (*AvailabilitySlot, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("AvailabilitySlot requires id and name")
  }
  obj := &AvailabilitySlot{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[AvailabilitySlot.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *AvailabilitySlot) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("AvailabilitySlot invalid status")
  }
  fmt.Printf("[AvailabilitySlot.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *AvailabilitySlot) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("AvailabilitySlot %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[AvailabilitySlot.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Appointment struct {
  ID     string
  Name   string
  Status string
}

func NewAppointment(id, name string) (*Appointment, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Appointment requires id and name")
  }
  obj := &Appointment{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Appointment.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Appointment) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Appointment invalid status")
  }
  fmt.Printf("[Appointment.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Appointment) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Appointment %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Appointment.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}


type Patient struct {
  ID     string
  Name   string
  Status string
}

func NewPatient(id, name string) (*Patient, error) {
  if id == "" || name == "" {
    return nil, fmt.Errorf("Patient requires id and name")
  }
  obj := &Patient{ID: id, Name: name, Status: "ACTIVE"}
  fmt.Printf("[Patient.__init__] created id=%s name=%s\\n", id, name)
  return obj, nil
}

func (o *Patient) Validate() error {
  if o.Status != "ACTIVE" && o.Status != "CLOSED" {
    return fmt.Errorf("Patient invalid status")
  }
  fmt.Printf("[Patient.validate] id=%s ok\\n", o.ID)
  return nil
}

func (o *Patient) Close() error {
  if err := o.Validate(); err != nil {
    return err
  }
  if o.Status != "ACTIVE" {
    return fmt.Errorf("Patient %s cannot close", o.ID)
  }
  o.Status = "CLOSED"
  fmt.Printf("[Patient.close] id=%s -> CLOSED\\n", o.ID)
  return nil
}

type HospitalAppointmentSchedulingService struct {
  mu  sync.Mutex
  seq int
  doctors map[string]*Doctor
  specialties map[string]*Specialty
  availability_slots map[string]*AvailabilitySlot
  appointments map[string]*Appointment
  patients map[string]*Patient
}

func NewHospitalAppointmentSchedulingService() *HospitalAppointmentSchedulingService {
  fmt.Println("[HospitalAppointmentSchedulingService.__init__] system ready")
  return &HospitalAppointmentSchedulingService{
    seq: 1,
    doctors: map[string]*Doctor{},
    specialties: map[string]*Specialty{},
    availability_slots: map[string]*AvailabilitySlot{},
    appointments: map[string]*Appointment{},
    patients: map[string]*Patient{},
  }
}

func (s *HospitalAppointmentSchedulingService) CreateDoctor(name string) (*Doctor, error) {
  if name == "" {
    return nil, fmt.Errorf("Doctor name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("DOC-%04d", s.seq)
  s.seq++
  obj, err := NewDoctor(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.doctors[id] = obj
  fmt.Printf("[HospitalAppointmentSchedulingService.CreateDoctor] stored %s\\n", id)
  return obj, nil
}

func (s *HospitalAppointmentSchedulingService) GetDoctor(id string) (*Doctor, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.doctors[id]
  if !ok {
    return nil, fmt.Errorf("unknown Doctor id: %s", id)
  }
  fmt.Printf("[HospitalAppointmentSchedulingService.GetDoctor] found %s\\n", id)
  return obj, nil
}

func (s *HospitalAppointmentSchedulingService) CreateSpecialty(name string) (*Specialty, error) {
  if name == "" {
    return nil, fmt.Errorf("Specialty name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("SPE-%04d", s.seq)
  s.seq++
  obj, err := NewSpecialty(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.specialties[id] = obj
  fmt.Printf("[HospitalAppointmentSchedulingService.CreateSpecialty] stored %s\\n", id)
  return obj, nil
}

func (s *HospitalAppointmentSchedulingService) GetSpecialty(id string) (*Specialty, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.specialties[id]
  if !ok {
    return nil, fmt.Errorf("unknown Specialty id: %s", id)
  }
  fmt.Printf("[HospitalAppointmentSchedulingService.GetSpecialty] found %s\\n", id)
  return obj, nil
}

func (s *HospitalAppointmentSchedulingService) CreateAvailabilitySlot(name string) (*AvailabilitySlot, error) {
  if name == "" {
    return nil, fmt.Errorf("AvailabilitySlot name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("AVA-%04d", s.seq)
  s.seq++
  obj, err := NewAvailabilitySlot(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.availability_slots[id] = obj
  fmt.Printf("[HospitalAppointmentSchedulingService.CreateAvailabilitySlot] stored %s\\n", id)
  return obj, nil
}

func (s *HospitalAppointmentSchedulingService) GetAvailabilitySlot(id string) (*AvailabilitySlot, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.availability_slots[id]
  if !ok {
    return nil, fmt.Errorf("unknown AvailabilitySlot id: %s", id)
  }
  fmt.Printf("[HospitalAppointmentSchedulingService.GetAvailabilitySlot] found %s\\n", id)
  return obj, nil
}

func (s *HospitalAppointmentSchedulingService) CreateAppointment(name string) (*Appointment, error) {
  if name == "" {
    return nil, fmt.Errorf("Appointment name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("APP-%04d", s.seq)
  s.seq++
  obj, err := NewAppointment(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.appointments[id] = obj
  fmt.Printf("[HospitalAppointmentSchedulingService.CreateAppointment] stored %s\\n", id)
  return obj, nil
}

func (s *HospitalAppointmentSchedulingService) GetAppointment(id string) (*Appointment, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.appointments[id]
  if !ok {
    return nil, fmt.Errorf("unknown Appointment id: %s", id)
  }
  fmt.Printf("[HospitalAppointmentSchedulingService.GetAppointment] found %s\\n", id)
  return obj, nil
}

func (s *HospitalAppointmentSchedulingService) CreatePatient(name string) (*Patient, error) {
  if name == "" {
    return nil, fmt.Errorf("Patient name required")
  }
  s.mu.Lock()
  defer s.mu.Unlock()
  id := fmt.Sprintf("PAT-%04d", s.seq)
  s.seq++
  obj, err := NewPatient(id, name)
  if err != nil {
    return nil, err
  }
  if err := obj.Validate(); err != nil {
    return nil, err
  }
  s.patients[id] = obj
  fmt.Printf("[HospitalAppointmentSchedulingService.CreatePatient] stored %s\\n", id)
  return obj, nil
}

func (s *HospitalAppointmentSchedulingService) GetPatient(id string) (*Patient, error) {
  s.mu.Lock()
  defer s.mu.Unlock()
  obj, ok := s.patients[id]
  if !ok {
    return nil, fmt.Errorf("unknown Patient id: %s", id)
  }
  fmt.Printf("[HospitalAppointmentSchedulingService.GetPatient] found %s\\n", id)
  return obj, nil
}

func (s *HospitalAppointmentSchedulingService) CloseDoctor(id string) (*Doctor, error) {
  obj, err := s.GetDoctor(id)
  if err != nil {
    return nil, err
  }
  fmt.Printf("[HospitalAppointmentSchedulingService.CloseDoctor] closing %s\\n", id)
  if err := obj.Close(); err != nil {
    return nil, err
  }
  return obj, nil
}

func main() {
  fmt.Println("========== STEP 1: Construct HospitalAppointmentSchedulingService ==========")
  system := NewHospitalAppointmentSchedulingService()
  fmt.Println("========== STEP 2: Create Doctor ==========")
  first, _ := system.CreateDoctor("alpha-doctor")
  system.CreateDoctor("beta-doctor")
  system.CreateSpecialty("sample-specialty")
  system.CreateAvailabilitySlot("sample-availability_slot")
  system.CreateAppointment("sample-appointment")
  system.CreatePatient("sample-patient")
  system.CloseDoctor(first.ID)
  if _, err := system.CloseDoctor(first.ID); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
  if _, err := system.GetDoctor("MISSING-ID"); err != nil {
    fmt.Printf("[main] expected failure: %v\\n", err)
  }
}
`

const csharp = `using System;
using System.Collections.Generic;

sealed class Doctor {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Doctor(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Doctor requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Doctor.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Doctor invalid status");
    }
    Console.WriteLine("[Doctor.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Doctor " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Doctor.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Specialty {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Specialty(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Specialty requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Specialty.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Specialty invalid status");
    }
    Console.WriteLine("[Specialty.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Specialty " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Specialty.close] id=" + Id + " -> CLOSED");
  }
}


sealed class AvailabilitySlot {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public AvailabilitySlot(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("AvailabilitySlot requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[AvailabilitySlot.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("AvailabilitySlot invalid status");
    }
    Console.WriteLine("[AvailabilitySlot.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("AvailabilitySlot " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[AvailabilitySlot.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Appointment {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Appointment(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Appointment requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Appointment.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Appointment invalid status");
    }
    Console.WriteLine("[Appointment.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Appointment " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Appointment.close] id=" + Id + " -> CLOSED");
  }
}


sealed class Patient {
  public string Id { get; }
  public string Name { get; }
  public string Status { get; private set; } = "ACTIVE";
  public Patient(string id, string name) {
    if (string.IsNullOrWhiteSpace(id) || string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Patient requires id and name");
    }
    Id = id.Trim(); Name = name.Trim();
    Console.WriteLine("[Patient.__init__] created id=" + Id + " name=" + Name);
  }

  public void Validate() {
    if (Status != "ACTIVE" && Status != "CLOSED") {
      throw new InvalidOperationException("Patient invalid status");
    }
    Console.WriteLine("[Patient.validate] id=" + Id + " ok");
  }

  public void Close() {
    Validate();
    if (Status != "ACTIVE") {
      throw new InvalidOperationException("Patient " + Id + " cannot close");
    }
    Status = "CLOSED";
    Console.WriteLine("[Patient.close] id=" + Id + " -> CLOSED");
  }
}

sealed class HospitalAppointmentSchedulingService {
  private readonly object _gate = new();
  private int _seq = 1;
  private readonly Dictionary<string, Doctor> _doctors = new();
  private readonly Dictionary<string, Specialty> _specialties = new();
  private readonly Dictionary<string, AvailabilitySlot> _availability_slots = new();
  private readonly Dictionary<string, Appointment> _appointments = new();
  private readonly Dictionary<string, Patient> _patients = new();
  public HospitalAppointmentSchedulingService() {
    Console.WriteLine("[HospitalAppointmentSchedulingService.__init__] system ready");
  }

  public Doctor CreateDoctor(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Doctor name required");
    }
    lock (_gate) {
      var id = string.Format("DOC-{0:D4}", _seq++);
      var obj = new Doctor(id, name.Trim());
      obj.Validate();
      _doctors[id] = obj;
      Console.WriteLine("[HospitalAppointmentSchedulingService.CreateDoctor] stored " + id);
      return obj;
    }
  }

  public Doctor GetDoctor(string id) {
    lock (_gate) {
      if (!_doctors.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Doctor id: " + id);
      }
      Console.WriteLine("[HospitalAppointmentSchedulingService.GetDoctor] found " + id);
      return obj;
    }
  }

  public Specialty CreateSpecialty(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Specialty name required");
    }
    lock (_gate) {
      var id = string.Format("SPE-{0:D4}", _seq++);
      var obj = new Specialty(id, name.Trim());
      obj.Validate();
      _specialties[id] = obj;
      Console.WriteLine("[HospitalAppointmentSchedulingService.CreateSpecialty] stored " + id);
      return obj;
    }
  }

  public Specialty GetSpecialty(string id) {
    lock (_gate) {
      if (!_specialties.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Specialty id: " + id);
      }
      Console.WriteLine("[HospitalAppointmentSchedulingService.GetSpecialty] found " + id);
      return obj;
    }
  }

  public AvailabilitySlot CreateAvailabilitySlot(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("AvailabilitySlot name required");
    }
    lock (_gate) {
      var id = string.Format("AVA-{0:D4}", _seq++);
      var obj = new AvailabilitySlot(id, name.Trim());
      obj.Validate();
      _availability_slots[id] = obj;
      Console.WriteLine("[HospitalAppointmentSchedulingService.CreateAvailabilitySlot] stored " + id);
      return obj;
    }
  }

  public AvailabilitySlot GetAvailabilitySlot(string id) {
    lock (_gate) {
      if (!_availability_slots.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown AvailabilitySlot id: " + id);
      }
      Console.WriteLine("[HospitalAppointmentSchedulingService.GetAvailabilitySlot] found " + id);
      return obj;
    }
  }

  public Appointment CreateAppointment(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Appointment name required");
    }
    lock (_gate) {
      var id = string.Format("APP-{0:D4}", _seq++);
      var obj = new Appointment(id, name.Trim());
      obj.Validate();
      _appointments[id] = obj;
      Console.WriteLine("[HospitalAppointmentSchedulingService.CreateAppointment] stored " + id);
      return obj;
    }
  }

  public Appointment GetAppointment(string id) {
    lock (_gate) {
      if (!_appointments.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Appointment id: " + id);
      }
      Console.WriteLine("[HospitalAppointmentSchedulingService.GetAppointment] found " + id);
      return obj;
    }
  }

  public Patient CreatePatient(string name) {
    if (string.IsNullOrWhiteSpace(name)) {
      throw new ArgumentException("Patient name required");
    }
    lock (_gate) {
      var id = string.Format("PAT-{0:D4}", _seq++);
      var obj = new Patient(id, name.Trim());
      obj.Validate();
      _patients[id] = obj;
      Console.WriteLine("[HospitalAppointmentSchedulingService.CreatePatient] stored " + id);
      return obj;
    }
  }

  public Patient GetPatient(string id) {
    lock (_gate) {
      if (!_patients.TryGetValue(id, out var obj)) {
        throw new KeyNotFoundException("unknown Patient id: " + id);
      }
      Console.WriteLine("[HospitalAppointmentSchedulingService.GetPatient] found " + id);
      return obj;
    }
  }

  public Doctor CloseDoctor(string id) {
    var obj = GetDoctor(id);
    Console.WriteLine("[HospitalAppointmentSchedulingService.CloseDoctor] closing " + id);
    obj.Close();
    return obj;
  }

  static void Main() {
    Console.WriteLine("========== STEP 1: Construct HospitalAppointmentSchedulingService ==========");
    var system = new HospitalAppointmentSchedulingService();
    Console.WriteLine("========== STEP 2: Create Doctor ==========");
    var first = system.CreateDoctor("alpha-doctor");
    system.CreateDoctor("beta-doctor");
    system.CreateSpecialty("sample-specialty");
    system.CreateAvailabilitySlot("sample-availability_slot");
    system.CreateAppointment("sample-appointment");
    system.CreatePatient("sample-patient");
    system.CloseDoctor(first.Id);
    try {
      system.CloseDoctor(first.Id);
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
    try {
      system.GetDoctor("MISSING-ID");
    }
    catch (Exception err) {
      Console.WriteLine("[main] expected failure: " + err.Message);
    }
  }
}
`

export const hospitalAppointmentSchedulingSolution: ProblemSolution = {
  slug: 'hospital-appointment-scheduling',
  title: 'Hospital Appointment Scheduling System - Complete LLD Guide',
  overview: {
    introduction: [
      'Design a system for scheduling patient appointments with doctors, considering availability, specialties, and rescheduling. The implementation below mirrors the UML class diagram class-for-class.',
      'Each UML class becomes a real type. The facade owns composition maps for the domain objects and exposes create/get/close methods that match the diagram.',
      'The main() walkthrough logs every step: which object is created, which method runs, and what success or failure means.',
    ],
    constraints: [
      'Search doctors by specialty, location, and availability',
      'Book an appointment slot for a patient with a doctor',
      'Prevent double-booking the same doctor/time slot',
      'Reschedule or cancel an appointment',
      'Send reminders before the appointment',
      'Support recurring appointments (e.g. physiotherapy sessions)',
    ],
    assumptions: [
      'Interview-scale in-memory design; persistence is a follow-up.',
      'Composition from the facade to domain classes matches the UML edges.',
      'Logs are stdlib console/logging only.',
    ],
    clarificationQuestions: [
    {
      question: 'Search doctors by specialty, location, and availability?',
      why: 'Shapes the facade API mirrored in the UML methods.',
    },
    {
      question: 'Book an appointment slot for a patient with a doctor?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Prevent double-booking the same doctor/time slot?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Reschedule or cancel an appointment?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    {
      question: 'Send reminders before the appointment?',
      why: 'Shapes the validation rules mirrored in the UML methods.',
    },
    ],
  },
  interviewApproach: {
    sections: [
      {
        heading: 'UML to code mapping',
        paragraphs: [
          'Start from the diagram. HospitalAppointmentSchedulingService is the facade stereotype. Doctor, Specialty, AvailabilitySlot, Appointment, Patient are concrete domain classes with id/name/status and validate/close.',
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
          'Construct HospitalAppointmentSchedulingService.',
          'createDoctor twice and create the related UML classes.',
          'closeDoctor once (happy path).',
          'Retry close and get missing id (expected failures with logs).',
        ],
      },
    ],
    entities: [
    { name: 'HospitalAppointmentSchedulingService', responsibility: 'UML facade - orchestrates Hospital Appointment Scheduling System.', keyMembers: ['create*', 'get*', 'closeDoctor'] },
    { name: 'Doctor', responsibility: 'UML class - domain object for Hospital Appointment Scheduling System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Specialty', responsibility: 'UML class - domain object for Hospital Appointment Scheduling System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'AvailabilitySlot', responsibility: 'UML class - domain object for Hospital Appointment Scheduling System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Appointment', responsibility: 'UML class - domain object for Hospital Appointment Scheduling System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Patient', responsibility: 'UML class - domain object for Hospital Appointment Scheduling System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
  },
  uml: { nodes, edges },
  umlCaption: 'Composition from HospitalAppointmentSchedulingService to Doctor, Specialty, AvailabilitySlot, Appointment, Patient. Code class names match these boxes.',
  designExplanation: {
    sections: [
      {
        heading: 'Why composition from the facade',
        paragraphs: [
          'The UML composition edges are implemented as private maps on HospitalAppointmentSchedulingService. Callers never touch those maps; they go through create/get/close methods drawn on the facade box.',
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
    { name: 'HospitalAppointmentSchedulingService', responsibility: 'UML facade - orchestrates Hospital Appointment Scheduling System.', keyMembers: ['create*', 'get*', 'closeDoctor'] },
    { name: 'Doctor', responsibility: 'UML class - domain object for Hospital Appointment Scheduling System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Specialty', responsibility: 'UML class - domain object for Hospital Appointment Scheduling System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'AvailabilitySlot', responsibility: 'UML class - domain object for Hospital Appointment Scheduling System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Appointment', responsibility: 'UML class - domain object for Hospital Appointment Scheduling System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    { name: 'Patient', responsibility: 'UML class - domain object for Hospital Appointment Scheduling System.', keyMembers: ['id', 'name', 'status', 'validate()', 'close()'] },
    ],
    patterns: [
      { name: 'Facade', why: 'One entry point matching the UML stereotype.', howApplied: 'HospitalAppointmentSchedulingService exposes create/get/close and owns composed collections.' },
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
      'main constructs HospitalAppointmentSchedulingService, creates UML domain objects, closes the primary Doctor, then logs two expected failures (double-close and missing id).',
    ],
    steps: [
      'Construct HospitalAppointmentSchedulingService.',
      'createDoctor for alpha and beta.',
      'create remaining UML classes.',
      'closeDoctor(alpha) then retry and get missing.',
    ],
    examples: [
      {
        title: 'Happy path',
        input: 'createDoctor("alpha..."); closeDoctor(id)',
        output: '[Doctor.close] id=... -> CLOSED',
        explanation: 'Facade delegates to the domain method drawn on the UML box.',
      },
      {
        title: 'Expected failure',
        input: 'closeDoctor(alreadyClosed) or getDoctor("MISSING-ID")',
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
