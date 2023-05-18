// Función para actualizar la URL y recargar la página
function updateURL() {
    const categoryCheckboxes = document.querySelectorAll('#filterFormCategory input[name="categoryFilter[]"]');
    const selectedCategories = [];

    categoryCheckboxes.forEach(checkbox => {
        if (checkbox.checked && checkbox.value !== 'category-all') {
            selectedCategories.push(checkbox.value);
        }
    });

    const brandCheckboxes = document.querySelectorAll('#filterFormBrand input[name="brandFilter[]"]');
    const selectedBrands = [];

    brandCheckboxes.forEach(checkbox => {
        if (checkbox.checked && checkbox.value !== 'brand-all') {
            selectedBrands.push(checkbox.value);
        }
    });

    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);

    if (selectedCategories.length > 0) {
        searchParams.set('categoryFilter', JSON.stringify(selectedCategories));
    } else {
        searchParams.delete('categoryFilter');
    }

    if (selectedBrands.length > 0) {
        searchParams.set('brandFilter', JSON.stringify(selectedBrands));
    } else {
        searchParams.delete('brandFilter');
    }

    url.search = searchParams.toString();
    window.location.href = url.toString();
}

// Evento para escuchar cambios en los checkboxes del formulario de categorías
const categoryCheckboxes = document.querySelectorAll('#filterFormCategory input[name="categoryFilter[]"]');
categoryCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        if (checkbox.value === 'category-all' && checkbox.checked) {
            categoryCheckboxes.forEach(check => {
                if (check !== checkbox) {
                    check.checked = false;
                }
            });
        } else if (!checkbox.checked && document.getElementById('category-all').checked) {
            document.getElementById('category-all').checked = false;
        }

        updateURL();
    });
});

// Evento para escuchar cambios en los checkboxes del formulario de marcas
const brandCheckboxes = document.querySelectorAll('#filterFormBrand input[name="brandFilter[]"]');
brandCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        if (checkbox.value === 'brand-all' && checkbox.checked) {
            brandCheckboxes.forEach(check => {
                if (check !== checkbox) {
                    check.checked = false;
                }
            });
        } else if (!checkbox.checked && document.getElementById('brand-all').checked) {
            document.getElementById('brand-all').checked = false;
        }

        updateURL();
    });
});

// Marcar los checkboxes seleccionados al cargar la página
const urlParams = new URLSearchParams(window.location.search);
const selectedCategories = JSON.parse(urlParams.get('categoryFilter') || '[]');
categoryCheckboxes.forEach(checkbox => {
    if (selectedCategories.includes(checkbox.value)) {
        checkbox.checked = true;
    }
});

const selectedBrands = JSON.parse(urlParams.get('brandFilter') || '[]');
brandCheckboxes.forEach(checkbox => {
    if (selectedBrands.includes(checkbox.value)) {
        checkbox.checked = true;
    }
});

// Marcar el checkbox "Todas las categorías" al cargar la página si no hay otras categorías seleccionadas
if (selectedCategories.length === 0) {
    document.getElementById('category-all').checked = true;
}

// Marcar el checkbox "Todas las marcas" al cargar la página si no hay otras marcas seleccionadas
if (selectedBrands.length === 0) {
    document.getElementById('brand-all').checked = true;
}