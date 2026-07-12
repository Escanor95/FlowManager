async function createClient(data) {

    const response = await fetch("/clients", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(data)

    });

    return await response.json();

}

export {
    createClient
};