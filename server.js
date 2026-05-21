const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurable Credentials for Verification
const ADMIN_USERNAME = 'admin'; 
const ADMIN_PASSWORD = 'KhyathiWeaves2026!'; // <-- Change this password before launching!

// Connect to SQLite local database file
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
const dbPath = path.join(dbDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure Secure Session Tracking Memory
app.use(session({
    secret: 'khyathi-heritage-secret-key-string',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // Session expires in 1 hour
}));

app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Database schema configuration
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS sarees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price TEXT NOT NULL,
        is_sold INTEGER DEFAULT 0,
        primary_image TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS saree_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        saree_id INTEGER,
        image_url TEXT NOT NULL,
        FOREIGN KEY(saree_id) REFERENCES sarees(id)
    )`);
});

// Verification Security Middleware Layer
function requireLogin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    res.redirect('/admin/login');
}

// Master Layout HTML Template Renderer
function renderView(viewName, res) {
    const layoutPath = path.join(__dirname, 'views', 'layout.html');
    const viewPath = path.join(__dirname, 'views', `${viewName}.html`);
    
    fs.readFile(layoutPath, 'utf8', (err, layoutHtml) => {
        if (err) return res.status(500).send("Layout configuration error");
        fs.readFile(viewPath, 'utf8', (err, viewHtml) => {
            if (err) return res.status(500).send("Content extraction error");
            const combinedHtml = layoutHtml.replace('<!-- VIEW_CONTENT_PLACEHOLDER -->', viewHtml);
            res.send(combinedHtml);
        });
    });
}

// Public Facing Routes
app.get('/', (req, res) => renderView('home', res));
app.get('/about', (req, res) => renderView('about', res));
app.get('/shop', (req, res) => renderView('shop', res));
app.get('/contact', (req, res) => renderView('contact', res));

// Authentication Action Gates
app.get('/admin/login', (req, res) => {
    if (req.session.isAdmin) return res.redirect('/admin');
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        return res.redirect('/admin');
    }
    // Redirect back to login with an error message parameter if verification fails
    res.redirect('/admin/login?error=invalid');
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// SECURED ADMIN ROUTES (Protected by requireLogin middleware)
// SECURED ADMIN ROUTES (Protected by requireLogin middleware)
app.get('/admin', requireLogin, (req, res) => {
    // Prevent browser back-button caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

app.get('/admin/billing', requireLogin, (req, res) => {
    // Prevent browser back-button caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Terminal Billing System</title>
            <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
        </head>
        <body class="bg-stone-900 text-stone-100 flex items-center justify-center min-h-screen font-mono">
            <div class="max-w-xl w-full p-8 bg-stone-950 border border-emerald-800/40 rounded-xl shadow-2xl mx-4">
                <div class="flex justify-between items-center border-b border-stone-800 pb-4 mb-6">
                    <div class="flex items-center space-x-3">
                        <img src="/assets/logo.png" alt="Logo" class="h-8 object-contain">
                        <h1 class="text-emerald-400 font-bold tracking-wider text-sm">BILLING TERMINAL</h1>
                    </div>
                    <a href="/admin" class="text-xs bg-stone-800 text-stone-400 px-3 py-1.5 rounded hover:bg-stone-700">Back</a>
                </div>
                <div class="space-y-4">
                    <div class="bg-stone-900 p-4 rounded border border-stone-800">
                        <label class="block text-xs uppercase text-stone-500 font-bold mb-1">Customer Phone</label>
                        <input type="text" placeholder="+91 XXXXX XXXXX" class="w-full bg-stone-950 border border-stone-800 rounded p-2 focus:border-emerald-600 outline-none text-white">
                    </div>
                    <div class="bg-stone-900 p-4 rounded border border-stone-800">
                        <label class="block text-xs uppercase text-stone-500 font-bold mb-1">Base Amount (INR)</label>
                        <input type="number" placeholder="0.00" class="w-full bg-stone-950 border border-stone-800 rounded p-2 focus:border-emerald-600 outline-none text-white">
                    </div>
                    <button onclick="alert('Receipt processed!')" class="w-full bg-emerald-600 text-stone-950 font-bold p-3 rounded tracking-widest hover:bg-emerald-500 transition-colors uppercase text-sm">Generate Invoice</button>
                </div>
            </div>
        </body>
        </html>
    `);
});
// Secure API Infrastructure Routes
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM sarees", [], (err, rows) => { res.json(rows); });
});
app.get('/api/products/:id/images', (req, res) => {
    db.all("SELECT image_url FROM saree_images WHERE saree_id = ?", [req.params.id], (err, rows) => { res.json(rows.map(r => r.image_url)); });
});
app.post('/api/products/:id/toggle-sold', requireLogin, (req, res) => {
    db.get("SELECT is_sold FROM sarees WHERE id = ?", [req.params.id], (err, row) => {
        const newStatus = row.is_sold === 1 ? 0 : 1;
        db.run("UPDATE sarees SET is_sold = ? WHERE id = ?", [newStatus, req.params.id], () => { res.json({ success: true }); });
    });
});

app.listen(PORT, () => console.log(`Secure server running at http://localhost:${PORT}`));