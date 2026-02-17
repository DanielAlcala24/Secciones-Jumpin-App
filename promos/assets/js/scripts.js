// Configuración de Supabase
// REEMPLAZA ESTOS VALORES CON TUS CREDENCIALES DE SUPABASE
const SUPABASE_URL = 'https://pcxunmtwgfechivixjkc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjeHVubXR3Z2ZlY2hpdml4amtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODA5NDksImV4cCI6MjA3OTA1Njk0OX0.j-ZVavdVP3w6nFjIukMa_pSWwUhYH6FsRBHwvhCz2Jo';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function loadPromos() {
    const container = document.getElementById('promo-container');

    try {
        const { data: promos, error } = await supabaseClient
            .from('promotions') // Nombre de la tabla actualizado a 'promotions'
            .select('*')
            .order('order_index', { ascending: true });

        if (error) throw error;

        if (!promos || promos.length === 0) {
            container.innerHTML = '<div class="alert alert-info">No hay promociones disponibles en este momento.</div>';
            return;
        }

        container.innerHTML = ''; // Limpiar el spinner

        promos.forEach((promo, index) => {
            const isActive = index === 0 ? 'active' : '';
            // Usar la descripción de la BD o el texto legal por defecto si está vacía
            const description = promo.description || 'ESTAS PROMOCIONES APLICAN SOBRE PRECIO DE LISTA, NO APLICAN SOBRE ACCESO GENERAL, NO INCLUYEN CALCETINES ANTIDERRAPANTES';

            const carouselItem = `
                <div class="carousel-item ${isActive}">
                    <img src="${promo.image_url}" class="d-block w-100" alt="${promo.image_hint || promo.title}">
                    <div class="carousel-caption d-md-block">
                        <h5 class="fw-bold">${promo.title}</h5>
                        <p style="font-size: 0.9rem;">${description}</p>
                    </div>
                </div>
            `;
            container.innerHTML += carouselItem;
        });

    } catch (error) {
        console.error('Error al cargar promos:', error);
        container.innerHTML = '<div class="alert alert-danger">Error al cargar las promociones. Por favor, intenta más tarde.</div>';
    }
}

// Cargar las promos cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', loadPromos);
