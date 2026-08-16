import { db } from "../../firebaseAdmin.js";

const APP_ID = "ramit-7e364";

export const getAllUsers = async () => {
  const snapshot = await db
    .collection("artifacts")
    .doc(APP_ID)
    .collection("public")
    .doc("data")
    .collection("user_data")
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const getUserById = async (userId) => {
  const userRef = db
    .collection("artifacts")
    .doc(APP_ID)
    .collection("public")
    .doc("data")
    .collection("user_data")
    .doc(userId);

  const snapshot = await userRef.get();

  if (!snapshot.exists) {
    return null;
  }

  return {
    id: snapshot.id,
    ...snapshot.data()
  };
};