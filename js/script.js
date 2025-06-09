// js/script.js
// Archivo JavaScript principal para las funcionalidades de Login, Dashboard,
// Crear Inventario, Ver Inventarios, Gestión CRUD de Inventarios y Productos, y Gráficos.

// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado. Iniciando script.js');

    // --- Paleta de Colores de Inventrak para D3.js ---
    // Usaremos un mapeo de nombres a valores hexadecimales para consistencia.
    const inventrakColors = {
        'yellow': '#E0FF7F',
        'blue': '#ADD8E6',
        'darkblue': '#4A90E2',
        'green-light': '#D4F0BA',
        'text-dark': '#333333',
        'text-light': '#666666',
        'card-bg': '#FFFFFF',
        'loss': '#FFD4D4', // Rojo claro para pérdidas
        'gain': '#E0FF7F', // Amarillo/Verde para ganancias
        // Algunos colores adicionales o variaciones para gráficos
        'primary-accent': '#4A90E2', // darkblue
        'secondary-accent': '#ADD8E6', // blue
        'positive': '#22C55E', // un verde más fuerte para barras positivas
        'negative': '#EF4444', // un rojo más fuerte para barras negativas
        'gray-light': '#F3F4F6', // Similar a bg-gray-100
        'gray-medium': '#9CA3AF',
        'gray-dark': '#4B5563'
    };

    // Crear una escala de color para D3 que use nuestra paleta
    // Esta escala es flexible y puede expandirse con más colores si hay muchas categorías.
    const colorScale = d3.scaleOrdinal()
        .range([
            inventrakColors['darkblue'],
            inventrakColors['yellow'],
            inventrakColors['blue'],
            inventrakColors['green-light'],
            inventrakColors['gray-medium'],
            inventrakColors['positive'],
            inventrakColors['negative'],
            inventrakColors['text-dark']
        ]);


    // --- Estado de la Aplicación (Datos almacenados en localStorage) ---
    let inventrakData = JSON.parse(localStorage.getItem('inventrakData')) || {
        users: [{ email: "test@inventrak.com", password: "password123", name: "Claudia" }],
        currentUser: null,
        budget: 50000.00,
        losses: 0.00,
        gains: 0.00,
        inventories: [
            {
                id: 1,
                name: "INVENTARIO PRINCIPAL",
                initialAmount: 10000.00,
                creationDate: "01/01/2025",
                products: [
                    { id: 101, name: "Leche Entera", category: "Lácteos", sku: "LE001", description: "Leche de vaca semidesnatada", cost: 2.00, salePrice: 2.50, stock: 50, unit: "litro", location: "Pasillo 1", supplier: "Proveedor Lácteo A", expiryDate: "2025-12-31", lastUpdated: "05/06/2025" },
                    { id: 102, name: "Pan Integral", category: "Panadería", sku: "PI002", description: "Pan de molde 500g", cost: 1.50, salePrice: 2.00, stock: 100, unit: "unidad", location: "Panadería", supplier: "Panificadora B", expiryDate: "2025-06-15", lastUpdated: "05/06/2025" },
                    { id: 103, name: "Manzanas Rojas", category: "Frutas", sku: "MR003", description: "Manzanas frescas por kilo", cost: 0.80, salePrice: 1.20, stock: 80, unit: "kg", location: "Verduras", supplier: "Frutas del Campo", expiryDate: "2025-06-20", lastUpdated: "05/06/2025" },
                    { id: 104, name: "Detergente Líquido", category: "Limpieza", sku: "DL004", description: "Detergente para ropa 3L", cost: 5.00, salePrice: 7.50, stock: 30, unit: "botella", location: "Pasillo 5", supplier: "Químicos ABC", expiryDate: "2026-01-31", lastUpdated: "05/06/2025" }
                ],
                transactions: [
                    { id: 1, productId: null, type: "creacion_inventario", quantity: 1, price: 10000.00, date: "01/01/2025", time: "09:00", notes: "Fondo inicial para inventario principal", totalCost: 10000.00 },
                    { id: 2, productId: 101, type: "compra", quantity: 50, price: 100.00, totalCost: 100.00, date: "05/06/2025", time: "10:00", notes: "Compra de 50 leches" },
                    { id: 3, productId: 102, type: "compra", quantity: 100, price: 150.00, totalCost: 150.00, date: "05/06/2025", time: "10:05", notes: "Compra de 100 panes" },
                    { id: 4, productId: 101, type: "venta", quantity: 5, price: 12.50, totalCost: 10.00, date: "05/06/2025", time: "10:30", notes: "Venta de 5 leches" },
                    { id: 5, productId: 102, type: "venta", quantity: 10, price: 20.00, totalCost: 15.00, date: "05/06/2025", time: "11:00", notes: "Venta de 10 panes" },
                    { id: 6, productId: 103, type: "compra", quantity: 80, price: 64.00, totalCost: 64.00, date: "05/05/2025", time: "12:00", notes: "Compra de 80kg manzanas" },
                    { id: 7, productId: 103, type: "venta", quantity: 20, price: 24.00, totalCost: 16.00, date: "05/05/2025", time: "13:00", notes: "Venta de 20kg manzanas" },
                    { id: 8, productId: 104, type: "compra", quantity: 30, price: 150.00, totalCost: 150.00, date: "05/04/2025", time: "14:00", notes: "Compra de 30 detergentes" }
                ]
            },
            {
                id: 2,
                name: "INVENTARIO SECUNDARIO",
                initialAmount: 5000.00,
                creationDate: "10/03/2025",
                products: [
                    { id: 201, name: "Cuaderno A4", category: "Papelería", sku: "CA401", description: "Cuaderno espiral 100 hojas", cost: 1.00, salePrice: 1.80, stock: 200, unit: "unidad", location: "Oficina", supplier: "Papeles S.A.", lastUpdated: "05/06/2025" }
                ],
                transactions: [
                    { id: 10, productId: null, type: "creacion_inventario", quantity: 1, price: 5000.00, date: "10/03/2025", time: "09:00", notes: "Fondo inicial para inventario secundario", totalCost: 5000.00 },
                    { id: 11, productId: 201, type: "compra", quantity: 200, price: 200.00, totalCost: 200.00, date: "10/03/2025", time: "10:00", notes: "Compra de 200 cuadernos" },
                    { id: 12, productId: 201, type: "venta", quantity: 50, price: 90.00, totalCost: 50.00, date: "05/06/2025", time: "14:00", notes: "Venta de 50 cuadernos" }
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


    let selectedInventoryId = null;
    let editingProductId = null;

    // --- Selectores de Elementos del DOM ---

    // Elementos comunes
    const logoutButton = document.getElementById('logout-button');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    // Elementos de la página de Login/Registro
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

    // Elementos del Dashboard
    const currentTimeSpan = document.getElementById('current-time');
    const userNameSpan = document.getElementById('user-name');
    const currentBudgetSpan = document.getElementById('current-budget');
    const totalLossesSpan = document.getElementById('total-losses');
    const totalGainsSpan = document.getElementById('total-gains');
    const toggleInOutBtn = document.getElementById('toggle-in-out');
    const inOutList = document.getElementById('in-out-list');
    const financialSummaryComment = document.getElementById('financial-summary-comment');
    const topUpBudgetBtn = document.getElementById('top-up-budget-btn');
    const changeBudgetBtn = document.getElementById('change-budget-btn');

    // Elementos de Crear Inventario
    const createInventoryForm = document.getElementById('createInventoryForm');
    const newInventoryNameInput = document.getElementById('newInventoryName');
    const newInventoryInitialAmountInput = document.getElementById('newInventoryInitialAmount');

    // Elementos de Ver Inventarios
    const inventoriesListDiv = document.getElementById('inventories-list');
    const noInventoriesMessage = document.getElementById('no-inventories-message');

    // Elementos de Gestionar Inventario
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

    // Elementos de Gráficos y Configuración
    const categoryDistributionChartDiv = document.getElementById('category-distribution-chart');
    const categoryDistributionLegendDiv = document.getElementById('category-distribution-legend');
    const noCategoryDataMessage = document.getElementById('no-category-data-message');
    const monthlyNetFlowChartDiv = document.getElementById('monthly-net-flow-chart');
    const noMonthlyDataMessage = document.getElementById('no-monthly-data-message');


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

        // Acciones específicas al mostrar la sección de gráficos
        if (sectionId === 'settings-section') {
            renderSettingsCharts();
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
                    const dateParts = t.date.split('/');
                    const transactionDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
                    
                    if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
                        if (t.type === 'venta' || t.type === 'ajuste_positivo' || t.type === 'ajuste_presupuesto_positivo' || t.type === 'top_up_budget') {
                            totalGlobalGainsThisMonth += t.price;
                        } else if (t.type === 'compra' || t.type === 'entrada' || t.type === 'creacion_inventario' || t.type === 'ajuste_negativo' || t.type === 'eliminacion' || t.type === 'ajuste_presupuesto_negativo' || t.type === 'change_budget_negative') {
                            totalGlobalLossesThisMonth += (t.totalCost || t.price || 0); // Usar totalCost si existe
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
        const totalLosses = inventrakData.losses; // Mensual
        const totalGains = inventrakData.gains; // Mensual

        let comment = "Aquí verás un resumen de tu situación financiera.";

        // Comentarios sobre el presupuesto actual (saldo de efectivo)
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
        } else if (totalGains === 0 && totalLosses === 0 && currentBudget === 50000) { // Estado inicial sin movimientos
            comment += "<br>Aún no hay movimientos registrados este mes. ¡Es un buen momento para empezar a trackear tus finanzas!";
        } else if (totalGains === 0 && totalLosses === 0) { // Si no hay movimientos pero el presupuesto cambió
            comment += "<br>No se han registrado movimientos de inventario este mes, pero tu presupuesto ha sido ajustado manualmente.";
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
                    let transactionDescription = `Movimiento en ${inv.name} (${t.type})`;

                    const product = inv.products.find(p => p.id === t.productId);
                    if (product) {
                        transactionDescription = `${product.name} (${t.type})`;
                    } else if (t.type === 'creacion_inventario') {
                        transactionDescription = `Creación de Inventario: ${inv.name}`;
                    } else {
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
            let displayValue = transaction.price;

            let actualValueForDisplay = transaction.price; // Valor por defecto

            if (transaction.type === 'venta' || transaction.type === 'ajuste_positivo' || transaction.type === 'ajuste_presupuesto_positivo' || transaction.type === 'top_up_budget') {
                typeClass = 'text-green-500';
                sign = '+';
                actualValueForDisplay = transaction.price;
            } else if (transaction.type === 'compra' || transaction.type === 'entrada' || transaction.type === 'creacion_inventario' || transaction.type === 'ajuste_negativo' || transaction.type === 'eliminacion' || transaction.type === 'ajuste_presupuesto_negativo' || transaction.type === 'change_budget_negative') {
                typeClass = 'text-red-500';
                sign = '-';
                actualValueForDisplay = transaction.totalCost || transaction.price;
            }
            displayValue = actualValueForDisplay;


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
                    e.stopPropagation();
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
            document.querySelectorAll('.sell-product-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = parseInt(e.currentTarget.dataset.productId);
                    sellProduct(productId);
                });
            });
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
            const dateParts = t.date.split('/');
            const transactionDate = new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));

            let value = t.price || 0; // Valor de la transacción
            let costValue = t.totalCost || 0; // Costo asociado a la transacción

            if (t.type === 'venta' || t.type === 'ajuste_positivo') {
                if (t.date === today) dailyNet += value;
                if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) monthlyNet += value;
                if (transactionDate.getFullYear() === currentYear) annualNet += value;
            } else if (t.type === 'compra' || t.type === 'entrada' || t.type === 'creacion_inventario') {
                if (t.date === today) dailyNet -= costValue;
                if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) monthlyNet -= costValue;
                if (transactionDate.getFullYear() === currentYear) annualNet -= costValue;
            } else if (t.type === 'ajuste_negativo' || t.type === 'eliminacion') {
                if (t.date === today) dailyNet -= costValue;
                if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) monthlyNet -= costValue;
                if (transactionDate.getFullYear() === currentYear) annualNet -= costValue;
            } else if (t.type === 'ajuste_presupuesto_positivo') {
                 if (t.date === today) dailyNet += value;
                if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) monthlyNet += value;
                if (transactionDate.getFullYear() === currentYear) annualNet += value;
            } else if (t.type === 'ajuste_presupuesto_negativo') {
                 if (t.date === today) dailyNet -= value;
                if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) monthlyNet -= value;
                if (transactionDate.getFullYear() === currentYear) annualNet -= value;
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
                const productName = product ? product.name : (t.type === 'creacion_inventario' ? inventory.name : (t.notes || 'Movimiento desconocido'));
                let transactionValueDisplay = t.price || 0;

                if (t.type === 'venta' || t.type === 'ajuste_positivo' || t.type === 'ajuste_presupuesto_positivo' || t.type === 'top_up_budget') {
                    typeColor = 'text-green-500';
                    sign = '+';
                    transactionValueDisplay = t.price;
                } else if (t.type === 'compra' || t.type === 'entrada' || t.type === 'creacion_inventario' || t.type === 'ajuste_negativo' || t.type === 'eliminacion' || t.type === 'ajuste_presupuesto_negativo' || t.type === 'change_budget_negative') {
                    typeColor = 'text-red-500';
                    sign = '-';
                    transactionValueDisplay = t.totalCost !== undefined ? t.totalCost : t.price;
                }

                div.className = 'bg-gray-50 p-2 rounded-lg flex justify-between items-center text-xs sm:text-sm';
                div.innerHTML = `
                    <span class="text-inventrak-text-dark">
                        ${t.date} ${t.time || ''} - <strong>${productName}</strong> (${t.notes || t.type})
                    </span>
                    <span class="${typeColor} font-semibold">${sign}${formatCurrency(transactionValueDisplay)}</span>
                `;
                recentTransactionsList.appendChild(div);
            });
        }
        console.log('renderInventoryBalances finalizado.');
    }

    /**
     * Función principal para renderizar todos los gráficos en la sección de configuración.
     */
    function renderSettingsCharts() {
        console.log('Iniciando renderSettingsCharts...');
        // Limpiar los contenedores de gráficos anteriores
        if (categoryDistributionChartDiv) categoryDistributionChartDiv.innerHTML = '';
        if (categoryDistributionLegendDiv) categoryDistributionLegendDiv.innerHTML = '';
        if (monthlyNetFlowChartDiv) monthlyNetFlowChartDiv.innerHTML = '';

        // Recolectar datos para el gráfico de categorías
        const allProducts = [];
        inventrakData.inventories.forEach(inv => {
            allProducts.push(...inv.products);
        });

        const categoryCounts = d3.rollup(allProducts, v => v.length, d => d.category || 'Sin Categoría');
        const categoryData = Array.from(categoryCounts, ([category, count]) => ({ category, count }));

        if (categoryData.length > 0) {
            renderCategoryDistributionChart(categoryData, 'category-distribution-chart');
            renderCategoryDistributionLegend(categoryData, 'category-distribution-legend');
            if (noCategoryDataMessage) noCategoryDataMessage.classList.add('hidden');
        } else {
            if (noCategoryDataMessage) noCategoryDataMessage.classList.remove('hidden');
        }

        // Recolectar datos para el gráfico de flujo neto mensual
        const monthlyFlows = new Map(); // Key: YYYY-MM, Value: net flow

        inventrakData.inventories.forEach(inv => {
            inv.transactions.forEach(t => {
                const dateParts = t.date.split('/'); // DD/MM/YYYY
                const yearMonth = `${dateParts[2]}-${dateParts[1]}`; // YYYY-MM

                let valueChange = 0;
                // Considerar el impacto en el flujo de efectivo global para los gráficos
                if (t.type === 'venta' || t.type === 'ajuste_positivo' || t.type === 'ajuste_presupuesto_positivo' || t.type === 'top_up_budget') {
                    valueChange = t.price;
                } else if (t.type === 'compra' || t.type === 'entrada' || t.type === 'creacion_inventario' || t.type === 'ajuste_negativo' || t.type === 'eliminacion' || t.type === 'ajuste_presupuesto_negativo' || t.type === 'change_budget_negative') {
                    valueChange = -(t.totalCost || t.price); // Negativo para gastos/pérdidas
                }
                
                monthlyFlows.set(yearMonth, (monthlyFlows.get(yearMonth) || 0) + valueChange);
            });
        });

        // Convertir el Map a un array de objetos y ordenar por fecha
        const monthlyFlowData = Array.from(monthlyFlows, ([month, netFlow]) => ({ month, netFlow }))
                                    .sort((a, b) => a.month.localeCompare(b.month));

        if (monthlyFlowData.length > 0) {
            renderMonthlyNetFlowChart(monthlyFlowData, 'monthly-net-flow-chart');
            if (noMonthlyDataMessage) noMonthlyDataMessage.classList.add('hidden');
        } else {
            if (noMonthlyDataMessage) noMonthlyDataMessage.classList.remove('hidden');
        }

        console.log('renderSettingsCharts finalizado.');
    }

    /**
     * Renderiza un gráfico circular (pie chart) de distribución por categorías de productos.
     * @param {Array} data - Array de objetos { category: string, count: number }.
     * @param {string} containerId - ID del elemento HTML donde se renderizará el gráfico.
     */
    function renderCategoryDistributionChart(data, containerId) {
        if (!data || data.length === 0) {
            console.log("No hay datos para renderizar el gráfico de distribución de categorías.");
            return;
        }

        const container = d3.select(`#${containerId}`);
        const width = Math.min(container.node().getBoundingClientRect().width, 300); // Adaptable al ancho del contenedor
        const height = width; // Hacerlo cuadrado
        const radius = Math.min(width, height) / 2;

        container.html(''); // Limpiar cualquier SVG anterior

        const svg = container.append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", `translate(${width / 2},${height / 2})`);

        const pie = d3.pie()
            .sort(null)
            .value(d => d.count);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(radius * 0.8); // Ajustar el radio exterior para que los arcos sean visibles

        const outerArc = d3.arc()
            .innerRadius(radius * 0.9)
            .outerRadius(radius * 0.9);

        const arcs = svg.selectAll(".arc")
            .data(pie(data))
            .enter()
            .append("g")
            .attr("class", "arc");

        arcs.append("path")
            .attr("d", arc)
            .attr("fill", d => colorScale(d.data.category))
            .attr("stroke", inventrakColors['card-bg']) // Borde blanco para los segmentos
            .style("stroke-width", "2px");

        // Añadir etiquetas de texto
        arcs.append("text")
            .attr("transform", d => `translate(${outerArc.centroid(d)})`)
            .attr("dy", "0.35em")
            .attr("font-size", "0.7em")
            .attr("text-anchor", d => (d.endAngle + d.startAngle) / 2 > Math.PI ? "end" : "start")
            .attr("fill", inventrakColors['text-dark'])
            .text(d => `${d.data.category} (${d.data.count})`);
    }

    /**
     * Renderiza la leyenda para el gráfico circular de distribución de categorías.
     * @param {Array} data - Array de objetos { category: string, count: number }.
     * @param {string} containerId - ID del elemento HTML donde se renderizará la leyenda.
     */
    function renderCategoryDistributionLegend(data, containerId) {
        if (!data || data.length === 0) {
            d3.select(`#${containerId}`).html('');
            return;
        }

        const legendContainer = d3.select(`#${containerId}`);
        legendContainer.html(''); // Limpiar cualquier leyenda anterior

        const legendItems = legendContainer.selectAll("div")
            .data(data)
            .enter()
            .append("div")
            .attr("class", "flex items-center space-x-2");

        legendItems.append("span")
            .attr("class", "w-3 h-3 rounded-full")
            .style("background-color", d => colorScale(d.category));

        legendItems.append("span")
            .attr("class", "text-inventrak-text-dark text-sm")
            .text(d => `${d.category} (${d.count})`);
    }

    /**
     * Renderiza un gráfico de barras del flujo financiero neto mensual.
     * @param {Array} data - Array de objetos { month: string (YYYY-MM), netFlow: number }.
     * @param {string} containerId - ID del elemento HTML donde se renderizará el gráfico.
     */
    function renderMonthlyNetFlowChart(data, containerId) {
        if (!data || data.length === 0) {
            console.log("No hay datos para renderizar el gráfico de flujo neto mensual.");
            return;
        }

        const container = d3.select(`#${containerId}`);
        const parentWidth = container.node().getBoundingClientRect().width;
        const margin = { top: 20, right: 30, bottom: 60, left: 70 }; // Aumentar margen inferior para etiquetas de eje X

        // Ajustar el ancho del gráfico para acomodar más barras si hay muchos meses
        const barWidth = 40; // Ancho de cada barra
        const paddingBetweenBars = 10;
        const calculatedWidth = (data.length * (barWidth + paddingBetweenBars)) + margin.left + margin.right;
        const width = Math.max(parentWidth, calculatedWidth); // Asegura que el gráfico no sea demasiado pequeño
        const height = 300 - margin.top - margin.bottom;

        container.html(''); // Limpiar cualquier SVG anterior

        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Escala X para los meses
        const x = d3.scaleBand()
            .domain(data.map(d => d.month))
            .range([0, width])
            .padding(0.2);

        // Escala Y para el flujo neto (centrada en 0)
        const y = d3.scaleLinear()
            .domain([d3.min(data, d => Math.min(0, d.netFlow)), d3.max(data, d => Math.max(0, d.netFlow))])
            .nice()
            .range([height, 0]);

        // Eje X
        svg.append("g")
            .attr("transform", `translate(0,${y(0)})`) // Mover el eje X a la posición Y=0
            .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("transform", "rotate(-45)") // Rotar etiquetas para evitar superposición
                .style("text-anchor", "end")
                .attr("fill", inventrakColors['text-dark']); // Color de las etiquetas

        // Eje Y
        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(d => formatCurrency(d))) // Formatear ticks como moneda
            .selectAll("text")
            .attr("fill", inventrakColors['text-dark']); // Color de las etiquetas

        // Etiquetas de los ejes
        svg.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .attr("fill", inventrakColors['text-dark'])
            .text("Mes");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .attr("fill", inventrakColors['text-dark'])
            .text("Flujo Neto");

        // Barras
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.month))
            .attr("y", d => y(Math.max(0, d.netFlow))) // Ajuste para barras positivas y negativas
            .attr("width", x.bandwidth())
            .attr("height", d => Math.abs(y(d.netFlow) - y(0))) // Altura basada en la distancia a Y=0
            .attr("fill", d => d.netFlow >= 0 ? inventrakColors['positive'] : inventrakColors['negative']) // Colores condicionales
            .on("mouseover", function(event, d) { // Tooltip al pasar el ratón
                d3.select(this)
                    .attr("fill", d => d.netFlow >= 0 ? d3.rgb(inventrakColors['positive']).darker(0.5) : d3.rgb(inventrakColors['negative']).darker(0.5)); // Oscurecer al pasar el ratón
                
                const tooltip = container.append("div")
                    .attr("class", "tooltip absolute bg-white p-2 rounded-lg shadow-md text-sm text-inventrak-text-dark border border-gray-300 pointer-events-none")
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`)
                    .html(`<strong>${d.month}</strong><br>Neto: ${formatCurrency(d.netFlow)}`);
            })
            .on("mouseout", function() { // Quitar tooltip al salir el ratón
                d3.select(this)
                    .attr("fill", d => d.netFlow >= 0 ? inventrakColors['positive'] : inventrakColors['negative']);
                container.select(".tooltip").remove();
            });
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
            id: Date.now(),
            name: name.toUpperCase(),
            initialAmount: initialAmount,
            creationDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            products: [],
            transactions: []
        };

        inventrakData.inventories.push(newInventory);
        const transactionCost = initialAmount;
        newInventory.transactions.push({
            id: Date.now(),
            productId: null,
            type: "creacion_inventario",
            quantity: 1,
            price: initialAmount,
            totalCost: transactionCost,
            date: newInventory.creationDate,
            time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
            notes: `Fondo inicial para inventario: ${newInventory.name}`
        });
        inventrakData.budget -= transactionCost;

        saveInventrakData();
        alert('Inventario "' + name + '" creado con éxito!');
        if (createInventoryForm) createInventoryForm.reset();
        renderDashboard();
        renderInventoriesList();
        showSection('view-inventories-section');
        console.log(`Inventario "${name}" creado. Presupuesto global actualizado.`);
    }

    /**
     * Maneja el "Top Up" (recarga) del presupuesto global.
     */
    function handleTopUpBudget() {
        const amountStr = prompt(`Ingresa la cantidad a añadir a tu presupuesto actual (${formatCurrency(inventrakData.budget)}):`);
        if (amountStr === null) return;

        const amount = parseFloat(amountStr);

        if (isNaN(amount) || amount <= 0) {
            alert('Por favor, ingresa una cantidad válida y mayor a cero para recargar.');
            return;
        }

        inventrakData.budget += amount;

        // Añadir una transacción global para este movimiento de presupuesto
        // (Aunque no esté en un inventario específico, se registra para el historial general)
        inventrakData.inventories[0].transactions.push({ // Asumiendo que el primer inventario puede ser un "general log"
            id: Date.now(),
            productId: null,
            type: "top_up_budget",
            quantity: 1,
            price: amount,
            totalCost: 0, // No hay costo asociado, es una inyección de capital
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
            notes: `Recarga manual de presupuesto global`
        });

        saveInventrakData();
        renderDashboard();
        alert(`Se han añadido ${formatCurrency(amount)} a tu presupuesto.`);
        console.log(`Presupuesto recargado en ${formatCurrency(amount)}. Nuevo presupuesto: ${formatCurrency(inventrakData.budget)}`);
    }

    /**
     * Maneja el "Cambiar" (establecer un nuevo valor) del presupuesto global.
     */
    function handleChangeBudget() {
        const newBudgetStr = prompt(`Ingresa el nuevo valor total para tu presupuesto (actual: ${formatCurrency(inventrakData.budget)}):`);
        if (newBudgetStr === null) return;

        const newBudget = parseFloat(newBudgetStr);

        if (isNaN(newBudget) || newBudget < 0) {
            alert('Por favor, ingresa una cantidad válida y no negativa para tu presupuesto.');
            return;
        }

        const oldBudget = inventrakData.budget;
        const difference = newBudget - oldBudget;
        
        let transactionType;
        if (difference > 0) {
            transactionType = "change_budget_positive"; // Nuevo tipo: aumento manual
        } else if (difference < 0) {
            transactionType = "change_budget_negative"; // Nuevo tipo: disminución manual
        } else {
            alert('El presupuesto no ha cambiado.');
            return;
        }

        inventrakData.budget = newBudget;

        // Registrar una transacción global para este cambio
        inventrakData.inventories[0].transactions.push({ // Asumiendo que el primer inventario puede ser un "general log"
            id: Date.now(),
            productId: null,
            type: transactionType,
            quantity: 1,
            price: Math.abs(difference),
            totalCost: (difference < 0) ? Math.abs(difference) : 0, // Si es negativo, el costo es la diferencia absoluta
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
            notes: `Cambio manual de presupuesto global a ${formatCurrency(newBudget)}`
        });

        saveInventrakData();
        renderDashboard();
        alert(`Tu presupuesto ha sido cambiado a ${formatCurrency(newBudget)}.`);
        console.log(`Presupuesto cambiado de ${formatCurrency(oldBudget)} a ${formatCurrency(newBudget)}.`);
    }


    /**
     * Carga los detalles y productos de un inventario específico en la sección "Gestionar Inventario".
     * @param {number} inventoryId - El ID del inventario a cargar.
     */
    function loadManageInventorySection(inventoryId) {
        selectedInventoryId = inventoryId;
        const inventory = inventrakData.inventories.find(inv => inv.id === inventoryId);

        if (inventory) {
            currentInventoryNameSpan.textContent = inventory.name;
            managedInventoryInitialAmountSpan.textContent = formatCurrency(inventory.initialAmount);
            managedInventoryCreationDateSpan.textContent = inventory.creationDate;

            renderProductList(inventory);
            renderInventoryBalances(inventory);
            resetProductForm();
            showSection('manage-inventory-section');
            console.log(`Cargando sección de gestión para inventario ID: ${inventoryId}`);
        } else {
            alert('Inventario no encontrado.');
            showSection('view-inventories-section');
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
        if (newName === null || newName.trim() === '') {
            alert('Nombre de inventario no puede estar vacío.');
            return;
        }

        const newAmountStr = prompt(`Editar monto inicial para "${newName}" (actual: ${formatCurrency(oldInitialAmount)}):`, oldInitialAmount);
        if (newAmountStr === null) return;

        const newAmount = parseFloat(newAmountStr);

        if (isNaN(newAmount) || newAmount <= 0) {
            alert('Por favor, ingresa un monto inicial válido y mayor a cero.');
            return;
        }

        inventory.name = newName.toUpperCase();
        
        if (newAmount !== oldInitialAmount) {
            const amountDifference = newAmount - oldInitialAmount;
            const transactionType = amountDifference > 0 ? "ajuste_presupuesto_positivo" : "ajuste_presupuesto_negativo";
            
            inventrakData.budget += amountDifference; // Ajusta el presupuesto global

            inventory.transactions.push({
                id: Date.now(),
                productId: null,
                type: transactionType,
                quantity: 1,
                price: Math.abs(amountDifference),
                totalCost: Math.abs(amountDifference),
                date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                notes: `Ajuste del monto inicial del inventario a ${formatCurrency(newAmount)}`
            });
            inventory.initialAmount = newAmount;
        }

        saveInventrakData();
        alert('Inventario actualizado con éxito!');
        renderInventoriesList();
        renderDashboard();
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

        inventrakData.inventories = inventrakData.inventories.filter(inv => inv.id !== inventoryId);

        saveInventrakData();
        alert('Inventario eliminado con éxito!');
        renderInventoriesList();
        renderDashboard();
        if (selectedInventoryId === inventoryId) {
            selectedInventoryId = null;
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

        if (!productName || isNaN(productCost) || isNaN(productSalePrice) || isNaN(productStock) || productStock < 0) {
            alert('Por favor, completa al menos el Nombre, Costo, Precio de Venta y Cantidad en Stock (debe ser >= 0) del producto con valores válidos.');
            return;
        }

        const now = new Date();
        const formattedDate = now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const formattedTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        if (editingProductId) {
            const productIndex = currentInventory.products.findIndex(p => p.id === editingProductId);
            if (productIndex !== -1) {
                const oldProduct = currentInventory.products[productIndex];
                const oldStock = oldProduct.stock;
                const stockDifference = productStock - oldStock;
                
                // Si el stock actual es mayor que el stock anterior, es una "compra" o "entrada"
                if (stockDifference > 0) {
                    const transactionCost = stockDifference * productCost;
                    currentInventory.transactions.push({
                        id: Date.now(),
                        productId: editingProductId,
                        type: "compra", // O "entrada"
                        quantity: stockDifference,
                        price: transactionCost,
                        totalCost: transactionCost,
                        date: formattedDate,
                        time: formattedTime,
                        notes: `Reabastecimiento de ${stockDifference} unidades de ${productName}`
                    });
                    inventrakData.budget -= transactionCost; // Afecta el presupuesto global
                } else if (stockDifference < 0) {
                    // Si el stock actual es menor que el stock anterior, es un "ajuste_negativo" o "pérdida"
                    const transactionCost = Math.abs(stockDifference) * productCost;
                    currentInventory.transactions.push({
                        id: Date.now(),
                        productId: editingProductId,
                        type: "ajuste_negativo", // O "eliminacion"
                        quantity: Math.abs(stockDifference),
                        price: transactionCost,
                        totalCost: transactionCost,
                        date: formattedDate,
                        time: formattedTime,
                        notes: `Ajuste negativo de ${Math.abs(stockDifference)} unidades de ${productName}`
                    });
                    // NOTA: Los ajustes negativos/eliminaciones de stock no impactan directamente el budget global aquí,
                    // ya que el dinero se gastó al comprarlo. Esto es una pérdida de valor de activo.
                }

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

                alert('Producto actualizado con éxito!');
            }
        } else {
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

            const transactionCost = productStock * productCost;
            currentInventory.transactions.push({
                id: Date.now(),
                productId: newProductId,
                type: "compra",
                quantity: productStock,
                price: transactionCost,
                totalCost: transactionCost,
                date: formattedDate,
                time: formattedTime,
                notes: `Compra inicial de ${productStock} unidades de ${productName}`
            });
            inventrakData.budget -= transactionCost;

            alert('Producto añadido con éxito!');
        }

        saveInventrakData();
        renderProductList(currentInventory);
        renderInventoryBalances(currentInventory);
        renderDashboard();
        resetProductForm();
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
            editingProductId = productId;
            if (productFormTitle) productFormTitle.textContent = 'Editar Producto';
            if (cancelEditProductBtn) cancelEditProductBtn.classList.remove('hidden');

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
            if (productExpiryDateInput && productToEdit.expiryDate) {
                productExpiryDateInput.value = productToEdit.expiryDate;
            } else if (productExpiryDateInput) {
                productExpiryDateInput.value = '';
            }

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
            return;
        }

        const currentInventory = inventrakData.inventories.find(inv => inv.id === selectedInventoryId);
        if (currentInventory) {
            const productToDelete = currentInventory.products.find(p => p.id === productId);
            if (productToDelete) {
                const transactionCost = productToDelete.stock * productToDelete.cost;
                currentInventory.transactions.push({
                    id: Date.now(),
                    productId: productId,
                    type: "eliminacion",
                    quantity: productToDelete.stock,
                    price: productToDelete.stock * productToDelete.salePrice,
                    totalCost: transactionCost,
                    date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
                    time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
                    notes: `Producto eliminado: ${productToDelete.name}`
                });
            }

            currentInventory.products = currentInventory.products.filter(p => p.id !== productId);

            saveInventrakData();
            alert('Producto eliminado.');
            renderProductList(currentInventory);
            renderInventoryBalances(currentInventory);
            renderDashboard();
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

        const quantityStr = prompt(`¿Cuántas unidades de "${productToSell.name}" quieres vender? (Stock actual: ${productToSell.stock})`);
        if (quantityStr === null) return;

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

        productToSell.stock -= quantityToSell;

        const now = new Date();
        currentInventory.transactions.push({
            id: Date.now(),
            productId: productId,
            type: "venta",
            quantity: quantityToSell,
            price: saleValue,
            totalCost: quantityToSell * productToSell.cost,
            date: now.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`,
            notes: `Venta de ${quantityToSell} unidades de ${productToSell.name}`
        });

        inventrakData.budget += saleValue;

        saveInventrakData();
        alert(`Venta de ${quantityToSell} unidades de "${productToSell.name}" registrada.`);
        renderProductList(currentInventory);
        renderInventoryBalances(currentInventory);
        renderDashboard();
        console.log(`Venta de ${quantityToYell} unidades de producto ID: ${productId} en inventario ID: ${selectedInventoryId}. Presupuesto global actualizado.`);
    }

    /**
     * Resetea el formulario de añadir/editar producto a su estado inicial.
     */
    function resetProductForm() {
        if (productForm) productForm.reset();
        editingProductId = null;
        if (productFormTitle) productFormTitle.textContent = 'Añadir Nuevo Producto';
        if (cancelEditProductBtn) cancelEditProductBtn.classList.add('hidden');
        console.log('Formulario de producto reseteado.');
    }

    // --- Inicialización y Event Listeners Globales ---

    if (loginForm && registerForm) {
        console.log('Lógica de login.html iniciada. Asignando event listeners de formularios.');
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); toggleForm(false); });
        if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleForm(true); });
    }

    if (document.body.classList.contains('flex-col')) {
        console.log('Lógica de index.html iniciada.');

        if (!inventrakData.currentUser) {
            console.log('No hay usuario logueado. Redirigiendo a login.html.');
            window.location.href = 'login.html';
            return;
        } else {
            console.log(`Usuario logueado: ${inventrakData.currentUser}`);
        }

        renderDashboard();

        if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
        if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const sectionId = item.dataset.section + '-section';
                showSection(sectionId);

                if (sectionId === 'view-inventories-section') {
                    renderInventoriesList();
                } else if (sectionId === 'dashboard-section') {
                    renderDashboard();
                }
                // renderSettingsCharts se llama dentro de showSection
            });
        });

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

        if (topUpBudgetBtn) {
            topUpBudgetBtn.addEventListener('click', handleTopUpBudget);
        }
        if (changeBudgetBtn) {
            changeBudgetBtn.addEventListener('click', handleChangeBudget);
        }

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

        if (createInventoryForm) {
            createInventoryForm.addEventListener('submit', handleCreateInventory);
        } else {
            console.warn('WARN: createInventoryForm no encontrado. ¿Estamos en la sección correcta?');
        }

        if (backToInventoriesBtn) {
            backToInventoriesBtn.addEventListener('click', (e) => {
                e.preventDefault();
                showSection('view-inventories-section');
                renderInventoriesList();
            });
        }
        if (productForm) {
            productForm.addEventListener('submit', handleProductFormSubmit);
        }
        if (cancelEditProductBtn) {
            cancelEditProductBtn.addEventListener('click', (e) => {
                e.preventDefault();
                resetProductForm();
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

        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        } else {
            console.warn('WARN: logoutButton no encontrado.');
        }

        showSection('dashboard-section'); // Muestra el dashboard por defecto
    }
});
