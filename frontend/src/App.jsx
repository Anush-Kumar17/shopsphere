import { useEffect, useMemo, useState } from "react";
import "./App.css";
import AdminDashboard from "./AdminDashboard";

const API_URL = "http://shopsphere-alb-1764685277.ap-south-1.elb.amazonaws.com/api";

function App() {
    // =========================
    // AUTH STATE
    // =========================

    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("user")) || null;
        } catch {
            return null;
        }
    });

    const [token, setToken] = useState(
        () => localStorage.getItem("token") || ""
    );

    // =========================
    // PRODUCT STATE
    // =========================

    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // =========================
    // CART STATE
    // =========================

    const [cart, setCart] = useState([]);
    const [cartCount, setCartCount] = useState(0);

    // =========================
    // ORDER STATE
    // =========================

    const [orders, setOrders] = useState([]);

    // =========================
    // UI STATE
    // =========================

    const [activeSection, setActiveSection] = useState("home");

    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showCart, setShowCart] = useState(false);
    const [showOrders, setShowOrders] = useState(false);
    const [showAdmin, setShowAdmin] = useState(false);

    const [selectedProduct, setSelectedProduct] = useState(null);

    // =========================
    // AUTH FORM
    // =========================

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    const [registerName, setRegisterName] = useState("");
    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");

    const [authLoading, setAuthLoading] = useState(false);

    // =========================
    // INITIAL PRODUCT FETCH
    // =========================

    useEffect(() => {
        fetchProducts();
    }, []);

    // =========================
    // LOAD USER CART
    // =========================

    useEffect(() => {
        if (token) {
            fetchCart();
        } else {
            setCart([]);
            setCartCount(0);
        }
    }, [token]);

    // =========================
    // FETCH PRODUCTS
    // =========================

    const fetchProducts = async () => {
        try {
            setLoadingProducts(true);

            const response = await fetch(
                `${API_URL}/products`
            );

            const data = await response.json();

            if (data.success) {
                setProducts(data.products);
            } else {
                alert("Failed to load products.");
            }
        } catch (error) {
            console.error("Product fetch error:", error);
            alert(
                "Cannot connect to backend. Make sure Node server is running."
            );
        } finally {
            setLoadingProducts(false);
        }
    };

    // =========================
    // LOGIN
    // =========================

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!loginEmail || !loginPassword) {
            alert("Please enter email and password.");
            return;
        }

        try {
            setAuthLoading(true);

            const response = await fetch(
                `${API_URL}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email: loginEmail,
                        password: loginPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(
                    data.message || "Login failed."
                );
                return;
            }

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );

            setToken(data.token);
            setUser(data.user);

            setLoginEmail("");
            setLoginPassword("");

            setShowLogin(false);

            alert(
                `Welcome back, ${data.user.name}!`
            );

            fetchCart();
        } catch (error) {
            console.error("Login error:", error);
            alert(
                "Cannot connect to backend."
            );
        } finally {
            setAuthLoading(false);
        }
    };

    // =========================
    // REGISTER
    // =========================

    const handleRegister = async (e) => {
        e.preventDefault();

        if (
            !registerName ||
            !registerEmail ||
            !registerPassword
        ) {
            alert("Please fill all fields.");
            return;
        }

        if (registerPassword.length < 6) {
            alert(
                "Password must contain at least 6 characters."
            );
            return;
        }

        try {
            setAuthLoading(true);

            const response = await fetch(
                `${API_URL}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name: registerName,
                        email: registerEmail,
                        password: registerPassword
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(
                    data.message ||
                    "Registration failed."
                );
                return;
            }

            setRegisterName("");
            setRegisterEmail("");
            setRegisterPassword("");

            setShowRegister(false);
            setShowLogin(true);

            alert(
                "Registration successful! Please login."
            );
        } catch (error) {
            console.error(
                "Registration error:",
                error
            );

            alert(
                "Cannot connect to backend."
            );
        } finally {
            setAuthLoading(false);
        }
    };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken("");
        setUser(null);

        setCart([]);
        setCartCount(0);
        setOrders([]);

        setShowCart(false);
        setShowOrders(false);
        setShowAdmin(false);

        setActiveSection("home");
    };

    // =========================
    // CART
    // =========================

    const fetchCart = async () => {
        if (!token) return;

        try {
            const response = await fetch(
                `${API_URL}/cart`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                const items =
                    data.cart ||
                    data.items ||
                    [];

                setCart(items);

                const count = items.reduce(
                    (total, item) =>
                        total +
                        Number(
                            item.quantity || 0
                        ),
                    0
                );

                setCartCount(count);
            }
        } catch (error) {
            console.error(
                "Cart fetch error:",
                error
            );
        }
    };

    const addToCart = async (productId) => {
        if (!user || !token) {
            setShowLogin(true);
            return;
        }

        try {
            const response = await fetch(
                `${API_URL}/cart`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization:
                            `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        productId,
                        quantity: 1
                    })
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(
                    data.message ||
                    "Unable to add product to cart."
                );
                return;
            }

            await fetchCart();

            alert("Product added to cart!");
        } catch (error) {
            console.error(
                "Add cart error:",
                error
            );

            alert(
                "Cannot connect to backend."
            );
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const response = await fetch(
                `${API_URL}/cart/${productId}`,
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
                    "Unable to remove item."
                );
                return;
            }

            await fetchCart();
        } catch (error) {
            console.error(
                "Remove cart error:",
                error
            );
        }
    };

    // =========================
    // CHECKOUT
    // =========================

    const handleCheckout = async () => {
        if (!user || !token) {
            setShowLogin(true);
            return;
        }

        if (cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        const confirmed = window.confirm(
            "Proceed with simulated payment and place order?"
        );

        if (!confirmed) return;

        try {
            const response = await fetch(
                `${API_URL}/orders/checkout`,
                {
                    method: "POST",
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                        "Content-Type":
                            "application/json"
                    }
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                alert(
                    data.message ||
                    "Checkout failed."
                );
                return;
            }

            alert(
                "Order placed successfully! Payment simulated."
            );

            await fetchCart();

            setShowCart(false);

            await fetchOrders();

            setShowOrders(true);
        } catch (error) {
            console.error(
                "Checkout error:",
                error
            );

            alert(
                "Cannot connect to backend."
            );
        }
    };

    // =========================
    // ORDERS
    // =========================

    const fetchOrders = async () => {
        if (!token) return;

        try {
            const response = await fetch(
                `${API_URL}/orders`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok && data.success) {
                setOrders(data.orders || []);
            } else {
                alert(
                    data.message ||
                    "Unable to load orders."
                );
            }
        } catch (error) {
            console.error(
                "Orders fetch error:",
                error
            );
        }
    };

    const openOrders = async () => {
        if (!user) {
            setShowLogin(true);
            return;
        }

        await fetchOrders();

        setShowOrders(true);
        setShowCart(false);
        setShowAdmin(false);
    };

    // =========================
    // NAVIGATION
    // =========================

    const goToHome = () => {
        setActiveSection("home");
        setShowOrders(false);
        setShowAdmin(false);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const goToProducts = () => {
        setActiveSection("products");
        setShowOrders(false);
        setShowAdmin(false);

        setTimeout(() => {
            document
                .getElementById("products")
                ?.scrollIntoView({
                    behavior: "smooth"
                });
        }, 50);
    };

    const goToCategories = () => {
        setActiveSection("categories");
        setShowOrders(false);
        setShowAdmin(false);

        setTimeout(() => {
            document
                .getElementById("categories")
                ?.scrollIntoView({
                    behavior: "smooth"
                });
        }, 50);
    };

    const openAdmin = () => {
        if (!user || user.role !== "admin") {
            alert("Admin access required.");
            return;
        }

        setShowAdmin(true);
        setShowOrders(false);
        setShowCart(false);
    };

    // =========================
    // CATEGORIES
    // =========================

    const categories = useMemo(() => {
        const unique = [
            ...new Set(
                products
                    .map(
                        (product) =>
                            product.category
                    )
                    .filter(Boolean)
            )
        ];

        return ["All", ...unique];
    }, [products]);

    // =========================
    // FILTERED PRODUCTS
    // =========================

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesSearch =
                product.name
                    ?.toLowerCase()
                    .includes(
                        search.toLowerCase()
                    ) ||
                product.description
                    ?.toLowerCase()
                    .includes(
                        search.toLowerCase()
                    );

            const matchesCategory =
                selectedCategory === "All" ||
                product.category ===
                    selectedCategory;

            return (
                matchesSearch &&
                matchesCategory
            );
        });
    }, [
        products,
        search,
        selectedCategory
    ]);

    // =========================
    // CART TOTAL
    // =========================

    const cartTotal = useMemo(() => {
        return cart.reduce(
            (total, item) =>
                total +
                Number(item.price || 0) *
                    Number(item.quantity || 0),
            0
        );
    }, [cart]);

    // =========================
    // PRODUCT IMAGE FALLBACK
    // =========================

    const getProductImage = (product) => {
        if (product.image_url) {
            return product.image_url;
        }

        const images = {
            Laptops:
                "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
            Phones:
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
            Audio:
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
            Wearables:
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
            Cameras:
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
            Fashion:
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"
        };

        return (
            images[product.category] ||
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800"
        );
    };

    // =========================
    // ADMIN DASHBOARD
    // =========================

    if (
        showAdmin &&
        user &&
        user.role === "admin"
    ) {
        return (
            <AdminDashboard
                onBack={() => {
                    setShowAdmin(false);
                    setActiveSection("home");
                }}
            />
        );
    }

    // =========================
    // MAIN UI
    // =========================

    return (
        <div className="app">

            {/* =========================
                NAVBAR
            ========================= */}

            <nav className="navbar">

                <div
                    className="logo"
                    onClick={goToHome}
                >
                    <span className="logo-icon">
                        🛒
                    </span>

                    <span>
                        ShopSphere
                    </span>
                </div>

                <div className="nav-links">

                    <button
                        onClick={goToHome}
                        className={
                            activeSection === "home"
                                ? "active"
                                : ""
                        }
                    >
                        Home
                    </button>

                    <button
                        onClick={goToProducts}
                        className={
                            activeSection ===
                            "products"
                                ? "active"
                                : ""
                        }
                    >
                        Products
                    </button>

                    <button
                        onClick={goToCategories}
                        className={
                            activeSection ===
                            "categories"
                                ? "active"
                                : ""
                        }
                    >
                        Categories
                    </button>

                    {user && (
                        <button
                            onClick={openOrders}
                        >
                            Orders
                        </button>
                    )}

                    {user &&
                        user.role === "admin" && (
                            <button
                                className="admin-nav-btn"
                                onClick={openAdmin}
                            >
                                Admin
                            </button>
                        )}

                </div>

                <div className="nav-actions">

                    {user ? (
                        <div className="user-area">

                            <span className="welcome-user">
                                Hi, {user.name}
                            </span>

                            <button
                                className="logout-btn"
                                onClick={
                                    handleLogout
                                }
                            >
                                Logout
                            </button>

                        </div>
                    ) : (
                        <button
                            className="login-btn"
                            onClick={() =>
                                setShowLogin(true)
                            }
                        >
                            Login
                        </button>
                    )}

                    <button
                        className="cart-btn"
                        onClick={() => {
                            if (!user) {
                                setShowLogin(true);
                                return;
                            }

                            setShowCart(true);
                            setShowOrders(false);
                        }}
                    >
                        🛒 Cart

                        {cartCount > 0 && (
                            <span className="cart-badge">
                                {cartCount}
                            </span>
                        )}
                    </button>

                </div>

            </nav>

            {/* =========================
                HERO
            ========================= */}

            <section
                className="hero"
                id="home"
            >

                <div className="hero-content">

                    <span className="hero-tag">
                        ✨ Smart Shopping Experience
                    </span>

                    <h1>
                        Everything You Need,
                        <br />
                        <span>
                            All in One Place.
                        </span>
                    </h1>

                    <p>
                        Discover premium products,
                        great prices and a seamless
                        shopping experience with
                        ShopSphere.
                    </p>

                    <div className="hero-buttons">

                        <button
                            className="primary-btn"
                            onClick={goToProducts}
                        >
                            Shop Now →
                        </button>

                        <button
                            className="secondary-btn"
                            onClick={
                                goToCategories
                            }
                        >
                            Explore Categories
                        </button>

                    </div>

                </div>

                <div className="hero-visual">

                    <div className="hero-circle">
                        🛍️
                    </div>

                    <div className="floating-card card-one">
                        🚚
                        <span>
                            Fast Delivery
                        </span>
                    </div>

                    <div className="floating-card card-two">
                        🔒
                        <span>
                            Secure Shopping
                        </span>
                    </div>

                    <div className="floating-card card-three">
                        ⭐
                        <span>
                            Quality Products
                        </span>
                    </div>

                </div>

            </section>

            {/* =========================
                CATEGORIES
            ========================= */}

            <section
                className="categories-section"
                id="categories"
            >

                <div className="section-heading">
                    <span>
                        BROWSE
                    </span>

                    <h2>
                        Shop by Category
                    </h2>

                    <p>
                        Find exactly what you're
                        looking for.
                    </p>
                </div>

                <div className="category-grid">

                    {categories
                        .filter(
                            (category) =>
                                category !==
                                "All"
                        )
                        .map(
                            (
                                category
                            ) => (
                                <button
                                    key={
                                        category
                                    }
                                    className="category-card"
                                    onClick={() => {
                                        setSelectedCategory(
                                            category
                                        );
                                        goToProducts();
                                    }}
                                >
                                    <div className="category-icon">
                                        {category ===
                                            "Laptops" &&
                                            "💻"}

                                        {category ===
                                            "Phones" &&
                                            "📱"}

                                        {category ===
                                            "Audio" &&
                                            "🎧"}

                                        {category ===
                                            "Wearables" &&
                                            "⌚"}

                                        {category ===
                                            "Cameras" &&
                                            "📷"}

                                        {category ===
                                            "Fashion" &&
                                            "👟"}

                                        {![
                                            "Laptops",
                                            "Phones",
                                            "Audio",
                                            "Wearables",
                                            "Cameras",
                                            "Fashion"
                                        ].includes(
                                            category
                                        ) &&
                                            "🛍️"}
                                    </div>

                                    <h3>
                                        {category}
                                    </h3>

                                    <span>
                                        Explore →
                                    </span>
                                </button>
                            )
                        )}

                </div>

            </section>

            {/* =========================
                PRODUCTS
            ========================= */}

            <section
                className="products-section"
                id="products"
            >

                <div className="products-header">

                    <div className="section-heading left">

                        <span>
                            OUR COLLECTION
                        </span>

                        <h2>
                            Featured Products
                        </h2>

                    </div>

                    <div className="search-box">

                        <span>
                            🔍
                        </span>

                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) =>
                                setSearch(
                                    e.target
                                        .value
                                )
                            }
                        />

                    </div>

                </div>

                {/* CATEGORY FILTER */}

                <div className="category-filter">

                    {categories.map(
                        (category) => (
                            <button
                                key={category}
                                className={
                                    selectedCategory ===
                                    category
                                        ? "selected"
                                        : ""
                                }
                                onClick={() =>
                                    setSelectedCategory(
                                        category
                                    )
                                }
                            >
                                {category}
                            </button>
                        )
                    )}

                </div>

                {loadingProducts ? (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>
                            Loading products...
                        </p>
                    </div>
                ) : filteredProducts.length ===
                  0 ? (
                    <div className="empty-state">
                        <div>
                            🔍
                        </div>

                        <h3>
                            No products found
                        </h3>

                        <p>
                            Try another search
                            or category.
                        </p>
                    </div>
                ) : (
                    <div className="product-grid">

                        {filteredProducts.map(
                            (product) => (
                                <div
                                    className="product-card"
                                    key={
                                        product.id
                                    }
                                >

                                    <div className="product-image-wrapper">

                                        <img
                                            src={getProductImage(
                                                product
                                            )}
                                            alt={
                                                product.name
                                            }
                                            className="product-image"
                                            onError={(
                                                e
                                            ) => {
                                                e.currentTarget.src =
                                                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800";
                                            }}
                                        />

                                        <span className="category-tag">
                                            {
                                                product.category
                                            }
                                        </span>

                                        {product.stock <=
                                            5 && (
                                            <span className="stock-warning">
                                                Only{" "}
                                                {
                                                    product.stock
                                                }{" "}
                                                left
                                            </span>
                                        )}

                                    </div>

                                    <div className="product-info">

                                        <h3>
                                            {
                                                product.name
                                            }
                                        </h3>

                                        <p className="product-description">
                                            {
                                                product.description
                                            }
                                        </p>

                                        <div className="product-bottom">

                                            <strong>
                                                ₹
                                                {Number(
                                                    product.price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </strong>

                                            <button
                                                className="view-btn"
                                                onClick={() =>
                                                    setSelectedProduct(
                                                        product
                                                    )
                                                }
                                            >
                                                View
                                            </button>

                                        </div>

                                        <button
                                            className="add-cart-btn"
                                            onClick={() =>
                                                addToCart(
                                                    product.id
                                                )
                                            }
                                            disabled={
                                                Number(
                                                    product.stock
                                                ) <=
                                                0
                                            }
                                        >
                                            {Number(
                                                product.stock
                                            ) <= 0
                                                ? "Out of Stock"
                                                : "Add to Cart"}
                                        </button>

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

            </section>

            {/* =========================
                FEATURES
            ========================= */}

            <section className="features-section">

                <div className="feature">

                    <div>
                        🚚
                    </div>

                    <h3>
                        Fast Delivery
                    </h3>

                    <p>
                        Quick and reliable
                        delivery.
                    </p>

                </div>

                <div className="feature">

                    <div>
                        🔐
                    </div>

                    <h3>
                        Secure Shopping
                    </h3>

                    <p>
                        Your account is protected
                        with JWT authentication.
                    </p>

                </div>

                <div className="feature">

                    <div>
                        💳
                    </div>

                    <h3>
                        Easy Checkout
                    </h3>

                    <p>
                        Simple and convenient
                        order placement.
                    </p>

                </div>

                <div className="feature">

                    <div>
                        ⭐
                    </div>

                    <h3>
                        Quality Products
                    </h3>

                    <p>
                        Carefully selected
                        products.
                    </p>

                </div>

            </section>

            {/* =========================
                FOOTER
            ========================= */}

            <footer>

                <div className="footer-logo">
                    🛒 ShopSphere
                </div>

                <p>
                    A highly available e-commerce
                    platform built with modern
                    web technologies.
                </p>

                <div className="footer-tech">
                    React • Node.js • Express •
                    MySQL • AWS
                </div>

                <p className="copyright">
                    © 2026 ShopSphere. College
                    Major Project.
                </p>

            </footer>

            {/* =========================
                LOGIN MODAL
            ========================= */}

            {showLogin && (
                <div
                    className="modal-overlay"
                    onClick={() =>
                        setShowLogin(false)
                    }
                >

                    <div
                        className="modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            className="close-btn"
                            onClick={() =>
                                setShowLogin(false)
                            }
                        >
                            ×
                        </button>

                        <div className="modal-icon">
                            🔐
                        </div>

                        <h2>
                            Welcome Back
                        </h2>

                        <p>
                            Login to continue
                            shopping.
                        </p>

                        <form
                            onSubmit={
                                handleLogin
                            }
                        >

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={
                                    loginEmail
                                }
                                onChange={(e) =>
                                    setLoginEmail(
                                        e.target
                                            .value
                                    )
                                }
                            />

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={
                                    loginPassword
                                }
                                onChange={(e) =>
                                    setLoginPassword(
                                        e.target
                                            .value
                                    )
                                }
                            />

                            <button
                                className="submit-btn"
                                type="submit"
                                disabled={
                                    authLoading
                                }
                            >
                                {authLoading
                                    ? "Logging in..."
                                    : "Login"}
                            </button>

                        </form>

                        <p className="switch-auth">
                            Don't have an account?{" "}
                            <button
                                onClick={() => {
                                    setShowLogin(
                                        false
                                    );
                                    setShowRegister(
                                        true
                                    );
                                }}
                            >
                                Register
                            </button>
                        </p>

                    </div>

                </div>
            )}

            {/* =========================
                REGISTER MODAL
            ========================= */}

            {showRegister && (
                <div
                    className="modal-overlay"
                    onClick={() =>
                        setShowRegister(false)
                    }
                >

                    <div
                        className="modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            className="close-btn"
                            onClick={() =>
                                setShowRegister(
                                    false
                                )
                            }
                        >
                            ×
                        </button>

                        <div className="modal-icon">
                            🛍️
                        </div>

                        <h2>
                            Create Account
                        </h2>

                        <p>
                            Join ShopSphere today.
                        </p>

                        <form
                            onSubmit={
                                handleRegister
                            }
                        >

                            <label>
                                Full Name
                            </label>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={
                                    registerName
                                }
                                onChange={(e) =>
                                    setRegisterName(
                                        e.target
                                            .value
                                    )
                                }
                            />

                            <label>
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={
                                    registerEmail
                                }
                                onChange={(e) =>
                                    setRegisterEmail(
                                        e.target
                                            .value
                                    )
                                }
                            />

                            <label>
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={
                                    registerPassword
                                }
                                onChange={(e) =>
                                    setRegisterPassword(
                                        e.target
                                            .value
                                    )
                                }
                            />

                            <button
                                className="submit-btn"
                                type="submit"
                                disabled={
                                    authLoading
                                }
                            >
                                {authLoading
                                    ? "Creating..."
                                    : "Create Account"}
                            </button>

                        </form>

                        <p className="switch-auth">
                            Already have an account?{" "}
                            <button
                                onClick={() => {
                                    setShowRegister(
                                        false
                                    );
                                    setShowLogin(
                                        true
                                    );
                                }}
                            >
                                Login
                            </button>
                        </p>

                    </div>

                </div>
            )}

            {/* =========================
                PRODUCT DETAILS MODAL
            ========================= */}

            {selectedProduct && (
                <div
                    className="modal-overlay"
                    onClick={() =>
                        setSelectedProduct(
                            null
                        )
                    }
                >

                    <div
                        className="product-detail-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            className="close-btn"
                            onClick={() =>
                                setSelectedProduct(
                                    null
                                )
                            }
                        >
                            ×
                        </button>

                        <img
                            src={getProductImage(
                                selectedProduct
                            )}
                            alt={
                                selectedProduct.name
                            }
                        />

                        <div className="detail-content">

                            <span className="detail-category">
                                {
                                    selectedProduct.category
                                }
                            </span>

                            <h2>
                                {
                                    selectedProduct.name
                                }
                            </h2>

                            <p>
                                {
                                    selectedProduct.description
                                }
                            </p>

                            <div className="detail-price">
                                ₹
                                {Number(
                                    selectedProduct.price
                                ).toLocaleString(
                                    "en-IN"
                                )}
                            </div>

                            <p className="stock-text">
                                Stock available:{" "}
                                {
                                    selectedProduct.stock
                                }
                            </p>

                            <button
                                className="submit-btn"
                                onClick={() => {
                                    addToCart(
                                        selectedProduct.id
                                    );
                                    setSelectedProduct(
                                        null
                                    );
                                }}
                                disabled={
                                    Number(
                                        selectedProduct.stock
                                    ) <= 0
                                }
                            >
                                Add to Cart
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* =========================
                CART MODAL
            ========================= */}

            {showCart && (
                <div
                    className="modal-overlay"
                    onClick={() =>
                        setShowCart(false)
                    }
                >

                    <div
                        className="cart-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="cart-header">

                            <div>
                                <span>
                                    YOUR CART
                                </span>

                                <h2>
                                    Shopping Cart
                                </h2>
                            </div>

                            <button
                                className="close-btn"
                                onClick={() =>
                                    setShowCart(
                                        false
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>

                        {cart.length === 0 ? (
                            <div className="empty-cart">

                                <div>
                                    🛒
                                </div>

                                <h3>
                                    Your cart is
                                    empty
                                </h3>

                                <p>
                                    Add some
                                    products to
                                    get started.
                                </p>

                                <button
                                    className="primary-btn"
                                    onClick={() => {
                                        setShowCart(
                                            false
                                        );
                                        goToProducts();
                                    }}
                                >
                                    Start Shopping
                                </button>

                            </div>
                        ) : (
                            <>
                                <div className="cart-items">

                                    {cart.map(
                                        (item) => (
                                            <div
                                                className="cart-item"
                                                key={
                                                    item.product_id ||
                                                    item.id
                                                }
                                            >

                                                <div className="cart-item-image">
                                                    <img
                                                        src={getProductImage(
                                                            item
                                                        )}
                                                        alt={
                                                            item.name
                                                        }
                                                    />
                                                </div>

                                                <div className="cart-item-info">

                                                    <h3>
                                                        {
                                                            item.name
                                                        }
                                                    </h3>

                                                    <p>
                                                        Qty:{" "}
                                                        {
                                                            item.quantity
                                                        }
                                                    </p>

                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            item.price ||
                                                            0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </strong>

                                                </div>

                                                <div className="cart-item-total">

                                                    <strong>
                                                        ₹
                                                        {(
                                                            Number(
                                                                item.price ||
                                                                0
                                                            ) *
                                                            Number(
                                                                item.quantity ||
                                                                0
                                                            )
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </strong>

                                                    <button
                                                        onClick={() =>
                                                            removeFromCart(
                                                                item.product_id ||
                                                                    item.id
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>

                                <div className="cart-summary">

                                    <div>
                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            ₹
                                            {cartTotal.toLocaleString(
                                                "en-IN"
                                            )}
                                        </strong>
                                    </div>

                                    <button
                                        className="checkout-btn"
                                        onClick={
                                            handleCheckout
                                        }
                                    >
                                        Checkout →
                                    </button>

                                    <small>
                                        Payment is
                                        simulated for
                                        this college
                                        project.
                                    </small>

                                </div>
                            </>
                        )}

                    </div>

                </div>
            )}

            {/* =========================
                ORDERS MODAL
            ========================= */}

            {showOrders && (
                <div
                    className="modal-overlay"
                    onClick={() =>
                        setShowOrders(false)
                    }
                >

                    <div
                        className="orders-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="cart-header">

                            <div>
                                <span>
                                    ACCOUNT
                                </span>

                                <h2>
                                    My Orders
                                </h2>
                            </div>

                            <button
                                className="close-btn"
                                onClick={() =>
                                    setShowOrders(
                                        false
                                    )
                                }
                            >
                                ×
                            </button>

                        </div>

                        {orders.length === 0 ? (
                            <div className="empty-cart">

                                <div>
                                    📦
                                </div>

                                <h3>
                                    No orders yet
                                </h3>

                                <p>
                                    Your placed
                                    orders will
                                    appear here.
                                </p>

                            </div>
                        ) : (
                            <div className="orders-list">

                                {orders.map(
                                    (order) => (
                                        <div
                                            className="order-card"
                                            key={
                                                order.id
                                            }
                                        >

                                            <div className="order-top">

                                                <div>
                                                    <span>
                                                        Order
                                                        #
                                                        {
                                                            order.id
                                                        }
                                                    </span>

                                                    <small>
                                                        {new Date(
                                                            order.created_at
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </small>
                                                </div>

                                                <span
                                                    className={`status status-${String(
                                                        order.status
                                                    ).toLowerCase()}`}
                                                >
                                                    {
                                                        order.status
                                                    }
                                                </span>

                                            </div>

                                            <div className="order-bottom">

                                                <span>
                                                    Total
                                                </span>

                                                <strong>
                                                    ₹
                                                    {Number(
                                                        order.total_amount ||
                                                        0
                                                    ).toLocaleString(
                                                        "en-IN"
                                                    )}
                                                </strong>

                                            </div>

                                        </div>
                                    )
                                )}

                            </div>
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}

export default App;