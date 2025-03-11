const form = document.getElementById('form');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const password = document.getElementById('password');
const password2 = document.getElementById('password2');

form.addEventListener('submit', async e => {
    e.preventDefault();
    if (validateInputs()) {
        const userData = {
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            password: password.value.trim()
        };

        console.log(userData);
        
        // try {
        //     const response = await fetch('https://tu-api.com/register', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json'
        //         },
        //         body: JSON.stringify(userData)
        //     });
            
        //     if (response.ok) {
        //         alert('Registro exitoso');
        //         form.reset();
        //     } else {
        //         const errorData = await response.json();
        //         alert(`Error: ${errorData.message}`);
        //     }
        // } catch (error) {
        //     alert('Hubo un error al conectar con el servidor');
        // }
    }
});

const setError = (element, message) => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = message;
    inputControl.classList.add('error');
    inputControl.classList.remove('success');
};

const setSuccess = element => {
    const inputControl = element.parentElement;
    const errorDisplay = inputControl.querySelector('.error');

    errorDisplay.innerText = '';
    inputControl.classList.add('success');
    inputControl.classList.remove('error');
};

const isValidEmail = email => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

const validateInputs = () => {
    let isValid = true;
    
    if (firstName.value.trim() === '') {
        setError(firstName, 'El nombre es obligatorio.');
        isValid = false;
    } else {
        setSuccess(firstName);
    }

    if (lastName.value.trim() === '') {
        setError(lastName, 'El apellido es obligatorio.');
        isValid = false;
    } else {
        setSuccess(lastName);
    }

    if (email.value.trim() === '') {
        setError(email, 'El correo electrónico es obligatorio.');
        isValid = false;
    } else if (!isValidEmail(email.value.trim())) {
        setError(email, 'El correo electrónico no tiene un formato válido.');
        isValid = false;
    } else {
        setSuccess(email);
    }

    if (password.value.trim() === '') {
        setError(password, 'La contraseña es obligatoria.');
        isValid = false;
    } else if (password.value.trim().length < 8) {
        setError(password, 'La contraseña debe tener al menos 8 caracteres.');
        isValid = false;
    } else {
        setSuccess(password);
    }

    if (password2.value.trim() === '') {
        setError(password2, 'La confirmación de la contraseña es obligatoria.');
        isValid = false;
    } else if (password2.value.trim() !== password.value.trim()) {
        setError(password2, 'Las contraseñas no coinciden.');
        isValid = false;
    } else {
        setSuccess(password2);
    }

    return isValid;
};
