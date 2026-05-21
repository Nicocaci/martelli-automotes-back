import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    console.log("🍪 Cookies recibidas:", req.cookies);

    if (!token) {
      return res.status(401).json({
        message: "No autorizado",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Token inválido",
    });
  }
};

export default auth;