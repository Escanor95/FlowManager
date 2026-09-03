const ActivityService = {

    async getAll() {

        const response = await fetch("/activities");

        if (!response.ok) {

            throw new Error(

                "No fue posible obtener las actividades."

            );

        }

        return await response.json();

    },

    async get(activityId) {

        const response = await fetch(

            `/activities/${activityId}`

        );

        if (!response.ok) {

            throw new Error(

                "No fue posible obtener la actividad."

            );

        }

        return await response.json();

    },

    async search(query) {

        const response = await fetch(

            `/activities/search/${query}`

        );

        if (!response.ok) {

            throw new Error(

                "No fue posible buscar."

            );

        }

        return await response.json();

    },

    async create(activity) {

        const response = await fetch(

            "/activities",

            {

                method: "POST",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(activity)

            }

        );

        if (!response.ok) {

            throw new Error(

                "No fue posible crear."

            );

        }

        return await response.json();

    },

    async update(activityId, activity) {

        const response = await fetch(

            `/activities/${activityId}`,

            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json"

                },

                body: JSON.stringify(activity)

            }

        );

        if (!response.ok) {

            throw new Error(

                "No fue posible actualizar."

            );

        }

        return await response.json();

    },

    async delete(activityId) {

        const response = await fetch(

            `/activities/${activityId}`,

            {

                method: "DELETE"

            }

        );

        if (!response.ok) {

            throw new Error(

                "No fue posible desactivar."

            );

        }

        return await response.json();

    }

};