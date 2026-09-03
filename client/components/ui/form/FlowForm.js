/*
====================================================

    FLOWMANAGER

    FLOW FORM

====================================================
*/

class FlowForm {

    static getValues(formId) {

        const form = document.getElementById(formId);

        if (!form) {

            throw new Error(

                `Formulario '${formId}' no encontrado.`

            );

        }

        const data = {};

        const fields = form.querySelectorAll(

            "[data-field]"

        );

        fields.forEach(field => {

            data[field.dataset.field] =

                FlowField.getValue(

                    field

                );

        });

        return data;

    }

    static setValues(formId, values) {

        const form = document.getElementById(formId);

        if (!form) return;

        const fields = form.querySelectorAll(

            "[data-field]"

        );

        fields.forEach(field => {

            const key = field.dataset.field;

            if (

                values[key] !== undefined

            ) {

                FlowField.setValue(

                    field,

                    values[key]

                );

            }

        });

    }

    static clear(formId) {

        const form = document.getElementById(formId);

        if (!form) return;

        const fields = form.querySelectorAll(

            "[data-field]"

        );

        fields.forEach(field =>

            FlowField.clear(field)

        );

    }

    static validate(formId, rules = []) {

        const values = this.getValues(

            formId

        );

        const validations = [];

        rules.forEach(rule => {

            validations.push({

                value: values[rule.field],

                validator: rule.validator,

                message: rule.message

            });

        });

        return FlowValidator.validate(

            validations

        );

    }

}