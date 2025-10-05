import { Product } from './product.js';

const productForm = document.getElementById('productForm');
const errorMessage = document.getElementById('errorMessage');

productForm.addEventListener('submit', handleFormSubmit);

function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const price = document.getElementById('price').value;
    const productType = document.getElementById('productType').value;

    // Validation
    if (!title || !description || !price || !productType) {
        showError('Please fill in all fields');
        return;
    }

    if (price <= 0) {
        showError('Price must be greater than 0');
        return;
    }

    // Create new product
    const newProduct = new Product(title, description, price, productType);

    // Store in localStorage
    const pendingProducts = JSON.parse(localStorage.getItem('pendingProducts') || '[]');
    pendingProducts.push({
        title: newProduct.title,
        description: newProduct.description,
        price: newProduct.price,
        type: newProduct.type,
        id: newProduct.id,
        createdAt: newProduct.createdAt.toISOString()
    });
    localStorage.setItem('pendingProducts', JSON.stringify(pendingProducts));

    // Show success and redirect
    alert('Product created successfully!');
    window.location.href = 'index.html';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('active');

    setTimeout(() => {
        errorMessage.classList.remove('active');
    }, 5000);
}