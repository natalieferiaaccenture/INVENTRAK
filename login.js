document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado. Iniciando script.js');

    // --- Selectores de Elementos del DOM ---
    // Login/Register page elements
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


    const logoutButton = document.getElementById('logout-button');

    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const openSidebarBtn = document.getElementById('open-sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar');
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');

    const contentSections = document.querySelectorAll('.content-section');

    // Dashboard Elements
    const currentTimeSpan = document.getElementById('current-time');
    const userNameSpan = document.getElementById('user-name');
    const currentBudgetSpan = document.getElementById('current-budget');
    const totalLossesSpan = document.getElementById('total-losses');
    const totalGainsSpan = document.getElementById('total-gains');
    const toggleInOutBtn = document.getElementById('toggle-in-out');
    const inOutList = document.getElementById('in-out-list');

    // Create Inventory Elements
    const createInventoryForm = document.getElementById('createInventoryForm');
    const inventoryNameInput = document.getElementById('inventoryName');
    const inventoryAmountInput = document.getElementById('inventoryAmount');

    // View Inventories Elements
    const inventoriesListDiv = document.getElementById('inventories-list');
    const noInventoriesMessage = document.getElementById('no-inventories-message');

    // --- Estado de la Aplicación (Datos en localStorage) ---
    let inventrakData = JSON.parse(localStorage.getItem('inventrakData')) || {
        users: [{ email: "test@inventrak.com", password: "password123", name: "Claudia" }], // Usuario de prueba predefinido
        currentUser: null,
        budget: 56890.00,
        inventories: [
            { id: 1, name: "AJAJQ", date: "01/01/2025", amount: 4000.00 },
            { id: 2, name: "INVENTARIO 1", date: "01/01/2025", amount: 1000.00 },
            { id: 3, name: "LACTEOS", date: "01/01/2025", amount: 300.00 },
            { id: 4, name: "VERDURAS", date: "01/01/2025", amount: 1500.00 },
        ],
        losses: 2890.00,
        gains: 1067.00
    };

    // --- Funciones de Utilidad ---

    // Guarda los datos en localStorage
    function saveInventrakData() {
        localStorage.setItem('inventrakData', JSON.stringify(inventrakData));
        console.log('Datos guardados:', inventrakData);
    }

    // Formatea un número como moneda
    function formatCurrency(amount) {
        return amount.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Muestra la sección de contenido deseada y oculta las demás
    function showSection(sectionId) {
        contentSections.forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(sectionId).classList.remove('hidden');

        // Actualiza el estado activo de los ítems de navegación de la barra lateral
        sidebarItems.forEach(item => item.classList.remove('active', 'bg-inventrak-blue', 'text-white'));
        document.querySelector(`.sidebar-item[data-section="${sectionId.replace('-section', '')}"]`)?.classList.add('active', 'bg-inventrak-blue', 'text-white');

        // Actualiza el estado activo de los ítems de navegación inferior para móvil
        bottomNavItems.forEach(item => item.classList.remove('active', 'text-inventrak-darkblue'));
        document.querySelector(`.bottom-nav-item[data-section="${sectionId.replace('-section', '')}"]`)?.classList.add('active', 'text-inventrak-darkblue');

        // Cierra la sidebar en móviles después de la selección
        if (window.innerWidth < 1024) {
            closeSidebar();
        }
    }

    // --- Funciones de Renderizado ---

    // Renderiza los datos del dashboard
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
        if (totalLossesSpan) totalLossesSpan.textContent = formatCurrency(inventrakData.losses);
        if (totalGainsSpan) totalGainsSpan.textContent = formatCurrency(inventrakData.gains);

        renderInOutList();
    }

    // Renderiza la lista de entradas y salidas en el dashboard
    function renderInOutList() {
        if (inOutList) {
            inOutList.innerHTML = '';
            if (inventrakData.inventories.length === 0) {
                inOutList.innerHTML = '<p class="text-inventrak-text-light text-center">No hay movimientos registrados.</p>';
                return;
            }

            inventrakData.inventories.forEach(item => {
                const div = document.createElement('div');
                div.className = 'flex justify-between items-center bg-gray-50 p-3 rounded-lg shadow-sm';
                div.innerHTML = `
                    <div class="flex items-center space-x-3">
                        <span class="bg-inventrak-blue text-white text-xs px-3 py-1 rounded-full font-medium">${item.name}</span>
                        <span class="text-inventrak-text-light text-sm">${item.date}</span>
                    </div>
                    <span class="text-inventrak-text-dark font-semibold">$${formatCurrency(item.amount)}</span>
                `;
                inOutList.appendChild(div);
            });
        }
    }

    // Renderiza la lista de inventarios creados en su sección
    function renderInventoriesList() {
        if (inventoriesListDiv) {
            inventoriesListDiv.innerHTML = '';
            if (inventrakData.inventories.length === 0) {
                noInventoriesMessage.classList.remove('hidden');
            } else {
                noInventoriesMessage.classList.add('hidden');
                inventrakData.inventories.forEach(item => {
                    const div = document.createElement('div');
                    div.className = 'flex justify-between items-center bg-inventrak-card-bg p-4 rounded-xl shadow-md';
                    div.innerHTML = `
                        <div class="flex flex-col">
                            <span class="text-inventrak-text-dark font-semibold text-lg">${item.name}</span>
                            <span class="text-inventrak-text-light text-sm">${item.date}</span>
                        </div>
                        <span class="text-inventrak-darkblue font-bold text-xl">$${formatCurrency(item.amount)}</span>
                    `;
                    inventoriesListDiv.appendChild(div);
                });
            }
        }
    }

    // --- Funciones de Lógica de la Aplicación ---

    // Alterna entre el panel de login y el de registro
    function toggleForm(showLogin) {
        if (showLogin) {
            loginPanel.classList.remove('hidden');
            registerPanel.classList.add('hidden');
        } else {
            loginPanel.classList.add('hidden');
            registerPanel.classList.remove('hidden');
        }
    }

    // Maneja el intento de inicio de sesión
    function handleLogin(e) {
        e.preventDefault();
        const email = loginEmailInput.value;
        const password = loginPasswordInput.value;

        const user = inventrakData.users.find(u => u.email === email && u.password === password);

        if (user) {
            inventrakData.currentUser = user.email;
            saveInventrakData();
            window.location.href = 'index.html'; // Redirige al dashboard
        } else {
            alert('Credenciales incorrectas. Intenta con test@inventrak.com / password123 (o regístrate)');
        }
    }

    // Maneja el registro de un nuevo usuario
    function handleRegister(e) {
        e.preventDefault();
        const name = registerNameInput.value.trim();
        const email = registerEmailInput.value.trim();
        const password = registerPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validaciones básicas
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
        // Validación simple de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        // Verificar si el email ya existe
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
        registerForm.reset(); // Limpia el formulario de registro
        toggleForm(true); // Vuelve al formulario de login
    }


    // Maneja el cierre de sesión
    function handleLogout() {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            inventrakData.currentUser = null;
            saveInventrakData();
            window.location.href = 'login.html'; // Redirige al login
        }
    }

    // Abre la barra lateral (para móvil)
    function openSidebar() {
        sidebar.classList.remove('-translate-x-full');
        sidebarOverlay.classList.remove('hidden');
    }

    // Cierra la barra lateral (para móvil)
    function closeSidebar() {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    }

    // Maneja el envío del formulario de creación de inventario
    function handleCreateInventory(e) {
        e.preventDefault();
        const name = inventoryNameInput.value.trim();
        const amount = parseFloat(inventoryAmountInput.value);

        if (!name || isNaN(amount)) {
            alert('Por favor, ingresa un nombre y un monto válidos.');
            return;
        }

        const newInventory = {
            id: Date.now(),
            name: name.toUpperCase(),
            date: new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
            amount: amount
        };

        inventrakData.inventories.push(newInventory);
        inventrakData.budget -= amount;
        inventrakData.losses += amount;

        saveInventrakData();
        alert('Inventario "' + name + '" creado con éxito!');
        createInventoryForm.reset();
        renderDashboard();
        renderInventoriesList();
        showSection('view-inventories-section');
    }


    // --- Inicialización y Event Listeners ---

    // Lógica para la página de login/registro (login.html)
    if (loginForm && registerForm) { // Asegura que estamos en login.html
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); toggleForm(false); });
        showLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleForm(true); });
    }

    // Lógica para la página principal (index.html)
    // Se ejecuta solo si el cuerpo del documento tiene la clase 'flex-col' (indicador de index.html)
    if (document.body.classList.contains('flex-col')) {
        if (!inventrakData.currentUser) {
            window.location.href = 'login.html'; // Redirige a login si no hay usuario logueado
            return; // Detiene la ejecución del script aquí
        }

        renderDashboard(); // Renderiza el dashboard al cargar

        // Sidebar & Overlay events
        if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
        if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebar);

        // Navegación de la barra lateral
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
            });
        });

        // Navegación de la barra inferior (móvil)
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

        // Toggle "View In & Out"
        if (toggleInOutBtn) {
            toggleInOutBtn.addEventListener('click', () => {
                inOutList.classList.toggle('hidden');
                const icon = toggleInOutBtn.querySelector('i');
                if (inOutList.classList.contains('hidden')) {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                } else {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                }
            });
        }

        // Formulario de Crear Inventario
        if (createInventoryForm) {
            createInventoryForm.addEventListener('submit', handleCreateInventory);
        }

        // Botón de Cerrar Sesión
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }

        // Mostrar la sección del dashboard por defecto al cargar index.html
        showSection('dashboard-section');
    }
});
