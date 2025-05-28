import jwt from 'jsonwebtoken';

const verificarToken = (req, res, next) => {
    const token = req.cookies.access_token;


    if(!token) {
        return res.status(401).json ({message: "Token no encontrado. Inicia sesión"})
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
             return res.status(401).json({ message: "Token inválido o expirado" });
        }
};


export default verificarToken;