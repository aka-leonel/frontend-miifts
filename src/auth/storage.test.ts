import { describe, it, expect, beforeEach } from "vitest";
import {
  getToken,
  setToken,
  getUsuarioGuardado,
  setUsuarioGuardado,
  clearSesion,
  getTokenExpSeconds,
} from "./storage";
import type { Usuario } from "../api/types";

describe("storage.ts", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should manage token correctly", () => {
    expect(getToken()).toBeNull();
    setToken("test-token-123");
    expect(getToken()).toBe("test-token-123");
  });

  it("should manage saved user correctly", () => {
    const usuario: Usuario = {
      id: 1,
      email: "test@ifts.edu.ar",
      nombre: "Juan",
      apellido: "Pérez",
      rol: "alumno",
      carrera_id: 1,
    };

    expect(getUsuarioGuardado()).toBeNull();
    setUsuarioGuardado(usuario);
    expect(getUsuarioGuardado()).toEqual(usuario);
  });

  it("should handle corrupted json in user storage gracefully", () => {
    localStorage.setItem("miifts_usuario", "invalid-json");
    expect(getUsuarioGuardado()).toBeNull();
  });

  it("should clear session completely", () => {
    setToken("token-abc");
    setUsuarioGuardado({
      id: 1,
      email: "test@ifts.edu.ar",
      nombre: "Juan",
      rol: "alumno",
      carrera_id: 1,
    });

    clearSesion();

    expect(getToken()).toBeNull();
    expect(getUsuarioGuardado()).toBeNull();
  });

  it("should parse token expiration seconds from JWT", () => {
    expect(getTokenExpSeconds("invalid")).toBeNull();

    // A dummy JWT with payload { exp: 1700000000 }
    // header: {"alg":"HS256","typ":"JWT"} -> eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
    // payload: {"exp":1700000000} -> eyJleHAiOjE3MDAwMDAwMDB9
    // signature: dummy
    const dummyJwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDAwMDAwMDB9.signature";
    expect(getTokenExpSeconds(dummyJwt)).toBe(1700000000);
  });
});
