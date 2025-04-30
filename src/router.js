import { Router } from 'express';
import { userController }  from './controllers/userController.js'

const router = Router();

router.get("/users", userController.getAllUsers);


export { router };