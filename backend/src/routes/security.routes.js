import express from "express";
import { db } from "../../firebaseAdmin.js";
import { cyberLogsPath } from "../firestorePaths.js";

const router = express.Router();


// ========================================
// GET SECURITY LOGS
// GET /api/security-logs
// ========================================

router.get("/", async (req, res) => {
  try {
    const snapshot = await db
      .collection(cyberLogsPath)
      .get();

    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    logs.sort((a, b) => {
      return Number(b.timestamp || 0) -
             Number(a.timestamp || 0);
    });

    res.json({
      success: true,
      logs
    });

  } catch (error) {

    console.error(
      "Security logs error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to load security logs"
    });

  }
});


// ========================================
// CREATE SECURITY LOG
// POST /api/security-logs
// ========================================

router.post("/", async (req, res) => {
  try {

    const {
      action,
      adminId,
      ip,
      device,
      result,
      details
    } = req.body;

    const log = {
      action: action || "unknown",
      adminId: adminId || null,
      ip: ip || null,
      device: device || null,
      result: result || "unknown",
      details: details || "",
      timestamp: Date.now()
    };

    const docRef = await db
      .collection(cyberLogsPath)
      .add(log);

    res.status(201).json({
      success: true,
      log: {
        id: docRef.id,
        ...log
      }
    });

  } catch (error) {

    console.error(
      "Create security log error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Failed to create security log"
    });

  }
});


export default router;