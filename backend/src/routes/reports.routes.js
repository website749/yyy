import express from "express";
import { db } from "../../firebaseAdmin.js";

const router = express.Router();

const COLLECTION = "reports";

// ========================================
// GET ALL REPORTS
// GET /api/reports
// ========================================

router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection(COLLECTION)
      .get();

    const reports = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json({
      success: true,
      reports
    });

  } catch (error) {
    console.error("GET reports error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to load reports"
    });
  }
});


// ========================================
// GET SINGLE REPORT
// GET /api/reports/:id
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
        error: "Report not found"
      });
    }

    res.json({
      success: true,
      report: {
        id: doc.id,
        ...doc.data()
      }
    });

  } catch (error) {
    console.error("GET report error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to load report"
    });
  }
});


// ========================================
// UPDATE REPORT STATUS
// PATCH /api/reports/:id/status
// ========================================

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "reviewing",
      "resolved",
      "rejected"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid report status"
      });
    }

    const reportRef = db
      .collection(COLLECTION)
      .doc(req.params.id);

    const existing =
      await reportRef.get();

    if (!existing.exists) {
      return res.status(404).json({
        success: false,
        error: "Report not found"
      });
    }

    await reportRef.update({
      status,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: "Report status updated"
    });

  } catch (error) {
    console.error(
      "UPDATE report status error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to update report"
    });
  }
});


// ========================================
// DELETE REPORT
// DELETE /api/reports/:id
// ========================================

router.delete("/:id", async (req, res) => {
  try {
    const reportRef = db
      .collection(COLLECTION)
      .doc(req.params.id);

    const existing =
      await reportRef.get();

    if (!existing.exists) {
      return res.status(404).json({
        success: false,
        error: "Report not found"
      });
    }

    await reportRef.delete();

    res.json({
      success: true,
      message: "Report deleted successfully"
    });

  } catch (error) {
    console.error(
      "DELETE report error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to delete report"
    });
  }
});


export default router;