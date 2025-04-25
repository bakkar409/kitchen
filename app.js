import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  deleteField,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDTabp2Dfv--RhHO6L-4hbxdb35HbuAxd8",
  authDomain: "bakkar-jr.firebaseapp.com",
  projectId: "bakkar-jr",
  storageBucket: "bakkar-jr.firebasestorage.app",
  messagingSenderId: "89884942656",
  appId: "1:89884942656:web:7005bafaa4cc211eb35aa5",
  measurementId: "G-RETWEG4PT8",
};

// Init
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔐 Auth Redirect Handling
onAuthStateChanged(auth, (user) => {
  const path = location.pathname;

  if (user) {
    if (path.endsWith("index.html") || path.endsWith("login.html")) {
      location.replace("user.html");
    }
  } else {
    if (path.endsWith("user.html") || path.endsWith("cart.html")) {
      location.replace("login.html");
    }
  }
});

// 🧑‍💻 Signup
function handleSignup() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      Swal.fire({
        title: "User Signed Up Successfully",
        text: `${userCredential.user.email}`,
        icon: "success",
      });
      location.replace("user.html");
    })
    .catch(() => {
      Swal.fire({
        icon: "error",
        title: "Oops ...",
        text: "Invalid Credentials",
      });
    });
}
window.handleSignup = handleSignup;

// 🔐 Login
function handleLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      Swal.fire({
        title: "User Signed In Successfully",
        text: `${userCredential.user.email}`,
        icon: "success",
      });
      location.replace("user.html");
    })
    .catch(() => {
      Swal.fire({
        icon: "error",
        title: "Oops ...",
        text: "Invalid Credentials",
      });
    });
}
window.handleLogin = handleLogin;

// 🚪 Logout (Fixed)
function logoutUser() {
  signOut(auth)
    .then(() => {
      Swal.fire({
        title: "User Signed Out Successfully",
        text: `Byee Byee <3`,
        icon: "success",
      }).then(() => {
        window.location.href = "login.html";
      });
    })
    .catch((error) => {
      console.error("Error signing out:", error);
      Swal.fire({
        icon: "error",
        title: "Oops ...",
        text: "Abhi na jaao Chor kr",
      });
    });
}
window.logoutUser = logoutUser;

// 📦 Add Product
async function addProducts() {
  getProductListDiv.innerHTML = "";

  const product_id = document.getElementById("productId").value;
  const product_name = document.getElementById("productName").value;
  const product_price = document.getElementById("productPrice").value;
  const product_des = document.getElementById("productDesc").value;
  const product_url = document.getElementById("productImage").value;

  try {
    const docRef = await addDoc(collection(db, "items"), {
      product_id,
      product_name,
      product_price,
      product_des,
      product_url,
    });

    Swal.fire({
      title: "Product Added Successfully",
      text: `Order ID: ${docRef.id}`,
      icon: "success",
    });
    getProductList();
  } catch (e) {
    console.error("Error adding product:", e);
  }
}
window.addProducts = addProducts;

// 📝 Show Products
let getProductListDiv = document.getElementById("product-list");

async function getProductList() {
  const querySnapshot = await getDocs(collection(db, "items"));
  getProductListDiv.innerHTML = "";

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    getProductListDiv.innerHTML += `
      <div class="card" style="width: 22rem;">
        <img src="${data.product_url}" class="card-img-top" alt="Image">
        <div class="card-body">
          <h5 class="card-title">${data.product_name}</h5>
          <p class="card-text">${data.product_des}</p>
          <h5 class="card-title">${data.product_price}</h5>
          <button onclick='openEditModal("${doc.id}", "${data.product_name}", "${data.product_price}", "${data.product_des}", "${data.product_url}")' class='btn btn-info'>Edit</button>
          <button onclick='delItem("${doc.id}")' class='btn btn-danger'>Delete</button>
        </div>
      </div>
    `;
  });
}
if (getProductListDiv) getProductList();

// 🗑️ Delete Product
async function delItem(id) {
  await deleteDoc(doc(db, "items", id));
  getProductList();
}
window.delItem = delItem;

// ✏️ Edit Modal
window.openEditModal = function (id, name, price, desc, url) {
  document.getElementById("editProductId").value = id;
  document.getElementById("editProductName").value = name;
  document.getElementById("editProductPrice").value = price;
  document.getElementById("editProductDesc").value = desc;
  document.getElementById("editProductImage").value = url;

  let editModal = new bootstrap.Modal(document.getElementById("editProductModal"));
  editModal.show();
};

