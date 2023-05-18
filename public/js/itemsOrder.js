function buildOrderURL(order) {
    const url = new URL(window.location.href);
    const searchParams = new URLSearchParams(url.search);
  
    // Eliminar cualquier opción de ordenamiento existente
    searchParams.delete('order');
  
    // Establecer la nueva opción de ordenamiento en la URL
    searchParams.set('order', order);
  
    url.search = searchParams.toString();
    window.location.href = url.toString();
  }
  
  // Leer la URL actual y agregar el icono a la opción de orden seleccionada
  const currentURL = window.location.href;

  if (currentURL.includes('order=name')) {
    document.getElementById('orderName').innerHTML += ' <i class="fas fa-check-square text-primary"></i>';
  } else if (currentURL.includes('order=popular')) {
    document.getElementById('orderPopular').innerHTML += ' <i class="fas fa-check-square text-primary"></i>';
  } else if (currentURL.includes('order=lowPrice')) {
    document.getElementById('orderLowPrice').innerHTML += ' <i class="fas fa-check-square text-primary"></i>';
  } else if (currentURL.includes('order=highPrice')) {
    document.getElementById('orderHighPrice').innerHTML += ' <i class="fas fa-check-square text-primary"></i>';
  }