/*
====================================================

    AURA WELLNESS

    SERVICE WORKER

====================================================
*/


const CACHE_NAME =
    "aura-wellness-v1";


self.addEventListener(

    "install",

    event => {

        console.log(
            "Aura Wellness Service Worker instalado."
        );


        self.skipWaiting();

    }

);


self.addEventListener(

    "activate",

    event => {

        console.log(
            "Aura Wellness Service Worker activado."
        );


        event.waitUntil(

            clients.claim()

        );

    }

);  