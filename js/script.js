// js/script.js
// Archivo JavaScript principal para las funcionalidades de Login, Dashboard,
// Crear Inventario, Ver Inventarios, y Gestión CRUD de Inventarios y Productos.

// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado. Iniciando script.js');

    // --- Estado de la Aplicación (Datos almacenados en localStorage) ---
    // Se intenta cargar los datos existentes. Si no hay o están corruptos,
    // se inicializa con una estructura válida para evitar errores.
    let inventrakData = JSON.parse(localStorage.getItem('inventrakData')) || {
        users: [{ email: "test@inventrak.com", password: "password123", name: "Claudia" }], // Usuario de prueba
        currentUser: null, // ID del usuario actualmente logueado
        // 'budget' ahora representa el saldo de efectivo actual
        budget: 50000.00, // Saldo inicial de efectivo
        losses: 0.00, // Total de pérdidas (costos, eliminaciones) del mes actual
        gains: 0.00, // Total de ganancias (ventas) del mes actual
        // Estructura para inventarios: cada inventario tiene sus propios productos y transacciones
        inventories: [
            // Ejemplo de inventario inicial (se puede remover en producción si no se quiere un inventario por defecto)
            {
                id: 1, // ID único del inventario
                name: "INVENTARIO PRINCIPAL",
                initialAmount: 10000.00, // Monto inicial conceptual para este inventario
                creationDate: "01/01/2025",
                products: [ // Lista de productos dentro de este inventario
                    { id: 101, name: "Leche Entera", category: "Lácteos", sku: "LE001", description: "Leche de vaca semidesnatada", cost: 2.00, salePrice: 2.50, stock: 50, unit: "litro", location: "Pasillo 1", supplier: "Proveedor Lácteo A", expiryDate: "2025-12-31", lastUpdated: "05/06/2025" },
                    { id: 102, name: "Pan Integral", category: "Panadería", sku: "PI002", description: "Pan de molde 500g", cost: 1.50, salePrice: 2.00, stock: 100, unit: "unidad", location: "Panadería", supplier: "Panificadora B", expiryDate: "2025-06-15", lastUpdated: "05/06/2025" }
                ],
                transactions: [ // Lista de transacciones (ventas, compras, ajustes) para este inventario
                    { id: 1, productId: null, type: "creacion_inventario", quantity: 1, price: 10000.00, date: "01/01/2025", time: "09:00", notes: "Fondo inicial para inventario principal", totalCost: 10000.00 }, // Representa el gasto inicial del presupuesto general para el inventario
                    { id: 2, productId: 101, type: "compra", quantity: 50, price: 100.00, date: "05/06/2025", time: "10:00", notes: "Compra de 50 leches", totalCost: 100.00 },
                    { id: 3, productId: 102, type: "compra", quantity: 100, price: 150.00, date: "05/06/2025", time: "10:05", notes: "Compra de 100 panes", totalCost: 150.00 },
                    { id: 4, productId: 101, type: "venta", quantity: 5, price: 12.50, date: "05/06/2025", time: "10:30", notes: "Venta de 5 leches", totalCost: 10.00 },
                    { id: 5, productId: 102, type: "venta", quantity: 10, price: 20.00, date: "05/06/2025", time: "11:00", notes: "Venta de 10 panes", totalCost: 15.00 }
                ]
            }
        ]
    };

    // Validación y saneamiento de datos cargados de localStorage
    inventrakData.inventories = inventrakData.inventories.map(inv => {
        return {
            ...inv,
            products: Array.isArray(inv.products) ? inv.products : [],
            transactions: Array.isArray(inv.transactions) ? inv.transactions : []
        };
    });
    console.log('Datos de inventrakData después del saneamiento:', inventrakData);


    let selectedInventoryId = null; // Guarda el ID del inventario actualmente seleccionado para gestionar
    let editingProductId = null; // Guarda el ID del producto que se está editando (null si no se está editando)

    // --- Selectores de Elementos del DOM ---
    // Se agregan checks '?' para evitar errores si los elementos no existen en la página actual.

    // Elementos comunes (pueden estar en login.html o index.html)
    const logoutButton = document.getElementById('logout-button');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    // Elementos de la página de Login/Registro (solo se esperan en login.html)
    const loginPanel = document.getElementById('loginPanel');
    const registerPanel = document.getElementById('registerPanel');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const loginEmailInput = document.getElementById('loginEmail');
    const loginPasswordInput = document.getElementById('loginPassword');
    const registerNameInput = document.getElementById('registerName');
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPasswordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');

    // Elementos del Dashboard (solo se esperan en index.html)
    const currentTimeSpan = document.getElementById('current-time');
    const userNameSpan = document.getElementById('user-name');
    const currentBudgetSpan = document.getElementById('current-budget');
    const totalLossesSpan = document.getElementById('total-losses');
    const totalGainsSpan = document.getElementById('total-gains');
    const toggleInOutBtn = document.getElementById('toggle-in-out');
    const inOutList = document.getElementById('in-out-list');
    const financialSummaryComment = document.getElementById('financial-summary-comment'); // Nuevo elemento para los comentarios

    // Elementos de Crear Inventario (solo se esperan en index.html)
    const createInventoryForm = document.getElementById('createInventoryForm');
    const newInventoryNameInput = document.getElementById('newInventoryName');
    const newInventoryInitialAmountInput = document.getElementById('newInventoryInitialAmount');

    // Elementos de Ver Inventarios (solo se esperan en index.html)
    const inventoriesListDiv = document.getElementById('inventories-list');
    const noInventoriesMessage = document.getElementById('no-inventories-message');

    // Elementos de Gestionar Inventario (solo se esperan en index.html)
    const backToInventoriesBtn = document.getElementById('backToInventoriesBtn');
    const currentInventoryNameSpan = document.getElementById('currentInventoryName');
    const managedInventoryInitialAmountSpan = document.getElementById('managedInventoryInitialAmount');
    const managedInventoryCreationDateSpan = document.getElementById('managedInventoryCreationDate');
    const editInventoryDetailsBtn = document.getElementById('editInventoryDetailsBtn');
    const deleteCurrentInventoryBtn = document.getElementById('deleteCurrentInventoryBtn');
    const productForm = document.getElementById('productForm');
    const productFormTitle = document.getElementById('productFormTitle');
    const productNameInput = document.getElementById('productName');
    const productCategoryInput = document.getElementById('productCategory');
    const productSKUInput = document.getElementById('productSKU');
    const productDescriptionInput = document.getElementById('productDescription');
    const productCostInput = document.getElementById('productCost');
    const productSalePriceInput = document.getElementById('productSalePrice');
    const productStockInput = document.getElementById('productStock');
    const productUnitInput = document.getElementById('productUnit');
    const productLocationInput = document.getElementById('productLocation');
    const productSupplierInput = document.getElementById('productSupplier');
    const productExpiryDateInput = document.getElementById('productExpiryDate');
    const cancelEditProductBtn = document.getElementById('cancelEditProductBtn');
    const productsListDiv = document.getElementById('products-list');
    const noProductsMessage = document.getElementById('no-products-message');
    const dailyBalanceSpan = document.getElementById('dailyBalance');
    const monthlyBalanceSpan = document.getElementById('monthlyBalance');
    const annualBalanceSpan = document.getElementById('annualBalance');
    const recentTransactionsList = document.getElementById('recentTransactionsList');


    // --- Funciones de Utilidad ---

    /**
     * Guarda el objeto 'inventrakData' completo en localStorage.
     */
    function saveInventrakData() {
        localStorage.setItem('inventrakData', JSON.stringify(inventrakData));
        console.log('Datos guardados en localStorage:', inventrakData);
    }

    /**
     * Formatea un número al formato de moneda colombiana (COP).
     * @param {number} amount - El monto a formatear.
     * @returns {string} El monto formateado como cadena de moneda.
     */
    function formatCurrency(amount) {
        return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    /**
     * Oculta todas las secciones de contenido y muestra solo la sección con el ID especificado.
     * También actualiza los estados activos del menú lateral y el menú inferior.
     * @param {string} sectionId - El ID de la sección HTML a mostrar (ej. 'dashboard-section').
     */
    function showSection(sectionId) {
        console.log(`Intentando mostrar la sección: ${sectionId}`);
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            console.log(`Sección "${sectionId}" mostrada.`);
        } else {
            console.error(`ERROR: Sección con ID "${sectionId}" no encontrada en el DOM.`);
            return;
        }

        sidebarItems.forEach(item => item.classList.remove('active', 'bg-inventrak-blue', 'text-white'));
        const activeSidebarItem = document.querySelector(`.sidebar-item[data-section="${sectionId.replace('-section', '')}"]`);
        if (activeSidebarItem) {
            activeSidebarItem.classList.add('active', 'bg-inventrak-blue', 'text-white');
            console.log(`Item del sidebar "${sectionId.replace('-section', '')}" activado.`);
        } else {
            console.warn(`WARN: Item del sidebar para la sección "${sectionId.replace('-section', '')}" no encontrado.`);
        }

        bottomNavItems.forEach(item => item.classList.remove('active', 'text-inventrak-darkblue'));
        const activeBottomNavItem = document.querySelector(`.bottom-nav-item[data-section="${sectionId.replace('-section', '')}"]`);
        if (activeBottomNavItem) {
            activeBottomNavItem.classList.add('active', 'text-inventrak-darkblue');
            console.log(`Item del bottom nav "${sectionId.replace('-section', '')}" activado.`);
        } else {
            console.warn(`WARN: Item del bottom nav para la sección "${sectionId.replace('-section', '')}" no encontrado.`);
        }

        if (window.innerWidth < 1024 && sidebar && sidebarOverlay) {
            closeSidebar();
            console.log('Sidebar cerrada (modo móvil).');
        }
    }

    // --- Funciones de Renderizado (UI Updates) ---

    /**
     * Renderiza y actualiza los datos principales del dashboard (presupuesto, pérdidas, ganancias, hora, nombre de usuario, comentarios).
     */
    function renderDashboard() {
        console.log('Iniciando renderDashboard...');
        if (currentTimeSpan) {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            currentTimeSpan.textContent = `${hours}:${minutes} ${now.getHours() < 12 ? 'AM' : 'PM'}`;
        }
        if (userNameSpan) {
            const currentUser = inventrakData.users.find(user => user.email === inventrakData.currentUser);
            userNameSpan.textContent = currentUser ? currentUser.name : 'Usuario';
        }
        
        // Recalcular pérdidas y ganancias GLOBALES (del mes actual)
        let totalGlobalLossesThisMonth = 0;
        let totalGlobalGainsThisMonth = 0;
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        inventrakData.inventories.forEach(inv => {
            if (inv.transactions && Array.isArray(inv.transactions)) {
                inv.transactions.forEach(t => {
                    const transactionDate = new Date(`${t.date.split('/').reverse().join('-')}T${t.time || '00:00'}`);
                    if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
                        if (t.type === 'venta' || t.type === 'ajuste_positivo') {
                            totalGlobalGainsThisMonth += t.price;
                        } else if (t.type === 'compra' || t.type === 'entrada' || t.type === 'creacion_inventario') {
                            totalGlobalLossesThisMonth += (t.price || t.totalCost || 0); // Usar price o totalCost si existe
                        } else if (t.type === 'ajuste_negativo' || t.type === 'eliminacion') {
                            totalGlobalLossesThisMonth += (t.totalCost || t.price || 0); // Asumir que totalCost o price es la pérdida
                        }
                    }
                });
            }
        });
        // Actualizar los datos globales de pérdidas y ganancias para el dashboard
        inventrakData.losses = totalGlobalLossesThisMonth;
        inventrakData.gains = totalGlobalGainsThisMonth;
        saveInventrakData(); // Guarda los totales actualizados

        if (currentBudgetSpan) currentBudgetSpan.textContent = formatCurrency(inventrakData.budget);
        if (totalLossesSpan) totalLossesSpan.textContent = formatCurrency(inventrakData.losses);
        if (totalGainsSpan) totalGainsSpan.textContent = formatCurrency(inventrakData.gains);

        // Generar comentarios financieros
        generateFinancialComment();

        renderDashboardInOutList();
        console.log('renderDashboard finalizado.');
    }

    /**
     * Genera un comentario amigable sobre el estado financiero del dashboard.
     */
    function generateFinancialComment() {
        if (!financialSummaryComment) return;

        const currentBudget = inventrakData.budget;
        const totalLosses = inventrakData.losses;
        const totalGains = inventrakData.gains;

        let comment = "Aquí verás un resumen de tu situación financiera.";

        if (currentBudget > 100000) {
            comment = "¡Tu presupuesto está floreciendo! Un excelente trabajo manteniendo las finanzas en verde. ¡Sigue así!";
        } else if (currentBudget > 50000) {
            comment = "Tu presupuesto está saludable. Mantente atento a tus movimientos para seguir creciendo.";
        } else if (currentBudget > 10000) {
            comment = "Tu presupuesto es sólido. No obstante, siempre hay espacio para optimizar tus gastos y aumentar tus ingresos.";
        } else if (currentBudget > 0) {
            comment = "Tu presupuesto es un poco bajo. Es un buen momento para revisar tus entradas y salidas, ¡pequeños cambios pueden hacer una gran diferencia!";
        } else {
            comment = "¡Atención! Tu presupuesto está en números rojos. Es crucial que revises urgentemente tus finanzas y tomes acciones para revertir la situación.";
        }

        // Comentarios adicionales basados en ganancias vs. pérdidas (mensual)
        if (totalGains > totalLosses * 1.5) {
            comment += "<br>¡Felicidades! Este mes tus ganancias han superado con creces tus gastos. ¡Un rendimiento impresionante!";
        } else if (totalGains > totalLosses) {
            comment += "<br>Buen desempeño este mes: tus ganancias superan tus gastos. ¡Vas por buen camino!";
        } else if (totalLosses > totalGains * 1.5) {
            comment += "<br>Este mes tus gastos han sido significativamente más altos que tus ganancias. Es momento de identificar dónde puedes optimizar y buscar nuevas oportunidades de ingreso.";
        } else if (totalLosses > totalGains) {
            comment += "<br>Tus gastos fueron mayores que tus ganancias este mes. Es un buen momento para analizar tus movimientos y ajustar tu estrategia.";
        } else if (totalGains === 0 && totalLosses === 0) {
            comment += "<br>Aún no hay movimientos registrados este mes. ¡Es un buen momento para empezar a trackear tus finanzas!";
        } else {
            comment += "<br>Tus ingresos y gastos de este mes están bastante equilibrados. Mantén la vigilancia para asegurar una tendencia positiva.";
        }

        financialSummaryComment.innerHTML = comment;
    }

    /**
     * Renderiza la lista de entradas y salidas (transacciones recientes) en el dashboard.
     */
    function renderDashboardInOutList() {
        console.log('Iniciando renderDashboardInOutList...');
        if (!inOutList) {
            console.error('ERROR: Elemento in-out-list no encontrado para renderDashboardInOutList.');
            return;
        }
        inOutList.innerHTML = '';
        const allTransactions = [];

        inventrakData.inventories.forEach(inv => {
            if (inv.transactions && Array.isArray(inv.transactions)) {
                inv.transactions.forEach(t => {
                    let transactionDescription = `Movimiento en ${inv.name} (${t.type})`; // Descripción genérica

                    // Intentar encontrar el producto asociado si productId existe
                    const product = inv.products.find(p => p.id === t.productId);
                    if (product) {
                        transactionDescription = `${product.name} (${t.type})`;
                    } else if (t.type === 'creacion_inventario') {
                        transactionDescription = `Creación de Inventario: ${inv.name}`;
                    } else {
                        // Si no se encuentra el producto pero no es creación de inventario, usar las notas de la transacción
                        transactionDescription = t.notes || `Movimiento en ${inv.name} (${t.type})`;
                    }

                    allTransactions.push({
                        ...t,
                        inventoryName: inv.name,
                        transactionDisplay: transactionDescription
                    });
                });
            }
        });

        allTransactions.sort((a, b) => {
            const dateTimeA = new Date(`${a.date.split('/').reverse().join('-')}T${a.time || '00:00'}`);
            const dateTimeB = new Date(`${b.date.split('/').reverse().join('-')}T${b.time || '00:00'}`);
            return dateTimeB - dateTimeA;
        });

        if (allTransactions.length === 0) {
            inOutList.innerHTML = '<p class="text-inventrak-text-light text-center">No hay movimientos recientes en ningún inventario.</p>';
            console.log('No hay transacciones para mostrar en el dashboard.');
            return;
        }

        const displayLimit = 5;
        allTransactions.slice(0, displayLimit).forEach(transaction => {
            const div = document.createElement('div');
            let typeClass = 'text-gray-700';
            let sign = '';
            let displayValue = transaction.price; // Por defecto

            // Determinar el valor que afecta al presupuesto
            let actualValueForBudget = 0;
            if (transaction.type === 'venta' || transaction.type === 'ajuste_positivo') {
                typeClass = 'text-green-500';
                sign = '+';
                actualValueForBudget = transaction.price; // El precio de venta es la ganancia de efectivo
            } else if (transaction.type === 'compra' || transaction.type === 'entrada' || transaction.type === 'creacion_inventario') {
                typeClass = 'text-red-500';
                sign = '-';
                actualValueForBudget = transaction.price || transaction.totalCost; // El costo de compra es la salida de efectivo
            } else if (transaction.type === 'ajuste_negativo' || transaction.type === 'eliminacion') {
                typeClass = 'text-red-500';
                sign = '-';
                // Para estos tipos, el 'price' o 'totalCost' refleja la pérdida de valor de inventario, no directamente el presupuesto global
                actualValueForBudget = transaction.totalCost || transaction.price;
            }
            displayValue = actualValueForBudget;


            div.className = 'flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm';
            div.innerHTML = `
                <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
                    <span class="bg-inventrak-blue text-white text-xs px-2 py-0.5 rounded-full font-medium mb-1 sm:mb-0">${transaction.inventoryName}</span>
                    <span class="text-inventrak-text-light text-sm">${transaction.date}</span>
                    <span class="text-inventrak-text-dark text-sm font-medium mt-1 sm:mt-0">${transaction.transactionDisplay}</span>
                </div>
                <span class="${typeClass} font-semibold text-sm sm:text-base">${sign}${formatCurrency(displayValue)}</span>
            `;
            inOutList.appendChild(div);
        });
        console.log('renderDashboardInOutList finalizado.');
    }

    /**
     * Renderiza la lista de inventarios creados en la sección "Inventarios Creados".
     */
    function renderInventoriesList() {
        console.log('Iniciando renderInventoriesList...');
        if (!inventoriesListDiv) {
            console.error('ERROR: Elemento inventories-list no encontrado para renderInventoriesList.');
            return;
        }
        inventoriesListDiv.innerHTML = '';
        if (inventrakData.inventories.length === 0) {
            if (noInventoriesMessage) noInventoriesMessage.classList.remove('hidden');
            console.log('No hay inventarios creados.');
        } else {
            if (noInventoriesMessage) noInventoriesMessage.classList.add('hidden');
            inventrakData.inventories.forEach(inventory => {
                const div = document.createElement('div');
                div.className = 'flex flex-col sm:flex-row justify-between items-start sm:items-center bg-inventrak-card-bg p-4 rounded-xl shadow-md';
                div.dataset.inventoryId = inventory.id;

                // Calcular el valor total actual del inventario (stock * costo)
                const totalInventoryValue = inventory.products.reduce((sum, product) => sum + (product.stock * product.cost), 0);
                // Calcular el valor de las ventas realizadas por este inventario
                const salesValue = inventory.transactions.reduce((sum, t) => {
                    if (t.type === 'venta') return sum + t.price;
                    return sum;
                }, 0);

                div.innerHTML = `
                    <div class="flex flex-col mb-2 sm:mb-0 flex-grow">
                        <span class="text-inventrak-text-dark font-semibold text-lg">${inventory.name}</span>
                        <span class="text-inventrak-text-light text-sm">Creado: ${inventory.creationDate}</span>
                        <span class="text-inventrak-darkblue text-sm mt-1">Valor Stock: ${formatCurrency(totalInventoryValue)}</span>
                        <span class="text-inventrak-text-light text-sm mt-0.5">Ventas Generadas: ${formatCurrency(salesValue)}</span>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <span class="text-inventrak-darkblue font-bold text-base sm:text-xl">Productos: ${inventory.products.length}</span>
                        <button class="manage-inventory-btn bg-inventrak-darkblue text-white px-3 py-1 rounded-lg text-sm hover:bg-inventrak-blue transition duration-200" data-inventory-id="${inventory.id}">
                            Gestionar
                        </button>
                        <button class="edit-inventory-btn bg-gray-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-gray-600 transition duration-200" data-inventory-id="${inventory.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-inventory-btn bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition duration-200" data-inventory-id="${inventory.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                inventoriesListDiv.appendChild(div);
            });

            // Añadir event listeners a los botones de gestionar, editar y eliminar inventario
            document.querySelectorAll('.manage-inventory-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); // Evita que el clic se propague al div padre si tuviera un listener
                    const invId = parseInt(e.currentTarget.dataset.inventoryId);
                    loadManageInventorySection(invId);
                });
            });
            document.querySelectorAll('.edit-inventory-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const invId = parseInt(e.currentTarget.dataset.inventoryId);
                    editInventory(invId);
                });
            });
            document.querySelectorAll('.delete-inventory-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const invId = parseInt(e.currentTarget.dataset.inventoryId);
                    deleteInventory(invId);
                });
            });
            console.log('Listeners para gestión de inventarios asignados.');
        }
        console.log('renderInventoriesList finalizado.');
    }

    /**
     * Renderiza la lista de productos dentro del inventario actualmente gestionado.
     * @param {object} inventory - El objeto del inventario cuyos productos se van a renderizar.
     */
    function renderProductList(inventory) {
        console.log('Iniciando renderProductList para inventario:', inventory?.name);
        if (!productsListDiv) {
            console.error('ERROR: Elemento products-list no encontrado para renderProductList.');
            return;
        }
        productsListDiv.innerHTML = '';
        if (!inventory || !inventory.products || inventory.products.length === 0) {
            if (noProductsMessage) noProductsMessage.classList.remove('hidden');
            console.log('No hay productos en este inventario.');
        } else {
            if (noProductsMessage) noProductsMessage.classList.add('hidden');
            inventory.products.forEach(product => {
                const div = document.createElement('div');
                div.className = 'flex flex-col sm:flex-row justify-between items-start sm:items-center bg-inventrak-blue bg-opacity-20 p-4 rounded-xl shadow-sm border border-inventrak-blue';
                div.innerHTML = `
                    <div class="flex flex-col flex-grow mb-2 sm:mb-0 sm:mr-4">
                        <span class="text-inventrak-text-dark font-bold text-base sm:text-lg">${product.name} <span class="text-inventrak-text-light text-xs sm:text-sm">(${product.sku || 'N/A'})</span></span>
                        <span class="text-inventrak-text-dark text-sm mt-1">Stock: ${product.stock} ${product.unit || ''} | Costo: ${formatCurrency(product.cost)} | Venta: ${formatCurrency(product.salePrice)}</span>
                        <span class="text-inventrak-text-light text-xs mt-1">Cat: ${product.category || 'N/A'} | Ubicación: ${product.location || 'N/A'} | Prov: ${product.supplier || 'N/A'} ${product.expiryDate ? `| Vence: ${product.expiryDate}` : ''}</span>
                    </div>
                    <div class="flex space-x-2 w-full sm:w-auto justify-end sm:justify-start">
                        <button class="sell-product-btn bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600 transition duration-200" data-product-id="${product.id}">
                            <i class="fas fa-dollar-sign"></i> Vender
                        </button>
                        <button class="edit-product-btn bg-inventrak-darkblue text-white px-3 py-1 rounded-lg text-sm hover:bg-inventrak-blue transition duration-200" data-product-id="${product.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-product-btn bg-red-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-600 transition duration-200" data-product-id="${product.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                productsListDiv.appendChild(div);
            });

            // Añadir event listeners para editar, eliminar y vender productos
            document.querySelectorAll('.edit-product-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = parseInt(e.currentTarget.dataset.productId);
                    editProduct(productId);
                });
            });
            document.querySelectorAll('.delete-product-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = parseInt(e.currentTarget.dataset.productId);
                    deleteProduct(productId);
                });
            });
            document.querySelectorAll('.sell-product-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = parseInt(e.currentTarget.dataset.productId);
                    sellProduct(productId);
                });
            });
            console.log(`Se han renderizado ${inventory.products.length} productos.`);
        }
        console.log('renderProductList finalizado.');
    }

    /**
     * Calcula y renderiza los balances (diario, mensual, anual) y movimientos recientes para un inventario específico.
     * @param {object} inventory - El objeto del inventario para calcular y mostrar balances.
     */
    function renderInventoryBalances(inventory) {
        console.log('Iniciando renderInventoryBalances para inventario:', inventory?.name);
        if (!inventory) {
            console.error('ERROR: No se proporcionó un inventario para renderInventoryBalances.');
            return;
        }

        let dailyNet = 0;
        let monthlyNet = 0;
        let annualNet = 0;

        const today = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        inventory.transactions.forEach(t => {
            // Asegurarse de que la fecha de la transacción es válida
            const dateParts = t.date.split('/');
            // new Date(año, mes-1, día) para evitar problemas de formato
            const transactionDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));

            let value = t.price || 0; // Asegurarse de que el valor exista

            // La lógica para balances de inventario debe reflejar el impacto en el valor del inventario
            // Venta: aumenta valor de inventario (por precio de venta)
            // Compra/Entrada: disminuye efectivo (gasto) y aumenta valor de inventario (por costo)
            // Eliminación/Ajuste Negativo: disminuye valor de inventario (por costo)
            // Ajuste Positivo: aumenta valor de inventario (por costo)

            if (t.type === 'venta' || t.type === 'ajuste_positivo') {
                if (t.date === today) dailyNet += value; // Ganancia
                if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) monthlyNet += value;
                if (transactionDate.getFullYear() === currentYear) annualNet += value;
            } else if (t.type === 'compra' || t.type === 'entrada' || t.type === 'creacion_inventario') {
                if (t.date === today) dailyNet -= (t.totalCost || value); // Gasto (costo de adquisición)
                if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) monthlyNet -= (t.totalCost || value);
                if (transactionDate.getFullYear() === currentYear) annualNet -= (t.totalCost || value);
            } else if (t.type === 'ajuste_negativo' || t.type === 'eliminacion') {
                const transactionCost = t.totalCost !== undefined ? t.totalCost : t.price; // Pérdida de valor del inventario
                if (t.date === today) dailyNet -= transactionCost;
                if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) monthlyNet -= transactionCost;
                if (transactionDate.getFullYear() === currentYear) annualNet -= transactionCost;
            }
        });

        if (dailyBalanceSpan) dailyBalanceSpan.textContent = formatCurrency(dailyNet);
        if (monthlyBalanceSpan) monthlyBalanceSpan.textContent = formatCurrency(monthlyNet);
        if (annualBalanceSpan) annualBalanceSpan.textContent = formatCurrency(annualNet);

        if (recentTransactionsList) {
            recentTransactionsList.innerHTML = '';
            if (!inventory.transactions || inventory.transactions.length === 0) {
                recentTransactionsList.innerHTML = '<p class="text-inventrak-text-light text-sm">No hay movimientos recientes.</p>';
                return;
            }

            const sortedTransactions = [...inventory.transactions].sort((a, b) => {
                const dateTimeA = new Date(`${a.date.split('/').reverse().join('-')}T${a.time || '00:00'}`);
                const dateTimeB = new Date(`${b.date.split('/').reverse().join('-')}T${b.time || '00:00'}`);
                return dateTimeB - dateTimeA;
            });

            sortedTransactions.slice(0, 5).forEach(t => { // Mostrar las últimas 5 transacciones
                const div = document.createElement('div');
                let typeColor = 'text-gray-700';
                let sign = '';
                const product = inventory.products.find(p => p.id === t.productId);
                const productName = product ? product.name : (t.type === 'creacion_inventario' ? inventory.name : 'N/A');
                let transactionValue = t.price || 0; // Valor por defecto

                if (t.type === 'venta' || t.type === 'ajuste_positivo') {
                    typeColor = 'text-green-500';
                    sign = '+';
                } else if (t.type === 'compra' || t.type === 'entrada' || t.type === 'creacion_inventario') {
                    typeColor = 'text-red-500';
                    sign = '-';
                    transactionValue = t.totalCost !== undefined ? t.totalCost : t.price; // Usar el costo para compras/entradas
                } else if (t.type === 'ajuste_negativo' || t.type === 'eliminacion') {
                    typeColor = 'text-red-500';
                    sign = '-';
                    transactionValue = t.totalCost !== undefined ? t.totalCost : t.price; // Usar el costo para pérdidas/eliminaciones
                }

                div.className = 'bg-gray-50 p-2 rounded-lg flex justify-between items-center text-xs sm:text-sm';
                div.innerHTML = `
                    <span class="text-inventrak-text-dark">
                        ${t.date} ${t.time || ''} - <strong>${productName}</strong> (${t.notes || t.type})
                    </span>
                    <span class="${typeColor} font-semibold">${sign}${formatCurrency(transactionValue)}</span>
                `;
                recentTransactionsList.appendChild(div);
            });
        }
        console.log('renderInventoryBalances finalizado.');
    }


    // --- Funciones de Lógica de la Aplicación ---

    /**
     * Alterna la visibilidad entre el panel de login y el de registro en login.html.
     * @param {boolean} showLogin - Si es true, muestra el panel de login; de lo contrario, muestra el de registro.
     */
    function toggleForm(showLogin) {
        if (loginPanel && registerPanel) {
            if (showLogin) {
                loginPanel.classList.remove('hidden');
                registerPanel.classList.add('hidden');
                console.log('Mostrando panel de login.');
            } else {
                loginPanel.classList.add('hidden');
                registerPanel.classList.remove('hidden');
                console.log('Mostrando panel de registro.');
            }
        } else {
            console.warn('WARN: Paneles de login/registro no encontrados. Probablemente no estamos en login.html');
        }
    }

    /**
     * Maneja el envío del formulario de inicio de sesión.
     * @param {Event} e - El evento de envío del formulario.
     */
    function handleLogin(e) {
        e.preventDefault();
        const email = loginEmailInput ? loginEmailInput.value : '';
        const password = loginPasswordInput ? loginPasswordInput.value : '';

        console.log(`Intentando login con email: ${email}`);
        const user = inventrakData.users.find(u => u.email === email && u.password === password);

        if (user) {
            inventrakData.currentUser = user.email;
            saveInventrakData();
            console.log('Login exitoso. Redirigiendo a index.html...');
            window.location.href = 'index.html';
        } else {
            alert('Credenciales incorrectas. Intenta con test@inventrak.com / password123 (o regístrate)');
            console.log('Login fallido.');
        }
    }

    /**
     * Maneja el envío del formulario de registro de un nuevo usuario.
     * @param {Event} e - El evento de envío del formulario.
     */
    function handleRegister(e) {
        e.preventDefault();
        const name = registerNameInput ? registerNameInput.value.trim() : '';
        const email = registerEmailInput ? registerEmailInput.value.trim() : '';
        const password = registerPasswordInput ? registerPasswordInput.value : '';
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

        if (!name || !email || !password || !confirmPassword) {
            alert('Por favor, completa todos los campos.');
            return;
        }
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden.');
            return;
        }
        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres.');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, ingresa un correo electrónico válido.');
            return;
        }
        if (inventrakData.users.some(user => user.email === email)) {
            alert('Este correo electrónico ya está registrado.');
            return;
        }

        const newUser = {
            email: email,
            password: password,
            name: name
        };

        inventrakData.users.push(newUser);
        saveInventrakData();
        alert('¡Registro exitoso! Ahora puedes iniciar sesión.');
        if (registerForm) registerForm.reset();
        toggleForm(true);
        console.log('Usuario registrado con éxito:', newUser.email);
    }

    /**
     * Maneja el cierre de sesión del usuario.
     */
    function handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            inventrakData.currentUser = null;
            saveInventrakData();
            console.log('Sesión cerrada. Redirigiendo a login.html...');
            window.location.href = 'login.html';
        }
    }

    /**
     * Abre la barra lateral (sidebar) en dispositivos móviles.
     */
    function openSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.remove('-translate-x-full');
            sidebarOverlay.classList.remove('hidden');
            console.log('Sidebar abierta.');
        } else {
            console.warn('WARN: Elementos de sidebar no encontrados para abrir.');
        }
    }

    /**
     * Cierra la barra lateral (sidebar) en dispositivos móviles.
     */
    function closeSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
            console.log('Sidebar cerrada.');
        } else {
            console.warn('WARN: Elementos de sidebar no encontrados para cerrar.');
        }
    }

    /**
     * Maneja el envío del formulario de creación de un nuevo inventario.
     * @param {Event} e - El evento de envío del formulario.
     */
    function handleCreateInventory(e) {
        e.preventDefault();
        const name = newInventoryNameInput ? newInventoryNameInput.value.trim() : '';
        const initialAmount = newInventoryInitialAmountInput ? parseFloat(newInventoryInitialAmountInput.value) : NaN;

        if (!name || isNaN(initialAmount) || initialAmount <= 0) {
            alert('Por favor, ingresa un nombre y un monto inicial válidos y mayor a cero.');
            return;
        }

        const newInventory = {
            id: Date.now(), // ID único basado en la marca de tiempo
            name: name.toUpperCase(),
            initialAmount: initialAmount,
            creationDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            products: [], // Lista vacía para los productos de este inventario
            transactions: [] // Lista vacía para las transacciones de este inventario
        };

        inventrakData.inventories.push(newInventory);
        // Registrar la creación del inventario como una transacción
        // Esta transacción DECREMENTA el presupuesto general porque el dinero se "gasta" en la creación del inventario.
        const transactionCost = initialAmount;
        newInventory.transactions.push({
            id: Date.now(),
            productId: null,
            type: "creacion_inventario",
            quantity: 1, // Una "unidad" de inventario
            price: initialAmount, // El valor inicial del inventario (para balance del inventario)
            totalCost: transactionCost, // Costo real que afecta el presupuesto global
            date: newInventory.creationDate,
            time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
            notes: `Fondo inicial para inventario: ${newInventory.name}`
        });
        inventrakData.budget -= transactionCost; // Deduce del presupuesto global

        saveInventrakData(); // Guarda los datos actualizados
        alert('Inventario "' + name + '" creado con éxito!');
        if (createInventoryForm) createInventoryForm.reset(); // Limpia el formulario
        renderDashboard(); // Refresca el dashboard para ver la nueva actividad
        renderInventoriesList(); // Refresca la lista de inventarios
        showSection('view-inventories-section'); // Navega a la vista de inventarios creados
        console.log(`Inventario "${name}" creado. Presupuesto global actualizado.`);
    }

    /**
     * Carga los detalles y productos de un inventario específico en la sección "Gestionar Inventario".
     * @param {number} inventoryId - El ID del inventario a cargar.
     */
    function loadManageInventorySection(inventoryId) {
        selectedInventoryId = inventoryId; // Establece el inventario actualmente seleccionado
        const inventory = inventrakData.inventories.find(inv => inv.id === inventoryId);

        if (inventory) {
            currentInventoryNameSpan.textContent = inventory.name;
            managedInventoryInitialAmountSpan.textContent = formatCurrency(inventory.initialAmount);
            managedInventoryCreationDateSpan.textContent = inventory.creationDate;

            renderProductList(inventory); // Renderiza los productos de este inventario
            renderInventoryBalances(inventory); // Renderiza los balances de este inventario
            resetProductForm(); // Limpia el formulario de producto (por si estaba en modo edición)
            showSection('manage-inventory-section'); // Muestra la sección de gestión
            console.log(`Cargando sección de gestión para inventario ID: ${inventoryId}`);
        } else {
            alert('Inventario no encontrado.');
            showSection('view-inventories-section'); // Vuelve a la lista de inventarios si no se encuentra
            console.error(`ERROR: Intentó cargar inventario ID: ${inventoryId}, pero no se encontró.`);
        }
    }

    /**
     * Maneja la edición de los detalles de un inventario (nombre, monto inicial).
     * Abre un prompt para que el usuario ingrese los nuevos datos.
     * @param {number} inventoryId - El ID del inventario a editar.
     */
    function editInventory(inventoryId) {
        const inventory = inventrakData.inventories.find(inv => inv.id === inventoryId);
        if (!inventory) {
            alert('Inventario no encontrado.');
            return;
        }

        const oldName = inventory.name;
        const oldInitialAmount = inventory.initialAmount;

        const newName = prompt(`Editar nombre para "${oldName}":`, oldName);
        if (newName === null || newName.trim() === '') { // Si el usuario cancela o deja vacío
            alert('Nombre de inventario no puede estar vacío.');
            return;
        }

        const newAmountStr = prompt(`Editar monto inicial para "${newName}" (actual: ${formatCurrency(oldInitialAmount)}):`, oldInitialAmount);
        if (newAmountStr === null) return; // Si el usuario cancela

        const newAmount = parseFloat(newAmountStr);

        if (isNaN(newAmount) || newAmount <= 0) {
            alert('Por favor, ingresa un monto inicial válido y mayor a cero.');
            return;
        }

        // Actualizar el inventario
        inventory.name = newName.toUpperCase();
        
        // Si hay un cambio en el monto inicial del inventario, registrar la transacción
        if (newAmount !== oldInitialAmount) {
            const amountDifference = newAmount - oldInitialAmount; // Positivo si aumenta, negativo si disminuye
            const transactionType = amountDifference > 0 ? "ajuste_presupuesto_positivo" : "ajuste_presupuesto_negativo";
            
            // Esta transacción afecta el presupuesto GLOBAL, porque estamos 'inyectando' o 'retirando' dinero
            // del fondo inicial conceptual del inventario en relación con el presupuesto global.
            // Para simplificar, asumimos que este ajuste afecta el cash balance global.
            inventrakData.budget += amountDifference; // Ajusta el presupuesto global

            inventory.transactions.push({
                id: Date.now(),
                productId: null,
                type: transactionType,
                quantity: 1,
                price: Math.abs(amountDifference),
                totalCost: Math.abs(amountDifference), // El costo es el mismo que el precio para este ajuste
                date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                notes: `Ajuste de monto inicial de inventario a ${formatCurrency(newAmount)}`
            });
            inventory.initialAmount = newAmount; // Actualiza el monto inicial del inventario
        }

        saveInventrakData();
        alert('Inventario actualizado con éxito!');
        renderInventoriesList(); // Refrescar la lista de inventarios
        renderDashboard(); // Refrescar el dashboard global
        // Si estamos actualmente en la sección de gestionar este inventario, recargarla
        if (selectedInventoryId === inventoryId) {
            loadManageInventorySection(inventoryId);
        }
    }

    /**
     * Elimina un inventario completo.
     * @param {number} inventoryId - El ID del inventario a eliminar.
     */
    function deleteInventory(inventoryId) {
        const inventory = inventrakData.inventories.find(inv => inv.id === inventoryId);
        if (!inventory) {
            alert('Inventario no encontrado.');
            return;
        }

        if (!confirm(`¿Estás seguro de que quieres eliminar el inventario "${inventory.name}" y todos sus productos y transacciones? Esta acción es irreversible y podría afectar tu balance global.`)) {
            return;
        }

        // Antes de eliminar, calcular el valor total de los productos en stock
        const totalValueLost = inventory.products.reduce((sum, product) => sum + (product.stock * product.cost), 0);
        
        // Registrar una transacción de "eliminación de inventario" en las transacciones del propio inventario (si queremos un historial de ello, aunque el inventario se borrará)
        // Opcional: Podríamos crear una transacción global si tuviéramos un array de transacciones globales.
        // Por ahora, asumimos que al borrar el inventario, sus transacciones se van con él,
        // pero el impacto en el budget global se recalcula en renderDashboard.

        // Al eliminar un inventario, el "initialAmount" que se gastó al crearlo
        // NO se recupera en el presupuesto global. Las compras de productos que salieron
        // del presupuesto global tampoco se "deshacen". Solo las ventas ya aumentaron
        // el presupuesto global.

        // Lo importante es que el `renderDashboard` recalcule `losses` y `gains` y el `budget`
        // basado en los inventarios restantes, que ya no incluirán los de este inventario.
        inventrakData.inventories = inventrakData.inventories.filter(inv => inv.id !== inventoryId);

        saveInventrakData();
        alert('Inventario eliminado con éxito!');
        renderInventoriesList(); // Refrescar la lista de inventarios
        renderDashboard(); // Refrescar el dashboard global
        // Si el inventario eliminado era el que estábamos gestionando, volver a la vista de inventarios
        if (selectedInventoryId === inventoryId) {
            selectedInventoryId = null; // Limpiar el inventario seleccionado
            showSection('view-inventories-section');
        }
        console.log(`Inventario ID: ${inventoryId} eliminado.`);
    }

    /**
     * Maneja el envío del formulario de producto (usado para añadir y editar productos).
     * @param {Event} e - El evento de envío del formulario.
     */
    function handleProductFormSubmit(e) {
        e.preventDefault();

        const currentInventory = inventrakData.inventories.find(inv => inv.id === selectedInventoryId);
        if (!currentInventory) {
            alert('No hay un inventario seleccionado para añadir/editar productos.');
            return;
        }

        const productName = productNameInput.value.trim();
        const productCategory = productCategoryInput.value.trim();
        const productSKU = productSKUInput.value.trim();
        const productDescription = productDescriptionInput.value.trim();
        const productCost = parseFloat(productCostInput.value);
        const productSalePrice = parseFloat(productSalePriceInput.value);
        let productStock = parseInt(productStockInput.value);
        const productUnit = productUnitInput.value.trim();
        const productLocation = productLocationInput.value.trim();
        const productSupplier = productSupplierInput.value.trim();
        const productExpiryDate = productExpiryDateInput.value;

        // Validaciones mínimas de los campos obligatorios
        if (!productName || isNaN(productCost) || isNaN(productSalePrice) || isNaN(productStock) || productStock < 0) {
            alert('Por favor, completa al menos el Nombre, Costo, Precio de Venta y Cantidad en Stock (debe ser >= 0) del producto con valores válidos.');
            return;
        }

        const now = new Date();
        const formattedDate = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        if (editingProductId) {
            // Lógica para EDITAR un producto existente
            const productIndex = currentInventory.products.findIndex(p => p.id === editingProductId);
            if (productIndex !== -1) {
                const oldProduct = currentInventory.products[productIndex];
                const oldStock = oldProduct.stock;
                const stockDifference = productStock - oldStock; // Diferencia entre el stock nuevo y el viejo

                // Actualiza los datos del producto
                currentInventory.products[productIndex] = {
                    id: editingProductId,
                    name: productName,
                    category: productCategory,
                    sku: productSKU,
                    description: productDescription,
                    cost: productCost,
                    salePrice: productSalePrice,
                    stock: productStock,
                    unit: productUnit,
                    location: productLocation,
                    supplier: productSupplier,
                    expiryDate: productExpiryDate,
                    lastUpdated: formattedDate
                };

                // Si hay un cambio en el stock, registra una transacción de ajuste
                if (stockDifference !== 0) {
                    const transactionType = stockDifference > 0 ? "ajuste_positivo" : "ajuste_negativo";
                    // Para ajustes, el valor de la transacción es el cambio en el costo de inventario
                    const transactionValue = Math.abs(stockDifference) * productCost;

                    currentInventory.transactions.push({
                        id: Date.now(),
                        productId: editingProductId,
                        type: transactionType,
                        quantity: Math.abs(stockDifference),
                        price: transactionValue, // Valor total del ajuste (positivo/negativo)
                        totalCost: transactionValue, // El costo es el mismo que el precio para este ajuste
                        date: formattedDate,
                        time: formattedTime,
                        notes: `Ajuste de stock para ${productName}: ${stockDifference} unidades`
                    });
                    // Los ajustes de stock (positivo/negativo) se reflejan en el valor del inventario,
                    // pero no impactan directamente el `inventrakData.budget` a menos que se compre/venda cash.
                    // Aquí asumimos que son correcciones de inventario, no flujos de efectivo directos.
                }

                alert('Producto actualizado con éxito!');
            }
        } else {
            // Lógica para AÑADIR un nuevo producto
            const newProductId = Date.now();
            const newProduct = {
                id: newProductId,
                name: productName,
                category: productCategory,
                sku: productSKU,
                description: productDescription,
                cost: productCost,
                salePrice: productSalePrice,
                stock: productStock,
                unit: productUnit,
                location: productLocation,
                supplier: productSupplier,
                expiryDate: productExpiryDate,
                lastUpdated: formattedDate
            };
            currentInventory.products.push(newProduct);

            // Registrar la adición inicial como una transacción de "entrada"
            const transactionCost = productStock * productCost;
            currentInventory.transactions.push({
                id: Date.now(),
                productId: newProductId,
                type: "entrada",
                quantity: productStock,
                price: transactionCost, // Precio total de la entrada inicial (para balance del inventario)
                totalCost: transactionCost, // Costo real que afecta el presupuesto global
                date: formattedDate,
                time: formattedTime,
                notes: `Entrada inicial de ${productStock} unidades de ${productName}`
            });
            inventrakData.budget -= transactionCost; // Deduce del presupuesto global

            alert('Producto añadido con éxito!');
        }

        saveInventrakData(); // Guarda los datos
        renderProductList(currentInventory); // Refresca la lista de productos
        renderInventoryBalances(currentInventory); // Refresca los balances del inventario actual
        renderDashboard(); // Refresca el dashboard global
        resetProductForm(); // Limpia el formulario y sale del modo edición
        console.log(`Producto ${editingProductId ? 'actualizado' : 'añadido'}. Presupuesto global actualizado.`);
    }

    /**
     * Carga los datos de un producto en el formulario para su edición.
     * @param {number} productId - El ID del producto a editar.
     */
    function editProduct(productId) {
        const currentInventory = inventrakData.inventories.find(inv => inv.id === selectedInventoryId);
        const productToEdit = currentInventory?.products.find(p => p.id === productId);

        if (productToEdit) {
            editingProductId = productId; // Establece el ID del producto que se está editando
            if (productFormTitle) productFormTitle.textContent = 'Editar Producto'; // Cambia el título del formulario
            if (cancelEditProductBtn) cancelEditProductBtn.classList.remove('hidden'); // Muestra el botón de cancelar edición

            // Rellena el formulario con los datos del producto
            if (productNameInput) productNameInput.value = productToEdit.name;
            if (productCategoryInput) productCategoryInput.value = productToEdit.category;
            if (productSKUInput) productSKUInput.value = productToEdit.sku;
            if (productDescriptionInput) productDescriptionInput.value = productToEdit.description;
            if (productCostInput) productCostInput.value = productToEdit.cost;
            if (productSalePriceInput) productSalePriceInput.value = productToEdit.salePrice;
            if (productStockInput) productStockInput.value = productToEdit.stock;
            if (productUnitInput) productUnitInput.value = productToEdit.unit;
            if (productLocationInput) productLocationInput.value = productToEdit.location;
            if (productSupplierInput) productSupplierInput.value = productToEdit.supplier;
            // Asegura que la fecha se formatee correctamente para el input date
            if (productExpiryDateInput && productToEdit.expiryDate) {
                productExpiryDateInput.value = productToEdit.expiryDate;
            } else if (productExpiryDateInput) {
                productExpiryDateInput.value = '';
            }

            // Desplaza la vista al formulario para que el usuario lo vea
            if (productForm) productForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
            console.log(`Cargando producto ID: ${productId} para edición.`);
        } else {
            console.error(`ERROR: Producto ID: ${productId} no encontrado para edición.`);
        }
    }

    /**
     * Elimina un producto del inventario actual.
     * @param {number} productId - El ID del producto a eliminar.
     */
    function deleteProduct(productId) {
        if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible y afectará los balances y métricas de pérdida.')) {
            return; // Si el usuario cancela, no hace nada
        }

        const currentInventory = inventrakData.inventories.find(inv => inv.id === selectedInventoryId);
        if (currentInventory) {
            const productToDelete = currentInventory.products.find(p => p.id === productId);
            if (productToDelete) {
                // Registrar la eliminación como una transacción de "eliminacion"
                // El totalCost representa la pérdida de valor del inventario debido a la eliminación.
                const transactionCost = productToDelete.stock * productToDelete.cost;
                currentInventory.transactions.push({
                    id: Date.now(),
                    productId: productId,
                    type: "eliminacion",
                    quantity: productToDelete.stock, // Cantidad que se elimina
                    price: productToDelete.stock * productToDelete.salePrice, // Valor de venta si se hubiera vendido (ej. pérdida de venta esperada)
                    totalCost: transactionCost, // Costo total de las unidades eliminadas (esto es la pérdida real en el valor de los activos)
                    date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                    notes: `Producto eliminado: ${productToDelete.name}`
                });
                // La eliminación de un producto es una pérdida de valor de inventario (afecta las métricas de pérdidas),
                // pero no un egreso directo de efectivo del presupuesto global en este modelo,
                // a menos que el producto ya se hubiera pagado con ese presupuesto.
                // Ya se contabilizó como salida al comprarlo.
            }

            // Filtra el producto de la lista de productos
            currentInventory.products = currentInventory.products.filter(p => p.id !== productId);

            saveInventrakData(); // Guarda los datos
            alert('Producto eliminado.');
            renderProductList(currentInventory); // Refresca la lista de productos
            renderInventoryBalances(currentInventory); // Refresca los balances
            renderDashboard(); // Refresca el dashboard global
            console.log(`Producto ID: ${productId} eliminado del inventario ID: ${selectedInventoryId}.`);
        } else {
            console.error(`ERROR: No se encontró el inventario seleccionado para eliminar el producto ID: ${productId}.`);
        }
    }

    /**
     * Maneja la venta de un producto (reduce el stock y registra una transacción).
     * @param {number} productId - El ID del producto a vender.
     */
    function sellProduct(productId) {
        const currentInventory = inventrakData.inventories.find(inv => inv.id === selectedInventoryId);
        const productToSell = currentInventory?.products.find(p => p.id === productId);

        if (!productToSell) {
            alert('Producto no encontrado.');
            console.error(`ERROR: Producto ID: ${productId} no encontrado para vender.`);
            return;
        }

        // Solicita la cantidad a vender
        const quantityStr = prompt(`¿Cuántas unidades de "${productToSell.name}" quieres vender? (Stock actual: ${productToSell.stock})`);
        if (quantityStr === null) return; // Si el usuario cancela

        const quantityToSell = parseInt(quantityStr);

        if (isNaN(quantityToSell) || quantityToSell <= 0) {
            alert('Por favor, introduce una cantidad válida y mayor que cero.');
            return;
        }

        if (quantityToSell > productToSell.stock) {
            alert(`No hay suficiente stock (${productToSell.stock} disponibles) para vender ${quantityToSell} unidades.`);
            return;
        }

        const saleValue = quantityToSell * productToSell.salePrice;
        if (!confirm(`Confirmar venta de ${quantityToSell} unidades de "${productToSell.name}" por ${formatCurrency(saleValue)}?`)) {
            return;
        }

        // Actualiza el stock del producto
        productToSell.stock -= quantityToSell;

        // Registrar una transacción de venta
        const now = new Date();
        currentInventory.transactions.push({
            id: Date.now(),
            productId: productId,
            type: "venta",
            quantity: quantityToSell,
            price: saleValue, // Precio de venta total de esta transacción (ingreso)
            totalCost: quantityToSell * productToSell.cost, // Costo total de las unidades vendidas (para cálculo de margen o métricas de pérdida)
            date: now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
            notes: `Venta de ${quantityToSell} unidades de ${productToSell.name}`
        });

        inventrakData.budget += saleValue; // Aumenta el presupuesto global con el dinero de la venta

        saveInventrakData(); // Guarda los datos
        alert(`Venta de ${quantityToSell} unidades de "${productToSell.name}" registrada.`);
        renderProductList(currentInventory); // Refresca la lista de productos
        renderInventoryBalances(currentInventory); // Refresca los balances del inventario actual
        renderDashboard(); // Refresca el dashboard global
        console.log(`Venta de ${quantityToSell} unidades de producto ID: ${productId} en inventario ID: ${selectedInventoryId}. Presupuesto global actualizado.`);
    }

    /**
     * Resetea el formulario de añadir/editar producto a su estado inicial.
     */
    function resetProductForm() {
        if (productForm) productForm.reset(); // Limpia todos los campos del formulario
        editingProductId = null; // Sale del modo edición
        if (productFormTitle) productFormTitle.textContent = 'Añadir Nuevo Producto'; // Restaura el título del formulario
        if (cancelEditProductBtn) cancelEditProductBtn.classList.add('hidden'); // Oculta el botón de cancelar edición
        console.log('Formulario de producto reseteado.');
    }

    // --- Inicialización y Event Listeners Globales ---

    // Lógica para la página de login/registro (login.html)
    if (loginForm && registerForm) {
        console.log('Lógica de login.html iniciada. Asignando event listeners de formularios.');
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); toggleForm(false); });
        if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleForm(true); });
    }

    // Lógica para la página principal (index.html)
    if (document.body.classList.contains('flex-col')) {
        console.log('Lógica de index.html iniciada.');

        if (!inventrakData.currentUser) {
            console.log('No hay usuario logueado. Redirigiendo a login.html.');
            window.location.href = 'login.html';
            return;
        } else {
            console.log(`Usuario logueado: ${inventrakData.currentUser}`);
        }

        renderDashboard(); // Renderiza el dashboard al cargar la página

        // Eventos de la barra lateral (Sidebar) y su overlay
        if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
        if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

        // Manejo de la navegación a través de los ítems de la barra lateral
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = item.dataset.section + '-section';
                showSection(sectionId);

                // Acciones específicas al cambiar de sección
                if (sectionId === 'view-inventories-section') {
                    renderInventoriesList();
                } else if (sectionId === 'dashboard-section') {
                    renderDashboard();
                }
                // 'manage-inventory-section' se carga a través de loadManageInventorySection
            });
        });

        // Manejo de la navegación a través de los ítems de la barra de navegación inferior (para móvil)
        bottomNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = item.dataset.section + '-section';
                showSection(sectionId);
                if (sectionId === 'view-inventories-section') {
                    renderInventoriesList();
                } else if (sectionId === 'dashboard-section') {
                    renderDashboard();
                }
            });
        });

        // Evento para expandir/contraer la sección "View In & Out" en el dashboard
        if (toggleInOutBtn) {
            toggleInOutBtn.addEventListener('click', () => {
                if (inOutList) {
                    inOutList.classList.toggle('hidden');
                    const icon = toggleInOutBtn.querySelector('i');
                    if (icon) {
                        if (inOutList.classList.contains('hidden')) {
                            icon.classList.remove('fa-chevron-up');
                            icon.classList.add('fa-chevron-down');
                        } else {
                            icon.classList.remove('fa-chevron-down');
                            icon.classList.add('fa-chevron-up');
                        }
                    }
                } else {
                     console.error('ERROR: Elemento in-out-list no encontrado para el toggle.');
                }
            });
        }

        // Evento para el formulario de Crear Inventario
        if (createInventoryForm) {
            createInventoryForm.addEventListener('submit', handleCreateInventory);
        } else {
            console.warn('WARN: createInventoryForm no encontrado. ¿Estamos en la sección correcta?');
        }

        // Eventos de la sección "Gestionar Inventario"
        if (backToInventoriesBtn) {
            backToInventoriesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showSection('view-inventories-section'); // Vuelve a la lista de inventarios
                renderInventoriesList(); // Refresca la lista
            });
        }
        if (productForm) {
            productForm.addEventListener('submit', handleProductFormSubmit); // Maneja añadir/editar producto
        }
        if (cancelEditProductBtn) {
            cancelEditProductBtn.addEventListener('click', (e) => {
                e.preventDefault();
                resetProductForm(); // Cancela la edición y resetea el formulario
            });
        }
        if (editInventoryDetailsBtn) {
            editInventoryDetailsBtn.addEventListener('click', () => {
                if (selectedInventoryId) {
                    editInventory(selectedInventoryId);
                } else {
                    alert('No hay un inventario seleccionado para editar sus detalles.');
                }
            });
        }
        if (deleteCurrentInventoryBtn) {
            deleteCurrentInventoryBtn.addEventListener('click', () => {
                if (selectedInventoryId) {
                    deleteInventory(selectedInventoryId);
                } else {
                    alert('No hay un inventario seleccionado para eliminar.');
                }
            });
        }


        // Evento para el botón de Cerrar Sesión
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        } else {
            console.warn('WARN: logoutButton no encontrado.');
        }

        // Muestra la sección del dashboard por defecto al cargar index.html
        showSection('dashboard-section');
    }
});
