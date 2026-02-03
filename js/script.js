/* =========================
   CONSTANTS & STORAGE
========================= */
const ADMIN_ID = "admin123";

/* PRODUCTS */
let products = JSON.parse(localStorage.getItem("products")) || [
  { id: 1, name: "Intel i5 CPU", price: 12000, cat: "CPU", img: "images/icpu.png" },
  { id: 2, name: "AMD Ryzen 5", price: 14000, cat: "CPU", img: "images/rcpu.png" },
  { id: 3, name: "8GB DDR4 RAM", price: 2500, cat: "RAM", img: "images/ram8.png" },
  { id: 4, name: "16GB DDR4 RAM", price: 4800, cat: "RAM", img: "images/ram16.png" },
  { id: 5, name: "512GB SSD", price: 4500, cat: "Storage", img: "images/ssd.png" },
  { id: 6, name: "1TB HDD", price: 3500, cat: "Storage", img: "images/hdd.png" },
  { id: 7, name: "NVIDIA GTX GPU", price: 22000, cat: "GPU", img: "images/gpu.png" },
  { id: 8, name: "450W SMPS", price: 2800, cat: "Power Supply", img: "images/psu.png" }
];

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
function login() {
  const id = document.getElementById("userid").value.trim();

  if (id === ADMIN_ID) {
    localStorage.setItem("role", "admin");
    window.location.href = "admin.html";
  } else {
    localStorage.setItem("role", "user");
    window.location.href = "products.html";
  }
}

/* =========================
   PRODUCT CATEGORIES
========================= */
function loadCategories() {
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
function addProduct() {
  const name = pname.value.trim();
  const cat = pcat.value.trim();
  const price = Number(pprice.value);
  const img = pimg.value.trim();

  if (!name || !cat || !price || !img) {
    alert("Fill all fields");
    return;
  }

  products.push({
    id: Date.now(),
    name,
    cat,
    price,
    img
  });

  saveProducts();
  loadAdminProducts();

  pname.value = "";
  pcat.value = "";
  pprice.value = "";
  pimg.value = "";
}

function deleteProduct(id) {
  products = products.filter(p => p.id !== id);
  saveProducts();
  loadAdminProducts();
}

function loadAdminProducts() {
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
  loadCategories();
  showProducts();
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
    loadAdminProducts();
    document.getElementById("contactInput").value =
      localStorage.getItem("serviceContact");
  }
}

if (page.includes("service.html")) {
  loadContact();
}

if (page.includes("pc-builder.html")) {
  loadBuilder();
}
