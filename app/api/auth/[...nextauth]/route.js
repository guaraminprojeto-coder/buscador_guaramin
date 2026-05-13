import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const { rows } = await pool.query(
          "SELECT * FROM admins WHERE email = $1",
          [credentials.email]
        );
        const admin = rows[0];
        if (!admin) return null;
        const senhaOk = await bcrypt.compare(credentials.senha, admin.senha);
        if (!senhaOk) return null;
        return { id: admin.id, email: admin.email };
      }
    })
  ],
  pages: { signIn: "/login" },
  secret: process.env.NEXTAUTH_SECRET
});

export { handler as GET, handler as POST };