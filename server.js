const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * 🔒 SECURITY CREDENTIALS
 * Change these for your production launch
 */
const ADMIN_USERNAME = 'admin'; 
const ADMIN_PASSWORD = 'KhyathiWeaves2026!'; 

// Ensure Database Directory Exists
// Change this in server.js
const dbDir = process.env.RENDER_DISK_MOUNT_PATH || path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
const dbPath = path.join(dbDir, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'khyathi-weaves-heritage-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 } // 1 Hour session
}));

// Serve Static Assets (Logo and Saree Images)
app.use('/assets', express.static(path.join(__dirname, 'assets')));

/**
 * 🗄️ DATABASE INITIALIZATION & SEEDING
 * Logic to ensure the shop is populated with local assets on first run.
 */
db.serialize(() => {
    // 1. Updated Table with mrp column
    db.run(`CREATE TABLE IF NOT EXISTS sarees (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT, 
        mrp TEXT, 
        price TEXT, 
        is_sold INTEGER DEFAULT 0, 
        primary_image TEXT
    )`);
    
    db.run(`CREATE TABLE IF NOT EXISTS saree_images (id INTEGER PRIMARY KEY AUTOINCREMENT, saree_id INTEGER, image_url TEXT, FOREIGN KEY(saree_id) REFERENCES sarees(id))`);

    db.get("SELECT COUNT(*) as count FROM sarees", [], (err, row) => {
        if (row && row.count === 0) {
            // 2. Updated Inventory with MRP
            const initialInventory = [
                {
                    name: 'Chettinad Cotton Saree(CC1)',
                    mrp: '₹1385',
                    price: '₹1185',
                    is_sold: 0,
                    main: '/assets/saree1_main.jpg',
                    gallery: ['/assets/saree1_main.jpg', '/assets/saree1_detail1.jpg']
                },
                // Apply this pattern (adding mrp) to CC2 through CC9...
                {
                    name: 'Chettinad Cotton Saree(CC2)',
                    mrp: '₹1385',
                    price: '₹1185',
                    is_sold: 1,
                    main: '/assets/saree2_main.jpg',
                    gallery: ['/assets/saree2_main.jpg', '/assets/saree2_detail1.jpg']
                },
                {
                    name: 'Chettinad Cotton Saree(CC3)',
                    mrp: '₹1695',
                    price: '₹1495',
                    is_sold: 0,
                    main: '/assets/saree3_main.jpg',
                    gallery: ['/assets/saree3_main.jpg', '/assets/saree3_detail1.jpg']
                },
                {
                    name: 'Chettinad Cotton Saree(CC4)',
                    mrp: '₹1385',
                    price: '₹1185',
                    is_sold: 0,
                    main: '/assets/saree4_main.jpg',
                    gallery: ['/assets/saree4_main.jpg', '/assets/saree4_detail1.jpg']
                },
                {
                    name: 'Chettinad Cotton Saree(CC5)',
                    mrp: '₹1385',
                    price: '₹1185',
                    is_sold: 0,
                    main: '/assets/saree5_main.jpg',
                    gallery: ['/assets/saree5_main.jpg', '/assets/saree5_detail1.jpg']
                },
                {
                    name: 'Chettinad Cotton Saree(CC6)',
                    mrp: '₹1385',
                    price: '₹1185',
                    is_sold: 0,
                    main: '/assets/saree6_main.jpg',
                    gallery: ['/assets/saree6_main.jpg', '/assets/saree6_detail1.jpg']
                },
                {
                    name: 'Chettinad Cotton Saree(CC7)',
                    mrp: '₹1485',
                    price: '₹1285',
                    is_sold: 1,
                    main: '/assets/saree7_main.jpg',
                    gallery: ['/assets/saree7_main.jpg', '/assets/saree7_detail1.jpg']
                },
                {
                    name: 'Chettinad Cotton Saree(CC9)',
                    mrp: '₹1585',
                    price: '₹1385',
                    is_sold: 1,
                    main: '/assets/saree9_main.jpg',
                    gallery: ['/assets/saree9_main.jpg']
                },
                {
                    name: 'Chettinad Cotton Saree(CC10)',
                    mrp: '₹1585',
                    price: '₹1385',
                    is_sold: 0,
                    main: '/assets/saree10_main.jpg',
                    gallery: ['/assets/saree10_main.jpg', '/assets/saree10_detail1.jpg']
                },
                {
                    name: 'Chettinad Cotton Saree(CC11)',
                    mrp: '₹1385',
                    price: '₹1185',
                    is_sold: 0,
                    main: '/assets/saree11_main.jpg',
                    gallery: ['/assets/saree11_main.jpg', '/assets/saree11_detail1.jpg']
                },
                {
                    name: 'Chettinad Cotton Saree(CC12)',
                    mrp: '₹1385',
                    price: '₹1185',
                    is_sold: 1,
                    main: '/assets/saree12_main.jpg',
                    gallery: ['/assets/saree12_main.jpg']
                },
                // ... etc for the rest of your sarees
            ];

            initialInventory.forEach(s => {
                db.run(`INSERT INTO sarees (name, mrp, price, is_sold, primary_image) VALUES (?, ?, ?, ?, ?)`, 
                [s.name, s.mrp, s.price, s.is_sold, s.main], function(err) {
                    const sID = this.lastID;
                    s.gallery.forEach(img => {
                        db.run(`INSERT INTO saree_images (saree_id, image_url) VALUES (?, ?)`, [sID, img]);
                    });
                });
            });
        }
    });
});
/**
 * 🖼️ VIEW RENDERING ENGINE
 * Combines layout.html with specific page content.
 */
