let selectedMembership = null;

//=====================================================
// Cargar módulo
//=====================================================

window.loadMembershipsFeature = async function (container) {

    const html = await FeatureManager.load(
        "memberships/memberships"
    );

    container.innerHTML = html;

    initializeMemberships();

};

//=====================================================
// Inicializar
//=====================================================

function initializeMemberships() {

    initializeMembershipSearch();

    initializeMembershipButtons();

    loadMembershipList();

}

//=====================================================
// Botones
//=====================================================

function initializeMembershipButtons() {

    const button = document.getElementById("newMembership");

    if (!button) return;

    button.addEventListener("click", () => {

        loadMembershipForm();

    });

}

//=====================================================
// Cargar lista
//=====================================================

async function loadMembershipList(search = "") {

    try {

        const memberships = search === ""

            ? await MembershipService.getAll()

            : await MembershipService.search(search);

        renderMembershipCards(memberships);

    }

    catch (error) {

        console.error(error);

    }

}

//=====================================================
// Buscador
//=====================================================

function initializeMembershipSearch() {

    const search = document.getElementById("searchMembership");

    if (!search) return;

    search.addEventListener("input", () => {

        loadMembershipList(

            search.value.trim()

        );

    });

}

//=====================================================
// Tarjetas
//=====================================================

function renderMembershipCards(memberships) {

    const container = document.getElementById("membershipResults");

    container.innerHTML = "";

    if (memberships.length === 0) {

        container.innerHTML = `

            <div class="empty-state">

                No hay membresías registradas.

            </div>

        `;

        return;

    }

    memberships.forEach(membership => {

        const card = document.createElement("div");

        card.className = "membership-card";

        card.innerHTML = `

            <strong>

                ${membership.name}

            </strong>

            <br>

            <small>

                ${membership.membershipId}

            </small>

        `;

        card.addEventListener("click", () => {

            loadMembershipProfile(

                membership.membershipId

            );

        });

        container.appendChild(card);

    });

}

//=====================================================
// Perfil
//=====================================================

async function loadMembershipProfile(membershipId) {

    try {

        const membership = await MembershipService.get(

            membershipId

        );

        selectedMembership = membership;

        const details = document.getElementById(

            "membershipDetails"

        );

        details.innerHTML = `

            <div class="membership-profile">

                <h2>

                    ${membership.name}

                </h2>

                <small>

                    ${membership.membershipId}

                </small>

                <hr>

                <p>

                    <strong>Precio:</strong>

                    $${membership.price}

                </p>

                <p>

                    <strong>Clases:</strong>

                    ${membership.classes ?? "Ilimitadas"}

                </p>

                <p>

                    <strong>Duración:</strong>

                    ${membership.durationDays} días

                </p>

                <p>

                    <strong>Descripción:</strong>

                    ${membership.description || "-"}

                </p>

                <div class="actions">

                    <button id="editMembership">

                        Editar

                    </button>

                    <button id="deleteMembership">

                        Desactivar

                    </button>

                </div>

            </div>

        `;

        initializeMembershipProfileButtons();

    }

    catch (error) {

        console.error(error);

    }

}

//=====================================================
// Botones del perfil
//=====================================================

function initializeMembershipProfileButtons() {

    document

        .getElementById("editMembership")

        .addEventListener("click", () => {

            loadMembershipForm(

                selectedMembership

            );

        });

    document

        .getElementById("deleteMembership")

        .addEventListener("click", async () => {

            if (

                !confirm(

                    "¿Deseas desactivar esta membresía?"

                )

            ) {

                return;

            }

            try {

                await MembershipService.delete(

                    selectedMembership.membershipId

                );

                selectedMembership = null;

                await loadMembershipList();

                document.getElementById(

                    "membershipDetails"

                ).innerHTML = `

                    <div class="empty-state">

                        <h2>

                            Membresía desactivada

                        </h2>

                    </div>

                `;

            }

            catch (error) {

                console.error(error);

            }

        });

}
