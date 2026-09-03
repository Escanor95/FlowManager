/*
====================================================

    FLOWMANAGER

    GENERATE CLIENT ID

====================================================
*/

const db =
    require("../config/database");


function generateClientId(
    callback
) {

    const promise =
        new Promise(

            (
                resolve,
                reject
            ) => {

                db.get(

                    `
                    SELECT
                        COUNT(*) AS total

                    FROM clients
                    `,

                    [],

                    (
                        error,
                        row
                    ) => {

                        if (error) {

                            reject(
                                error
                            );

                            return;

                        }


                        const nextNumber =
                            Number(
                                row?.total || 0
                            ) + 1;


                        const clientId =
                            `AU-${String(
                                nextNumber
                            ).padStart(
                                3,
                                "0"
                            )}`;


                        resolve(
                            clientId
                        );

                    }

                );

            }

        );


    /*
    ====================================================
    
        COMPATIBILIDAD
    
        Permite usar:
    
        await generateClientId()
    
        o:
    
        generateClientId(
            (error, clientId) => {}
        )

    ====================================================
    */

    if (
        typeof callback ===
        "function"
    ) {

        promise

            .then(

                clientId => {

                    callback(
                        null,
                        clientId
                    );

                }

            )

            .catch(

                error => {

                    callback(
                        error
                    );

                }

            );

    }


    return promise;

}


module.exports =
    generateClientId;