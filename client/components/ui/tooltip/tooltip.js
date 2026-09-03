/*
====================================================

    FLOWMANAGER

    TOOLTIP

====================================================
*/

const Tooltip = {

    element: null,

    initialize() {

        if (this.element) {

            return;

        }

        this.element = document.createElement("div");

        this.element.className = "fm-tooltip";

        document.body.appendChild(this.element);

    },

    show(html, x, y) {

        this.initialize();

        this.element.innerHTML = html;

        this.element.style.left = `${x + 16}px`;

        this.element.style.top = `${y + 16}px`;

        this.element.classList.add("visible");

    },

    move(x, y) {

        if (!this.element) {

            return;

        }

        this.element.style.left = `${x + 16}px`;

        this.element.style.top = `${y + 16}px`;

    },

    hide() {

        if (!this.element) {

            return;

        }

        this.element.classList.remove("visible");

    }

};