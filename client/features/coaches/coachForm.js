/*
====================================================

    AURA ACCESS PRO

    COACH FORM

====================================================
*/

function openCoachForm(
    coach = null
) {

    const isEditing =
        Boolean(coach);


    const title =
        isEditing
            ? "Editar coach"
            : "Nuevo coach";


    const content = `

        <form
            id="coachForm"
            class="fm-form"
        >

            <div
                class="fm-form-group"
            >

                <label>
                    Nombre completo
                </label>

                <input
                    type="text"
                    id="coachFullName"
                    value="${escapeCoachHtml(
        coach?.fullName || ""
    )}"
                    required
                >

            </div>


            <div
                class="fm-form-group"
            >

                <label>
                    Teléfono
                </label>

                <input
                    type="tel"
                    id="coachPhone"
                    value="${escapeCoachHtml(
        coach?.phone || ""
    )}"
                >

            </div>


            <div
                class="fm-form-group"
            >

                <label>
                    Correo electrónico
                </label>

                <input
                    type="email"
                    id="coachEmail"
                    value="${escapeCoachHtml(
        coach?.email || ""
    )}"
                >

            </div>


            <div
                class="fm-form-group"
            >

                <label>
                    Pago por clase
                </label>

                <input
                    type="number"
                    id="coachPaymentPerClass"
                    min="0"
                    step="0.01"
                    value="${Number(
        coach?.paymentPerClass || 0
    )}"
                >

            </div>


            <div
                class="fm-form-group"
            >

                <label>
                    Notas
                </label>

                <textarea
                    id="coachNotes"
                    rows="4"
                >${escapeCoachHtml(
        coach?.notes || ""
    )}</textarea>

            </div>


            <div
                class="fm-form-actions"
            >

                <button
                    type="button"
                    id="cancelCoachButton"
                    class="fm-button secondary"
                >

                    Cancelar

                </button>


                <button
                    type="submit"
                    class="fm-button primary"
                >

                    ${isEditing
            ? "Guardar cambios"
            : "Crear coach"
        }

                </button>

            </div>

        </form>

    `;


    Modal.open(
        title,
        content
    );


    const form =
        document.getElementById(
            "coachForm"
        );


    const cancelButton =
        document.getElementById(
            "cancelCoachButton"
        );


    cancelButton?.addEventListener(
        "click",
        () => {

            Modal.close();

        }
    );


    form.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const submitButton =
                form.querySelector(
                    "button[type='submit']"
                );


            const coachData = {

                fullName:
                    document
                        .getElementById(
                            "coachFullName"
                        )
                        .value
                        .trim(),

                phone:
                    document
                        .getElementById(
                            "coachPhone"
                        )
                        .value
                        .trim() || null,

                email:
                    document
                        .getElementById(
                            "coachEmail"
                        )
                        .value
                        .trim() || null,

                paymentPerClass:
                    Number(
                        document
                            .getElementById(
                                "coachPaymentPerClass"
                            )
                            .value
                    ) || 0,

                notes:
                    document
                        .getElementById(
                            "coachNotes"
                        )
                        .value
                        .trim() || null

            };


            submitButton.disabled =
                true;


            try {

                if (isEditing) {

                    await CoachService.update(
                        coach.coachId,
                        coachData
                    );

                }
                else {

                    await CoachService.create(
                        coachData
                    );

                }


                Modal.close();


                await renderCoaches();

            }

            catch (error) {

                alert(
                    error.message
                );

            }

            finally {

                submitButton.disabled =
                    false;

            }

        }
    );

}