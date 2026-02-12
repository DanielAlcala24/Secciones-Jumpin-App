// Configuración de Supabase
const SUPABASE_URL = 'https://pcxunmtwgfechivixjkc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeHVubXR3Z2ZlY2hpdml4amtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODA5NDksImV4cCI6MjA3OTA1Njk0OX0.j-ZVavdVP3w6nFjIukMa_pSWwUhYH6FsRBHwvhCz2Jo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadMenu() {
    const container = document.getElementById('menu-container');

    try {
        // 1. Obtener categorías
        const { data: categories, error: catError } = await supabaseClient
            .from('menu_categories')
            .select('*')
            .order('order_index', { ascending: true });

        if (catError) throw catError;

        // 2. Obtener items
        const { data: items, error: itemError } = await supabaseClient
            .from('menu_items')
            .select('*')
            .order('order_index', { ascending: true });

        if (itemError) throw itemError;

        if (!categories || categories.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No hay categorías configuradas.</div>';
            return;
        }

        container.innerHTML = ''; // Limpiar el spinner

        // 3. Generar secciones por categoría
        categories.forEach((category, catIndex) => {
            const categoryItems = items.filter(item => item.category === category.name);

            if (categoryItems.length === 0) return; // No mostrar categorías vacías

            const sectionId = `carousel-${category.name.replace(/\s+/g, '-').toLowerCase()}`;

            const sectionHtml = `
                <section class="combos-container">
                    <h2>${category.name.toUpperCase()}</h2>
                    <div id="${sectionId}" class="carousel slide">
                        <!-- Flechas de navegación -->
                        <button class="carousel-control-prev" style="left: -15px; top: -100px;" type="button" 
                            data-bs-target="#${sectionId}" data-bs-slide="prev">
                            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Previous</span>
                        </button>
                        <button class="carousel-control-next" style="right: -15px; top: -100px;" type="button" 
                            data-bs-target="#${sectionId}" data-bs-slide="next">
                            <span class="carousel-control-next-icon" aria-hidden="true"></span>
                            <span class="visually-hidden">Next</span>
                        </button>
                        <!-- Contenido del carrusel -->
                        <div class="carousel-inner">
                            ${categoryItems.map((item, index) => `
                                <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                    <img src="${item.image_url}" class="d-block w-100" alt="${item.image_hint || item.title}">
                                    <div class="carousel-caption d-md-block">
                                        <h5>${item.title.toUpperCase()}</h5>
                                        ${item.description ? `<p>${item.description}</p><br>` : ''}
                                        <p class="precio text-4xl price-font" style="padding: 5px 10px 5px 10px;">${item.price}</p>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </section>
            `;
            container.innerHTML += sectionHtml;
        });

    } catch (error) {
        console.error('Error al cargar el menú:', error);
        container.innerHTML = '<div class="alert alert-danger">Error al cargar el menú. Por favor, intenta más tarde.</div>';
    }
}

// Cargar el menú cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadMenu);
