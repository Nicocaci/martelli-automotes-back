import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    // ✅ Primero busca en cookie, luego en header Authorization
    let token = req.cookies.access_token;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    console.log("🍪 Cookies recibidas:", req.cookies);
    console.log("🔑 Token encontrado:", token ? "sí" : "no");

    if (!token) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const decoded = jwt.verify(token, process.env.PRIVATE_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido" });
  }
};

export default auth;
