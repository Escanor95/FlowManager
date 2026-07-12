import { createClient } from "./api/client.api.js";

const form = document.getElementById("clientForm");

form.addEventListener("submit", async (event) => {

    event.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const membershipType = document.getElementById("membershipType").value;

    const client = {

        fullName,
        phone,
        email,
        membershipType

    };
    const result = await createClient(client);

    const result = await response.json();

    console.log(result);

    alert("Cliente registrado correctamente");

    form.reset();

});