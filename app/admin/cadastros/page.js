"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Cadastros() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cadastros, setCadastros] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/cadastros")
        .then(r => r.json())
        .then(data => Array.isArray(data) && setCadastros(data));
    }
  }, [session]);

  async function atualizar(id, campo, valor) {
    await fetch("/api/admin/cadastros", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, campo, valor })
    });
    setCadastros(prev => prev.map(c => c.id === id ? { ...c, [campo]: valor } : c));
  }

  async function excluir(id) {
    if (!confirm("Excluir este cadastro?")) return;
    await fetch("/api/admin/cadastros", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setCadastros(prev => prev.filter(c => c.id !== id));
  }

  if (status === "loading") return <p style={{ padding: "2rem" }}>Carregando...</p>;

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <nav style={{ background: "white", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>🐦 Guaramim — Cadastros</h1>
        <button onClick={() => router.push("/admin")}
          style={{ color: "#16a34a", background: "none", border: "none", cursor: "pointer" }}>
          ← Voltar
        </button>
      </nav>

      <div style={{ padding: "1.5rem", overflowX: "auto" }}>
        <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                {["Nome", "Telefone", "Categoria", "Cidade", "Plano", "Ativo", "Ações"].map(h => (
                  <th key={h} style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cadastros.map(c => (
                <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.75rem", fontWeight: "500" }}>{c.nome}</td>
                  <td style={{ padding: "0.75rem" }}>{c.telefone}</td>
                  <td style={{ padding: "0.75rem" }}>{c.categoria}</td>
                  <td style={{ padding: "0.75rem" }}>{c.cidade}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <select
                      value={c.plano}
                      onChange={e => atualizar(c.id, "plano", e.target.value)}
                      style={{ border: "1px solid #ddd", borderRadius: "4px", padding: "0.25rem", fontSize: "0.8rem" }}
                    >
                      <option value="basico">Básico</option>
                      <option value="premium">Premium ⭐</option>
                    </select>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <button
                      onClick={() => atualizar(c.id, "ativo", !c.ativo)}
                      style={{
                        padding: "0.25rem 0.5rem", borderRadius: "4px", border: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600",
                        background: c.ativo ? "#dcfce7" : "#fee2e2",
                        color: c.ativo ? "#16a34a" : "#dc2626"
                      }}
                    >
                      {c.ativo ? "Ativo" : "Inativo"}
                    </button>
                  </td>
                  <td style={{ padding: "0.75rem" }}>
                    <button
                      onClick={() => excluir(c.id)}
                      style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer", fontSize: "0.8rem" }}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {cadastros.length === 0 && (
                <tr><td colSpan={7} style={{ padding: "1rem", textAlign: "center", color: "#9ca3af" }}>Nenhum cadastro ainda</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}