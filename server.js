
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Sample book data
let books = [
    {
        id: 1,
        title: "The Alchemist",
        author: "Paulo Coelho",
        price: 250
    },
    {
        id: 2,
        title: "Wings of Fire",
        author: "A.P.J. Abdul Kalam",
        price: 300
    },
    {
        id: 3,
        title: "Atomic Habits",
        author: "James Clear",
        price: 400
    }
];

// GET: Retrieve all books
app.get('/books', (req, res) => {
    res.json(books);
});

// GET: Retrieve a particular book
app.get('/books/:id', (req, res) => {
    const book = books.find(
        b => b.id === Number(req.params.id)
    );

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    res.json(book);
});

// POST: Add a new book
app.post('/books', (req, res) => {
    const { id, title, author, price } = req.body;

    if (
        id == null ||
        !title?.trim() ||
        !author?.trim() ||
        price == null ||
        title.length > 150 ||
        author.length > 100 ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
    ) {
        return res.status(400).json({
            message: "Please provide valid book details"
        });
    }

    if (
        books.some(b => b.id === Number(id)) ||
        !Number.isInteger(Number(id)) ||
        Number(id) < 1
    ) {
        return res.status(400).json({
            message: "Invalid or duplicate book ID"
        });
    }

    const newBook = {
        id: Number(id),
        title: title.trim(),
        author: author.trim(),
        price: Number(price)
    };

    books.push(newBook);

    res.status(201).json({
        message: "Book added successfully",
        book: newBook
    });
});

// PUT: Update book details
app.put('/books/:id', (req, res) => {
    const book = books.find(
        b => b.id === Number(req.params.id)
    );

    if (!book) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const { title, author, price } = req.body;

    if (
        !title?.trim() ||
        !author?.trim() ||
        price == null ||
        title.length > 150 ||
        author.length > 100 ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
    ) {
        return res.status(400).json({
            message: "Please provide valid book details"
        });
    }

    book.title = title.trim();
    book.author = author.trim();
    book.price = Number(price);

    res.json({
        message: "Book updated successfully",
        book
    });
});

// DELETE: Delete a book
app.delete('/books/:id', (req, res) => {
    const index = books.findIndex(
        b => b.id === Number(req.params.id)
    );

    if (index === -1) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    const deletedBook = books.splice(index, 1)[0];

    res.json({
        message: "Book deleted successfully",
        book: deletedBook
    });
});

// Handle invalid JSON and other errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).json({
            message: "Invalid JSON request data"
        });
    }

    console.error(err);

    res.status(500).json({
        message: "Internal server error"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
