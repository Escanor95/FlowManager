/*
====================================================

    FLOWMANAGER

    FLOW FIELD

====================================================
*/

class FlowField {

    static getValue(element) {

        if (!element) {

            return null;

        }

        // ==========================
        // INPUT
        // ==========================

        if (

            element.tagName === "INPUT"

        ) {

            if (

                element.type === "checkbox"

            ) {

                return element.checked;

            }

            return element.value;

        }

        // ==========================
        // TEXTAREA
        // ==========================

        if (

            element.tagName === "TEXTAREA"

        ) {

            return element.value;

        }

        // ==========================
        // SELECT
        // ==========================

        if (

            element.tagName === "SELECT"

        ) {

            return element.value;

        }

        // ==========================
        // COMPONENTES FLOW
        // ==========================

        if (

            element.dataset.component === "ColorPicker"

        ) {

            return ColorPicker.getValue(

                element.id

            );

        }

        if (

            element.dataset.component === "IconPicker"

        ) {

            return IconPicker.getValue(

                element.id

            );

        }

        return null;

    }

    static setValue(

        element,

        value

    ) {

        if (!element) return;

        if (

            element.tagName === "INPUT" ||

            element.tagName === "TEXTAREA" ||

            element.tagName === "SELECT"

        ) {

            element.value = value;

            return;

        }

        if (

            element.dataset.component === "ColorPicker"

        ) {

            ColorPicker.setValue(

                element.id,

                value

            );

        }

        if (

            element.dataset.component === "IconPicker"

        ) {

            IconPicker.setValue(

                element.id,

                value

            );

        }

    }

    static clear(element) {

        if (!element) return;

        if (

            element.tagName === "INPUT" ||

            element.tagName === "TEXTAREA"

        ) {

            element.value = "";

        }

    }

}