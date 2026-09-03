/*
====================================================

    FLOWMANAGER

    CLASS MODULE

====================================================
*/

class ActivityModule extends Module {

    constructor() {

        super("Classes");

        this.selectedActivity = null;

    }

    async open() {

        await this.load(

            "activities/activities"

        );

        this.initialize();

    }

    initialize() {

        this.initializeButtons();

        this.initializeSearch();

        this.refresh();

    }

    async refresh() {

        try {

            const activities =

                await ActivityService.getAll();

            this.renderCards(

                activities

            );

            this.clearProfile();

        }

        catch (error) {

            console.error(error);

        }

    }

    initializeButtons() {

        const button =

            document.getElementById(

                "newActivity"

            );

        if (!button) return;

        button.onclick = () => {

            loadActivityForm();

        };

    }

    initializeSearch() {

        const search =

            document.getElementById(

                "searchActivity"

            );

        if (!search) return;

        search.oninput = async () => {

            const text =

                search.value.trim();

            try {

                const activities =

                    text === ""

                        ? await ActivityService.getAll()

                        : await ActivityService.search(text);

                this.renderCards(

                    activities

                );

            }

            catch (error) {

                console.error(error);

            }

        };

    }

    renderCards(activities) {

        const container =

            document.getElementById(

                "activityResults"

            );

        if (!container) return;

        container.innerHTML = "";

        if (

            activities.length === 0

        ) {

            container.innerHTML = `

                <div class="empty-state">

                    No hay clases registradas.

                </div>

            `;

            return;

        }

        activities.forEach(activity => {

            const card =

                document.createElement(

                    "div"

                );

            card.className =

                "activity-card";

            card.innerHTML = `

                <span
                    class="material-symbols-outlined"
                    style="color:${activity.color}">

                    ${activity.icon}

                </span>

                <div>

                    <strong>

                        ${activity.name}

                    </strong>

                    <br>

                    <small>

                        ${activity.duration} min

                    </small>

                </div>

            `;

            card.onclick = () => {

                this.loadActivity(

                    activity.activityId

                );

            };

            container.appendChild(

                card

            );

        });

    }

    async loadActivity(activityId) {

        try {

            this.selectedActivity =

                await ActivityService.get(

                    activityId

                );

            this.renderProfile();

        }

        catch (error) {

            console.error(error);

        }

    }

    renderProfile() {

        const activity =

            this.selectedActivity;

        if (!activity) return;

        document.getElementById(

            "activityDetails"

        ).innerHTML = `

            <div class="client-profile">

                <span
                    class="material-symbols-outlined"
                    style="
                        font-size:70px;
                        color:${activity.color};
                    ">

                    ${activity.icon}

                </span>

                <h2>

                    ${activity.name}

                </h2>

                <hr>

                <p>

                    <strong>

                        Duración:

                    </strong>

                    ${activity.duration} minutos

                </p>

                <p>

                    <strong>

                        Capacidad sugerida:

                    </strong>

                    ${activity.suggestedCapacity}

                </p>

                <p>

                    <strong>

                        Descripción:

                    </strong>

                    ${activity.description || "-"}

                </p>

                <div class="actions">

                    <button

                        id="editActivity"

                        class="fm-btn fm-btn-primary">

                        Editar

                    </button>

                    <button

                        id="deleteActivity"

                        class="fm-btn">

                        Desactivar

                    </button>

                </div>

            </div>

        `;

        document

            .getElementById(

                "editActivity"

            )

            .onclick = () => {

                loadActivityForm(

                    activity

                );

            };

        document

            .getElementById(

                "deleteActivity"

            )

            .onclick = () => {

                this.deleteActivity();

            };

    }

    async deleteActivity() {

        if (

            !confirm(

                "¿Deseas desactivar esta clase?"

            )

        ) {

            return;

        }

        try {

            await ActivityService.delete(

                this.selectedActivity.activityId

            );

            await this.refresh();

        }

        catch (error) {

            console.error(error);

        }

    }

    clearProfile() {

        document.getElementById(

            "activityDetails"

        ).innerHTML = `

            <div class="empty-state">

                <h2>

                    📚 Clases

                </h2>

                <p>

                    Selecciona una clase.

                </p>

            </div>

        `;

    }

}

window.ActivityModule =

    new ActivityModule();

ModuleFactory.register(

    "activities",

    window.ActivityModule

);