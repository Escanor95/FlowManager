/*
====================================================

    AURA ACCESS PRO

    COACH MODULE

====================================================
*/

class CoachModule extends Module {

    constructor() {

        super(
            "coaches"
        );

    }


    async load() {

        const workspace =
            document.getElementById(
                "workspace"
            );


        workspace.innerHTML =
            await this.loadTemplate(
                "features/coaches/coaches.html"
            );


        await loadCoachesFeature();

    }

}


ModuleFactory.register(
    "coaches",
    CoachModule
);