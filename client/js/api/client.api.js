async function createClient(clientData) {

    const response = await fetch("/clients", {

        method: "POST",

        headers: {

            "Content-Type": "application/json"

        },

        body: JSON.stringify(clientData)

    });

    return await response.json();

}

export {
    createClient
};