/*
====================================================

    AURA WELLNESS PWA

    LOGIN PAGE

====================================================
*/


function renderLoginPage() {

    return `

        <section
            class="login-page"
        >

            <div
                class="aura-brand"
            >

                <img
                    src="/assets/logo.png"
                    alt="Aura Wellness"
                    class="aura-brand-logo"
                >

                <div
                    class="aura-brand-name"
                >

                    AURA WELLNESS

                </div>

            </div>


            <div
                class="login-heading"
            >

                <h1>
                    Bienvenido
                </h1>

                <p>
                    Inicia sesión para continuar
                </p>

            </div>


            <form
                id="loginForm"
                class="login-form"
            >

                <div
                    class="input-wrapper"
                >

                    <i
                        class="
                            fa-regular
                            fa-envelope
                        "
                    ></i>


                    <input

                        type="email"

                        id="loginEmail"

                        name="email"

                        placeholder="Correo electrónico"

                        autocomplete="email"

                        required

                    >

                </div>


                <div
                    class="input-wrapper password-wrapper"
                >

                    <i
                        class="
                            fa-solid
                            fa-lock
                        "
                    ></i>


                    <input

                        type="password"

                        id="loginPassword"

                        name="password"

                        placeholder="Contraseña"

                        autocomplete="current-password"

                        required

                    >


                    <button

                        type="button"

                        id="togglePassword"

                        class="password-toggle"

                        aria-label="Mostrar contraseña"

                    >

                        <i
                            class="
                                fa-regular
                                fa-eye
                            "
                        ></i>

                    </button>

                </div>


                <div
                    class="login-options"
                >

                    <label
                        class="remember-label"
                    >

                        <input
                            type="checkbox"
                            id="rememberMe"
                        >

                        <span
                            class="custom-checkbox"
                        ></span>


                        <span>
                            Recordarme
                        </span>

                    </label>


                    <button

                        type="button"

                        class="forgot-password"

                    >

                        ¿Olvidaste tu contraseña?

                    </button>

                </div>


                <button

                    type="submit"

                    id="loginButton"

                    class="
                        button
                        button-primary
                    "

                >

                    Iniciar sesión

                </button>

            </form>

        </section>

    `;

}


/*
====================================================

    ENVIAR LOGIN

====================================================
*/

async function handleLogin(
    event
) {

    event.preventDefault();


    console.log(
        "Intentando iniciar sesión..."
    );


    const emailInput =
        document.getElementById(
            "loginEmail"
        );


    const passwordInput =
        document.getElementById(
            "loginPassword"
        );


    const loginButton =
        document.getElementById(
            "loginButton"
        );


    const email =
        emailInput
            .value
            .trim()
            .toLowerCase();


    const password =
        passwordInput
            .value;


    /*
    ================================================

        VALIDACIÓN

    ================================================
    */

    if (
        !email ||
        !password
    ) {

        alert(
            "Ingresa tu correo y contraseña."
        );

        return;

    }


    /*
    ================================================

        ESTADO DEL BOTÓN

    ================================================
    */

    loginButton.disabled =
        true;


    loginButton.innerHTML = `

        <i
            class="
                fa-solid
                fa-spinner
                fa-spin
            "
        ></i>

        Iniciando sesión...

    `;


    try {

        /*
        ============================================

            PETICIÓN AL SERVIDOR

        ============================================
        */

        const response =
            await fetch(

                "/auth/login",

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            email:
                                email,

                            password:
                                password

                        })

                }

            );


        /*
        ============================================

            RESPUESTA

        ============================================
        */

        const data =
            await response.json();


        console.log(
            "Respuesta del servidor:",
            data
        );


        /*
        ============================================

            ERROR

        ============================================
        */

        if (
            !response.ok
        ) {

            throw new Error(

                data.message ||
                "No fue posible iniciar sesión."

            );

        }


        /*
        ============================================

            GUARDAR TOKEN

        ============================================
        */

        localStorage.setItem(

            "auraToken",

            data.token

        );


        /*
        ============================================

            GUARDAR USUARIO

        ============================================
        */

        localStorage.setItem(

            "auraUser",

            JSON.stringify(
                data.user
            )

        );


        /*
        ============================================

            ACTUALIZAR APP STATE

        ============================================
        */

        AppState.user =
            data.user;


        /*
        ============================================

            ENTRAR

        ============================================
        */

        navigateTo(
            "home"
        );

    }

    catch (
    error
    ) {

        console.error(
            "LOGIN ERROR:",
            error
        );


        alert(
            error.message ||
            "No fue posible iniciar sesión."
        );


        loginButton.disabled =
            false;


        loginButton.innerHTML = `

            Iniciar sesión

        `;

    }

}


/*
====================================================

    MOSTRAR / OCULTAR CONTRASEÑA

====================================================
*/

function togglePassword() {

    const passwordInput =
        document.getElementById(
            "loginPassword"
        );


    const passwordEye =
        document.getElementById(
            "passwordEye"
        );


    if (
        !passwordInput ||
        !passwordEye
    ) {

        return;

    }


    const isPassword =

        passwordInput.type ===
        "password";


    passwordInput.type =

        isPassword

            ? "text"

            : "password";


    passwordEye.className =

        isPassword

            ? "fa-regular fa-eye-slash"

            : "fa-regular fa-eye";

}