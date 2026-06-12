require('dotenv').config();
const express = require('express');
const session = require('express-session');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Supabase client (service role — full DB + Storage access) ────────────────
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BUCKET = 'assets';

// ── Multer — store uploads in memory for direct pass-through to Supabase ─────
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.ADMIN_SESSION_SECRET || 'khyathi-weaves-heritage-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

// ── Serve local /assets folder (logo, me.jpg, etc.) ──────────────────────────
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ── Auth guard ────────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
    if (!req.session.isAdmin) return res.redirect('/admin/login');
    next();
}
function requireAdminApi(req, res, next) {
    if (!req.session.isAdmin) return res.status(403).json({ success: false, error: 'Unauthorized' });
    next();
}

// ── Storage helper ────────────────────────────────────────────────────────────
async function uploadToStorage(fileBuffer, originalName, mimetype) {
    const ext = path.extname(originalName);
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(safeName, fileBuffer, { contentType: mimetype, upsert: false });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(safeName);
    return data.publicUrl;
}

async function deleteFromStorage(publicUrl) {
    if (!publicUrl) return;
    try {
        const url = new URL(publicUrl);
        // Extract file name from path: /storage/v1/object/public/assets/<filename>
        const parts = url.pathname.split('/');
        const fileName = parts[parts.length - 1];
        await supabase.storage.from(BUCKET).remove([fileName]);
    } catch (_) { /* best-effort */ }
}

// ── HTML renderer ─────────────────────────────────────────────────────────────
function render(view, res) {
    try {
        const layout  = fs.readFileSync(path.join(__dirname, 'views', 'layout.html'), 'utf8');
        const content = fs.readFileSync(path.join(__dirname, 'views', `${view}.html`), 'utf8');
        res.send(layout.replace('', content));
    } catch (error) {
        console.error(error);
        res.status(500).send('View Rendering Error');
    }
}

// ════════════════════════════════════════════════════════════════════════════
// PUBLIC ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send('User-agent: *\nAllow: /\nSitemap: https://khyathiweaves.in/sitemap.xml');
});

app.get('/sitemap.xml', (req, res) => {
    res.header('Content-Type', 'application/xml');
    const baseUrl = 'https://khyathiweaves.in';
    res.send(`<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>${baseUrl}/</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><priority>1.0</priority></url>
        <url><loc>${baseUrl}/shop</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><priority>0.9</priority></url>
        <url><loc>${baseUrl}/about</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><priority>0.8</priority></url>
        <url><loc>${baseUrl}/contact</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod><priority>0.5</priority></url>
    </urlset>`);
});

app.get('/',        (req, res) => render('home', res));
app.get('/about',   (req, res) => render('about', res));
app.get('/shop',    (req, res) => render('shop', res));
app.get('/contact', (req, res) => render('contact', res));
app.get('/gallery', (req, res) => render('gallery', res));

// ── Public API: products list ─────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
    const { data, error } = await supabase.from('sarees').select('*').order('id');
    if (error) return res.status(500).json({ error: error.message });
    // Coerce Supabase boolean → integer (1/0) so shop.html Alpine comparisons (=== 0 / === 1) work
    const sarees = (data || []).map(s => ({ ...s, is_sold: s.is_sold ? 1 : 0 }));
    res.json(sarees);
});

