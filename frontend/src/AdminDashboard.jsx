import { useEffect, useMemo, useState } from "react";

const API_URL = "http://localhost:5000/api";

function AdminDashboard({ onBack }) {
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [editingProduct, setEditingProduct] =
        useState(null);

    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        stock: "",
        category_id: "",
        image_url: ""
    });

    const token = localStorage.getItem("token");

    // =====================================================
    // FETCH ADMIN DATA
    // =====================================================

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);

            await Promise.all([
                fetchProducts(),
                fetchOrders()
            ]);
        } catch (error) {
            console.error(
                "Admin data error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // FETCH PRODUCTS
    // =====================================================

    const fetchProducts = async () => {
        try {
            const response = await fetch(
                `${API_URL}/admin/products`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(
                    data.message ||
                    "Unable to load products."
                );
                return;
            }

            setProducts(data.products || []);
        } catch (error) {
            console.error(
                "Products error:",
                error
            );

            alert(
                "Cannot connect to backend."
            );
        }
    };

    // =====================================================
    // FETCH ORDERS
    // =====================================================

    const fetchOrders = async () => {
        try {
            const response = await fetch(
                `${API_URL}/admin/orders`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(
                    data.message ||
                    "Unable to load orders."
                );
                return;
            }

            setOrders(data.orders || []);
        } catch (error) {
            console.error(
                "Orders error:",
                error
            );
        }
    };

    // =====================================================
    // FORM CHANGE
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // =====================================================
    // RESET FORM
    // =====================================================

    const resetForm = () => {
        setForm({
            name: "",
            description: "",
            price: "",
            stock: "",
            category_id: "",
            image_url: ""
        });

        setEditingProduct(null);
    };

    // =====================================================
    // ADD / UPDATE PRODUCT
    // =====================================================

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !form.name ||
            !form.price ||
            form.stock === ""
        ) {
            alert(
                "Name, price and stock are required."
            );
            return;
        }

        try {
            setSaving(true);

            const isEditing =
                editingProduct !== null;

            const url = isEditing
                ? `${API_URL}/admin/products/${editingProduct.id}`
                : `${API_URL}/admin/products`;

            const method = isEditing
                ? "PUT"
                : "POST";

            const response = await fetch(
                url,
                {
                    method,
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        name: form.name,
                        description:
                            form.description,
                        price: Number(
                            form.price
                        ),
                        stock: Number(
                            form.stock
                        ),
                        category_id:
                            form.category_id
                                ? Number(
                                      form.category_id
                                  )
                                : null,
                        image_url:
                            form.image_url ||
                            null
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(
                    data.message ||
                    "Unable to save product."
                );
                return;
            }

            alert(
                isEditing
                    ? "Product updated successfully!"
                    : "Product added successfully!"
            );

            resetForm();

            await fetchProducts();
        } catch (error) {
            console.error(
                "Save product error:",
                error
            );

            alert(
                "Cannot connect to backend."
            );
        } finally {
            setSaving(false);
        }
    };

    // =====================================================
    // START EDITING
    // =====================================================

    const startEdit = (product) => {
        setEditingProduct(product);

        setForm({
            name: product.name || "",
            description:
                product.description || "",
            price: product.price || "",
            stock: product.stock ?? "",
            category_id:
                product.category_id || "",
            image_url:
                product.image_url || ""
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =====================================================
    // DELETE PRODUCT
    // =====================================================

    const deleteProduct = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `${API_URL}/admin/products/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(
                    data.message ||
                    "Unable to delete product."
                );
                return;
            }

            alert(
                "Product deleted successfully!"
            );

            await fetchProducts();
        } catch (error) {
            console.error(
                "Delete error:",
                error
            );

            alert(
                "Cannot connect to backend."
            );
        }
    };

    // =====================================================
    // UPDATE ORDER STATUS
    // =====================================================

    const updateOrderStatus = async (
        orderId,
        status
    ) => {
        try {
            const response = await fetch(
                `${API_URL}/admin/orders/${orderId}/status`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        status
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(
                    data.message ||
                    "Unable to update order."
                );
                return;
            }

            await fetchOrders();
        } catch (error) {
            console.error(
                "Order update error:",
                error
            );

            alert(
                "Cannot connect to backend."
            );
        }
    };

    // =====================================================
    // DASHBOARD STATS
    // =====================================================

    const totalRevenue = useMemo(() => {
        return orders.reduce(
            (total, order) =>
                total +
                Number(
                    order.total_amount || 0
                ),
            0
        );
    }, [orders]);

    const totalStock = useMemo(() => {
        return products.reduce(
            (total, product) =>
                total +
                Number(product.stock || 0),
            0
        );
    }, [products]);

    const lowStockProducts = useMemo(() => {
        return products.filter(
            (product) =>
                Number(product.stock) <= 5
        ).length;
    }, [products]);

    // =====================================================
    // CATEGORY OPTIONS
    // =====================================================

    const categories = [
        {
            id: 1,
            name: "Laptops"
        },
        {
            id: 2,
            name: "Phones"
        },
        {
            id: 3,
            name: "Audio"
        },
        {
            id: 4,
            name: "Wearables"
        },
        {
            id: 5,
            name: "Cameras"
        },
        {
            id: 6,
            name: "Fashion"
        }
    ];

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="admin-page">

                <div className="admin-loading">

                    <div className="spinner"></div>

                    <h2>
                        Loading Admin Dashboard...
                    </h2>

                    <p>
                        Connecting to ShopSphere
                        backend.
                    </p>

                </div>

            </div>
        );
    }

    // =====================================================
    // DASHBOARD
    // =====================================================

    return (
        <div className="admin-page">

            {/* =================================================
                ADMIN HEADER
            ================================================= */}

            <header className="admin-header">

                <div>

                    <div className="admin-brand">
                        🛒 ShopSphere
                    </div>

                    <span className="admin-label">
                        ADMINISTRATION PANEL
                    </span>

                    <h1>
                        Admin Dashboard
                    </h1>

                    <p>
                        Manage products,
                        inventory and customer
                        orders.
                    </p>

                </div>

                <div className="admin-header-actions">

                    <button
                        className="admin-refresh-btn"
                        onClick={
                            fetchAdminData
                        }
                    >
                        ↻ Refresh
                    </button>

                    <button
                        className="admin-back-btn"
                        onClick={onBack}
                    >
                        ← Back to Store
                    </button>

                </div>

            </header>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section className="admin-stats">

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        📦
                    </div>

                    <div>

                        <span>
                            PRODUCTS
                        </span>

                        <strong>
                            {products.length}
                        </strong>

                    </div>

                </div>

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        🛒
                    </div>

                    <div>

                        <span>
                            ORDERS
                        </span>

                        <strong>
                            {orders.length}
                        </strong>

                    </div>

                </div>

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        ₹
                    </div>

                    <div>

                        <span>
                            REVENUE
                        </span>

                        <strong>
                            ₹
                            {totalRevenue.toLocaleString(
                                "en-IN"
                            )}
                        </strong>

                    </div>

                </div>

                <div className="admin-stat-card">

                    <div className="admin-stat-icon">
                        🏬
                    </div>

                    <div>

                        <span>
                            TOTAL STOCK
                        </span>

                        <strong>
                            {totalStock}
                        </strong>

                    </div>

                </div>

                <div className="admin-stat-card warning">

                    <div className="admin-stat-icon">
                        ⚠️
                    </div>

                    <div>

                        <span>
                            LOW STOCK
                        </span>

                        <strong>
                            {lowStockProducts}
                        </strong>

                    </div>

                </div>

            </section>

            {/* =================================================
                PRODUCT FORM
            ================================================= */}

            <section className="admin-panel">

                <div className="admin-panel-header">

                    <div>

                        <span>
                            PRODUCT MANAGEMENT
                        </span>

                        <h2>
                            {editingProduct
                                ? "Update Product"
                                : "Add New Product"}
                        </h2>

                    </div>

                    {editingProduct && (
                        <button
                            className="cancel-edit-btn"
                            onClick={
                                resetForm
                            }
                        >
                            Cancel Edit
                        </button>
                    )}

                </div>

                <form
                    className="product-form"
                    onSubmit={handleSubmit}
                >

                    <div className="form-group">

                        <label>
                            Product Name *
                        </label>

                        <input
                            name="name"
                            value={form.name}
                            onChange={
                                handleChange
                            }
                            placeholder="e.g. MacBook Pro"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Price *
                        </label>

                        <input
                            name="price"
                            type="number"
                            min="0"
                            value={form.price}
                            onChange={
                                handleChange
                            }
                            placeholder="99999"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Stock *
                        </label>

                        <input
                            name="stock"
                            type="number"
                            min="0"
                            value={form.stock}
                            onChange={
                                handleChange
                            }
                            placeholder="10"
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Category
                        </label>

                        <select
                            name="category_id"
                            value={
                                form.category_id
                            }
                            onChange={
                                handleChange
                            }
                        >

                            <option value="">
                                Select Category
                            </option>

                            {categories.map(
                                (category) => (
                                    <option
                                        key={
                                            category.id
                                        }
                                        value={
                                            category.id
                                        }
                                    >
                                        {
                                            category.name
                                        }
                                    </option>
                                )
                            )}

                        </select>

                    </div>

                    <div className="form-group full">

                        <label>
                            Description
                        </label>

                        <textarea
                            name="description"
                            value={
                                form.description
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Describe the product..."
                            rows="3"
                        />

                    </div>

                    <div className="form-group full">

                        <label>
                            Image URL
                        </label>

                        <input
                            name="image_url"
                            value={
                                form.image_url
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="https://..."
                        />

                    </div>

                    <div className="form-actions">

                        <button
                            type="submit"
                            className="admin-submit-btn"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : editingProduct
                                ? "✓ Update Product"
                                : "+ Add Product"}
                        </button>

                        {editingProduct && (
                            <button
                                type="button"
                                className="admin-cancel-btn"
                                onClick={
                                    resetForm
                                }
                            >
                                Cancel
                            </button>
                        )}

                    </div>

                </form>

            </section>

            {/* =================================================
                PRODUCT TABLE
            ================================================= */}

            <section className="admin-panel">

                <div className="admin-panel-header">

                    <div>

                        <span>
                            INVENTORY
                        </span>

                        <h2>
                            Product Management
                        </h2>

                    </div>

                    <span className="record-count">
                        {products.length} products
                    </span>

                </div>

                {products.length === 0 ? (
                    <div className="admin-empty">
                        No products available.
                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>

                                    <th>
                                        Product
                                    </th>

                                    <th>
                                        Category
                                    </th>

                                    <th>
                                        Price
                                    </th>

                                    <th>
                                        Stock
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {products.map(
                                    (product) => (
                                        <tr
                                            key={
                                                product.id
                                            }
                                        >

                                            <td>

                                                <div className="admin-product-name">

                                                    <div className="admin-product-image">

                                                        {product.image_url ? (
                                                            <img
                                                                src={
                                                                    product.image_url
                                                                }
                                                                alt={
                                                                    product.name
                                                                }
                                                            />
                                                        ) : (
                                                            "📦"
                                                        )}

                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {
                                                                product.name
                                                            }
                                                        </strong>

                                                        <small>
                                                            ID:{" "}
                                                            {
                                                                product.id
                                                            }
                                                        </small>

                                                    </div>

                                                </div>

                                            </td>

                                            <td>
                                                <span className="admin-category">
                                                    {
                                                        product.category ||
                                                        "Uncategorized"
                                                    }
                                                </span>
                                            </td>

                                            <td>
                                                <strong>
                                                    ₹
                                                    {Number(
                                                        product.price
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>
                                            </td>

                                            <td>

                                                <span
                                                    className={
                                                        Number(
                                                            product.stock
                                                        ) <=
                                                        5
                                                            ? "stock-low"
                                                            : "stock-good"
                                                    }
                                                >
                                                    {
                                                        product.stock
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                <div className="table-actions">

                                                    <button
                                                        className="edit-btn"
                                                        onClick={() =>
                                                            startEdit(
                                                                product
                                                            )
                                                        }
                                                    >
                                                        ✏️ Edit
                                                    </button>

                                                    <button
                                                        className="delete-btn"
                                                        onClick={() =>
                                                            deleteProduct(
                                                                product.id
                                                            )
                                                        }
                                                    >
                                                        🗑 Delete
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

            {/* =================================================
                ORDERS
            ================================================= */}

            <section className="admin-panel">

                <div className="admin-panel-header">

                    <div>

                        <span>
                            SALES
                        </span>

                        <h2>
                            Order Management
                        </h2>

                    </div>

                    <span className="record-count">
                        {orders.length} orders
                    </span>

                </div>

                {orders.length === 0 ? (
                    <div className="admin-empty">

                        <div>
                            📦
                        </div>

                        <h3>
                            No orders yet
                        </h3>

                        <p>
                            Customer orders will
                            appear here.
                        </p>

                    </div>
                ) : (
                    <div className="admin-table-wrapper">

                        <table className="admin-table">

                            <thead>

                                <tr>

                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        Customer
                                    </th>

                                    <th>
                                        Date
                                    </th>

                                    <th>
                                        Amount
                                    </th>

                                    <th>
                                        Status
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {orders.map(
                                    (order) => (
                                        <tr
                                            key={
                                                order.id
                                            }
                                        >

                                            <td>

                                                <strong>
                                                    #
                                                    {
                                                        order.id
                                                    }
                                                </strong>

                                            </td>

                                            <td>

                                                <div className="customer-info">

                                                    <strong>
                                                        {
                                                            order.name
                                                        }
                                                    </strong>

                                                    <small>
                                                        {
                                                            order.email
                                                        }
                                                    </small>

                                                </div>

                                            </td>

                                            <td>

                                                <span className="date-text">
                                                    {new Date(
                                                        order.created_at
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </span>

                                            </td>

                                            <td>

                                                <strong>
                                                    ₹
                                                    {Number(
                                                        order.total_amount ||
                                                            0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>

                                            </td>

                                            <td>

                                                <select
                                                    className={`order-status-select status-${String(
                                                        order.status
                                                    ).toLowerCase()}`}
                                                    value={
                                                        order.status
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        updateOrderStatus(
                                                            order.id,
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                >

                                                    <option value="pending">
                                                        Pending
                                                    </option>

                                                    <option value="confirmed">
                                                        Confirmed
                                                    </option>

                                                    <option value="shipped">
                                                        Shipped
                                                    </option>

                                                    <option value="delivered">
                                                        Delivered
                                                    </option>

                                                    <option value="cancelled">
                                                        Cancelled
                                                    </option>

                                                </select>

                                            </td>

                                        </tr>
                                    )
                                )}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

            {/* =================================================
                ADMIN FOOTER
            ================================================= */}

            <footer className="admin-footer">

                <strong>
                    ShopSphere Admin Panel
                </strong>

                <span>
                    React • Node.js • Express •
                    MySQL
                </span>

            </footer>

        </div>
    );
}

export default AdminDashboard;