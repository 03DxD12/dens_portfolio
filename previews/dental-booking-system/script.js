document.addEventListener('DOMContentLoaded', function() {
    const authForm = document.getElementById('authForm');
    const authMessage = document.getElementById('authMessage');

    authForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const formData = new FormData(authForm);

        fetch('auth.php', {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            authMessage.textContent = data;
            authMessage.style.display = 'block';
            if (data.includes('successfully')) {
                authMessage.classList.add('success');
                authMessage.classList.remove('error');
            } else {
                authMessage.classList.add('error');
                authMessage.classList.remove('success');
            }
            authForm.reset(); // Reset the form after submission
        })
        .catch(error => {
            console.error('Error:', error);
            authMessage.classList.add('error');
            authMessage.classList.remove('success');
            authMessage.textContent = 'An error occurred. Please try again.';
            authMessage.style.display = 'block';
        });
    });
});
