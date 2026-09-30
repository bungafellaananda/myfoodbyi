const restaurants = [
 {id:1,name:"Warung Nusantara",category:"Nasi",rating:4.9,time:"20–30 min",price:25000,emoji:"🍛",discount:"40% OFF",desc:"Nasi campur khas Indonesia"},
 {id:2,name:"Sate Senayan",category:"Sate",rating:4.8,time:"25–35 min",price:28000,emoji:"🍢",discount:"25% OFF",desc:"Sate ayam & kambing bakar"},
 {id:3,name:"Bakso Mantul",category:"Bakso",rating:4.8,time:"15–25 min",price:18000,emoji:"🍜",discount:"20% OFF",desc:"Bakso kuah gurih favorit"},
 {id:4,name:"Ayam Geprek Juara",category:"Ayam",rating:4.7,time:"20–30 min",price:22000,emoji:"🍗",discount:"30% OFF",desc:"Ayam geprek level pedas"},
 {id:5,name:"Mie Aceh Meuligoe",category:"Mie",rating:4.9,time:"25–40 min",price:27000,emoji:"🍝",discount:"15% OFF",desc:"Mie Aceh rempah autentik"},
 {id:6,name:"Es Teh Nusantara",category:"Minuman",rating:4.6,time:"10–20 min",price:9000,emoji:"🧋",discount:"10% OFF",desc:"Minuman segar untuk menemani"},
 {id:7,name:"Rendang Minang",category:"Nasi",rating:4.9,time:"30–40 min",price:35000,emoji:"🥘",discount:"20% OFF",desc:"Rendang daging kaya rempah"},
 {id:8,name:"Pempek Kapal Selam",category:"Lainnya",rating:4.8,time:"25–35 min",price:23000,emoji:"🐟",discount:"15% OFF",desc:"Pempek Palembang + cuko"}
];
const categories = [
 ["🍚","Nasi"],["🍢","Sate"],["🍜","Bakso"],["🍗","Ayam"],["🍝","Mie"],["🧋","Minuman"]
];
let cart = JSON.parse(localStorage.getItem("foodnesiaCart") || "[]");
let activeCategory = "Semua";
const rupiah = n => "Rp" + n.toLocaleString("id-ID");
const $ = s => document.querySelector(s);

function renderCategories(){
  $("#categories").innerHTML = `<button class="category ${activeCategory==="Semua"?"active":""}" onclick="setCategory('Semua')"><span class="emoji">🍽️</span><span>Semua</span></button>` +
    categories.map(([e,n])=>`<button class="category ${activeCategory===n?"active":""}" onclick="setCategory('${n}')"><span class="emoji">${e}</span><span>${n}</span></button>`).join("");
}
function renderRestaurants(){
  const q = $("#searchInput").value.toLowerCase();
  let data = restaurants.filter(r => (activeCategory==="Semua" || r.category===activeCategory) && (r.name+" "+r.desc+" "+r.category).toLowerCase().includes(q));
  const sort = $("#sortSelect").value;
  if(sort==="rating") data.sort((a,b)=>b.rating-a.rating);
  if(sort==="price") data.sort((a,b)=>a.price-b.price);
  $("#restaurantGrid").innerHTML = data.map(r=>`
    <article class="restaurant">
      <div class="food-image"><span class="discount">${r.discount}</span><button class="heart" onclick="toast('❤️ Ditambahkan ke favorit')">♡</button><span>${r.emoji}</span></div>
      <div class="restaurant-body">
        <h3>${r.name}</h3><div class="meta"><span class="rating">★ ${r.rating}</span> ${r.time} • Delivery</div>
        <div class="menu-row"><div><small class="meta">${r.desc}</small><div class="price">${rupiah(r.price)}</div></div><button class="add" onclick="addToCart(${r.id})">+ Tambah</button></div>
      </div>
    </article>`).join("");
  $("#emptyState").hidden = data.length>0;
}
function setCategory(c){activeCategory=c;renderCategories();renderRestaurants()}
function addToCart(id){
  const r=restaurants.find(x=>x.id===id), item=cart.find(x=>x.id===id);
  if(item)item.qty++; else cart.push({...r,qty:1});
  saveCart(); openCart(); toast(`${r.name} masuk keranjang 🛒`);
}
function saveCart(){localStorage.setItem("foodnesiaCart",JSON.stringify(cart));renderCart()}
function renderCart(){
  const count=cart.reduce((s,x)=>s+x.qty,0), subtotal=cart.reduce((s,x)=>s+x.price*x.qty,0), fee=count?7000:0;
  $("#cartCount").textContent=count; $("#subtotal").textContent=rupiah(subtotal);$("#deliveryFee").textContent=rupiah(fee);$("#total").textContent=rupiah(subtotal+fee);
  $("#cartItems").innerHTML=cart.length?cart.map(x=>`<div class="cart-item"><div class="cart-thumb">${x.emoji}</div><div><h4>${x.name}</h4><small>${rupiah(x.price)}</small></div><div class="qty"><button onclick="changeQty(${x.id},-1)">−</button><b>${x.qty}</b><button onclick="changeQty(${x.id},1)">+</button></div></div>`).join(""):`<div style="text-align:center;padding:70px 10px;color:#777">🛒<h3>Keranjang masih kosong</h3><p>Yuk pilih makanan favoritmu.</p></div>`;
}
function changeQty(id,d){const x=cart.find(x=>x.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(x=>x.id!==id);saveCart()}
function openCart(){$("#cartPanel").classList.add("open");$("#overlay").classList.add("show")}
function closeCart(){$("#cartPanel").classList.remove("open");$("#overlay").classList.remove("show")}
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove("show"),2200)}
$("#searchInput").addEventListener("input",renderRestaurants);
$("#sortSelect").addEventListener("change",renderRestaurants);
$("#cartBtn").onclick=openCart;$("#closeCart").onclick=closeCart;$("#overlay").onclick=closeCart;
$("#locationBtn").onclick=()=>$("#locationDialog").showModal();
document.querySelectorAll("[data-location]").forEach(b=>b.onclick=()=>{ $("#locationText").textContent=b.dataset.location;$("#locationDialog").close();toast("Lokasi diubah ke "+b.dataset.location+" 📍")});
$("#promoCodeBtn").onclick=()=>{navigator.clipboard?.writeText("MAKANENAK");toast("Kode MAKANENAK disalin 🎁")};
$("#promoBtn").onclick=()=>{toast("Promo: gratis ongkir dengan kode MAKANENAK")};
$("#checkoutBtn").onclick=()=>{if(!cart.length){toast("Keranjang kamu masih kosong");return}$("#checkoutDialog").showModal()};
$("#placeOrder").onclick=()=>{const address=$("#address").value.trim();if(!address){toast("Isi alamat pengantaran dulu ya");return}$("#checkoutDialog").close();closeCart();cart=[];saveCart();toast("Pesanan dibuat! Driver akan segera mengambil pesanan 🛵")};
renderCategories();renderRestaurants();renderCart();
