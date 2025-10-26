// Get DOM elements
const editForm = document.getElementById('editProductForm');
const errorMessageDiv = document.getElementById('editErrorMessage');
const cancelBtn = document.getElementById('cancelEdit');
const editFormContainer = document.getElementById('editFormContainer');

// Get Product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

let currentProduct = null;

if (productId) {
    loadProductData(productId);
} else {
    showError("No product ID specified. Cannot edit.");
    editFormContainer.style.display = 'none';
}

editForm.addEventListener('submit', handleFormSubmit);
cancelBtn.addEventListener('click', () => {
    window.location.href = '/'; 
});


async function loadProductData(id) {
    try {
        const response = await fetch(`/api/products/${id}`);

        if (!response.ok) {
            editFormContainer.style.display = 'block'; 
            productListSection.style.display = 'none';
            showError("Could not load product. It may have been deleted.");
            return;
        }

        // Assign the fetched data to the global variable
        currentProduct = await response.json();

        // Populate the form fields using the correct variable
        document.getElementById('editTitle').value = currentProduct.title;
        document.getElementById('editDescription').value = currentProduct.description;
        document.getElementById('editPrice').value = currentProduct.price;
        document.getElementById('editProductType').value = currentProduct.product_type;
        // Show the form and hide the 'loading' list
        editFormContainer.style.display = 'block';

    } catch (error) {
        console.error("Network error loading product:", error);
        showError("A network error occurred while loading the data.");
    }
}


async function handleFormSubmit(e) {
    e.preventDefault();

    const updatedData = {};

    const newTitle = document.getElementById('editTitle').value.trim();
    const newDescription = document.getElementById('editDescription').value.trim();
    const newPrice = parseFloat(document.getElementById('editPrice').value);
    const newProductType = document.getElementById('editProductType').value;

    if (newPrice <= 0) {
        showError('Price must be greater than 0');
        return;
    }

    // Compare new values to the original 'currentProduct' data
    if (newTitle !== currentProduct.title) {
        updatedData.title = newTitle;
    }
    if (newDescription !== currentProduct.description) {
        updatedData.description = newDescription;
    }
    if (newPrice !== currentProduct.price) {
        updatedData.price = newPrice;
    }
    if (newProductType !== currentProduct.product_type) {
        updatedData.product_type = newProductType;
    }

    // Check if any changes were actually made
    if (Object.keys(updatedData).length === 0) {
        showError("You haven't made any changes.");
        return;
    }

    try {
        // Send ONLY the changed data to the dynamic PUT endpoint
        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            showError(errorData.error || 'Failed to update product.');
            return;
        }

        window.location.href = '/';

    } catch (error) {
        console.error("Network error updating product:", error);
        showError("A network error occurred.");
    }
}

function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.classList.add('active'); // Use .active class

    // Hide the error after 5 seconds
    setTimeout(() => {
        errorMessageDiv.classList.remove('active');
    }, 5000);
}