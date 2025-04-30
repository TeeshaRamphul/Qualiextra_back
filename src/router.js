import { Router } from 'express';
import { userController }  from './controllers/userController.js'

const router = Router();


router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getOneUser);
router.post("/users", userController.createUser);
router.patch("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);


export { router };