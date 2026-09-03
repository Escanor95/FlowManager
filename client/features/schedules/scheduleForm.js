/*
====================================================

    AURA ACCESS

    SCHEDULE FORM

====================================================
*/

let editingSchedule = null;
let duplicatingSchedule = false;


// ====================================================
// ABRIR FORMULARIO
// ====================================================

async function openScheduleForm(
    schedule = null,
    duplicate = false
) {

    editingSchedule = schedule;

    duplicatingSchedule = duplicate;

    const response = await fetch(
        "features/schedules/scheduleForm.html"
    );

    if (!response.ok) {

        throw new Error(
            "No fue posible cargar el formulario."
        );

    }

    openModal(
        await response.text()
    );

    await initializeScheduleForm();

}


// ====================================================
// INICIALIZAR
// ====================================================

async function initializeScheduleForm() {

    await loadActivities();

    await loadCoaches();


    document.getElementById(
        "activity"
    ).addEventListener(
        "change",
        activityChanged
    );


    initializeRepeatControls();


    document.getElementById(
        "scheduleForm"
    ).addEventListener(
        "submit",
        saveSchedule
    );


    document.getElementById(
        "cancelSchedule"
    ).addEventListener(
        "click",
        closeModal
    );


    // ====================================================
    // DESACTIVAR
    // ====================================================

    const deactivateButton =
        document.getElementById(
            "deactivateSchedule"
        );


    if (
        editingSchedule &&
        !duplicatingSchedule
    ) {

        deactivateButton.addEventListener(
            "click",
            deactivateSchedule
        );

    }

    else {

        deactivateButton.style.display =
            "none";

    }


    // ====================================================
    // CARGAR DATOS
    // ====================================================

    if (editingSchedule) {

        loadScheduleData();

    }

    else {

        activityChanged();

    }

}


// ====================================================
// CONTROLES DE REPETICIÓN
// ====================================================

function initializeRepeatControls() {

    const checkbox =
        document.getElementById(
            "isRecurring"
        );

    const options =
        document.getElementById(
            "repeatOptions"
        );

    const from =
        document.getElementById(
            "repeatFrom"
        );

    const until =
        document.getElementById(
            "repeatUntil"
        );

    const singleDayGroup =
        document.getElementById(
            "singleDayGroup"
        );

    const weekdaySelect =
        document.getElementById(
            "weekday"
        );

    const weekdayChecks =
        document.querySelectorAll(
            'input[name="weekday"]'
        );


    const updateVisibility = () => {

        const enabled =
            checkbox.checked;


        options.style.display =
            enabled
                ? "block"
                : "none";


        singleDayGroup.style.display =
            enabled
                ? "none"
                : "block";


        weekdaySelect.disabled =
            enabled;


        weekdayChecks.forEach(input => {

            input.disabled =
                !enabled;

        });


        from.disabled =
            !enabled;

        until.disabled =
            !enabled;


        if (!enabled) {

            weekdayChecks.forEach(input => {

                input.checked = false;

            });

            from.value = "";

            until.value = "";

        }

    };


    checkbox.addEventListener(
        "change",
        updateVisibility
    );


    if (editingSchedule) {

        checkbox.checked =
            Number(
                editingSchedule.isRecurring
            ) === 1;

        from.value =
            editingSchedule.repeatFrom || "";

        until.value =
            editingSchedule.repeatUntil || "";

    }


    updateVisibility();

}


// ====================================================
// CARGAR ACTIVIDADES
// ====================================================

async function loadActivities() {

    const response = await fetch(
        "/activities/options"
    );

    if (!response.ok) {

        throw new Error(
            "No fue posible obtener las actividades."
        );

    }

    const activities =
        await response.json();


    const select =
        document.getElementById(
            "activity"
        );


    select.innerHTML = "";


    activities.forEach(activity => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            activity.activityId;


        option.textContent =
            activity.name;


        option.dataset.duration =
            activity.duration;


        option.dataset.capacity =
            activity.suggestedCapacity;


        select.appendChild(
            option
        );

    });

}


// ====================================================
// CARGAR COACHES
// ====================================================

