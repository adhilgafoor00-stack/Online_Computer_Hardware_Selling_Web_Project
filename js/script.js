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
  const nameEl = document.getElementById("pname");
  const catEl = document.getElementById("pcat");
  const priceEl = document.getElementById("pprice");
  const imgEl = document.getElementById("pimg");

  const name = nameEl.value.trim();
  const cat = catEl.value.trim();
  const price = Number(priceEl.value);
  
  if (!name || !cat || !price) {
    alert("Fill all required fields");
    return;
  }

  let imgData = "images/default.png"; // fallback

  if (imgEl.files && imgEl.files[0]) {
    const reader = new FileReader();
    imgData = await new Promise((resolve) => {
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(imgEl.files[0]);
    });
  }

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Role': localStorage.getItem('role') || ''
      },
      body: JSON.stringify({ name, cat, price, img: imgData })
    });
    
    if (res.ok) {
      alert("Product added successfully!");
      await loadAdminProducts();
      nameEl.value = "";
      catEl.value = "";
      priceEl.value = "";
      imgEl.value = "";
    } else {
      const err = await res.json();
      alert('Failed to add product: ' + (err.error || 'Unknown error'));
    }
  } catch (e) {
    alert('Error adding product: ' + e.message);
  }
}

async function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
    headers: { 'X-Role': localStorage.getItem('role') || '' }
  });
  if (res.ok) {
    alert("Deleted");
    await loadAdminProducts();
  } else {
    alert("Failed to delete");
  }
}

async function updateProduct(id, btn) {
  const card = btn.parentElement;
  const name = card.querySelector(".edit-name").value.trim();
  const cat = card.querySelector(".edit-cat").value.trim();
  const price = Number(card.querySelector(".edit-price").value);
  const imgData = card.dataset.img; // keep original img unless we add image editing later

  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 
      'Content-Type': 'application/json',
      'X-Role': localStorage.getItem('role') || '' 
    },
    body: JSON.stringify({ name, cat, price, img: imgData })
  });

  if (res.ok) {
    alert("Updated successfully");
    await loadAdminProducts();
  } else {
    alert("Failed to update");
  }
}

async function loadAdminProducts() {
  await fetchProducts();
  const div = document.getElementById("adminProductList");
  if (!div) return;

  div.innerHTML = "";
  products.forEach(p => {
    const d = document.createElement("div");
    d.className = "product-card-admin card";
    d.dataset.img = p.img;
    d.innerHTML = `
      <img src="${p.img}" width="80"><br>
      <input class="edit-name" value="${p.name}" placeholder="Name">
      <input class="edit-cat" value="${p.cat}" placeholder="Category">
      <input class="edit-price" type="number" value="${p.price}" placeholder="Price">
      <div class="admin-actions">
        <button onclick="updateProduct(${p.id}, this)">Save</button>
        <button class="delete-btn" onclick="deleteProduct(${p.id})">Delete</button>
      </div>
    `;
    div.appendChild(d);
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
      await loadUsers();
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
