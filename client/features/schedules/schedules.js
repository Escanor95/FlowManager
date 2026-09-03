/*
====================================================
    FLOWMANAGER

    SCHEDULES
====================================================
*/

let scheduleCalendar = null;

async function initializeSchedules() {

    initializeButtons();

    initializeScheduleCalendar();

    await refreshSchedules();

}

function initializeScheduleCalendar() {

    scheduleCalendar = new FlowCalendar({

        container: "#scheduleCalendarNavigation",

        viewMode: "week",

        showViewSwitcher: false,

        showDateGrid: false,

        onViewChange: ({ range }) => {

            refreshScheduleBoard(range);

        }

    });

}

async function refreshSchedules() {

    try {

        const schedules =
            await ScheduleService.getAll();

        window.currentSchedules = schedules;

        refreshScheduleBoard(
            scheduleCalendar.getRange()
        );

    }

    catch (error) {

        console.error(error);

    }

}

function refreshScheduleBoard(range) {

    ScheduleBoard.render({

        container: "scheduleBoard",

        schedules:
            window.currentSchedules || [],

        range

    });

}

function initializeButtons() {

    const button =
        document.getElementById("newSchedule");

    if (!button) {

        return;

    }

    button.onclick = () => {

        openScheduleForm();

    };

}