async function loadCoaches() {

    const users =
        await UserService.getAll();


    const coaches =
        users.filter(user =>
            user.role === "coach" &&
            Number(user.isActive) === 1
        );


    const select =
        document.getElementById(
            "coach"
        );


    select.innerHTML =
        `<option value="">
            Sin asignar
        </option>`;


    coaches.forEach(coach => {

        const option =
            document.createElement(
                "option"
            );


        option.value =
            coach.coachId ||
            coach.userId;


        option.textContent =
            coach.fullName;


        select.appendChild(
            option
        );

    });

}


// ====================================================
// CAMBIO DE ACTIVIDAD
// ====================================================

function activityChanged() {

    const option =
        document.getElementById(
            "activity"
        ).selectedOptions[0];


    if (!option) {

        return;

    }


    document.getElementById(
        "duration"
    ).value =
        option.dataset.duration;


    document.getElementById(
        "capacity"
    ).value =
        option.dataset.capacity;

}


// ====================================================
// CARGAR DATOS
// ====================================================

function loadScheduleData() {

    FlowForm.setValues(
        "scheduleForm",
        editingSchedule
    );


    const activitySelect =
        document.getElementById(
            "activity"
        );

    activitySelect.value =
        editingSchedule.activityId;


    activityChanged();


    const coachSelect =
        document.getElementById(
            "coach"
        );

    coachSelect.value =
        editingSchedule.coachId || "";


    document.getElementById(
        "weekday"
    ).value =
        editingSchedule.weekday;


    document
        .querySelectorAll(
            'input[name="weekday"]'
        )
        .forEach(input => {

            input.checked =
                input.value ===
                editingSchedule.weekday;

        });

}


// ====================================================
// GUARDAR
// ====================================================

async function saveSchedule(event) {

    event.preventDefault();


    const data =
        FlowForm.getValues(
            "scheduleForm"
        );


    data.coachId =
        document.getElementById(
            "coach"
        ).value || null;


    const isRecurring =
        document.getElementById(
            "isRecurring"
        ).checked;


    data.isRecurring =
        isRecurring
            ? 1
            : 0;


    // ====================================================
    // HORARIO NORMAL
    // ====================================================

    if (!isRecurring) {

        data.repeatRule = null;

        data.repeatFrom = null;

        data.repeatUntil = null;


        try {

            if (
                editingSchedule &&
                !duplicatingSchedule
            ) {

                await ScheduleService.update(
                    editingSchedule.scheduleId,
                    data
                );

            }

            else {

                await ScheduleService.create(
                    data
                );

            }


            closeModal();


            await window.ScheduleModule.refresh();

        }

        catch (error) {

            console.error(error);

            alert(
                error.message
            );

        }

        return;

    }


    // ====================================================
    // HORARIO RECURRENTE
    // ====================================================

    const weekdays = [

        ...document.querySelectorAll(
            'input[name="weekday"]:checked'
        )

    ].map(input => input.value);


    if (weekdays.length === 0) {

        alert(
            "Selecciona al menos un día para repetir."
        );

        return;

    }


    data.repeatRule =
        "WEEKLY";


    data.repeatFrom =
        document.getElementById(
            "repeatFrom"
        ).value || null;


    data.repeatUntil =
        document.getElementById(
            "repeatUntil"
        ).value || null;


    if (
        !data.repeatFrom ||
        !data.repeatUntil
    ) {

        alert(
            "Debes indicar la fecha de inicio y la fecha de fin."
        );

        return;

    }


    try {

        // ====================================================
        // EDITAR
        // ====================================================

        if (
            editingSchedule &&
            !duplicatingSchedule
        ) {

            data.weekday =
                weekdays[0];


            await ScheduleService.update(
                editingSchedule.scheduleId,
                data
            );

        }


        // ====================================================
        // CREAR RECURRENTES
        // ====================================================

        else {

            for (
                const weekday of weekdays
            ) {

                await ScheduleService.create({

                    ...data,

                    weekday

                });

            }

        }


        closeModal();


        await window.ScheduleModule.refresh();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}


// ====================================================
// DESACTIVAR
// ====================================================

async function deactivateSchedule() {

    if (
        !confirm(
            "¿Deseas desactivar este horario?"
        )
    ) {

        return;

    }


    try {

        await ScheduleService.delete(
            editingSchedule.scheduleId
        );


        closeModal();


        await window.ScheduleModule.refresh();

    }

    catch (error) {

        console.error(error);

        alert(
            error.message
        );

    }

}