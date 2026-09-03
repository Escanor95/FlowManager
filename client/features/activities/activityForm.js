/*
====================================================

    FLOWMANAGER

    ACTIVITY FORM

====================================================
*/

let editingActivity = null;

async function loadActivityForm(activity = null) {

    editingActivity = activity;

    const response = await fetch(

        "features/activities/activityForm.html"

    );

    if (!response.ok) {

        throw new Error(

            "No fue posible cargar el formulario."

        );

    }

    openModal(

        await response.text()

    );

    initializeActivityForm();

}

function initializeActivityForm() {

    ColorPicker.create(

        "activityColor",

        "#7E57C2"

    );

    IconPicker.create(

        "iconPicker",

        "favorite"

    );

    if (editingActivity) {

        loadActivityData();

    }

    initializePreview();

    document

        .getElementById(

            "activityForm"

        )

        .addEventListener(

            "submit",

            saveActivity

        );

    document

        .getElementById(

            "cancelActivity"

        )

        .onclick = closeModal;

}

function initializePreview() {

    const name =

        document.getElementById(

            "className"

        );

    const duration =

        document.getElementById(

            "duration"

        );

    const capacity =

        document.getElementById(

            "capacity"

        );

    name.addEventListener(

        "input",

        updatePreview

    );

    duration.addEventListener(

        "input",

        updatePreview

    );

    capacity.addEventListener(

        "input",

        updatePreview

    );

    const observer = new MutationObserver(

        updatePreview

    );

    observer.observe(

        document.getElementById(

            "activityColor"

        ),

        {

            attributes: true,

            subtree: true,

            childList: true

        }

    );

    observer.observe(

        document.getElementById(

            "iconPicker"

        ),

        {

            attributes: true,

            subtree: true,

            childList: true

        }

    );

    updatePreview();

}

function updatePreview() {

    document.getElementById(

        "previewName"

    ).textContent =

        document.getElementById(

            "className"

        ).value ||

        "Nueva Clase";

    document.getElementById(

        "previewDuration"

    ).textContent =

        (

            document.getElementById(

                "duration"

            ).value || 50

        ) +

        " minutos";

    document.getElementById(

        "previewCapacity"

    ).textContent =

        (

            document.getElementById(

                "capacity"

            ).value || 10

        ) +

        " personas";

    const color =

        ColorPicker.getValue(

            "activityColor"

        );

    if (

        color

    ) {

        document.getElementById(

            "previewColor"

        ).style.background =

            color.value;

    }

    const icon =

        IconPicker.getValue(

            "iconPicker"

        );

    if (

        icon

    ) {

        document.getElementById(

            "previewIcon"

        ).textContent =

            icon;

    }

}

async function loadActivityData() {

    document.getElementById(

        "className"

    ).value =

        editingActivity.name;

    document.getElementById(

        "duration"

    ).value =

        editingActivity.duration;

    document.getElementById(

        "capacity"

    ).value =

        editingActivity.suggestedCapacity;

    document.getElementById(

        "description"

    ).value =

        editingActivity.description || "";

    ColorPicker.setValue(

        "activityColor",

        editingActivity.color

    );

    IconPicker.setValue(

        "iconPicker",

        editingActivity.icon

    );

    updatePreview();

}

async function saveActivity(event) {

    event.preventDefault();

    const validation =

        FlowForm.validate(

            "activityForm",

            [

                {

                    field: "name",

                    validator: FlowValidator.required,

                    message: "Escribe el nombre."

                }

            ]

        );

    if (

        !validation.valid

    ) {

        alert(

            validation.message

        );

        return;

    }

    const data =

        FlowForm.getValues(

            "activityForm"

        );

    data.color =

        ColorPicker

            .getValue(

                "activityColor"

            ).value;

    data.icon =

        IconPicker.getValue(

            "iconPicker"

        );

    try {

        if (

            editingActivity

        ) {

            await ActivityService.update(

                editingActivity.activityId,

                data

            );

        }

        else {

            await ActivityService.create(

                data

            );

        }

        closeModal();

        await window.ActivityModule.refresh();

    }

    catch (error) {

        console.error(

            error

        );

        alert(

            "No fue posible guardar la clase."

        );

    }

}