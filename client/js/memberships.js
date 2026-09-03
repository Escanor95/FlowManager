let selectedMembership = null;

async function initializeMemberships() {

    initializeMembershipSearch();

    loadMemberships();

}

async function loadMemberships() {

    try {

        const memberships = await MembershipService.getAll();

        renderMemberships(memberships);

    }

    catch (error) {

        console.error(error);

    }

}

function initializeMembershipSearch() {

    const search = document.getElementById("searchMembership");

    search.addEventListener("input", async () => {

        const text = search.value.trim();

        if (text.length === 0) {

            loadMemberships();

            return;

        }

        try {

            const memberships = await MembershipService.search(text);

            renderMemberships(memberships);

        }

        catch (error) {

            console.error(error);

        }

    });

}

function renderMemberships(memberships) {

    const container = document.getElementById("membershipResults");

    container.innerHTML = "";

    if (memberships.length === 0) {

        container.innerHTML = "<p>No se encontraron membresías.</p>";

        return;

    }

    memberships.forEach(membership => {

        const card = document.createElement("div");

        card.className = "membership-card";

        card.innerHTML = `

            <strong>${membership.name}</strong>

            <br>

            ${membership.membershipId}

        `;

        card.addEventListener("click", async () => {

            const fullMembership =
                await MembershipService.get(membership.membershipId);

            loadMembership(fullMembership);

        });

        container.appendChild(card);

    });

}

function loadMembership(membership) {

    selectedMembership = membership;

    document.getElementById("membershipDetails").innerHTML = `

        <div class="membership-profile">

            <h2>${membership.name}</h2>

            <small>${membership.membershipId}</small>

            <hr>

            <p><strong>Precio:</strong> $${membership.price}</p>

            <p><strong>Clases:</strong>

                ${membership.classes ?? "Ilimitadas"}

            </p>

            <p><strong>Duración:</strong>

                ${membership.durationDays} días

            </p>

            <p><strong>Descripción:</strong>

                ${membership.description || "-"}

            </p>

            <div class="actions">

                <button id="newMembershipBtn">

                    Nueva

                </button>

                <button id="editMembershipBtn">

                    Editar

                </button>

                <button id="deleteMembershipBtn">

                    Desactivar

                </button>

            </div>

        </div>

    `;

}