const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
    // Verificar si existe el objeto de autorización en la sesión
    if (req.session.authorization) {
        // Recuperar el token de acceso de la sesión
        let token = req.session.authorization['accessToken'];

        // Verificar el token JWT
        // Nota: Asegúrate de que la clave secreta ("access") coincida con la que usaste al firmar el token en auth_users.js
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                // Si el token es válido, guardar el usuario en el request y pasar al siguiente middleware
                req.user = user;
                next();
            } else {
                // Si el token no es válido o ha expirado
                return res.status(403).json({ message: "Usuario no autenticado / Token inválido" });
            }
        });
    } else {
        // Si no hay información de autorización en la sesión
        return res.status(403).json({ message: "Usuario no ha iniciado sesión" });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
