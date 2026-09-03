let editingMembership = null;

async function loadMembershipForm(membership = null) {

    editingMembership = membership;

    try {

        const html = await FeatureManager.load(
            "memberships/membershipForm"
        );

        openModal(html);

        initializeMembershipForm();

    }

    catch (error) {

        console.error(error);

    }

}

function initializeMembershipForm() {

    const form =
        document.getElementById("membershipForm");

    const cancelButton =
        document.getElementById("cancelMembership");

    cancelButton.onclick = () => {

        editingMembership = null;

        closeModal();

    };

    if (editingMembership) {

        populateMembershipForm(

            editingMembership

        );

    }

    form.addEventListener(

        "submit",

        saveMembership

    );

}

function populateMembershipForm(membership) {

    document.getElementById(

        "membershipFormTitle"

    ).textContent =

        "💳 Editar Membresía";

    document.getElementById(

        "membershipFormDescription"

    ).textContent =

        "Actualiza la información de la membresía.";

    document.getElementById(

        "saveMembership"

    ).textContent =

        "Actualizar";

    document.getElementById(

        "membershipId"

    ).value =

        membership.membershipId;

    document.getElementById(

        "membershipName"

    ).value =

        membership.name;

    document.getElementById(

        "membershipPrice"

    ).value =

        membership.price;

    document.getElementById(

        "membershipClasses"

    ).value =

        membership.classes ?? "";

    document.getElementById(

        "membershipDuration"

    ).value =

        membership.durationDays;

    document.getElementById(

        "membershipDescription"

    ).value =

        membership.description ?? "";

}

async function saveMembership(event) {

    event.preventDefault();

    const membership = {

        name:
            document.getElementById("membershipName")
                .value
                .trim(),

        price:
            Number(
                document.getElementById(
                    "membershipPrice"
                ).value
            ),

        classes:

            document.getElementById(
                "membershipClasses"
            ).value === ""

                ? null

                : Number(

                    document.getElementById(
                        "membershipClasses"
                    ).value

                ),

        durationDays:

            Number(

                document.getElementById(
                    "membershipDuration"
                ).value

            ),

        description:

            document.getElementById(
                "membershipDescription"
            )
                .value
                .trim()

    };

    try {

        const saveButton =
            document.getElementById(
                "saveMembership"
            );

        disableButton(

            saveButton,

            "Guardando..."

        );

        if (editingMembership) {

            await MembershipService.update(

                editingMembership.membershipId,

                membership

            );

            alert(

                "Membresía actualizada correctamente."

            );

        }

        else {

            await MembershipService.create(

                membership

            );

            alert(

                "Membresía registrada correctamente."

            );

        }

        editingMembership = null;

        closeModal();

        await ModuleFactory.refresh(

            "memberships"

        );

    }

    catch (error) {

        console.error(error);

        alert(

            error.message

        );

    }

    finally {

        enableButton(

            document.getElementById(

                "saveMembership"

            )

        );

    }

}