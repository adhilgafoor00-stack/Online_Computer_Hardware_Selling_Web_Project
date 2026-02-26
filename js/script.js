/* =========================
   CONSTANTS & STORAGE
========================= */
const ADMIN_ID = "admin";
const ADMIN_PASS = "admin@123";

/* PRODUCTS */
let products = []; // will be loaded from backend

async function fetchProducts() {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      products = await res.json();
    } else {
      console.error('Failed to fetch products');
    }
  } catch (e) {
    console.error('Error fetching products', e);
  }
}

/* CART */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

/* SERVICE CONTACT */
if (!localStorage.getItem("serviceContact")) {
  localStorage.setItem("serviceContact", "+91 9XXXXXXXXX");
}

/* =========================
   SAVE FUNCTIONS
========================= */
function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================
   LOGIN
========================= */
async function login() {
  const id = document.getElementById("userid").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (!id || !pass) {
    alert("Please enter login details");
    return;
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: id, password: pass })
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("role", data.role);
      if (data.role === 'admin') {
        window.location.href = "admin.html";
      } else {
        window.location.href = "products.html";
      }
    } else {
      const err = await res.json();
      alert(err.error || 'Login failed');
    }
  } catch (e) {
    alert('Network error: ' + e.message);
  }
}

/* =========================
   PRODUCT CATEGORIES
========================= */
async function loadCategories() {
  await fetchProducts();
  const div = document.getElementById("categories");
  if (!div) return;

  div.innerHTML = "";
  const cats = [...new Set(products.map(p => p.cat))];

  cats.forEach(c => {
    const span = document.createElement("span");
    span.className = "category";
    span.innerText = c;
    span.onclick = () => showProducts(c);
    div.appendChild(span);
  });
}

/* =========================
   SHOW PRODUCTS
========================= */
function showProducts(filter = null) {
  const list = document.getElementById("productList");
  if (!list) return;

  list.innerHTML = "";

  products
    .filter(p => !filter || p.cat === filter)
    .forEach(p => {
      const d = document.createElement("div");
      d.className = "product";
      d.innerHTML = `
        <img src="${p.img}">
        <h3>${p.name}</h3>
        <p>₹${p.price}</p>
        <button onclick="addToCart(${p.id})">Add to Cart</button>
      `;
      list.appendChild(d);
    });
}

/* =========================
   SORT PRODUCTS
========================= */
function sortProducts(type) {
  if (type === "low") products.sort((a, b) => a.price - b.price);
  if (type === "high") products.sort((a, b) => b.price - a.price);
  showProducts();
}

/* =========================
   CART FUNCTIONS
========================= */
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;

  cart.push(product);
  saveCart();
  alert("Added to cart");
}

function loadCart() {
  const div = document.getElementById("cartItems");
  const totalEl = document.getElementById("total");
  if (!div || !totalEl) return;

  div.innerHTML = "";
  let total = 0;

  cart.forEach(p => {
    total += p.price;
    div.innerHTML += `<p>${p.name} - ₹${p.price}</p>`;
  });

  totalEl.innerText = "Total: ₹" + total;
}

/* =========================
   ORDER
========================= */
function placeOrder() {
  localStorage.setItem("order", JSON.stringify(cart));
  localStorage.removeItem("cart");
  cart = [];
  window.location.href = "order.html";
}

function loadOrder() {
  const div = document.getElementById("summary");
  if (!div) return;

  const data = JSON.parse(localStorage.getItem("order")) || [];
  div.innerHTML = "";

  data.forEach(p => {
    div.innerHTML += `<p>${p.name} - ₹${p.price}</p>`;
  });
}

/* =========================
   ADMIN PRODUCT MANAGEMENT
========================= */
async function addProduct() {
  const name = pname.value.trim();
  const cat = pcat.value.trim();
  const price = Number(pprice.value);
  const img = pimg.value.trim();

  if (!name || !cat || !price || !img) {
    alert("Fill all fields");
    return;
  }

  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, cat, price, img })
  });
  if (res.ok) {
    await loadAdminProducts();
    pname.value = "";
    pcat.value = "";
    pprice.value = "";
    pimg.value = "";
  } else {
    alert('Failed to add product');
  }
}

async function deleteProduct(id) {
  // TODO: implement backend deletion endpoint
  products = products.filter(p => p.id !== id);
  await loadAdminProducts();
}

