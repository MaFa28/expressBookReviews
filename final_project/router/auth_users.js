const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    // Filtrar el arreglo de usuarios buscando coincidencias con el nombre de usuario
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Si se encuentra al menos un usuario, devuelve true, indicando que existe
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username, password) => { //returns boolean
    // Filtrar buscando que tanto el nombre de usuario como la contraseña coincidan
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Si se encuentra una coincidencia, las credenciales son válidas
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // 1. Verificar que se hayan proporcionado usuario y contraseña
    if (!username || !password) {
        return res.status(404).json({ message: "Error al iniciar sesión. Faltan datos." });
    }

    // 2. Autenticar al usuario usando la función auxiliar
    if (authenticatedUser(username, password)) {
        // 3. Generar el token JWT. 
        // Nota: Usamos la firma "access" porque así lo configuraste en index.js
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 }); // Expira en 1 hora

        // 4. Guardar el token y el nombre de usuario en la sesión
        req.session.authorization = {
            accessToken, username
        }

        return res.status(200).send("Usuario ha iniciado sesión exitosamente");
    } else {
        return res.status(208).json({ message: "Inicio de sesión inválido. Verifica tu usuario y contraseña" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    // 1. Obtener el ISBN y la reseña
    const isbn = req.params.isbn;
    const review = req.query.review;

    // 2. Obtener el nombre de usuario de la sesión activa
    const username = req.session.authorization.username;

    // 3. Verificar si el libro existe en la base de datos
    if (books[isbn]) {
        // 4. Verificar que se haya proporcionado una reseña en la consulta
        if (review) {
            // 5. Agregar o modificar la reseña
            // Si el usuario ya tiene una reseña para este ISBN, se actualiza. Si no, se crea.
            books[isbn].reviews[username] = review;
            return res.status(200).send(`La reseña para el libro con ISBN ${isbn} ha sido agregada/actualizada exitosamente.`);
        } else {
            return res.status(400).json({ message: "No se proporcionó ninguna reseña" });
        }
    } else {
        return res.status(404).json({ message: "Libro no encontrado" });
    }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // 1. Obtener el ISBN de los parámetros
    const isbn = req.params.isbn;

    // 2. Obtener el nombre de usuario de la sesión actual
    const username = req.session.authorization.username;

    // 3. Verificar si el libro existe
    if (books[isbn]) {
        // 4. Eliminar la reseña asociada a este usuario
        delete books[isbn].reviews[username];

        return res.status(200).send(`La reseña para el libro con ISBN ${isbn} publicada por el usuario ${username} ha sido eliminada exitosamente.`);
    } else {
        return res.status(404).json({ message: "Libro no encontrado" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;