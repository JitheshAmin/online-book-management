
const API_URL = '/books';

const bookForm = document.getElementById('bookForm');
const bookList = document.getElementById('bookList');
const message = document.getElementById('message');

const bookId = document.getElementById('bookId');
const title = document.getElementById('title');
const author = document.getElementById('author');
const price = document.getElementById('price');

const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');

let editMode = false;

// Display message
function showMessage(msg, type) {
    message.textContent = msg;
    message.className = type;
}

// API request helper
async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Request failed');
    }

    return data;
}

// GET: Display all books
async function displayBooks() {
    try {
        const books = await apiRequest(API_URL);

        bookList.replaceChildren();

        books.forEach(book => {
            const row = document.createElement('tr');

            const values = [
                book.id,
                book.title,
                book.author,
                Number(book.price).toFixed(2)
            ];

            values.forEach(value => {
                const cell = document.createElement('td');
                cell.textContent = value;
                row.appendChild(cell);
            });

            const actionCell = document.createElement('td');

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'edit-btn';
            editButton.addEventListener('click', () => {
                editBook(book);
            });

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-btn';
            deleteButton.addEventListener('click', () => {
                deleteBook(book.id);
            });

            actionCell.append(editButton, deleteButton);
            row.appendChild(actionCell);

            bookList.appendChild(row);
        });

        if (books.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');

            cell.colSpan = 5;
            cell.textContent = 'No books available';

            row.appendChild(cell);
            bookList.appendChild(row);
        }

    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// POST: Add new book
bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const book = {
        id: Number(bookId.value),
        title: title.value.trim(),
        author: author.value.trim(),
        price: Number(price.value)
    };

    if (
        !Number.isInteger(book.id) ||
        book.id < 1 ||
        !book.title ||
        !book.author ||
        !Number.isFinite(book.price) ||
        book.price < 0
    ) {
        showMessage('Please enter valid book details', 'error');
        return;
    }

    try {
        let data;

        if (editMode) {
            // PUT: Update book
            const { id, ...details } = book;

            data = await apiRequest(
                `${API_URL}/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(details)
                }
            );

        } else {
            // POST: Add book
            data = await apiRequest(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(book)
            });
        }

        showMessage(data.message, 'success');

        bookForm.reset();
        resetForm();

        await displayBooks();

    } catch (error) {
        showMessage(error.message, 'error');
    }
});

// Load book details into form for editing
function editBook(book) {
    bookId.value = book.id;
    bookId.readOnly = true;

    title.value = book.title;
    author.value = book.author;
    price.value = book.price;

    editMode = true;

    submitBtn.textContent = 'Update Book';
    cancelBtn.hidden = false;

    showMessage('Edit the book details and click Update Book', 'success');
}

// DELETE: Delete book
async function deleteBook(id) {
    if (!confirm('Are you sure you want to delete this book?')) {
        return;
    }

    try {
        const data = await apiRequest(
            `${API_URL}/${id}`,
            {
                method: 'DELETE'
            }
        );

        showMessage(data.message, 'success');

        await displayBooks();

    } catch (error) {
        showMessage(error.message, 'error');
    }
}

// Reset form
function resetForm() {
    editMode = false;
    bookId.readOnly = false;

    submitBtn.textContent = 'Add Book';
    cancelBtn.hidden = true;
}

// Cancel update
cancelBtn.addEventListener('click', () => {
    bookForm.reset();
    resetForm();
    showMessage('Update cancelled', 'success');
});

// Initial load
displayBooks();
