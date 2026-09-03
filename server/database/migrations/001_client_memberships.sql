-- ====================================================
-- FLOWMANAGER
-- CLIENT MEMBERSHIPS / PURCHASED PACKAGES
-- ====================================================

CREATE TABLE IF NOT EXISTS client_memberships (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    clientMembershipId TEXT NOT NULL UNIQUE,

    clientId TEXT NOT NULL,

    membershipId TEXT NOT NULL,

    status TEXT NOT NULL DEFAULT 'PENDING_ACTIVATION',

    purchasedAt TEXT NOT NULL,

    activatedAt TEXT,

    expiresAt TEXT,

    frozenAt TEXT,

    frozenRemainingDays INTEGER,

    remainingClasses INTEGER,

    createdByUserId TEXT,

    createdAt TEXT NOT NULL,

    updatedAt TEXT NOT NULL,

    FOREIGN KEY (clientId)
        REFERENCES clients(clientId),

    FOREIGN KEY (membershipId)
        REFERENCES memberships(membershipId),

    FOREIGN KEY (createdByUserId)
        REFERENCES users(userId)

);


-- ====================================================
-- EXTENSION HISTORY
-- ====================================================

CREATE TABLE IF NOT EXISTS membership_extensions (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    extensionId TEXT NOT NULL UNIQUE,

    clientMembershipId TEXT NOT NULL,

    daysAdded INTEGER NOT NULL,

    reason TEXT NOT NULL,

    extendedByUserId TEXT,

    createdAt TEXT NOT NULL,

    FOREIGN KEY (clientMembershipId)
        REFERENCES client_memberships(clientMembershipId),

    FOREIGN KEY (extendedByUserId)
        REFERENCES users(userId)

);


-- ====================================================
-- FREEZE HISTORY
-- ====================================================

CREATE TABLE IF NOT EXISTS membership_freezes (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    freezeId TEXT NOT NULL UNIQUE,

    clientMembershipId TEXT NOT NULL,

    frozenAt TEXT NOT NULL,

    reactivatedAt TEXT,

    remainingDays INTEGER,

    frozenByUserId TEXT,

    reactivatedByUserId TEXT,

    createdAt TEXT NOT NULL,

    updatedAt TEXT NOT NULL,

    FOREIGN KEY (clientMembershipId)
        REFERENCES client_memberships(clientMembershipId),

    FOREIGN KEY (frozenByUserId)
        REFERENCES users(userId),

    FOREIGN KEY (reactivatedByUserId)
        REFERENCES users(userId)

);


-- ====================================================
-- CLIENT MEMBERSHIPS INDEXES
-- ====================================================

CREATE INDEX IF NOT EXISTS
idx_client_memberships_client_status

ON client_memberships (

    clientId,
    status

);


CREATE INDEX IF NOT EXISTS
idx_client_memberships_client_purchased

ON client_memberships (

    clientId,
    purchasedAt

);


CREATE INDEX IF NOT EXISTS
idx_membership_extensions_client_membership

ON membership_extensions (

    clientMembershipId

);


CREATE INDEX IF NOT EXISTS
idx_membership_freezes_client_membership

ON membership_freezes (

    clientMembershipId

);