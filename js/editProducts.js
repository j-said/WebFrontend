import { Product } from './product.js';

// DOM Elements
const productList = document.getElementById('productList');
const editFormContainer = document.getElementById('editFormContainer');
const editProductForm = document.getElementById('editProductForm');
const cancelEditBtn = document.getElementById('cancelEdit');
const editErrorMessage = document.getElementById('editErrorMessage');

let products = [];
let editingProductId = null;

// Initialize the edit page
function initEditPage() {
    loadProducts();
    setupEditEventListeners();
    renderProductList();

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            startEditing(product);
        }
    } else { showError('Product not found!'); }
}

function loadProducts() {
    try {
        const pendingProducts = JSON.parse(localStorage.getItem('pendingProducts') || '[]');
        console.log('Loaded products from localStorage:', pendingProducts); // Debug log

        products = pendingProducts.map(p => {
            const product = new Product(p.title, p.description, p.price, p.type);
            product.id = p.id;
            product.createdAt = new Date(p.createdAt);
            return product;
        });

    } catch (error) {
        console.error('Error loading products:', error);
        products = [];
    }
}

function setupEditEventListeners() {
    editProductForm.addEventListener('submit', handleEditSubmit);
    cancelEditBtn.addEventListener('click', cancelEditing);
}

function renderProductList() {
    console.log('Rendering product list, products count:', products.length); // Debug log

    if (products.length === 0) {
        productList.innerHTML = '<div class="shared-no-products">No products available for editing. <a href="create-prod.html">Create your first product!</a></div>';
        return;
    }

    productList.innerHTML = products.map(product => `
        <div class="product-list-item" data-id="${product.id}">
            <div class="product-list-info">
                <h4>${product.title}</h4>
                <p>${product.description}</p>
                <div class="product-meta">
                    <span class="price">$${product.price.toFixed(2)}</span>
                    <span class="type">${product.type}</span>
                </div>
            </div>
            <button type="button" class="edit-list-btn" data-id="${product.id}">Edit</button>
        </div>
    `).join('');

    // Add event listeners to edit buttons
    document.querySelectorAll('.edit-list-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            console.log('Edit button clicked for product:', productId); // Debug log
            const product = products.find(p => p.id === productId);
            if (product) {
                startEditing(product);
            }
        });
    });
}

function startEditing(product) {
    editingProductId = product.id;

    // Fill form with product data
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editTitle').value = product.title;
    document.getElementById('editDescription').value = product.description;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editProductType').value = product.type;

    // Show form and hide product list
    document.querySelector('.product-list-section').style.display = 'none';
    editFormContainer.style.display = 'block';

    hideError();
}

function cancelEditing() {
    editingProductId = null;
    editFormContainer.style.display = 'none';
    document.querySelector('.product-list-section').style.display = 'block';
    editProductForm.reset();
    hideError();
}

function handleEditSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const price = parseFloat(document.getElementById('editPrice').value);
    const productType = document.getElementById('editProductType').value;

    // Validation
    if (!title || !description || !price || !productType) {
        showError('Please fill in all fields');
        return;
    }

    if (price <= 0) {
        showError('Price must be greater than 0');
        return;
    }

    // Update the product
    const productIndex = products.findIndex(p => p.id === editingProductId);
    if (productIndex !== -1) {
        // Update the product in our array
        const updatedProduct = {
            ...products[productIndex],
            title,
            description,
            price,
            type: productType,
            lastUpdated: new Date().toISOString()
        };

        products[productIndex] = updatedProduct;

        // Update localStorage
        const pendingProducts = products.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            price: p.price,
            type: p.type,
            createdAt: p.createdAt.toISOString(),
            lastUpdated: p.lastUpdated
        }));

        localStorage.setItem('pendingProducts', JSON.stringify(pendingProducts));

        // Show success and go back to home page
        alert('Product updated successfully!');
        window.location.href = 'index.html';
    } else {
        showError('Product not found!');
    }
}

function showError(message) {
    editErrorMessage.textContent = message;
    editErrorMessage.classList.add('active');
}

function hideError() {
    editErrorMessage.classList.remove('active');
}

// Initialize the edit page when DOM is loaded
document.addEventListener('DOMContentLoaded', initEditPage);
