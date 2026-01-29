const admin = require("firebase-admin");
const serviceAccount = require(
  `../../gloudServiceAccounts/tag-a-log-v2/tag-a-log-v2-firebase-adminsdk-fbsvc-91eb6b7680.json`,
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function cleanUp() {
  const now = admin.firestore.Timestamp.now();

  // requires an index
  const snapshot = await db
    .collection("users")
    .where("accountStatus", "==", "scheduled_for_deletion")
    .where("scheduledDeletionDate", "<=", now)
    .get();

  if (snapshot.empty) {
    console.log("No accounts to delete.");
    return;
  }

  console.log(`Found ${snapshot.size} accounts to delete.`);

  for (const doc of snapshot.docs) {
    console.log(`Deleting ${doc.id}...`);
    // Delete Auth
    try {
      await admin.auth().deleteUser(doc.id);
    } catch (e) {
      console.log("Auth user already gone");
    }

    // Delete Data
    await db.recursiveDelete(doc.ref);
    console.log("Deleted.");
  }
}

cleanUp().then(() => process.exit());
