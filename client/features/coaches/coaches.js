/*
====================================================

    AURA ACCESS PRO

    COACHES FEATURE

====================================================
*/

let coachesData = [];


async function loadCoachesFeature() {

    const addButton =
        document.getElementById(
            "addCoachButton"
        );


    if (addButton) {

        addButton.addEventListener(
            "click",
            () => {

                openCoachForm();

            }
        );

    }


    await renderCoaches();

}


// ====================================================
// RENDER
// ====================================================

async function renderCoaches() {

    const container =
        document.getElementById(
            "coachesList"
        );


    if (!container) {

        return;

    }


    container.innerHTML = `

        <div class="fm-loading">

            Cargando coaches...

        </div>

    `;


    try {

        coachesData =
            await CoachService.getAll();


        if (

            !coachesData.length

        ) {

            container.innerHTML = `

                <div class="fm-empty-state">

                    <span class="material-symbols-outlined">

                        person

                    </span>

                    <h3>
                        No hay coaches registrados
                    </h3>

                    <p>
                        Agrega el primer coach para comenzar.
                    </p>

                </div>

            `;

            return;

        }


        container.innerHTML =
            coachesData
                .map(
                    coach =>
                        createCoachCard(
                            coach
                        )
                )
                .join("");


        registerCoachActions();

    }

    catch (error) {

        console.error(error);


        container.innerHTML = `

            <div class="fm-error-state">

                ${error.message}

            </div>

        `;

    }

}


// ====================================================
// CARD
// ====================================================

function createCoachCard(coach) {

    const status =
        Number(coach.isActive) === 1;


    const payment =
        Number(
            coach.paymentPerClass || 0
        ).toLocaleString(
            "es-MX",
            {

                style:
                    "currency",

                currency:
                    "MXN"

            }
        );


    return `

        <article
            class="fm-coach-card"
        >

            <div
                class="fm-coach-card-header"
            >

                <div
                    class="fm-coach-avatar"
                >

                    <span
                        class="material-symbols-outlined"
                    >

                        person

                    </span>

                </div>


                <div
                    class="fm-coach-main"
                >

                    <h3>
                        ${escapeCoachHtml(
        coach.fullName
    )}
                    </h3>

                    <span
                        class="
                            fm-status
                            ${status
            ? "active"
            : "inactive"
        }
                        "
                    >

                        ${status
            ? "Activo"
            : "Inactivo"
        }

                    </span>

                </div>


                <div
                    class="fm-coach-actions"
                >

                    <button
                        class="fm-icon-button edit-coach-button"
                        data-coach-id="${coach.coachId}"
                        title="Editar coach"
                    >

                        <span
                            class="material-symbols-outlined"
                        >

                            edit

                        </span>

                    </button>

                </div>

            </div>


            <div
                class="fm-coach-info"
            >

                <div>

                    <span>
                        Teléfono
                    </span>

                    <strong>
                        ${coach.phone ||
        "No registrado"
        }
                    </strong>

                </div>


                <div>

                    <span>
                        Correo
                    </span>

                    <strong>
                        ${coach.email ||
        "No registrado"
        }
                    </strong>

                </div>


                <div>

                    <span>
                        Pago por clase
                    </span>

                    <strong>
                        ${payment}
                    </strong>

                </div>

            </div>


            <div
                class="fm-coach-card-footer"
            >

                <button
                    class="
                        fm-coach-status-button
                        ${status
            ? "deactivate"
            : "activate"
        }
                    "
                    data-coach-id="${coach.coachId}"
                >

                    ${status
            ? "Desactivar"
            : "Activar"
        }

                </button>

            </div>

        </article>

    `;

}


// ====================================================
// ACTIONS
// ====================================================

function registerCoachActions() {

    const editButtons =
        document.querySelectorAll(
            ".edit-coach-button"
        );


    editButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const coach =
                        coachesData.find(
                            item =>
                                item.coachId ===
                                button.dataset.coachId
                        );


                    if (coach) {

                        openCoachForm(
                            coach
                        );

                    }

                }
            );

        }
    );


    const statusButtons =
        document.querySelectorAll(
            ".fm-coach-status-button"
        );


    statusButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const coachId =
                        button.dataset.coachId;


                    const coach =
                        coachesData.find(
                            item =>
                                item.coachId ===
                                coachId
                        );


                    if (!coach) {

                        return;

                    }


                    try {

                        if (

                            Number(
                                coach.isActive
                            ) === 1

                        ) {

                            const confirmed =
                                confirm(
                                    `¿Deseas desactivar a ${coach.fullName}?`
                                );


                            if (!confirmed) {

                                return;

                            }


                            await CoachService.deactivate(
                                coachId
                            );

                        }
                        else {

                            await CoachService.activate(
                                coachId
                            );

                        }


                        await renderCoaches();

                    }

                    catch (error) {

                        alert(
                            error.message
                        );

                    }

                }
            );

        }
    );

}


// ====================================================
// ESCAPE HTML
// ====================================================

function escapeCoachHtml(value) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        value || "";


    return element.innerHTML;

}