// ── Public API: product images ────────────────────────────────────────────────
app.get('/api/products/:id/images', async (req, res) => {
    const { data, error } = await supabase
        .from('saree_images')
        .select('id, image_url')
        .eq('saree_id', req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    // ?withIds=1 → return [{id, url}] objects (used by admin panel)
    // default    → return plain URL array (used by shop.html)
    if (req.query.withIds) {
        res.json((data || []).map(r => ({ id: r.id, url: r.image_url })));
    } else {
        res.json((data || []).map(r => r.image_url));
    }
});

// ── Public API: gallery ───────────────────────────────────────────────────────
app.get('/api/gallery', async (req, res) => {
    const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('id', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data || []);
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN API: List all images in Storage (image picker)
// ════════════════════════════════════════════════════════════════════════════

// No auth required — bucket is already public; listing filenames is not sensitive
app.get('/api/storage/images', async (req, res) => {
    const { data, error } = await supabase.storage
        .from(BUCKET)
        .list('', { limit: 500, sortBy: { column: 'name', order: 'asc' } });
    if (error) return res.status(500).json({ error: error.message });
    const images = (data || [])
        .filter(f => f.name && /\.(jpe?g|png|webp|gif)$/i.test(f.name))
        .map(f => ({
            name: f.name,
            url: supabase.storage.from(BUCKET).getPublicUrl(f.name).data.publicUrl
        }));
    res.json(images);
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN AUTH ROUTES
// ════════════════════════════════════════════════════════════════════════════

app.get('/admin/login', (req, res) => {
    if (req.session.isAdmin) return res.redirect('/admin');
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
        return res.redirect('/admin/login?error=invalid');
    }
    req.session.isAdmin = true;
    req.session.adminEmail = email;
    return res.redirect('/admin');
});

app.get('/admin/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

// ════════════════════════════════════════════════════════════════════════════
// ADMIN PANEL
// ════════════════════════════════════════════════════════════════════════════

app.get('/admin', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// ── Toggle sold status ────────────────────────────────────────────────────────
app.post('/api/products/:id/toggle-sold', requireAdminApi, async (req, res) => {
    const { data: saree, error: fetchErr } = await supabase
        .from('sarees').select('is_sold').eq('id', req.params.id).single();
    if (fetchErr || !saree) return res.status(404).json({ success: false });

    const newStatus = !saree.is_sold;
    const { error } = await supabase
        .from('sarees').update({ is_sold: newStatus }).eq('id', req.params.id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true, newStatus });
});

// ── Add new saree (with images) ───────────────────────────────────────────────
app.post('/api/products', requireAdminApi, upload.fields([
    { name: 'primary_image', maxCount: 1 },
    { name: 'gallery_images', maxCount: 10 }
]), async (req, res) => {
    try {
        const { name, mrp, price, primary_storage_url, gallery_storage_urls } = req.body;
        let primaryImageUrl = null;

        // Prefer uploaded file; fall back to storage-picked URL
        if (req.files?.primary_image?.[0]) {
            const f = req.files.primary_image[0];
            primaryImageUrl = await uploadToStorage(f.buffer, f.originalname, f.mimetype);
        } else if (primary_storage_url) {
            primaryImageUrl = primary_storage_url;
        }

        const { data: saree, error: insertErr } = await supabase
            .from('sarees')
            .insert({ name, mrp, price, is_sold: false, primary_image: primaryImageUrl })
            .select('id').single();
        if (insertErr) throw insertErr;

        // Uploaded gallery files
        const galleryFiles = req.files?.gallery_images || [];
        for (const f of galleryFiles) {
            const url = await uploadToStorage(f.buffer, f.originalname, f.mimetype);
            await supabase.from('saree_images').insert({ saree_id: saree.id, image_url: url });
        }

        // Storage-picked gallery URLs (JSON array string)
        if (gallery_storage_urls) {
            try {
                const storageUrls = JSON.parse(gallery_storage_urls);
                for (const url of storageUrls) {
                    await supabase.from('saree_images').insert({ saree_id: saree.id, image_url: url });
                }
            } catch (_) { /* ignore parse errors */ }
        }

        // If nothing in gallery yet, add primary as first gallery image
        if (primaryImageUrl && galleryFiles.length === 0 && !gallery_storage_urls) {
            await supabase.from('saree_images').insert({ saree_id: saree.id, image_url: primaryImageUrl });
        }

        res.json({ success: true, id: saree.id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});


// ── Edit saree details (text fields only; images via separate endpoint) ────────
app.put('/api/products/:id', requireAdminApi, async (req, res) => {
    const { name, mrp, price } = req.body;
    const { error } = await supabase
        .from('sarees').update({ name, mrp, price }).eq('id', req.params.id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
});

// ── Delete saree (cascades to saree_images via FK) ────────────────────────────
app.delete('/api/products/:id', requireAdminApi, async (req, res) => {
    // Fetch images to delete from storage
    const { data: images } = await supabase
        .from('saree_images').select('image_url').eq('saree_id', req.params.id);
    const { data: saree } = await supabase
        .from('sarees').select('primary_image').eq('id', req.params.id).single();

    // Delete from storage (best effort)
    const urls = new Set([
        ...(images || []).map(i => i.image_url),
        saree?.primary_image
    ].filter(Boolean));
    for (const url of urls) await deleteFromStorage(url);

    // Delete DB row (cascade removes saree_images)
    const { error } = await supabase.from('sarees').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
});

// ── Add image to an existing saree ───────────────────────────────────────────
app.post('/api/products/:id/images', requireAdminApi, upload.single('image'), async (req, res) => {
    try {
        const f = req.file;
        if (!f) return res.status(400).json({ success: false, error: 'No file provided' });
        const url = await uploadToStorage(f.buffer, f.originalname, f.mimetype);
        await supabase.from('saree_images').insert({ saree_id: req.params.id, image_url: url });
        res.json({ success: true, url });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Delete a single image from a saree ───────────────────────────────────────
app.delete('/api/products/:id/images/:imgId', requireAdminApi, async (req, res) => {
    const { data: img } = await supabase
        .from('saree_images').select('image_url').eq('id', req.params.imgId).single();
    await deleteFromStorage(img?.image_url);
    const { error } = await supabase.from('saree_images').delete().eq('id', req.params.imgId);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
});

// ── Link an existing Storage image to a saree (no re-upload) ──────────────────
app.post('/api/products/:id/images/from-storage', requireAdminApi, async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ success: false, error: 'No URL provided' });
    const { error } = await supabase
        .from('saree_images')
        .insert({ saree_id: req.params.id, image_url: url });
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
});

// ── Gallery: Add item ─────────────────────────────────────────────────────────
app.post('/api/gallery', requireAdminApi, upload.single('image'), async (req, res) => {
    try {
        const { title, description, category } = req.body;
        let mediaUrl = null;
        if (req.file) {
            mediaUrl = await uploadToStorage(req.file.buffer, req.file.originalname, req.file.mimetype);
        }
        const { error } = await supabase
            .from('gallery_items').insert({ title, description, media_url: mediaUrl, category });
        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── Gallery: Edit item ────────────────────────────────────────────────────────
app.put('/api/gallery/:id', requireAdminApi, async (req, res) => {
    const { title, description, category } = req.body;
    const { error } = await supabase
        .from('gallery_items').update({ title, description, category }).eq('id', req.params.id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
});

// ── Gallery: Delete item ──────────────────────────────────────────────────────
app.delete('/api/gallery/:id', requireAdminApi, async (req, res) => {
    const { data: item } = await supabase
        .from('gallery_items').select('media_url').eq('id', req.params.id).single();
    await deleteFromStorage(item?.media_url);
    const { error } = await supabase.from('gallery_items').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ success: false, error: error.message });
    res.json({ success: true });
});

// ── Billing page (keep existing functionality) ─────────────────────────────────
app.get('/admin/billing', requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// ════════════════════════════════════════════════════════════════════════════
// START
// ════════════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log('KHYATHI WEAVES — SERVER RUNNING');
    console.log(`URL: http://localhost:${PORT}`);
    console.log('Database: Supabase PostgreSQL');
    console.log('-------------------------------------------');
});