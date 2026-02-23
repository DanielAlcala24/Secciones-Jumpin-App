// Configuración de Supabase
const SUPABASE_URL = 'https://pcxunmtwgfechivixjkc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeHVubXR3Z2ZlY2hpdml4amtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODA5NDksImV4cCI6MjA3OTA1Njk0OX0.j-ZVavdVP3w6nFjIukMa_pSWwUhYH6FsRBHwvhCz2Jo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadBranchData() {
    const loadingScreen = document.getElementById('loading-screen');
    const content = document.getElementById('content');

    // Obtener el slug desde la URL (ej: /sucursales/churubusco -> churubusco)
    const pathParts = window.location.pathname.split('/').filter(p => p);
    const slug = pathParts[pathParts.length - 1];

    if (!slug || slug === 'sucursal.html') {
        window.location.href = '/'; // Redirigir al inicio si no hay slug
        return;
    }

    try {
        const { data: branch, error } = await supabaseClient
            .from('branches')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error || !branch) {
            console.error('Sucursal no encontrada:', error);
            document.body.innerHTML = `
                <div class="h-screen flex flex-col items-center justify-center bg-gray-100 font-sans">
                    <h1 class="text-6xl font-bold text-gray-800">404</h1>
                    <p class="text-2xl text-gray-600 mb-8">Sucursal no encontrada</p>
                    <a href="/" class="bg-pink-500 text-white px-6 py-2 rounded-lg">Volver al inicio</a>
                </div>`;
            return;
        }

        // Poblar datos básicos
        document.title = `${branch.name} - Jump-In`;
        document.getElementById('branch-name-header').innerText = branch.name.toUpperCase();

        // Actualizar links de cotización con el nombre de la sucursal
        const quoteBtn = document.getElementById('quote-party-btn');
        if (quoteBtn) {
            const message = `¡Hola! Me gustaría cotizar mi fiesta en Jump-In. Aquí están mis datos:\n\n* Nombre completo del tutor: \n* Número de invitados niños: \n* Número de invitados adultos: \n* Correo electrónico: \n* Número de teléfono: \n* Sucursal: ${branch.name}\n* Fecha del evento: \n* Nombre del festejado(a): \n* Edad que cumple: \n* Hora de ingreso: `;
            quoteBtn.href = `https://wa.me/525536441494?text=${encodeURIComponent(message)}`;
        }

        const eventBtn = document.getElementById('quote-event-btn');
        if (eventBtn) {
            const message = `¡Hola! Me gustaría cotizar un Evento Empresarial en Jump-In. Para poder reservar me podría brindar los siguientes datos por favor ☺️🥳\n\n* Nombre completo del responsable: \n* Número de asistentes: \n* Correo electrónico: \n* Número de teléfono: \n* Sucursal: ${branch.name}\n* Fecha del evento: \n* Nombre de la empresa: `;
            eventBtn.href = `https://wa.me/525536441494?text=${encodeURIComponent(message)}`;
        }

        document.getElementById('branch-address').innerText = `DIRECCIÓN: ${branch.address}`;
        document.getElementById('branch-phone').innerHTML = `TELÉFONO: ${branch.phone}`;

        if (branch.whatsapp) {
            const waNumber = branch.whatsapp.replace(/\D/g, ''); // Solo números para el link
            document.getElementById('branch-phone').innerHTML += `<br><a href="https://wa.me/${waNumber}" target="_blank" class="text-green-500 hover:text-green-700 decoration-none">
                <span class="flex items-center justify-center gap-2">
                    WhatsApp: ${branch.whatsapp}
                </span>
            </a>`;
        }

        if (branch.map_link) {
            document.getElementById('map-link-btn').href = branch.map_link;
            // Intentar extraer src de iframe si es un link de embed o usar directo si es link de maps
            const mapContainer = document.getElementById('map-container');
            if (branch.map_link.includes('embed')) {
                mapContainer.innerHTML = `<iframe class="rounded-[10px]" src="${branch.map_link}" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"></iframe>`;
            } else {
                // Link normal, quizás no podamos embeberlo directamente sin un embed link real
                // Mostramos un placeholder o intentamos convertirlo
                mapContainer.innerHTML = `<div class="p-4 text-center">Pincha abajo para ver el mapa</div>`;
            }
        }

        // Horarios
        const scheduleList = document.getElementById('schedule-list');
        if (branch.horarios && Array.isArray(branch.horarios)) {
            scheduleList.innerHTML = branch.horarios.map(h => `<p class="text-xl">${(h || '').toUpperCase()}</p>`).join('');
        }

        // Precios (JSONB)
        // Estructura esperada: [{ label: "1 HR", price: "270", icon_type: "monkey/raccoon/worm/calcetines/other" }]
        const pricingContainer = document.getElementById('pricing-container');
        if (branch.prices && Array.isArray(branch.prices)) {
            pricingContainer.innerHTML = branch.prices.map((p, idx) => {
                let bgColor = 'bg-blue-700';
                let iconPath = '/sucursales/churubusco/assets/img/app sucursal-26.png'; // worm default

                if (p.icon_type === 'monkey') {
                    bgColor = 'bg-blue-950';
                    iconPath = '/sucursales/churubusco/assets/img/app sucursal-24.png';
                } else if (p.icon_type === 'raccoon') {
                    bgColor = 'bg-blue-900';
                    iconPath = '/sucursales/churubusco/assets/img/app sucursal-25.png';
                } else if (p.icon_type === 'calcetines') {
                    bgColor = 'bg-white';
                    iconPath = '/sucursales/churubusco/assets/img/calcetines.png';
                }

                const textColor = bgColor === 'bg-white' ? 'text-black' : 'text-white';

                return `
                    <div class="z-${50 - idx * 10} flex flex-row items-center justify-between ${bgColor} rounded-[30px] p-2 text-center shadow-xl">
                        <div class="text-center pl-4 flex-1">
                            <p class="${textColor} text-sm font-bold">${(p.title || '').toUpperCase()}</p>
                            <p class="${textColor} text-xl">${(p.label || '').toUpperCase()}</p>
                            <p class="text-5xl ${textColor} font-semibold price-font">${p.price || '--'}</p>
                            ${p.description ? `<p class="${textColor} text-xs mt-1 italic">${p.description}</p>` : ''}
                        </div>
                        <div class="w-20 h-20 rounded-full mt-4 pr-2">
                            <img src="${iconPath}" alt="">
                        </div>
                    </div>`;
            }).join('');
        }

        // Atracciones (JSONB)
        // Estructura esperada: [{ title: "Dodgeball", image_url: "..." }]
        const attractionsContainer = document.getElementById('attractions-container');
        const validAttractions = (branch.attractions && Array.isArray(branch.attractions))
            ? branch.attractions.filter(a => a.src || a.image_url || a.title || a.alt)
            : [];

        if (validAttractions.length > 0) {
            attractionsContainer.innerHTML = validAttractions.map((a, idx) => {
                const title = (a.alt || a.title || '').toUpperCase();
                const imageUrl = a.src || a.image_url || '';
                return `
                <div class="carousel-item ${idx === 0 ? 'active' : ''}">
                    <div class="carousel-caption d-md-block">
                        <h5 class="text-3xl font-semibold">ATRACCIONES:</h5>
                        <p class="text-xl">${title}</p>
                    </div>
                    <img src="${imageUrl}" class="d-block w-100" alt="${title}">
                </div>`;
            }).join('');
        } else {
            document.getElementById('attractions-section').style.display = 'none';
        }

        // Galería (JSONB)
        // Estructura esperada: ["url1", "url2", ...] o [{url: "..."}]
        const galleryContainer = document.getElementById('gallery-container');
        const validGallery = (branch.gallery && Array.isArray(branch.gallery))
            ? branch.gallery.filter(img => typeof img === 'string' ? img : (img.src || img.url))
            : [];

        if (validGallery.length > 0) {
            galleryContainer.innerHTML = validGallery.map((img, idx) => {
                const url = typeof img === 'string' ? img : (img.src || img.url);
                const altText = typeof img === 'string' ? 'Galería sucursal' : (img.alt || 'Galería sucursal');
                return `
                    <div class="carousel-item ${idx === 0 ? 'active' : ''}" data-bs-interval="3000">
                        <img src="${url}" class="d-block w-100" style="height: 400px; object-fit: contain;" alt="${altText}">
                    </div>`;
            }).join('');
        } else {
            document.getElementById('gallery-section').style.display = 'none';
        }

        // Ocultar sección de imagen destacada (a petición del usuario)
        const featuredSection = document.getElementById('featured-image').closest('section');
        if (featuredSection) {
            featuredSection.style.display = 'none';
        }

        // Mostrar contenido
        loadingScreen.style.display = 'none';
        content.style.display = 'block';

    } catch (error) {
        console.error('Error general:', error);
        loadingScreen.innerHTML = `<h2 class="text-white">Lo sentimos, hubo un error al cargar la información.</h2>`;
    }
}

document.addEventListener('DOMContentLoaded', loadBranchData);
