const API_BASE_URL = '/api/v1';

// Check authentication
function checkAuth() {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        window.location.href = '/';
        return null;
    }
    
    try {
        const userData = JSON.parse(user);
        return { userData, token };
    } catch (error) {
        console.error('Error parsing user data:', error);
        logout();
        return null;
    }
}

// Load products
async function loadProducts(filters = {}) {
    const auth = checkAuth();
    if (!auth) return;

    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_BASE_URL}/products?${queryParams}`, {
            headers: {
                'x-auth-token': auth.token
            }
        });

        const data = await response.json();
        
        if (data.success) {
            displayProducts(data.products);
            
            // Show admin panel if user is admin
            if (auth.userData.role === 'admin') {
                document.getElementById('adminPanel').classList.remove('hidden');
            }
        }
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Display products
function displayProducts(products) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p class="text-center col-span-full text-gray-400">No products found</p>';
        return;
    }

    products.forEach(product => {
        const productCard = `
            <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="font-bold text-lg mb-2">${product.name}</h3>
                    <p class="text-gray-400 text-sm mb-3">${product.description.substring(0, 100)}...</p>
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-red-500 font-bold">$${product.price}</span>
                        <span class="text-sm text-gray-400">Stock: ${product.stock}</span>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="addToCart('${product._id}')" 
                                class="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded text-sm"
                                ${product.stock === 0 ? 'disabled' : ''}>
                            ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                        ${checkAuth().userData.role === 'admin' ? `
                            <button onclick="editProduct('${product._id}')" class="bg-yellow-600 hover:bg-yellow-700 px-3 py-2 rounded text-sm">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteProduct('${product._id}')" class="bg-red-700 hover:bg-red-800 px-3 py-2 rounded text-sm">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        grid.innerHTML += productCard;
    });
}

// Apply filters
function applyFilters() {
    const filters = {
        category: document.getElementById('categoryFilter').value,
        minPrice: document.getElementById('minPrice').value,
        maxPrice: document.getElementById('maxPrice').value
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
        if (!filters[key]) delete filters[key];
    });

    loadProducts(filters);
}

// Add to cart
async function addToCart(productId) {
    const auth = checkAuth();
    if (!auth) return;

    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': auth.token
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Product added to cart!');
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding product to cart');
    }
}

// Admin functions
function showAddProductModal() {
    document.getElementById('addProductModal').classList.remove('hidden');
}

function closeAddProductModal() {
    document.getElementById('addProductModal').classList.add('hidden');
    document.getElementById('addProductForm').reset();
}

// Add new product
document.getElementById('addProductForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const auth = checkAuth();
    if (!auth || auth.userData.role !== 'admin') return;

    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        stock: parseInt(document.getElementById('productStock').value),
        category: document.getElementById('productCategory').value,
        image: document.getElementById('productImage').value || undefined
    };

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-auth-token': auth.token
            },
            body: JSON.stringify(productData)
        });

        const data = await response.json();
        
        if (data.success) {
            alert('Product added successfully!');
            closeAddProductModal();
            loadProducts();
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error adding product:', error);
        alert('Error adding product');
    }
});

// Logout
function logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
}

// Initialize shop
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    loadProducts();
});