function render(view, res) {
    try {
        const layout = fs.readFileSync(path.join(__dirname, 'views', 'layout.html'), 'utf8');
        const content = fs.readFileSync(path.join(__dirname, 'views', `${view}.html`), 'utf8');
        
        // Ensure this string matches exactly what is in your layout.html
        res.send(layout.replace('', content));
    } catch (error) {
        console.error(error);
        res.status(500).send("View Rendering Error");
    }
}

// Public Page Routes
app.get('/', (req, res) => render('home', res));
app.get('/about', (req, res) => render('about', res));
app.get('/shop', (req, res) => render('shop', res));
app.get('/contact', (req, res) => render('contact', res));

/**
 * 🔒 ADMIN GATEWAY
 */
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
    res.redirect('/admin/login?error=invalid');
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

app.get('/admin', (req, res) => {
    if (!req.session.isAdmin) return res.redirect('/admin/login');
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Billing Terminal (Inline Styled)
app.get('/admin/billing', (req, res) => {
    if (!req.session.isAdmin) return res.redirect('/admin/login');
    res.send(`
        <html><head><script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script></head>
        <body class="bg-stone-900 text-stone-100 flex items-center justify-center h-screen font-mono">
            <div class="p-10 bg-stone-950 border border-emerald-500/30 rounded-3xl w-full max-w-md shadow-2xl">
                <h1 class="text-emerald-400 font-bold mb-6 tracking-widest text-center">BILLING TERMINAL</h1>
                <div class="space-y-4">
                    <input type="text" placeholder="Customer Number" class="w-full bg-stone-900 border border-stone-800 p-4 rounded-xl outline-none focus:border-emerald-500">
                    <input type="number" placeholder="Total Amount" class="w-full bg-stone-900 border border-stone-800 p-4 rounded-xl outline-none focus:border-emerald-500">
                    <button onclick="alert('Printing Invoice...')" class="w-full bg-emerald-600 hover:bg-emerald-500 p-4 rounded-xl font-bold uppercase transition-all">Process Bill</button>
                    <a href="/admin" class="block text-center mt-6 text-xs text-stone-500 hover:text-stone-300">Exit System</a>
                </div>
            </div>
        </body></html>
    `);
});

/**
 * 🌐 API ENDPOINTS
 */

// Get all sarees
app.get('/api/products', (req, res) => {
    db.all("SELECT * FROM sarees", [], (err, rows) => {
        res.json(rows || []);
    });
});

// Get specific saree gallery images
app.get('/api/products/:id/images', (req, res) => {
    db.all("SELECT image_url FROM saree_images WHERE saree_id = ?", [req.params.id], (err, rows) => {
        res.json(rows ? rows.map(r => r.image_url) : []);
    });
});

// Admin: Toggle Sold Status
app.post('/api/products/:id/toggle-sold', (req, res) => {
    if (!req.session.isAdmin) return res.status(403).json({ success: false });
    db.get("SELECT is_sold FROM sarees WHERE id = ?", [req.params.id], (err, row) => {
        if (!row) return res.status(404).json({ success: false });
        const nextStatus = row.is_sold === 1 ? 0 : 1;
        db.run("UPDATE sarees SET is_sold = ? WHERE id = ?", [nextStatus, req.params.id], () => {
            res.json({ success: true, newStatus: nextStatus });
        });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`-------------------------------------------`);
    console.log(`KHYATHI WEAVES CORE SERVER RUNNING`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log(`-------------------------------------------`);
});