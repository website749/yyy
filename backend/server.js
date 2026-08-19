import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import usersRoutes from "./src/routes/users.routes.js";
import locationsRoutes from "./src/routes/locations.routes.js";
import reportsRoutes from "./src/routes/reports.routes.js";
import securityRoutes from "./src/routes/security.routes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());

app.use(express.json());


// ========================================
// HEALTH CHECK
// ========================================
// ========================================
// ADMIN STATIC FILES
// ========================================

app.use(
  "/admin",
  express.static(
    path.join(__dirname, "src/admin")
  )
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SmartMap Backend API is running!",
    firebase: "connected"
  });
});


// ========================================
// USERS API
// ========================================

app.use(
  "/api/users",
  usersRoutes
);


// ========================================
// LOCATIONS API
// ========================================

app.use(
  "/api/locations",
  locationsRoutes
);


// ========================================
// REPORTS API
// ========================================

app.use(
  "/api/reports",
  reportsRoutes
);


// ========================================
// SECURITY LOGS API
// ========================================

app.use(
  "/api/security-logs",
  securityRoutes
);


// ========================================
// ADMIN DASHBOARD
// ========================================

app.get("/admin", (req, res) => {

  res.sendFile(
    path.join(
      __dirname,
      "src/admin/admin.html"
    )
  );

});


// ========================================
// 404 API HANDLER
// ========================================

app.use("/api", (req, res) => {

  res.status(404).json({
    success: false,
    error: "API endpoint not found"
  });

});


// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use(
  (error, req, res, next) => {

    console.error(
      "Server error:",
      error
    );

    res.status(500).json({
      success: false,
      error: "Internal server error"
    });

  }
);


// ========================================
// START SERVER
// ========================================

const PORT =
  process.env.PORT || 5000;


app.listen(
  PORT,
  () => {

    console.log(
      `SmartMap Backend running on http://localhost:${PORT}`
    );

    console.log(
      `Admin Dashboard: http://localhost:${PORT}/admin`
    );

  }
);