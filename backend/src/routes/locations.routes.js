import express from "express";
import { db } from "../../firebaseAdmin.js";

const router = express.Router();

const COLLECTION = "locations";

// ========================================
// GET ALL LOCATIONS
// GET /api/locations
// ========================================

router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection(COLLECTION)
      .get();

    const locations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      locations
    });

  } catch (error) {
    console.error("GET locations error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to load locations"
    });
  }
});


// ========================================
// GET SINGLE LOCATION
// GET /api/locations/:id
// ========================================

router.get("/:id", async (req, res) => {
  try {
    const doc = await db
      .collection(COLLECTION)
      .doc(req.params.id)
      .get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        error: "Location not found"
      });
    }

    res.json({
      success: true,
      location: {
        id: doc.id,
        ...doc.data()
      }
    });

  } catch (error) {
    console.error("GET location error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to load location"
    });
  }
});


// ========================================
// CREATE LOCATION
// POST /api/locations
// ========================================

router.post("/", async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      phone,
      latitude,
      longitude,
      address,
      image,
      status
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Location name is required"
      });
    }

    const location = {
      name,
      type: type || "other",
      description: description || "",
      phone: phone || "",
      latitude:
        latitude !== undefined
          ? Number(latitude)
          : null,
      longitude:
        longitude !== undefined
          ? Number(longitude)
          : null,
      address: address || "",
      image: image || "",
      status: status || "active",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db
      .collection(COLLECTION)
      .add(location);

    res.status(201).json({
      success: true,
      message: "Location created successfully",
      location: {
        id: docRef.id,
        ...location
      }
    });

  } catch (error) {
    console.error("CREATE location error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to create location"
    });
  }
});


// ========================================
// UPDATE LOCATION
// PUT /api/locations/:id
// ========================================

router.put("/:id", async (req, res) => {
  try {
    const locationRef = db
      .collection(COLLECTION)
      .doc(req.params.id);

    const existing =
      await locationRef.get();

    if (!existing.exists) {
      return res.status(404).json({
        success: false,
        error: "Location not found"
      });
    }

    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    delete updates.id;

    await locationRef.update(updates);

    res.json({
      success: true,
      message: "Location updated successfully"
    });

  } catch (error) {
    console.error("UPDATE location error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to update location"
    });
  }
});


// ========================================
// DELETE LOCATION
// DELETE /api/locations/:id
// ========================================

router.delete("/:id", async (req, res) => {
  try {
    const locationRef = db
      .collection(COLLECTION)
      .doc(req.params.id);

    const existing =
      await locationRef.get();

    if (!existing.exists) {
      return res.status(404).json({
        success: false,
        error: "Location not found"
      });
    }

    await locationRef.delete();

    res.json({
      success: true,
      message: "Location deleted successfully"
    });

  } catch (error) {
    console.error("DELETE location error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to delete location"
    });
  }
});


// ========================================
// APPROVE LOCATION
// PATCH /api/locations/:id/approve
// ========================================

router.patch("/:id/approve", async (req, res) => {
  try {
    const locationRef = db
      .collection(COLLECTION)
      .doc(req.params.id);

    const existing =
      await locationRef.get();

    if (!existing.exists) {
      return res.status(404).json({
        success: false,
        error: "Location not found"
      });
    }

    await locationRef.update({
      status: "active",
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: "Location approved successfully"
    });

  } catch (error) {
    console.error("APPROVE location error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to approve location"
    });
  }
});


// ========================================
// REJECT LOCATION
// PATCH /api/locations/:id/reject
// ========================================

router.patch("/:id/reject", async (req, res) => {
  try {
    const locationRef = db
      .collection(COLLECTION)
      .doc(req.params.id);

    const existing =
      await locationRef.get();

    if (!existing.exists) {
      return res.status(404).json({
        success: false,
        error: "Location not found"
      });
    }

    await locationRef.update({
      status: "rejected",
      rejectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: "Location rejected successfully"
    });

  } catch (error) {
    console.error("REJECT location error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to reject location"
    });
  }
});


export default router;