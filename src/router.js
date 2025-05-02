import { Router } from 'express';
import { userController }  from './controllers/userController.js'
import { authController }  from './controllers/authController.js'
import { authenticateToken }  from './middleware/authenticateToken.js'
import { checkAdmin } from './middleware/checkAdmin.js';

const router = Router();

router.post("/register", authController.registerUser);
router.get("/verify-email", authController.verifyEmail);
router.post("/login", authController.loginUser);

router.get("/users", authenticateToken, checkAdmin, userController.getAllUsers);
router.get("/users/:id",  authenticateToken, userController.getOneUser);
router.patch("/users/:id",  authenticateToken, userController.updateUser);
router.delete("/users/:id", authenticateToken, checkAdmin,userController.deleteUser);

router.get("/private", authenticateToken, (req, res) => {
    res.status(200).json({ message: `Hello ${req.user.firstname}` });
});

export { router };
