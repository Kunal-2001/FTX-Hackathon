const { Router } = require("express");
const uController = require("../controllers/usercontroller");
const { requireAuth } = require("../middleware/authMiddleware");

const router = Router();

// routes
router.post("/signup", uController.signup_post);
router.post("/login", uController.login_post);
router.get("/logout", uController.logout_get);
router.get("/dashboard/:id", uController.user_dashboard);
router.post("/addstartup", uController.add_startup_post);


module.exports = router;
