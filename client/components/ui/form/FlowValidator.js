/*
====================================================

    FLOWMANAGER

    FLOW VALIDATOR

====================================================
*/

class FlowValidator {

    static required(value) {

        if (

            value === null ||

            value === undefined

        ) {

            return false;

        }

        if (

            typeof value === "string"

        ) {

            return value.trim() !== "";

        }

        return true;

    }

    static email(value) {

        if (

            !this.required(value)

        ) {

            return true;

        }

        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(

            value

        );

    }

    static phone(value) {

        if (

            !this.required(value)

        ) {

            return true;

        }

        return /^[0-9()+\-\s]{7,20}$/.test(

            value

        );

    }

    static number(value) {

        return !isNaN(value);

    }

    static min(value, min) {

        return Number(value) >= min;

    }

    static max(value, max) {

        return Number(value) <= max;

    }

    static positive(value) {

        return Number(value) > 0;

    }

    static validate(rules) {

        for (const rule of rules) {

            const {

                value,

                validator,

                message

            } = rule;

            if (

                !validator(value)

            ) {

                return {

                    valid: false,

                    message

                };

            }

        }

        return {

            valid: true,

            message: ""

        };

    }

}