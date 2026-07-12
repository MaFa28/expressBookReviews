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

// Tarea 10: Get the book list available in the shop using async/await and Promises
public_users.get('/', async function (req, res) {
    try {
        // 1. Creamos una Promesa que simula una operación asíncrona (como consultar una base de datos)
        const getBooks = new Promise((resolve, reject) => {
            // Resolvemos la promesa devolviendo el objeto books
            resolve(books);
        });

        // 2. Usamos await para esperar a que la Promesa se resuelva
        const bookList = await getBooks;

        // 3. Enviamos la respuesta con los datos
        return res.status(200).send(JSON.stringify(bookList, null, 4));
    } catch (error) {
        // Manejo de errores en caso de que la promesa falle
        return res.status(500).json({ message: "Error interno al obtener los libros" });
    }
});

// Tarea 11: Get book details based on ISBN using async/await and Promises
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    try {
        // 1. Creamos una Promesa para simular la búsqueda asíncrona
        const getBookByIsbn = new Promise((resolve, reject) => {
            const book = books[isbn];
            if (book) {
                resolve(book); // Si el libro existe, resolvemos la promesa con los datos
            } else {
                reject(new Error("Libro no encontrado")); // Si no, la rechazamos con un error
            }
        });

        // 2. Usamos await para esperar el resultado de la Promesa
        const bookData = await getBookByIsbn;

        // 3. Enviamos la respuesta si se resuelve con éxito
        return res.status(200).json(bookData);

    } catch (error) {
        // 4. Capturamos el error si la promesa fue rechazada (el libro no existe)
        return res.status(404).json({ message: error.message });
    }
});

// Get book details based on author
// Tarea 12: Get book details based on author using async/await and Promises
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;

    try {
        // 1. Creamos la Promesa para manejar la lógica de búsqueda
        const getBooksByAuthor = new Promise((resolve, reject) => {
            const keys = Object.keys(books);
            let matchingBooks = [];

            keys.forEach(key => {
                if (books[key].author === author) {
                    matchingBooks.push({
                        isbn: key,
                        title: books[key].title,
                        reviews: books[key].reviews
                    });
                }
            });

            // Si encontramos libros, resolvemos la promesa. Si no, la rechazamos.
            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject(new Error("No se encontraron libros para ese autor"));
            }
        });

        // 2. Esperamos a que la promesa se resuelva usando await
        const booksByAuthor = await getBooksByAuthor;

        // 3. Enviamos la respuesta exitosa
        return res.status(200).json({ booksbyauthor: booksByAuthor });

    } catch (error) {
        // 4. Capturamos el error de la promesa rechazada
        return res.status(404).json({ message: error.message });
    }
});

// Tarea 13: Get all books based on title using async/await and Promises
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;

    try {
        // 1. Creamos la Promesa para manejar la lógica de búsqueda por título
        const getBooksByTitle = new Promise((resolve, reject) => {
            const keys = Object.keys(books);
            let matchingBooks = [];

            keys.forEach(key => {
                if (books[key].title === title) {
                    matchingBooks.push({
                        isbn: key,
                        author: books[key].author,
                        reviews: books[key].reviews
                    });
                }
            });

            // Resolvemos si hay coincidencias, rechazamos si no hay
            if (matchingBooks.length > 0) {
                resolve(matchingBooks);
            } else {
                reject(new Error("No se encontraron libros con ese título"));
            }
        });

        // 2. Esperamos a que la promesa se resuelva
        const booksByTitle = await getBooksByTitle;

        // 3. Enviamos la respuesta
        return res.status(200).json({ booksbytitle: booksByTitle });

    } catch (error) {
        // 4. Capturamos el error si no se encuentra el título
        return res.status(404).json({ message: error.message });
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
