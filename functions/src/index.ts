/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { setGlobalOptions } from "firebase-functions";
import * as logger from "firebase-functions/logger";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const DB_TAGS = "tags";
export const DB_LOGS = "logs";
export const DB_USERS = "users";

admin.initializeApp();

const db = admin.firestore();

export const deleteExpiredAccounts = onSchedule(
  "every 24 hours",
  async (event) => {
    const now = admin.firestore.Timestamp.now();

    const expiredUsersQuery = db
      .collection(DB_USERS)
      .where("accountStatus", "==", "scheduled_for_deletion")
      .where("scheduledDeletionDate", "<=", now);

    const snapshot = await expiredUsersQuery.get();

    if (snapshot.empty) {
      logger.info("No expired accounts found.");
      return;
    }

    const deletePromises = snapshot.docs.map(async (doc) => {
      const uid = doc.id;
      logger.info(`Deleting user: ${uid}`);

      try {
        await db.recursiveDelete(doc.ref);
        await admin.auth().deleteUser(uid);
        logger.info(`Successfully deleted user ${uid}`);
      } catch (error) {
        logger.error(`Failed to delete user ${uid}:`, error);
      }
    });

    await Promise.all(deletePromises);
  },
);
