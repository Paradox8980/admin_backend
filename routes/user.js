const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middlewere/fetchuser');
var dbUtils = require('../helper/index').Db;
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer();

const JWT_SECRET = process.env.ENCR;

// Get loggedin user detail 
router.post('/login', upload.none(), [body('email', 'Enter a email').exists(),body('password', 'Enter a password').exists()], async (req, res)=>{

    // Validation error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 0, errors: errors.array() });
    }
    try{
        const { email, password } = req.body;
        // const hashedPassword = await bcrypt.hash(password, 10);
        const user = await dbUtils.execute_single(`SELECT
			u.id,
            ut.usertype,
            u.usertype AS usertypeid,
			u.name,
			u.firstname,
			u.lastname,
			u.email,
            u.password
		FROM tbl_users u
        JOIN tbl_user_types ut ON u.usertype = ut.id 
        WHERE u.email = '${email}'`);
        if(!user){
            return res.status(400).json({status:0, error: "User not found."})
        }
        else 
        {   
            const passwordsMatch = await bcrypt.compare(password, user.password);
            if(!passwordsMatch){
                res.status(400).json({ status:0, error: "Invalid Password"});
            }
            else{
                const data = {
                    user: {
                        id:user.id,
                        role:user.usertype,
                        roleId:user.usertypeid,
                        user_name:user.name,
                        profile_color:user.profile_color
                    },
                    provider: user.provider_name
                };
                const authtoken = jwt.sign(data, JWT_SECRET);
                delete user.password;
                user.authtoken = authtoken;
                const res_data = {
                    user: user,
                    email: user.email,
                    authtoken: authtoken
                }
                res.json({ status: 1, res_data: res_data});
            }
        }
        // res.json({error: password, passwordsMatch: passwordsMatch});
    } catch (error){
        res.status(500).json({ status:0, error: "Internal server error", error_data: error});
    }
});

module.exports = router;