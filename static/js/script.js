import { Product } from './product.js';

// DOM Elements
const totalExpensesElement = document.getElementById('counterDisplay');
const countButton = document.getElementById('countButton');
const sortToggle = document.getElementById('sort-toggle');
const searchInput = document.getElementById('searchInput');
const clearButton = document.getElementById('searchClear');
const marketSection = document.querySelector('.market');
const searchForm = document.getElementById('searchForm');

// Global state
let products = [];

// Main initialization function

async function init() {
    await loadProducts(); // Wait for products to load from API
    setupEventListeners();
    renderProducts();   // Then render them
    calculateTotalExpenses();
}

// Fetches all products from our Flask API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        if (!response.ok) {
            console.error('Failed to fetch products');
            return;
        }

        const productsFromDB = await response.json();

        // Convert raw data into Product class instances
        products = productsFromDB.map(p => {
            const newProduct = new Product(p.title, p.description, p.price, p.product_type);
            newProduct.id = p.id;
            newProduct.createdAt = new Date(p.created_at);
            return newProduct;
        });

    } catch (error) {
        console.error('Network error fetching products:', error);
    }
}


function setupEventListeners() {
    countButton.addEventListener('click', calculateTotalExpenses);
    sortToggle.addEventListener('change', renderProducts);
    searchForm.addEventListener('submit', handleSearch);
    clearButton.addEventListener('click', clearSearch);

    // Event delegation for Edit/Remove buttons
    marketSection.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-btn')) {
            const productId = e.target.dataset.id;
            removeProduct(productId);
        } else if (e.target.classList.contains('edit-btn')) {
            const productId = e.target.dataset.id;
            editProduct(productId);
        }
    });
}

// Renders the products array to the DOM
function renderProducts() {
    let productsToRender = [...products];
    const searchTerm = searchInput.value.toLowerCase();

    // Apply sorting
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
    if (productsToRender.length > 0) {
        marketSection.innerHTML = productsToRender.map(product => product.toHTML()).join('');
    } else {
        marketSection.innerHTML = '<div class="col"><p class="text-muted">No products found.</p></div>';
    }
}

// Calculates and displays total cost of all products
function calculateTotalExpenses() {
    const total = products.reduce((sum, product) => sum + product.price, 0);
    totalExpensesElement.textContent = `Total: $${total.toFixed(2)}`;
}

function handleSearch(e) {
    e.preventDefault();
    renderProducts();
}

function clearSearch() {
    searchInput.value = '';
    renderProducts();
}

// Deletes a product via the API
async function removeProduct(productId) {
    if (confirm('Are you sure you want to remove this product?')) {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                alert('Failed to delete product. Please try again.');
                return;
            }

            // Remove from local array
            products = products.filter(p => p.id.toString() !== productId);

            // Re-render
            renderProducts();
            calculateTotalExpenses();

        } catch (error) {
            console.error('Network error deleting product:', error);
            alert('A network error occurred.');
        }
    }
}

// Redirects to the edit page for a specific product
function editProduct(productId) {
    window.location.href = `/edit?id=${productId}`;
}

init();