// js/script.js
// Archivo JavaScript principal para las funcionalidades de Login, Dashboard,
// Crear Inventario y Ver Inventarios.

// Espera a que todo el contenido del DOM esté cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado. Iniciando script.js');

    // --- Estado de la Aplicación (Datos almacenados en localStorage) ---
    // Se intenta cargar los datos existentes. Si no hay o están corruptos,
    // se inicializa con una estructura válida para evitar errores.
    let inventrakData = JSON.parse(localStorage.getItem('inventrakData')) || {
        users: [{ email: "test@inventrak.com", password: "password123", name: "Claudia" }],
        currentUser: null,
        budget: 56890.00,
        losses: 2890.00,
        gains: 1067.00,
        inventories: [
            {
                id: 1,
                name: "INVENTARIO PRINCIPAL",
                initialAmount: 10000.00,
                creationDate: "01/01/2025",
                products: [],
                transactions: []
            }
        ]
    };

    // Validación y saneamiento de datos cargados de localStorage
    // Esto es crucial para manejar casos donde el formato de datos en localStorage ha cambiado
    // o está incompleto, evitando errores TypeError.
    inventrakData.inventories = inventrakData.inventories.map(inv => {
        return {
            ...inv,
            products: Array.isArray(inv.products) ? inv.products : [],
            transactions: Array.isArray(inv.transactions) ? inv.transactions : []
        };
    });
    console.log('Datos de inventrakData después del saneamiento:', inventrakData);


    let selectedInventoryId = null; // Mantener para futura expansión

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

    // Elementos de Crear Inventario (solo se esperan en index.html)
    const createInventoryForm = document.getElementById('createInventoryForm');
    const newInventoryNameInput = document.getElementById('newInventoryName');
    const newInventoryInitialAmountInput = document.getElementById('newInventoryInitialAmount');

    // Elementos de Ver Inventarios (solo se esperan en index.html)
    const inventoriesListDiv = document.getElementById('inventories-list');
    const noInventoriesMessage = document.getElementById('no-inventories-message');

    // --- Funciones de Utilidad ---

    function saveInventrakData() {
        localStorage.setItem('inventrakData', JSON.stringify(inventrakData));
        console.log('Datos guardados en localStorage:', inventrakData);
    }

    function formatCurrency(amount) {
        return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

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

    // --- Funciones de Renderizado ---
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
        if (currentBudgetSpan) currentBudgetSpan.textContent = formatCurrency(inventrakData.budget);

        let totalGlobalLosses = 0;
        let totalGlobalGains = 0;
        inventrakData.inventories.forEach(inv => {
            // AÑADIDO: Verificación de si inv.transactions es un array válido
            if (inv.transactions && Array.isArray(inv.transactions)) {
                inv.transactions.forEach(t => {
                    if (t.type === 'venta' || t.type === 'ajuste_positivo') {
                        totalGlobalGains += t.price;
                    } else if (t.type === 'compra' || t.type === 'entrada' || t.type === 'ajuste_negativo' || t.type === 'eliminacion' || t.type === 'creacion_inventario') {
                        totalGlobalLosses += t.price;
                    }
                });
            } else {
                console.warn(`WARN: Inventario "${inv.name}" (ID: ${inv.id}) no tiene un array de transacciones válido. Se asume vacío.`);
                // Opcional: inv.transactions = []; // Esto podría sanear los datos en memoria si es necesario
            }
        });
        inventrakData.losses = totalGlobalLosses;
        inventrakData.gains = totalGlobalGains;
        saveInventrakData();

        if (totalLossesSpan) totalLossesSpan.textContent = formatCurrency(inventrakData.losses);
        if (totalGainsSpan) totalGainsSpan.textContent = formatCurrency(inventrakData.gains);

        renderDashboardInOutList();
        console.log('renderDashboard finalizado.');
    }

    function renderDashboardInOutList() {
        console.log('Iniciando renderDashboardInOutList...');
        if (!inOutList) {
            console.error('ERROR: Elemento in-out-list no encontrado para renderDashboardInOutList.');
            return;
        }
        inOutList.innerHTML = '';
        const allTransactions = [];

        inventrakData.inventories.forEach(inv => {
            // AÑADIDO: Verificación de si inv.transactions es un array válido
            if (inv.transactions && Array.isArray(inv.transactions)) {
                inv.transactions.forEach(t => {
                    const transactionDescription = t.type === 'creacion_inventario' ? `Creación de Inventario: ${inv.name}` : `Movimiento en ${inv.name} (${t.type})`;
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
        console.log('renderDashboardInOutList finalizado.');
    }

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
                div.className = 'flex flex-col sm:flex-row justify-between items-start sm:items-center bg-inventrak-card-bg p-4 rounded-xl shadow-md cursor-pointer hover:bg-gray-50 transition duration-200';
                div.dataset.inventoryId = inventory.id;
                div.innerHTML = `
                    <div class="flex flex-col mb-2 sm:mb-0">
                        <span class="text-inventrak-text-dark font-semibold text-lg">${inventory.name}</span>
                        <span class="text-inventrak-text-light text-sm">Creado: ${inventory.creationDate}</span>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
                        <span class="text-inventrak-darkblue font-bold text-base sm:text-xl">Productos: ${inventory.products.length}</span>
                        <button class="bg-gray-400 text-white px-3 py-1 rounded-lg text-sm cursor-not-allowed" disabled>
                            Gestionar (Próximamente)
                        </button>
                    </div>
                `;
                inventoriesListDiv.appendChild(div);
            });
            console.log(`Se han renderizado ${inventrakData.inventories.length} inventarios.`);
        }
        console.log('renderInventoriesList finalizado.');
    }

    // --- Funciones de Lógica de la Aplicación ---
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

    function handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            inventrakData.currentUser = null;
            saveInventrakData();
            console.log('Sesión cerrada. Redirigiendo a login.html...');
            window.location.href = 'login.html';
        }
    }

    function openSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.remove('-translate-x-full');
            sidebarOverlay.classList.remove('hidden');
            console.log('Sidebar abierta.');
        } else {
            console.warn('WARN: Elementos de sidebar no encontrados para abrir.');
        }
    }

    function closeSidebar() {
        if (sidebar && sidebarOverlay) {
            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');
            console.log('Sidebar cerrada.');
        } else {
            console.warn('WARN: Elementos de sidebar no encontrados para cerrar.');
        }
    }

    function handleCreateInventory(e) {
        e.preventDefault();
        const name = newInventoryNameInput ? newInventoryNameInput.value.trim() : '';
        const initialAmount = newInventoryInitialAmountInput ? parseFloat(newInventoryInitialAmountInput.value) : NaN;

        if (!name || isNaN(initialAmount)) {
            alert('Por favor, ingresa un nombre y un monto inicial válidos.');
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

        saveInventrakData();
        alert('Inventario "' + name + '" creado con éxito!');
        if (createInventoryForm) createInventoryForm.reset();
        renderDashboard();
        renderInventoriesList();
        showSection('view-inventories-section');
        console.log(`Inventario "${name}" creado.`);
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

        // Renderiza el dashboard al cargar la página
        renderDashboard();

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
                if (inOutList) { // Asegurarse de que inOutList existe
                    inOutList.classList.toggle('hidden');
                    const icon = toggleInOutBtn.querySelector('i');
                    if (icon) { // Asegurarse de que el icono existe
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
