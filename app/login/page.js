"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  async function handleLogin() {
    setErro("");
    const res = await signIn("credentials", {
      email, senha, redirect: false
    });
    if (res?.ok) {
      router.push("/admin");
    } else {
      setErro("Email ou senha incorretos");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "white", padding: "2rem", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", width: "100%", maxWidth: "360px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "1.5rem" }}>🐦 Guaramim Admin</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", border: "1px solid #ddd", borderRadius: "4px", padding: "0.5rem", marginBottom: "0.75rem" }}
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleLogin()}
          style={{ width: "100%", border: "1px solid #ddd", borderRadius: "4px", padding: "0.5rem", marginBottom: "0.75rem" }}
        />

        {erro && <p style={{ color: "red", fontSize: "0.85rem", marginBottom: "0.75rem" }}>{erro}</p>}

        <button
          onClick={handleLogin}
          style={{ width: "100%", background: "#16a34a", color: "white", border: "none", borderRadius: "4px", padding: "0.6rem", fontWeight: "bold", cursor: "pointer" }}
        >
          Entrar
        </button>
      </div>
    </div>
  );
}