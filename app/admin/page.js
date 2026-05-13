"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Admin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [buscas, setBuscas] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status]);

  useEffect(() => {
    if (session) {
      fetch("/api/admin/buscas")
        .then(r => r.json())
        .then(data => Array.isArray(data) && setBuscas(data));
    }
  }, [session]);

  if (status === "loading") return <p style={{ padding: "2rem" }}>Carregando...</p>;

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6" }}>
      <nav style={{ background: "white", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: "1.2rem", fontWeight: "bold" }}>🐦 Guaramim Admin</h1>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button onClick={() => router.push("/admin/cadastros")}
            style={{ color: "#16a34a", background: "none", border: "none", cursor: "pointer", fontWeight: "bold" }}>
            Cadastros
          </button>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            style={{ color: "#dc2626", background: "none", border: "none", cursor: "pointer" }}>
            Sair
          </button>
        </div>
      </nav>

      <div style={{ padding: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem", fontWeight: "bold" }}>📊 Últimas Buscas</h2>
        <div style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead style={{ background: "#f9fafb" }}>
              <tr>
                {["Telefone", "Mensagem", "Serviço", "Resultados", "Data"].map(h => (
                  <th key={h} style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {buscas.map(b => (
                <tr key={b.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "0.75rem" }}>{b.telefone}</td>
                  <td style={{ padding: "0.75rem" }}>{b.mensagem_original}</td>
                  <td style={{ padding: "0.75rem" }}>{b.servico_interpretado}</td>
                  <td style={{ padding: "0.75rem" }}>{b.resultados_encontrados}</td>
                  <td style={{ padding: "0.75rem" }}>{new Date(b.criado_em).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
              {buscas.length === 0 && (
                <tr><td colSpan={5} style={{ padding: "1rem", textAlign: "center", color: "#9ca3af" }}>Nenhuma busca ainda</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}