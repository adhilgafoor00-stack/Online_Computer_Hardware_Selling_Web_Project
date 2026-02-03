const ADMIN_ID = "admin123";

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

let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveProducts() {
  localStorage.setItem("products", JSON.stringify(products));
}

/* LOGIN */
function login() {
  const id = document.getElementById("userid").value;
  if (id === ADMIN_ID) {
    localStorage.setItem("role","admin");
    location.href="admin.html";
  } else {
    localStorage.setItem("role","user");
    location.href="products.html";
  }
}

/* PRODUCTS */
function loadCategories() {
  const div=document.getElementById("categories");
  if(!div) return;
  [...new Set(products.map(p=>p.cat))].forEach(c=>{
    div.innerHTML+=`<span class="category" onclick="showProducts('${c}')">${c}</span>`;
  });
}

function showProducts(cat=null) {
  const list=document.getElementById("productList");
  if(!list) return;
  list.innerHTML="";
  products.filter(p=>!cat||p.cat===cat).forEach(p=>{
    list.innerHTML+=`
    <div class="product">
      <img src="${p.img}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <button onclick="addToCart(${p.id})">Add to Cart</button>
    </div>`;
  });
}

function sortProducts(type){
  if(type==="low") products.sort((a,b)=>a.price-b.price);
  if(type==="high") products.sort((a,b)=>b.price-a.price);
  showProducts();
}

/* CART */
function addToCart(id){
  cart.push(products.find(p=>p.id===id));
  localStorage.setItem("cart",JSON.stringify(cart));
  alert("Added to cart");
}

function loadCart(){
  const div=document.getElementById("cartItems");
  const t=document.getElementById("total");
  if(!div) return;
  let total=0;
  div.innerHTML="";
  cart.forEach(p=>{total+=p.price;div.innerHTML+=`<p>${p.name} - ₹${p.price}</p>`});
  t.innerText="Total: ₹"+total;
}

/* ORDER */
function placeOrder(){
  localStorage.setItem("order",JSON.stringify(cart));
  localStorage.removeItem("cart");
  location.href="order.html";
}

function loadOrder(){
  const d=document.getElementById("summary");
  if(!d) return;
  JSON.parse(localStorage.getItem("order")||"[]")
    .forEach(p=>d.innerHTML+=`<p>${p.name} - ₹${p.price}</p>`);
}

/* ADMIN */
function addProduct(){
  products.push({
    id:Date.now(),
    name:pname.value,
    cat:pcat.value,
    price:+pprice.value,
    img:pimg.value
  });
  saveProducts();
  loadAdminProducts();
}

function deleteProduct(id){
  products=products.filter(p=>p.id!==id);
  saveProducts();
  loadAdminProducts();
}

function loadAdminProducts(){
  const d=document.getElementById("adminProductList");
  if(!d) return;
  d.innerHTML="";
  products.forEach(p=>{
    d.innerHTML+=`
    <div class="product">
      <img src="${p.img}" width="80"><br>
      <input value="${p.name}" onchange="p.name=this.value;saveProducts()">
      <input value="${p.cat}" onchange="p.cat=this.value;saveProducts()">
      <input type="number" value="${p.price}" onchange="p.price=this.value;saveProducts()">
      <button onclick="deleteProduct(${p.id})">Delete</button>
    </div>`;
  });
}

/* PC BUILDER */
function loadBuilder(){
  ["CPU","RAM","GPU","Storage"].forEach(t=>{
    const s=document.getElementById(t.toLowerCase());
    if(!s) return;
    products.filter(p=>p.cat===t)
      .forEach(p=>s.innerHTML+=`<option value="${p.id}">${p.name}</option>`);
  });
}

function updateBuild(){
  let total=0,ok=true;
  ["cpu","ram","gpu","storage"].forEach(id=>{
    const v=document.getElementById(id).value;
    if(!v) ok=false;
    const p=products.find(x=>x.id==v);
    if(p) total+=p.price;
  });
  buildPrice.innerText="Total: ₹"+total;
  buildStatus.innerText=ok?"✅ Compatible Build":"⚠ Select all parts";
}

/* PAGE LOAD */
const page=location.pathname;
if(page.includes("products")){loadCategories();showProducts();}
if(page.includes("cart")) loadCart();
if(page.includes("order")) loadOrder();
if(page.includes("admin")){
  if(localStorage.getItem("role")!=="admin") location.href="index.html";
  loadAdminProducts();
}
if(page.includes("pc-builder")) loadBuilder();
