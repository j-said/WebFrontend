import { Product } from './product.js';

// DOM Elements
const totalExpensesElement = document.getElementById('counterDisplay');
const countButton = document.getElementById('countButton');
const sortToggle = document.getElementById('sort-toggle');
const searchInput = document.getElementById('searchInput');
const clearButton = document.getElementById('searchClear');
const marketSection = document.querySelector('.market');
const searchForm = document.querySelector('header form');

let products = [];

function init() {
    loadProducts();
    setupEventListeners();
    renderProducts();
}

function loadProducts() {
    const pendingProducts = getPendingProducts();
    if (pendingProducts.length > 0) {
        pendingProducts.forEach(p => {
            const newProduct = new Product(p.title, p.description, p.price, p.type);
            newProduct.id = p.id;
            newProduct.createdAt = new Date(p.createdAt);
            products.push(newProduct);
        });
    }
}

function setupEventListeners() {
    // Count total expenses
    countButton.addEventListener('click', calculateTotalExpenses);

    // Sort toggle
    sortToggle.addEventListener('change', renderProducts);

    // Search functionality
    searchForm.addEventListener('submit', handleSearch);
    clearButton.addEventListener('click', clearSearch);

    // Product actions (using event delegation)
    marketSection.addEventListener('click', handleProductActions);
}

function renderProducts() {
    let productsToRender = [...products];
    const searchTerm = searchInput.value.toLowerCase();

    // Apply sorting if toggle is checked
    if (sortToggle.checked) {
        productsToRender.sort((a, b) => a.price - b.price);
    }

    // Apply search filter
    if (searchTerm) {
        productsToRender = productsToRender.filter(product =>
            product.title.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.type.toLowerCase().includes(searchTerm)
        );
    }

    // Render products
    marketSection.innerHTML = productsToRender.length > 0
        ? productsToRender.map(product => product.toHTML()).join('')
        : '<div class="shared-no-products">No products found. <a href="create-prod.html">Create your first product!</a></div>';
}

function calculateTotalExpenses() {
    const total = products.reduce((sum, product) => sum + product.price, 0);
    totalExpensesElement.textContent = `Total expenses: $${total.toFixed(2)}`;
}

function handleSearch(e) {
    e.preventDefault();
    renderProducts();
}

function clearSearch() {
    searchInput.value = '';
    renderProducts();
}

function handleProductActions(e) {
    const productCard = e.target.closest('.product-card');
    if (!productCard) return;

    const productId = productCard.dataset.id;

    if (e.target.classList.contains('remove-btn')) {
        let pendingProducts = getPendingProducts();
        pendingProducts = pendingProducts.filter(p => p.id !== productId);
        setPendingProducts(pendingProducts);
        removeProduct(productId);
    } else if (e.target.classList.contains('edit-btn')) {
        editProduct(productId);
    }
}

function removeProduct(productId) {
    if (confirm('Are you sure you want to remove this product?')) {
        products = products.filter(p => p.id !== productId);

        let pendingProducts = getPendingProducts();
        pendingProducts = pendingProducts.filter(p => p.id !== productId);
        setPendingProducts(pendingProducts);

        renderProducts();
        calculateTotalExpenses();
    }
}

function editProduct(productId) {
    window.location.href = `edit-prod.html?id=${productId}`;
}

function getPendingProducts() {
    return JSON.parse(localStorage.getItem('pendingProducts') || '[]');
}

function setPendingProducts(products) {
    localStorage.setItem('pendingProducts', JSON.stringify(products));
}

window.getProducts = () => products;
window.setProducts = (newProducts) => {
    products = newProducts;
};

init()