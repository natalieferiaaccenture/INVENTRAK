// js/script.js
// Archivo JavaScript principal para las funcionalidades de Login, Dashboard,
// Crear Inventario y Ver Inventarios.

// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado. Iniciando script.js');

    // --- Estado de la Aplicación (Datos almacenados en localStorage) ---
    // Se intenta cargar los datos existentes, si no hay, se inicializa con datos de ejemplo
    let inventrakData = JSON.parse(localStorage.getItem('inventrakData')) || {
        users: [{ email: "test@inventrak.com", password: "password123", name: "Claudia" }], // Usuario de prueba
        currentUser: null, // ID del usuario actualmente logueado
        // Datos generales del dashboard (serán actualizados dinámicamente)
        budget: 56890.00,
        losses: 2890.00,
        gains: 1067.00,
        // Estructura para inventarios: cada inventario tiene sus propios productos y transacciones
        inventories: [
            // Ejemplo de inventario inicial (se puede remover en producción)
            {
                id: 1, // ID único del inventario
                name: "INVENTARIO PRINCIPAL",
                initialAmount: 10000.00, // Presupuesto inicial para este inventario
                creationDate: "01/01/2025",
                products: [ // Lista de productos dentro de este inventario (vacía por ahora en simplificación)
                    // { id: 101, name: "Leche Entera", category: "Lacteos", sku: "LE001", description: "Leche de vaca semidesnatada", cost: 2.00, salePrice: 2.50, stock: 50, unit: "litro", location: "Pasillo 1", supplier: "Proveedor Lácteo A", expiryDate: "2025-12-31", lastUpdated: "05/06/2025" },
                ],
                transactions: [ // Lista de transacciones (ventas, compras, ajustes) para este inventario (vacía por ahora)
                    // { id: 1, productId: 101, type: "venta", quantity: 5, price: 12.50, date: "05/06/2025", time: "10:00", notes: "Venta de 5 leches", totalCost: 10.00 },
                ]
            }
        ]
    };

    // Variable para el ID del inventario actualmente seleccionado (no se usa en esta fase simplificada, pero se mantiene para futura expansión)
    let selectedInventoryId = null;

    // --- Selectores de Elementos del DOM ---

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

    // Elementos de Crear Inventario (solo se esperan en index.html)
    const createInventoryForm = document.getElementById('createInventoryForm');
    const newInventoryNameInput = document.getElementById('newInventoryName');
    const newInventoryInitialAmountInput = document.getElementById('newInventoryInitialAmount');

    // Elementos de Ver Inventarios (solo se esperan en index.html)
    const inventoriesListDiv = document.getElementById('inventories-list');
    const noInventoriesMessage = document.getElementById('no-inventories-message');

    // --- Funciones de Utilidad ---

    /**
     * Guarda el objeto 'inventrakData' completo en localStorage.
     */
    function saveInventrakData() {
        localStorage.setItem('inventrakData', JSON.stringify(inventrakData));
        console.log('Datos guardados:', inventrakData);
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
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        } else {
            console.error(`Sección con ID "${sectionId}" no encontrada.`);
            return;
        }

        // Actualiza el estado visual del ítem activo en la barra lateral
        sidebarItems.forEach(item => item.classList.remove('active', 'bg-inventrak-blue', 'text-white'));
        const activeSidebarItem = document.querySelector(`.sidebar-item[data-section="${sectionId.replace('-section', '')}"]`);
        if (activeSidebarItem) {
            activeSidebarItem.classList.add('active', 'bg-inventrak-blue', 'text-white');
        }

        // Actualiza el estado visual del ítem activo en la barra de navegación inferior (móvil)
        bottomNavItems.forEach(item => item.classList.remove('active', 'text-inventrak-darkblue'));
        const activeBottomNavItem = document.querySelector(`.bottom-nav-item[data-section="${sectionId.replace('-section', '')}"]`);
        if (activeBottomNavItem) {
            activeBottomNavItem.classList.add('active', 'text-inventrak-darkblue');
        }

        // Cierra la barra lateral en dispositivos móviles después de seleccionar una sección
        if (window.innerWidth < 1024 && sidebar && sidebarOverlay) {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        }
    }

    // --- Funciones de Renderizado (UI Updates) ---

    /**
     * Renderiza y actualiza los datos principales del dashboard (presupuesto, pérdidas, ganancias, hora, nombre de usuario).
     */
    function renderDashboard() {
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
        if (currentBudgetSpan) currentBudgetSpan.textContent = formatCurrency(inventrakData.budget);

        // Recalcular pérdidas y ganancias globales
        let totalGlobalLosses = 0;
        let totalGlobalGains = 0;
        inventrakData.inventories.forEach(inv => {
            inv.transactions.forEach(t => {
                if (t.type === 'venta' || t.type === 'ajuste_positivo') {
                    totalGlobalGains += t.price;
                } else if (t.type === 'compra' || t.type === 'entrada' || t.type === 'ajuste_negativo' || t.type === 'eliminacion' || t.type === 'creacion_inventario') {
                    totalGlobalLosses += t.price;
                }
            });
        });
        inventrakData.losses = totalGlobalLosses;
        inventrakData.gains = totalGlobalGains;
        saveInventrakData(); // Guarda los totales actualizados

        if (totalLossesSpan) totalLossesSpan.textContent = formatCurrency(inventrakData.losses);
        if (totalGainsSpan) totalGainsSpan.textContent = formatCurrency(inventrakData.gains);

        renderDashboardInOutList(); // También renderiza la lista de movimientos
    }

    /**
     * Renderiza la lista de entradas y salidas (transacciones recientes) en el dashboard.
     */
    function renderDashboardInOutList() {
        if (inOutList) {
            inOutList.innerHTML = ''; // Limpia la lista existente
            const allTransactions = [];

            // Recopila todas las transacciones de todos los inventarios
            inventrakData.inventories.forEach(inv => {
                inv.transactions.forEach(t => {
                    // Aquí, en la versión simplificada, no estamos usando product.name extensivamente
                    // Pero mantenemos la estructura para compatibilidad futura si se añaden productos.
                    const transactionDescription = t.type === 'creacion_inventario' ? `Creación de Inventario: ${inv.name}` : `Movimiento en ${inv.name} (${t.type})`;
                    allTransactions.push({
                        ...t,
                        inventoryName: inv.name,
                        transactionDisplay: transactionDescription // Texto a mostrar en la transacción
                    });
                });
            });

            // Ordena las transacciones por fecha y hora, las más recientes primero
            allTransactions.sort((a, b) => {
                const dateTimeA = new Date(`${a.date.split('/').reverse().join('-')}T${a.time || '00:00'}`);
                const dateTimeB = new Date(`${b.date.split('/').reverse().join('-')}T${b.time || '00:00'}`);
                return dateTimeB - dateTimeA;
            });

            if (allTransactions.length === 0) {
                inOutList.innerHTML = '<p class="text-inventrak-text-light text-center">No hay movimientos recientes en ningún inventario.</p>';
                return;
            }

            // Mostrar un número limitado de transacciones en el dashboard (ej. las últimas 5)
            const displayLimit = 5;
            allTransactions.slice(0, displayLimit).forEach(transaction => {
                const div = document.createElement('div');
                let typeClass = 'text-gray-700'; // Color por defecto
                let sign = '';
                let displayValue = transaction.price;

                if (transaction.type === 'venta' || transaction.type === 'ajuste_negativo' || transaction.type === 'eliminacion') {
                    typeClass = 'text-red-500';
                    sign = '-';
                } else if (transaction.type === 'compra' || transaction.type === 'entrada' || transaction.type === 'ajuste_positivo' || transaction.type === 'creacion_inventario') {
                    typeClass = 'text-green-500';
                    sign = '+';
                }

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
        }
    }

    /**
     * Renderiza la lista de inventarios creados en la sección "Inventarios Creados".
     */
    function renderInventoriesList() {
        if (inventoriesListDiv) {
            inventoriesListDiv.innerHTML = ''; // Limpia la lista
            if (inventrakData.inventories.length === 0) {
                noInventoriesMessage.classList.remove('hidden');
            } else {
                noInventoriesMessage.classList.add('hidden');
                inventrakData.inventories.forEach(inventory => {
                    const div = document.createElement('div');
                    div.className = 'flex flex-col sm:flex-row justify-between items-start sm:items-center bg-inventrak-card-bg p-4 rounded-xl shadow-md cursor-pointer hover:bg-gray-50 transition duration-200';
                    div.dataset.inventoryId = inventory.id; // Guarda el ID para futura gestión
                    div.innerHTML = `
                        <div class="flex flex-col mb-2 sm:mb-0">
                            <span class="text-inventrak-text-dark font-semibold text-lg">${inventory.name}</span>
                            <span class="text-inventrak-text-light text-sm">Creado: ${inventory.creationDate}</span>
                        </div>
                        <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                            <span class="text-inventrak-darkblue font-bold text-base sm:text-xl">Productos: ${inventory.products.length}</span>
                            <!-- Botón "Gestionar" no funcional en esta fase, solo un placeholder visual -->
                            <button class="bg-gray-400 text-white px-3 py-1 rounded-lg text-sm cursor-not-allowed" disabled>
                                Gestionar (Próximamente)
                            </button>
                        </div>
                    `;
                    inventoriesListDiv.appendChild(div);
                });
                // No se añaden event listeners de "Gestionar" ya que esa funcionalidad no está activa aún.
            }
        }
    }

    // --- Funciones de Lógica de la Aplicación ---

    /**
     * Alterna la visibilidad entre el panel de login y el de registro en login.html.
     * @param {boolean} showLogin - Si es true, muestra el panel de login; de lo contrario, muestra el de registro.
     */
    function toggleForm(showLogin) {
        // Asegúrate de que los paneles existan (estamos en login.html)
        if (loginPanel && registerPanel) {
            if (showLogin) {
                loginPanel.classList.remove('hidden');
                registerPanel.classList.add('hidden');
            } else {
                loginPanel.classList.add('hidden');
                registerPanel.classList.remove('hidden');
            }
        }
    }

    /**
     * Maneja el envío del formulario de inicio de sesión.
     * @param {Event} e - El evento de envío del formulario.
     */
    function handleLogin(e) {
        e.preventDefault();
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

        const user = inventrakData.users.find(u => u.email === email && u.password === password);

        if (user) {
            inventrakData.currentUser = user.email;
            saveInventrakData();
            window.location.href = 'index.html';
        } else {
            alert('Credenciales incorrectas. Intenta con test@inventrak.com / password123 (o regístrate)');
        }
    }

    /**
     * Maneja el envío del formulario de registro de un nuevo usuario.
     * @param {Event} e - El evento de envío del formulario.
     */
    function handleRegister(e) {
        e.preventDefault();
        const name = registerNameInput.value.trim();
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

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
        registerForm.reset();
        toggleForm(true);
    }

    /**
     * Maneja el cierre de sesión del usuario.
     */
    function handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            inventrakData.currentUser = null;
            saveInventrakData();
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
        }
    }

    /**
     * Cierra la barra lateral (sidebar) en dispositivos móviles.
     */
    function closeSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
        }
    }

    /**
     * Maneja el envío del formulario de creación de un nuevo inventario.
     * @param {Event} e - El evento de envío del formulario.
     */
    function handleCreateInventory(e) {
        e.preventDefault();
        const name = newInventoryNameInput.value.trim();
        const initialAmount = parseFloat(newInventoryInitialAmountInput.value);

        if (!name || isNaN(initialAmount)) {
            alert('Por favor, ingresa un nombre y un monto inicial válidos.');
            return;
        }

        const newInventory = {
            id: Date.now(), // ID único basado en la marca de tiempo
            name: name.toUpperCase(),
            initialAmount: initialAmount,
            creationDate: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            products: [], // Vacío por ahora
            transactions: [] // Vacío por ahora
        };

        inventrakData.inventories.push(newInventory);
        // Registrar la creación del inventario como una transacción
        newInventory.transactions.push({
            id: Date.now(),
            productId: null,
            type: "creacion_inventario",
            quantity: 1,
            price: initialAmount,
            date: newInventory.creationDate,
            time: `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`,
            notes: `Creación de inventario: ${newInventory.name}`
        });

        saveInventrakData(); // Guarda los datos actualizados
        alert('Inventario "' + name + '" creado con éxito!');
        createInventoryForm.reset(); // Limpia el formulario
        renderDashboard(); // Refresca el dashboard para ver la nueva actividad
        renderInventoriesList(); // Refresca la lista de inventarios
        showSection('view-inventories-section'); // Navega a la vista de inventarios creados
    }

    // --- Inicialización y Event Listeners Globales ---

    // Lógica para la página de login/registro (login.html)
    // Se ejecuta solo si los formularios de login y registro están presentes en el DOM
    if (loginForm && registerForm) {
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); toggleForm(false); });
        showLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleForm(true); });
    }

    // Lógica para la página principal (index.html)
    // Se ejecuta solo si el cuerpo del documento tiene la clase 'flex-col' (un indicador de index.html)
    if (document.body.classList.contains('flex-col')) {
        // Redirige al login si no hay usuario logueado
        if (!inventrakData.currentUser) {
            window.location.href = 'login.html';
            return; // Detiene la ejecución del script aquí
        }

        // Renderiza el dashboard al cargar la página
        renderDashboard();

        // Eventos de la barra lateral (Sidebar) y su overlay
        if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
        if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar); // Cierra la sidebar si se hace clic fuera

        // Manejo de la navegación a través de los ítems de la barra lateral
        sidebarItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault(); // Previene el comportamiento por defecto del enlace
                const sectionId = item.dataset.section + '-section'; // Obtiene el ID de la sección a mostrar
                showSection(sectionId); // Muestra la sección

                // Acciones específicas al cambiar de sección
                if (sectionId === 'view-inventories-section') {
                    renderInventoriesList(); // Refresca la lista de inventarios
                } else if (sectionId === 'dashboard-section') {
                    renderDashboard(); // Asegura que el dashboard se refresque
                }
                // Las otras secciones (settings) no tienen lógica de renderizado compleja aún.
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
                // Las otras secciones (settings) no tienen lógica de renderizado compleja aún.
            });
        });

        // Evento para expandir/contraer la sección "View In & Out" en el dashboard
        if (toggleInOutBtn) {
            toggleInOutBtn.addEventListener('click', () => {
                inOutList.classList.toggle('hidden'); // Alterna la visibilidad
                const icon = toggleInOutBtn.querySelector('i'); // Cambia el icono de flecha
                if (inOutList.classList.contains('hidden')) {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                } else {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                }
            });
        }

        // Evento para el formulario de Crear Inventario
        if (createInventoryForm) {
            createInventoryForm.addEventListener('submit', handleCreateInventory);
        }

        // Evento para el botón de Cerrar Sesión
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }

        // Muestra la sección del dashboard por defecto al cargar index.html
        showSection('dashboard-section');
    }
});