async function loadAdminProducts() {
  await fetchProducts();
  const div = document.getElementById("adminProductList");
  if (!div) return;

  div.innerHTML = "";
  products.forEach(p => {
    div.innerHTML += `
      <div class="product">
        <img src="${p.img}" width="80"><br>
        <input value="${p.name}" onchange="p.name=this.value;saveProducts()">
        <input value="${p.cat}" onchange="p.cat=this.value;saveProducts()">
        <input type="number" value="${p.price}" onchange="p.price=this.value;saveProducts()">
        <button onclick="deleteProduct(${p.id})">Delete</button>
      </div>
    `;
  });
}

/* =========================
   SERVICE CONTACT (ADMIN)
========================= */
function saveContact() {
  const num = document.getElementById("contactInput").value.trim();
  if (!num) {
    alert("Enter valid contact number");
    return;
  }
  localStorage.setItem("serviceContact", num);
  alert("Contact number updated");
}

async function registerUser() {
  const username = document.getElementById('newUser').value.trim();
  const password = document.getElementById('newPass').value.trim();
  if (!username || !password) {
    alert('Enter username and password');
    return;
  }

  const payload = { username, password, role: 'user' };
  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Role': localStorage.getItem('role') || ''
      },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      alert('User account created');
      document.getElementById('newUser').value = '';
      document.getElementById('newPass').value = '';
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to create user');
    }
  } catch (e) {
    alert('Network error: ' + e.message);
  }
}

async function signupUser() {
  const username = document.getElementById('signupUser').value.trim();
  const password = document.getElementById('signupPass').value.trim();
  if (!username || !password) {
    alert('Enter username and password');
    return;
  }
  try {
    const res = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (res.ok) {
      alert('Account created! Please login.');
      window.location.href = 'index.html';
    } else {
      const err = await res.json();
      alert(err.error || 'Signup failed');
    }
  } catch (e) {
    alert('Network error: ' + e.message);
  }
}

// admin user management
async function loadUsers() {
  const res = await fetch('/api/users', {
    headers: { 'X-Role': localStorage.getItem('role') || '' }
  });
  if (!res.ok) return;
  const users = await res.json();
  const div = document.getElementById('userList');
  if (!div) return;
  div.innerHTML = '';
  users.forEach(u => {
    div.innerHTML += `<p>${u.username} (${u.role}) ` +
      `<button onclick="deleteUser(${u.id})">Delete</button></p>`;
  });
}

async function deleteUser(id) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'DELETE',
    headers: { 'X-Role': localStorage.getItem('role') || '' }
  });
  if (res.ok) await loadUsers();
}

function loadContact() {
  const el = document.getElementById("contactDisplay");
  if (!el) return;
  el.innerHTML = `<b>${localStorage.getItem("serviceContact")}</b>`;
}

/* =========================
   PC BUILDER
========================= */
function loadBuilder() {
  ["CPU", "RAM", "GPU", "Storage"].forEach(type => {
    const sel = document.getElementById(type.toLowerCase());
    if (!sel) return;

    products
      .filter(p => p.cat === type)
      .forEach(p => {
        sel.innerHTML += `<option value="${p.id}">${p.name}</option>`;
      });
  });
}

function updateBuild() {
  let total = 0;
  let ready = true;

  ["cpu", "ram", "gpu", "storage"].forEach(id => {
    const val = document.getElementById(id).value;
    if (!val) ready = false;
    const prod = products.find(p => p.id == val);
    if (prod) total += prod.price;
  });

  document.getElementById("buildPrice").innerText = "Total: ₹" + total;
  document.getElementById("buildStatus").innerText =
    ready ? "✅ Compatible Build" : "⚠ Select all components";
}

/* =========================
   PAGE-SPECIFIC EXECUTION
========================= */
const page = window.location.pathname;

if (page.includes("products.html")) {
  (async () => {
    await loadCategories();
    showProducts();
  })();
}

if (page.includes("cart.html")) {
  loadCart();
}

if (page.includes("order.html")) {
  loadOrder();
}

if (page.includes("admin.html")) {
  if (localStorage.getItem("role") !== "admin") {
    alert("Admin only!");
    window.location.href = "index.html";
  } else {
    (async () => {
      await loadAdminProducts();
      document.getElementById("contactInput").value =
        localStorage.getItem("serviceContact");
    })();
  }
}

if (page.includes("service.html")) {
  loadContact();
}

if (page.includes("pc-builder.html")) {
  loadBuilder();
}