// 💾 Save Product Changes
window.saveProductChanges = async function () {
  const id = document.getElementById("editProductId").value;
  const name = document.getElementById("editProductName").value;
  const price = document.getElementById("editProductPrice").value;
  const desc = document.getElementById("editProductDesc").value;
  const url = document.getElementById("editProductImage").value;

  try {
    await updateDoc(doc(db, "items", id), {
      product_id: id,
      product_name: name,
      product_price: price,
      product_des: desc,
      product_url: url,
    });

    Swal.fire({
      title: "Updated!",
      text: "Product updated successfully.",
      icon: "success",
    });

    getProductList();
    bootstrap.Modal.getInstance(document.getElementById("editProductModal")).hide();
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text: error.message,
    });
  }
};

// 👤 Show Products for User Page
let userDiv = document.getElementById("userDiv");

async function userData() {
  const querySnapshot = await getDocs(collection(db, "items"));
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    userDiv.innerHTML += `
      <div class="card" style="width: 22rem;">
        <img src="${data.product_url}" class="card-img-top" alt="Image">
        <div class="card-body">
          <h5 class="card-title">${data.product_name}</h5>
          <p class="card-text">${data.product_des}</p>
          <h5 class="card-title">${data.product_price}</h5>
        </div>
        <button onclick='addtocart("${doc.id}", "${data.product_name}", "${data.product_price}", "${data.product_des}", "${data.product_url}")' class='btn btn-primary'>Add to Cart</button>
      </div>
    `;
  });
}
if (userDiv) userData();

// 🛒 Add to Cart
let num = 0;
const cart = document.getElementById("cart-badge");

async function addtocart(id, name, price, des, url) {
  try {
    await addDoc(collection(db, "carts"), {
      id, name, price, des, url
    });

    Swal.fire({
      title: "Added to Cart!",
      icon: "success",
    });

    num++;
    cart.innerHTML = num;
  } catch (e) {
    console.error("Cart error:", e);
  }
}
window.addtocart = addtocart;

// 🛒 Cart List
let showCart = document.getElementById("showCart");
let totalDiv = document.getElementById("cart-total");

async function cartData() {
  const querySnapshot = await getDocs(collection(db, "carts"));
  showCart.innerHTML = "";
  let totalAmount = 0;

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const id = docSnap.id;
    const price = parseFloat(data.price);
    const qty = 1;

    totalAmount += price * qty;

    showCart.innerHTML += `
      <div class="card mb-3" style="width: 22rem;">
        <img src="${data.url}" class="card-img-top" alt="Image">
        <div class="card-body">
          <h5 class="card-title">${data.name}</h5>
          <p class="card-text">${data.des}</p>
          <h5 class="card-title">RS: <span id="price-${id}">${price.toFixed(2)}</span></h5>
          <div class="d-flex justify-content-around align-items-center mt-2">
            <button onclick="updateQty('${id}', -1, ${price})" class="btn btn-danger">-</button>
            <span id="qty-${id}">${qty}</span>
            <button onclick="updateQty('${id}', 1, ${price})" class="btn btn-warning">+</button>
            <button onclick="removeCartItem('${id}')" class="btn btn-outline-secondary">Remove</button>
          </div>
        </div>
      </div>
    `;
  });

  totalDiv.textContent = `Total: RS: ${totalAmount.toFixed(2)}`;
}
if (showCart) cartData();

window.removeCartItem = async function (id) {
  await deleteDoc(doc(db, "carts", id));
  cartData();
};

window.updateQty = function (id, delta, price) {
  const qtyEl = document.getElementById(`qty-${id}`);
  let qty = parseInt(qtyEl.textContent, 10) + delta;
  if (qty < 1) return;
  qtyEl.textContent = qty;
  recalcTotal();
};

function recalcTotal() {
  let sum = 0;
  document.querySelectorAll("[id^='qty-']").forEach((el) => {
    const id = el.id.replace("qty-", "");
    const qty = parseInt(el.textContent, 10);
    const price = parseFloat(document.getElementById(`price-${id}`).textContent);
    sum += price * qty;
  });
  totalDiv.textContent = `Total: ₹ ${sum.toFixed(2)}`;
}
