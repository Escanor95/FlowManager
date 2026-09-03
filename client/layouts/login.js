/*
====================================================

    FLOWMANAGER

    LOGIN

====================================================
*/

async function initializeLogin() {

    const form =
        document.getElementById(
            "loginForm"
        );

    const errorContainer =
        document.getElementById(
            "loginError"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const email =
                document
                    .getElementById("loginEmail")
                    .value
                    .trim();


            const password =
                document
                    .getElementById("loginPassword")
                    .value;


            const button =
                form.querySelector(
                    "button[type='submit']"
                );


            errorContainer.hidden =
                true;


            button.disabled =
                true;

            button.textContent =
                "Iniciando sesión...";


            try {

                await AuthService.login(
                    email,
                    password
                );


                window.location.reload();

            }

            catch (error) {

                errorContainer.textContent =
                    error.message;

                errorContainer.hidden =
                    false;

            }

            finally {

                button.disabled =
                    false;

                button.textContent =
                    "Iniciar sesión";

            }

        }
    );

}


window.initializeLogin =
    initializeLogin;