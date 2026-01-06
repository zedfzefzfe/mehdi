// Element selectors
let theme_btn = document.querySelector(".theme") // theme button
let logo = document.querySelectorAll(".logo") // logo images
let side_menu = document.querySelector("nav") // side nav
let side_menu_btn = document.querySelector(".burger") // burger button
let header = document.querySelector("header") // page header
let main = document.querySelector("main")
let footer = document.querySelector("footer")
let nav_ele = document.querySelectorAll("nav a") // nav links
let up_btn = document.querySelector(".to-up") // scroll to top button

// Initialize theme from localStorage
if (localStorage.theme == "light") {
    document.body.classList.remove("dark")
    pic_theme()
    theme_btn.classList.remove("fi-rc-moon")
    theme_btn.classList.add("fi-rs-brightness")
} else {
    document.body.classList.add("dark")
    pic_theme()
    theme_btn.classList.add("fi-rc-moon")
    theme_btn.classList.remove("fi-rs-brightness")
}

// Update logos based on theme
function pic_theme() {
    if (document.body.classList.contains("dark")) {
        logo.forEach(logo => {
            logo.src = "images/logo/logo.webp" // light logo
        })
    } else {
        logo.forEach(logo => {
            logo.src = "images/logo/logo-alt.webp" // dark logo
        })
    }
}

// Toggle theme on click and save choice
theme_btn.addEventListener("click", () => {
    document.body.classList.toggle("dark") // flip theme
    theme_btn.classList.toggle("fi-rc-moon") // toggle icon class
    theme_btn.classList.toggle("fi-rs-brightness") // toggle icon class
    pic_theme() // update logos
    if (document.body.classList.contains("dark")) {
        localStorage.theme = "dark" // persist choice
    } else {
        localStorage.theme = "light" // persist choice
    }
})

// scroll to top
up_btn.addEventListener("click", () => {
    window.scrollTo(0, 0)
})

// Highlight active nav link on click
nav_ele.forEach(ele => {
    ele.addEventListener("click", () => {
        nav_ele.forEach(a => {
            a.classList.remove("active")
        })
        ele.classList.add("active")
        // Only toggle menu if it's open (mobile view)
        if (side_menu.classList.contains("max-lg:left-0")) {
            side_menu_toggle()
        }
    })
})

// open/close side menu (mobile)
side_menu_btn.addEventListener("click", side_menu_toggle)

function side_menu_toggle() {
    side_menu.classList.toggle("max-lg:-left-full")
    side_menu.classList.toggle("max-lg:left-0")
    main.classList.toggle("blur-md")
    footer.classList.toggle("blur-md")
}

// header style on scroll
function HeaderEffect() {
    if (window.pageYOffset > 10) {
        header.classList.add("backdrop-blur-sm", "shadow-md", "dark:bg-header-overlay")
    } else {
        header.classList.remove("backdrop-blur-sm", "shadow-md", "dark:bg-header-overlay")
    }
}

HeaderEffect()

