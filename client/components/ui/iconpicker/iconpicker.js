/*
====================================================

    FLOWMANAGER

    ICON PICKER

====================================================
*/

const IconPicker = {

    icons: [

        {
            name: "Pilates",
            value: "favorite"
        },

        {
            name: "Sculpt",
            value: "fitness_center"
        },

        {
            name: "GAP",
            value: "directions_run"
        },

        {
            name: "Barre",
            value: "accessibility_new"
        },

        {
            name: "Spinning",
            value: "directions_bike"
        },

        {
            name: "Zumba Strong",
            value: "music_note"
        },

	{
    	    name: "Step",
            value: "directions_walk"
	},

        {
            name: "Jumping",
            value: "fitness_center"
        },

        {
            name: "Masajes",
            value: "spa"
        },

        {
            name: "Faciales",
            value: "face"
        },

        {
            name: "Uñas",
            value: "back_hand"
        },

        {
            name: "Pestañas",
            value: "visibility"
        },

        {
            name: "Nutrióloga",
            value: "restaurant_menu"
        }

    ],

    create(

        containerId,

        selected = "favorite"

    ) {

        const container =

            document.getElementById(

                containerId

            );

        if (!container) {

            return;

        }

        container.dataset.component = "IconPicker";

        container.innerHTML = "";

        const wrapper = document.createElement(

            "div"

        );

        wrapper.className = "fm-iconpicker";

        const grid = document.createElement(

            "div"

        );

        grid.className = "fm-icon-grid";

        wrapper.appendChild(

            grid

        );

        container.appendChild(

            wrapper

        );

        this.icons.forEach(icon => {

            const option = document.createElement(

                "div"

            );

            option.className = "fm-icon-option";

            option.innerHTML = `

                <span class="material-symbols-outlined">

                    ${icon.value}

                </span>

                <span>

                    ${icon.name}

                </span>

            `;

            if (

                icon.value === selected

            ) {

                option.classList.add(

                    "selected"

                );

                container.dataset.value =

                    icon.value;

            }

            option.onclick = () => {

                grid

                    .querySelectorAll(

                        ".fm-icon-option"

                    )

                    .forEach(item =>

                        item.classList.remove(

                            "selected"

                        )

                    );

                option.classList.add(

                    "selected"

                );

                container.dataset.value =

                    icon.value;

            };

            grid.appendChild(

                option

            );

        });

    },

    getValue(

        containerId

    ) {

        const container =

            document.getElementById(

                containerId

            );

        return container.dataset.value;

    },

    setValue(

        containerId,

        value

    ) {

        this.create(

            containerId,

            value

        );

    },

    clear(

        containerId

    ) {

        this.create(

            containerId

        );

    }

};
