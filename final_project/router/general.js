const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    // 1. Obtener nombre de usuario y contraseña del cuerpo de la solicitud
    const username = req.body.username;
    const password = req.body.password;

    // 2. Verificar que se hayan proporcionado ambos campos
    if (username && password) {
        // 3. Verificar si el usuario ya existe en el arreglo 'users'
        // Asumiendo que 'users' es un arreglo de objetos [{username: "...", password: "..."}]
        const userExists = users.filter((user) => user.username === username);

        if (userExists.length > 0) {
            // Si el usuario ya existe, devolver un error
            return res.status(409).json({ message: "El usuario ya existe" });
        } else {
            // Si el usuario no existe, agregarlo al arreglo de usuarios
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "Usuario registrado exitosamente. Ahora puedes iniciar sesión." });
        }
    }

    // 4. Si falta el nombre de usuario o la contraseña, devolver un error
    return res.status(400).json({ message: "No se proporcionó nombre de usuario y/o contraseña" });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Enviar el objeto books formateado con JSON.stringify
    // El 'null, 4' añade indentación de 4 espacios para que la salida se vea ordenada
    return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    // 1. Recuperar el ISBN de los parámetros de la solicitud
    const isbn = req.params.isbn;

    // 2. Buscar el libro en la base de datos (objeto books) usando el ISBN como clave
    const book = books[isbn];

    // 3. Devolver los detalles del libro si se encuentra, o un error si no existe
    if (book) {
        return res.status(200).json(book);
    } else {
        return res.status(404).json({ message: "Libro no encontrado" });
    }
});

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    // 1. Recuperar el autor de los parámetros de la solicitud
    const author = req.params.author;

    // 2. Obtener todas las claves del objeto books
    const keys = Object.keys(books);

    // 3. Crear un arreglo para almacenar los libros que coincidan
    let matchingBooks = [];

    // 4. Iterar a través de las claves y verificar si el autor coincide
    keys.forEach(key => {
        if (books[key].author === author) {
            // Agregar el libro al arreglo (incluyendo su ISBN para mayor claridad)
            matchingBooks.push({
                isbn: key,
                title: books[key].title,
                reviews: books[key].reviews
            });
        }
    });

    // 5. Devolver los libros encontrados o un mensaje de error si el arreglo está vacío
    if (matchingBooks.length > 0) {
        return res.status(200).json({ booksbyauthor: matchingBooks });
    } else {
        return res.status(404).json({ message: "No se encontraron libros para ese autor" });
    }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
    // 1. Recuperar el título de los parámetros de la solicitud
    const title = req.params.title;

    // 2. Obtener todas las claves del objeto books
    const keys = Object.keys(books);

    // 3. Crear un arreglo para almacenar los libros que coincidan
    let matchingBooks = [];

    // 4. Iterar a través de las claves y verificar si el título coincide
    keys.forEach(key => {
        if (books[key].title === title) {
            // Agregar el libro al arreglo (incluyendo su ISBN y autor)
            matchingBooks.push({
                isbn: key,
                author: books[key].author,
                reviews: books[key].reviews
            });
        }
    });

    // 5. Devolver los libros encontrados o un mensaje de error si no hay coincidencias
    if (matchingBooks.length > 0) {
        return res.status(200).json({ booksbytitle: matchingBooks });
    } else {
        return res.status(404).json({ message: "No se encontraron libros con ese título" });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    // 1. Recuperar el ISBN de los parámetros de la solicitud
    const isbn = req.params.isbn;

    // 2. Buscar el libro en la base de datos usando el ISBN
    const book = books[isbn];

    // 3. Si el libro existe, devolver únicamente sus reseñas; de lo contrario, enviar un error
    if (book) {
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({ message: "Libro no encontrado" });
    }
});

module.exports.general = public_users;