window.addEventListener('scroll', HeaderEffect) // run on scroll

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoading = document.getElementById('btnLoading');
    const formStatus = document.getElementById('formStatus');

    // Validation en temps réel
    const fields = {
        name: {
            element: document.getElementById('name'),
            error: document.getElementById('name-error'),
            validator: (value) => {
                if (!value.trim()) return "Le nom est obligatoire";
                if (value.trim().length < 2) return "Le nom doit contenir au moins 2 caractères";
                if (value.length > 255) return "Le nom ne peut pas dépasser 255 caractères";
                if (!/^[a-zA-ZÀ-ÿ\s\-']+$/u.test(value)) return "Le nom contient des caractères invalides";
                return null;
            }
        },
        email: {
            element: document.getElementById('email'),
            error: document.getElementById('email-error'),
            validator: (value) => {
                if (!value.trim()) return "L'email est obligatoire";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Format d'email invalide";
                if (value.length > 255) return "L'email ne peut pas dépasser 255 caractères";
                return null;
            }
        },
        phone: {
            element: document.getElementById('phone'),
            error: document.getElementById('phone-error'),
            validator: (value) => {
                if (value && !/^[+]?[\d\s\-()]{8,20}$/.test(value)) return "Format de téléphone invalide";
                return null;
            }
        },
        service: {
            element: document.getElementById('service'),
            error: document.getElementById('service-error'),
            validator: (value) => {
                if (!value) return "Veuillez sélectionner un service";
                return null;
            }
        },
        message: {
            element: document.getElementById('message'),
            error: document.getElementById('message-error'),
            validator: (value) => {
                if (!value.trim()) return "Le message est obligatoire";
                if (value.trim().length < 10) return "Le message doit contenir au moins 10 caractères";
                if (value.length > 2000) return "Le message ne peut pas dépasser 2000 caractères";
                return null;
            }
        }
    };

    // Fonction de validation d'un champ
    function validateField(fieldName) {
        const field = fields[fieldName];
        const value = field.element.value;
        const error = field.validator(value);

        if (error) {
            field.error.textContent = error;
            field.error.classList.remove('hidden');
            field.element.classList.add('border-red-500');
            field.element.classList.remove('border-gray-200', 'dark:border-gray-600');
            return false;
        } else {
            field.error.textContent = '';
            field.error.classList.add('hidden');
            field.element.classList.remove('border-red-500');
            field.element.classList.add('border-gray-200', 'dark:border-gray-600');
            return true;
        }
    }

    // Validation en temps réel
    Object.keys(fields).forEach(fieldName => {
        const field = fields[fieldName];
        field.element.addEventListener('blur', () => validateField(fieldName));
        field.element.addEventListener('input', () => {
            if (fieldName === 'message') {
                document.getElementById('message-count').textContent = field.element.value.length;
            }
            // Validation immédiate pour les champs simples
            if (fieldName === 'name' || fieldName === 'email' || fieldName === 'phone') {
                validateField(fieldName);
            }
        });
    });

    // Gestion des messages de statut
    function showStatus(message, type = 'info') {
        formStatus.textContent = message;
        formStatus.classList.remove('hidden');

        // Styles selon le type
        if (type === 'success') {
            formStatus.className = 'p-4 rounded-xl border-2 bg-green-50 border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200';
        } else if (type === 'error') {
            formStatus.className = 'p-4 rounded-xl border-2 bg-red-50 border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200';
        } else {
            formStatus.className = 'p-4 rounded-xl border-2 bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200';
        }

        // Auto-cacher après 8 secondes pour les succès
        if (type === 'success') {
            setTimeout(() => {
                formStatus.classList.add('hidden');
            }, 8000);
        }
    }

    function hideStatus() {
        formStatus.classList.add('hidden');
    }

    // Soumission du formulaire
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Validation de tous les champs
        let isValid = true;
        Object.keys(fields).forEach(fieldName => {
            if (!validateField(fieldName)) {
                isValid = false;
            }
        });

        if (!isValid) {
            showStatus('Veuillez corriger les erreurs dans le formulaire.', 'error');
            return;
        }

        // Désactivation du bouton et affichage du loading
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoading.classList.remove('hidden');
        hideStatus();

        // Préparation des données
        const formData = {
            name: fields.name.element.value.trim(),
            email: fields.email.element.value.trim(),
            phone: fields.phone.element.value.trim(),
            service: fields.service.element.value,
            message: fields.message.element.value.trim()
        };

        try {
            // Envoi de la requête
            const response = await fetch('contact.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                showStatus(result.message, 'success');
                form.reset();
                // Réinitialiser les compteurs et styles
                document.getElementById('message-count').textContent = '0';

                Object.keys(fields).forEach(fieldName => {
                    fields[fieldName].error.classList.add('hidden');
                    fields[fieldName].element.classList.remove('border-red-500');
                    fields[fieldName].element.classList.add('border-gray-200', 'dark:border-gray-600');
                });

                // Scroll vers le message de succès
                formStatus.scrollIntoView({ behavior: 'smooth', block: 'center' });

            } else {
                showStatus(result.message, 'error');

                // Affichage des erreurs de validation si présentes
                if (result.data && result.data.errors) {
                    Object.keys(result.data.errors).forEach(fieldName => {
                        if (fields[fieldName]) {
                            fields[fieldName].error.textContent = result.data.errors[fieldName];
                            fields[fieldName].error.classList.remove('hidden');
                            fields[fieldName].element.classList.add('border-red-500');
                        }
                    });
                }
            }

        } catch (error) {
            console.error('Erreur:', error);
            showStatus('❌ Une erreur réseau s\'est produite. Veuillez vérifier votre connexion et réessayer.', 'error');
        } finally {
            // Réactivation du bouton
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoading.classList.add('hidden');
        }
    });


    // Initialisation du compteur de caractères
    document.getElementById('message-count').textContent = '0';
});