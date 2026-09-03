/*
====================================================

    FLOWMANAGER

    COLOR PICKER

====================================================
*/

const ColorPicker = {

    colors: [

        { name: "Morado", value: "#7E57C2" },
        { name: "Azul", value: "#42A5F5" },
        { name: "Verde", value: "#43A047" },
        { name: "Rojo", value: "#E53935" },
        { name: "Naranja", value: "#FB8C00" },
        { name: "Amarillo", value: "#FDD835" },
        { name: "Rosa", value: "#EC407A" },
        { name: "Café", value: "#8D6E63" },
        { name: "Gris", value: "#546E7A" },
        { name: "Turquesa", value: "#26A69A" }

    ],

    create(containerId, selected = "#7E57C2") {

        const container = document.getElementById(containerId);

        if (!container) return;

        container.innerHTML = "";

        const wrapper = document.createElement("div");

        wrapper.className = "fm-colorpicker";

        const grid = document.createElement("div");

        grid.className = "fm-color-grid";

        const info = document.createElement("div");

        info.className = "fm-color-selected";

        const preview = document.createElement("span");

        preview.className = "fm-color-preview";

        const name = document.createElement("span");

        name.className = "fm-color-name";

        info.appendChild(preview);

        info.appendChild(name);

        wrapper.appendChild(grid);

        wrapper.appendChild(info);

        container.appendChild(wrapper);

        this.colors.forEach(color => {

            const option = document.createElement("div");

            option.className = "fm-color-option";

            option.style.background = color.value;

            option.title = color.name;

            if (color.value === selected) {

                option.classList.add("selected");

                preview.style.background = color.value;

                name.textContent = color.name;

                container.dataset.value = color.value;

                container.dataset.name = color.name;

            }

            option.onclick = () => {

                grid.querySelectorAll(".fm-color-option")

                    .forEach(item =>

                        item.classList.remove("selected")

                    );

                option.classList.add("selected");

                preview.style.background = color.value;

                name.textContent = color.name;

                container.dataset.value = color.value;

                container.dataset.name = color.name;

            };

            grid.appendChild(option);

        });

    },

    getValue(containerId) {

        const container = document.getElementById(containerId);

        return {

            name: container.dataset.name,

            value: container.dataset.value

        };

    }

};