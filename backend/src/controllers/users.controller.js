import { db } from "../../firebaseAdmin.js";

const APP_ID = "ramit-7e364";

const usersCollection = () =>
  db
    .collection("artifacts")
    .doc(APP_ID)
    .collection("public")
    .doc("data")
    .collection("user_data");

// GET /api/users
export const getUsers = async (req, res) => {
  try {
    const snapshot = await usersCollection().get();

    const users = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// GET /api/users/:id
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await usersCollection().doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: doc.id,
        ...doc.data(),
      },
    });
  } catch (error) {
    console.error("Get user error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// PATCH /api/users/:id
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    await usersCollection().doc(id).update(data);

    const updatedDoc = await usersCollection().doc(id).get();

    res.json({
      success: true,
      message: "User updated successfully",
      user: {
        id: updatedDoc.id,
        ...updatedDoc.data(),
      },
    });
  } catch (error) {
    console.error("Update user error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await usersCollection().doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    await usersCollection().doc(id).delete();

    res.json({
      success: true,
      message: "User deleted successfully",
      id,
    });
  } catch (error) {
    console.error("Delete user error:", error);

    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};