const productForm = document.getElementById('productForm');
const errorMessageDiv = document.getElementById('errorMessage');

productForm.addEventListener('submit', handleFormSubmit);

async function handleFormSubmit(e) {
    e.preventDefault(); // Stop the form from causing a page reload

    const title = document.getElementById('title').value.trim();
    const description = document.getElementById('description').value.trim();
    const price = document.getElementById('price').value;
    const productType = document.getElementById('productType').value;

    if (!title || !description || !price || !productType) {
        showError('Please fill in all fields');
        return;
    }
    if (price <= 0) {
        showError('Price must be greater than 0');
        return;
    }

    const productData = {
        title: title,
        description: description,
        price: parseFloat(price),
        product_type: productType // Matches our Flask API's expected key
    };

    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData) // Convert the object to a JSON string
        });

        if (!response.ok) {
            // If the server sends a specific error message, try to use it
            const errorData = await response.json();
            showError(errorData.error || 'Failed to create product. Please try again.');
            return; // Stop execution
        }

        // If 'response.ok' is true, the product was created
        console.log('Product created successfully!');

        window.location.href = '/';

    } catch (error) {
        // This catches network errors (e.g., server is down)
        console.error('Network error:', error);
        showError('A network error occurred. Please check your connection.');
    }
}

function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.remove('d-none');

    setTimeout(() => {
        errorMessageDiv.classList.add('d-none');
    }, 5000);
}