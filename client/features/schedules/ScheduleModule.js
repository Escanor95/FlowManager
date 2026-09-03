/*
====================================================

    FLOWMANAGER

    SCHEDULE MODULE

====================================================
*/

class ScheduleModule extends Module {

    constructor() {

        super("Schedules");

    }

    async open() {

        await this.load(

            "schedules/schedules"

        );

        this.initialize();

    }

    initialize() {

        this.refresh();

    }

    async refresh() {

        await initializeSchedules();

    }

}

window.ScheduleModule =

    new ScheduleModule();

ModuleFactory.register(

    "schedules",

    window.ScheduleModule

);