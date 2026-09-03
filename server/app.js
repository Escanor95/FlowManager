/*
====================================================

    AURA ACCESS PRO

    SERVER + PWA + WEB

====================================================
*/

const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const port = process.env.PORT || 3000;


// ====================================================
// MIDDLEWARE
// ====================================================

app.use(express.json());

// ====================================================
// PÁGINA PRINCIPAL AURA WELLNESS
// ====================================================

app.get("/", (req, res) => {
    if (req.hostname === "aura-access-pro.duckdns.org") {
        return res.sendFile(
            path.join(__dirname, "../client/index.html")
        );
    }

    return res.sendFile(
        path.join(__dirname, "../web/index.html")
    );
});

// ====================================================
// ARCHIVOS PÚBLICOS AURA WELLNESS
// ====================================================

app.use(
    express.static(
        path.join(__dirname, "../web"),
        {
            index: false,
            extensions: ["html"]
        }
    )
);

// ====================================================
// DESKTOP / FLOWMANAGER
// ====================================================

app.use(
    express.static(
        path.join(__dirname, "../client")
    )
);


// ====================================================
// PWA
// ====================================================
//
// La PWA se busca primero en /pwa.
// Si no existe, utiliza /client/pwa.
//

const rootPwaPath =
    path.join(__dirname, "../pwa");

const clientPwaPath =
    path.join(__dirname, "../client/pwa");

const pwaPath =
    fs.existsSync(rootPwaPath)
        ? rootPwaPath
        : clientPwaPath;


app.use(
    "/pwa",
    express.static(
        pwaPath,
        {
            index: "index.html",
            extensions: ["html"]
        }
    )
);


// ====================================================
// PWA SIN DIAGONAL
// ====================================================

app.get(
    "/pwa",
    (req, res) => {

        res.redirect("/pwa/");

    }
);


// ====================================================
// WEB PÚBLICA AURA WELLNESS
// ====================================================
//
// Estructura:
//
// /web/
//     index.html
//     nosotros.html
//     disciplinas.html
//     espacio.html
//     contacto.html
//     styles.css
//     assets/
//
// URL:
//
// http://localhost:3000/web/
//

const webPath =
    path.join(
        __dirname,
        "../web"
    );


// ====================================================
// VERIFICAR CARPETA WEB
// ====================================================

if (
    fs.existsSync(webPath)
) {

    console.log(
        `🌐 Web Aura encontrada en: ${webPath}`
    );

}


// ====================================================
// SERVIR WEB
// ====================================================

app.use(
    "/web",
    express.static(
        webPath,
        {
            index: "index.html",
            extensions: ["html"]
        }
    )
);


// ====================================================
// WEB SIN DIAGONAL
// ====================================================

app.get(
    "/web",
    (req, res) => {

        res.redirect(
            "/web/"
        );

    }
);


// ====================================================
// ROUTES
// ====================================================

const clientRoutes =
    require("./routes/client.routes");

const membershipRoutes =
    require("./routes/membership.routes");

const attendanceRoutes =
    require("./routes/attendance.routes");

const dashboardRoutes =
    require("./routes/dashboard.routes");

const activityRoutes =
    require("./routes/activity.routes");

const scheduleRoutes =
    require("./routes/schedule.routes");

const reservationRoutes =
    require("./routes/reservation.routes");

const authRoutes =
    require("./routes/auth.routes");

const userRoutes =
    require("./routes/user.routes");

const coachRoutes =
    require("./routes/coach.routes");


// ====================================================
// REGISTER ROUTES
// ====================================================

app.use(
    "/auth",
    authRoutes
);

app.use(
    "/users",
    userRoutes
);

app.use(
    "/clients",
    clientRoutes
);

app.use(
    "/memberships",
    membershipRoutes
);

app.use(
    "/attendance",
    attendanceRoutes
);

app.use(
    "/dashboard",
    dashboardRoutes
);

app.use(
    "/activities",
    activityRoutes
);

app.use(
    "/schedules",
    scheduleRoutes
);

app.use(
    "/reservations",
    reservationRoutes
);

app.use(
    "/coaches",
    coachRoutes
);


// ====================================================
// MAIN PAGE
// ====================================================
//
// FlowManager Desktop
//
// http://localhost:3000/
//

app.get(
    "/",
    (req, res) => {

        res.sendFile(

            path.join(
                __dirname,
                "../client/index.html"
            )

        );

    }
);


// ====================================================
// START SERVER
// ====================================================

app.listen(

    port,

    "0.0.0.0",

    () => {

        console.log(
            ""
        );

        console.log(
            "============================================"
        );

        console.log(
            "🚀 AURA ACCESS PRO"
        );

        console.log(
            "============================================"
        );

        console.log(
            `💻 Desktop: http://localhost:${port}/`
        );

        console.log(
            `📱 PWA:     http://localhost:${port}/pwa/`
        );

        console.log(
            `🌐 Web:     http://localhost:${port}/web/`
        );

        console.log(
            `📡 Red:     http://<IP-DE-TU-PC>:${port}/`
        );

        console.log(
            "============================================"
        );

    }
);
