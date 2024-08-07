document.getElementById('contact-form').addEventListener('submit', function(event) {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    const namePattern = /^[A-Za-z0-9 ]{3,}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!namePattern.test(name)) {
        alert('Nombre inválido. Debe ser alfanumérico y tener al menos 3 caracteres.');
        event.preventDefault();
    } else if (!emailPattern.test(email)) {
        alert('Correo electrónico inválido.');
        event.preventDefault();
    } else if (message.length < 5) {
        
        alert('El mensaje debe tener al menos 5 caracteres.');
        event.preventDefault();
    }
});
