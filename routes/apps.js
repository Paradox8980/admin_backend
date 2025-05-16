const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
var fetchuser = require('../middlewere/fetchuser');
var dbUtils = require('../helper/index').Db;
const multer = require('multer');
const upload = multer();
const { encrypt } = require('../helper/encryption.cjs');
var jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.ENCR;
// Get loggedin user detail 
router.post('/', fetchuser, upload.none(), [body('name', 'Enter a name').exists()], async (req, res)=>{

    // Validation error
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: 0, errors: errors.array() });
    }
    try{
        const { playstore, adx, name, code, package, url, remark, status } = req.body;
        let appData = [];
        appData['playstore'] = playstore;
        appData['adx'] = adx;
        appData['name'] = name;
        appData['code'] = code;
        appData['package'] = package;
        appData['url'] = url;
        appData['remark'] = remark;
        appData['status'] = parseInt(status);
        await dbUtils.insert('tbl_app', appData);
        res.json({status: 1, message: "App added successfully."});
    } catch (error){
        res.status(500).json({ status:0, error: "Internal server error", error_data: error});
    }
});

// Update a playstore 
router.put('/', fetchuser, upload.none(), [], async (req, res)=>{
    const { playstore, adx, name, code, package, url, remark, status, id } = req.body;
    try {
        let appData = [];
        appData['playstore'] = playstore;
        appData['adx'] = adx;
        appData['name'] = name;
        appData['code'] = code;
        appData['package'] = package;
        appData['url'] = url;
        appData['remark'] = remark;
        appData['status'] = parseInt(status);
        appData['update_date'] = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
        dbUtils.update('tbl_app',appData, "id='"+id+"'");

        res.json({status:1, message: "User updated successfully."});
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// Delete a app
router.delete('/', fetchuser, upload.none(), [], async (req, res)=>{
    let status = 0;
    const {id} = req.body;
    try{
        // Check Song Exist
        const leave = await dbUtils.execute(`SELECT id FROM tbl_app WHERE id = '${id}'`);
        if(leave && id && id != "" && leave.length > 0) {
            await dbUtils.delete('tbl_app',`id = '${id}'`);
            status=1;
        }
        else {
            {return res.status(400).json({ status:status, errors: "Not Found!" });}
        }
        
        res.json({status: status, message: "app Deleted Successfully"});

    } catch (error){
        res.status(500).json({ status:status, error: "Internal server error"});
    }
});

// Get app
router.get('/', fetchuser, upload.none(), [], async (req, res)=>{
    let { search, page, page_size, currentStatus, sortField, sortDirection } = req.query;
	const ITEMS_PER_PAGE = page_size;
    page = parseInt(page);
    const offset = (page - 1) * ITEMS_PER_PAGE;
    let status = 0;
    let orderBy = "entry_date DESC";
    if(sortField != ""){
        orderBy = sortField + " " + ((sortDirection != "") ? sortDirection : 'asc');
    }
    try{
        const app = await dbUtils.execute(`SELECT *
            FROM tbl_app
            WHERE status = '${currentStatus}' AND name LIKE '${`%${search}%`}'
            ORDER BY ${orderBy}
            LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`);
        if(!app){
            return res.status(400).json({status:0, error: "Data not found."})
        }
        else 
        {
            const app_total = await dbUtils.execute_single(`SELECT COUNT(id)
            FROM tbl_app
            WHERE name LIKE '${`%${search}%`}'`);
            res.json({ status: 1, res_data: app, total: app_total['count']});
        }

    } catch (error){
        res.status(500).json({ status:status, error: "Internal server error"});
    }
});

router.get('/appbyid', fetchuser, upload.none(), [], async (req, res)=>{
	let { id } = req.query;
    try{
        const app = await dbUtils.execute_single(`SELECT * FROM tbl_app WHERE id = '${id}'`);
        if(!app){
            return res.status(400).json({status:0, error: "Data not found."})
        }
        else 
        {
            res.json({ status: 1, res_data: app});
        }
    } catch (error){
        res.status(500).json({ status:status, error: "Internal server error"});
    }
});

/*============================================================================================================
                                                Settings
============================================================================================================*/

// Update a google 
router.post('/google', fetchuser, upload.none(), [], async (req, res)=>{
    const { g1_percentage, g2_percentage, g3_percentage, g1_account, g2_account, g3_account, g1_banner, g2_banner, g3_banner, g1_inter, g2_inter, g3_inter, g1_native, g2_native, g3_native, g1_native2, g2_native2, g3_native2, g1_appopen, g2_appopen, g3_appopen, g1_appid, g2_appid, g3_appid, type, id } = req.body;
    try {
        let appData = [];
        appData['g1_percentage'] = g1_percentage;
        appData['g2_percentage'] = g2_percentage;
        appData['g3_percentage'] = g3_percentage;
        appData['g1_account_name'] = g1_account;
        appData['g2_account_name'] = g2_account;
        appData['g3_account_name'] = g3_account;
        appData['g1_banner'] = g1_banner;
        appData['g2_banner'] = g2_banner;
        appData['g3_banner'] = g3_banner;
        appData['g1_inter'] = g1_inter;
        appData['g2_inter'] = g2_inter;
        appData['g3_inter'] = g3_inter;
        appData['g1_native'] = g1_native;
        appData['g2_native'] = g2_native;
        appData['g3_native'] = g3_native;
        appData['g1_native2'] = g1_native2;
        appData['g2_native2'] = g2_native2;
        appData['g3_native2'] = g3_native2;
        appData['g1_appopen'] = g1_appopen;
        appData['g2_appopen'] = g2_appopen;
        appData['g3_appopen'] = g3_appopen;
        appData['g1_appid'] = g1_appid;
        appData['g2_appid'] = g2_appid;
        appData['g3_appid'] = g3_appid;

        const app = await dbUtils.execute_single(`SELECT * FROM tbl_apps_settings WHERE app_id = '${id}' AND type='${type}'`);
        if(!app){
            appData['app_id'] = id;
            appData['type'] = type;
            dbUtils.insert('tbl_apps_settings',appData);
        }
        else 
        {
            appData['update_date'] = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
            dbUtils.update('tbl_apps_settings',appData, "id='"+app.id+"'");
        }

        res.json({status:1, message: "User updated successfully."});
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// get Google Data 
router.get('/google', fetchuser, upload.none(), [], async (req, res)=>{
    const { type, id } = req.query;
    try {
        const app = await dbUtils.execute_single(`SELECT * FROM tbl_apps_settings WHERE app_id = '${id}' AND type='${type}'`);
        if(!app){
            return res.status(400).json({status:0, error: "Data not found."})
        }
        else 
        {
            res.json({ status: 1, res_data: app});
        }
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// Update a adsetting 
router.post('/adsetting', fetchuser, upload.none(), [], async (req, res)=>{
    const { app_color, app_background_color, native_loading, bottom_banner, all_screen_native, list_native, list_native_cnt, exit_dialoge_native, native_btn, native_btn_text, native_background_color, native_text_color, native_button_background_color, native_button_text_color, alternate_with_appopen, inter_loading, inter_interval, back_click_inter, app_open_loading, splash_ads, app_open, is_bifurcate, type, id } = req.body;
    try {
        let appData = [];
        appData['app_color'] = app_color;
        appData['app_background_color'] = app_background_color;
        appData['native_loading'] = native_loading;
        appData['bottom_banner'] = bottom_banner;
        appData['all_screen_native'] = all_screen_native;
        appData['list_native'] = list_native;
        appData['list_native_cnt'] = list_native_cnt;
        appData['exit_dialoge_native'] = exit_dialoge_native;
        appData['native_btn'] = native_btn;
        appData['native_btn_text'] = native_btn_text;
        appData['native_background_color'] = native_background_color;
        appData['native_text_color'] = native_text_color;
        appData['native_button_background_color'] = native_button_background_color;
        appData['native_button_text_color'] = native_button_text_color;
        appData['alternate_with_appopen'] = alternate_with_appopen;
        appData['inter_loading'] = inter_loading;
        appData['inter_interval'] = inter_interval;
        appData['back_click_inter'] = back_click_inter;
        appData['app_open_loading'] = app_open_loading;
        appData['splash_ads'] = splash_ads;
        appData['app_open'] = app_open;
        const app = await dbUtils.execute_single(`SELECT * FROM tbl_app_ad_settings WHERE app_id = '${id}' AND type='${type}' AND is_bifurcate = ${is_bifurcate}`);
        if(!app){
            appData['app_id'] = id;
            appData['type'] = type;
            appData['is_bifurcate'] = is_bifurcate;
            dbUtils.insert('tbl_app_ad_settings',appData);
        }
        else 
        {
            appData['update_date'] = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
            dbUtils.update('tbl_app_ad_settings',appData, "id='"+app.id+"'");
        }

        res.json({status:1, message: "User updated successfully."});
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// get adsetting Data 
router.get('/adsetting', fetchuser, upload.none(), [], async (req, res)=>{
    const { type, id, is_bifurcate, bifurcate_id } = req.query;
    try {
        let app;
        if(is_bifurcate){
            app = await dbUtils.execute_single(`SELECT * FROM tbl_app_ad_settings WHERE app_id = '${id}' AND type='${type}' AND is_bifurcate = 0`);
        }
        else {
            app = await dbUtils.execute_single(`SELECT * FROM tbl_app_ad_settings WHERE id = '${bifurcate_id}'`);
        }
        
        if(!app){
            return res.status(400).json({status:0, error: "Data not found."})
        }
        else 
        {
            res.json({ status: 1, res_data: app});
        }
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// Update a othersetting 
router.post('/othersetting', fetchuser, upload.none(), [], async (req, res)=>{
    const { all_ads, fullscreen, adblock_version, continue_screen, lets_start_screen, age_screen, next_screen, next_inner_screen, contact_screen, start_screen, real_casting_flow, app_stop, additional_fields, is_bifurcate, type, id } = req.body;
    try {
        let appData = [];
        appData['all_ads'] = all_ads;
        appData['fullscreen'] = fullscreen;
        appData['adblock_version'] = adblock_version;
        appData['continue_screen'] = continue_screen;
        appData['lets_start_screen'] = lets_start_screen;
        appData['age_screen'] = age_screen;
        appData['next_screen'] = next_screen;
        appData['next_inner_screen'] = next_inner_screen;
        appData['contact_screen'] = contact_screen;
        appData['start_screen'] = start_screen;
        appData['real_casting_flow'] = real_casting_flow;
        appData['app_stop'] = app_stop;
        appData['additional_fields'] = additional_fields;

        const app = await dbUtils.execute_single(`SELECT id FROM tbl_app_ad_settings WHERE app_id = '${id}' AND type='${type}' AND is_bifurcate = ${is_bifurcate}`);
        if(!app){
            appData['app_id'] = id;
            appData['type'] = type;
            appData['is_bifurcate'] = is_bifurcate;
            dbUtils.insert('tbl_app_ad_settings',appData);
        }
        else 
        {
            appData['update_date'] = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
            dbUtils.update('tbl_app_ad_settings',appData, "id='"+app.id+"'");
        }

        res.json({status:1, message: "User updated successfully."});
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// get othersetting Data 
router.get('/othersetting', fetchuser, upload.none(), [], async (req, res)=>{
    const { type, id } = req.query;
    try {
        let app = await dbUtils.execute_single(`SELECT all_ads, fullscreen, adblock_version, continue_screen, lets_start_screen, age_screen, next_screen, next_inner_screen, contact_screen, start_screen, real_casting_flow, app_stop, additional_fields FROM tbl_app_ad_settings WHERE app_id = '${id}' AND type='${type}' AND is_bifurcate = 0`);
        if(!app){
            return res.status(400).json({status:0, error: "Data not found."})
        }
        else 
        {
            res.json({ status: 1, res_data: app});
        }
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// Update a vpnsetting 
router.post('/vpnsetting', fetchuser, upload.none(), [], async (req, res)=>{
    const { vpn, vpn_dialog, vpn_dialog_open, vpn_country, vpn_url, vpn_carrier_id, is_bifurcate, type, id } = req.body;
    try {
        let appData = [];
        appData['vpn'] = vpn;
        appData['vpn_dialog'] = vpn_dialog;
        appData['vpn_dialog_open'] = vpn_dialog_open;
        appData['vpn_country'] = vpn_country;
        appData['vpn_url'] = vpn_url;
        appData['vpn_carrier_id'] = vpn_carrier_id;

        const app = await dbUtils.execute_single(`SELECT id FROM tbl_app_ad_settings WHERE app_id = '${id}' AND type='${type}' AND is_bifurcate = ${is_bifurcate}`);
        if(!app){
            appData['app_id'] = id;
            appData['type'] = type;
            appData['is_bifurcate'] = is_bifurcate;
            dbUtils.insert('tbl_app_ad_settings',appData);
        }
        else 
        {
            appData['update_date'] = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
            dbUtils.update('tbl_app_ad_settings',appData, "id='"+app.id+"'");
        }

        res.json({status:1, message: "User updated successfully."});
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// get vpnsetting Data 
router.get('/vpnsetting', fetchuser, upload.none(), [], async (req, res)=>{
    const { type, id } = req.query;
    try {
        let app = await dbUtils.execute_single(`SELECT vpn, vpn_dialog, vpn_dialog_open, vpn_country, vpn_url, vpn_carrier_id FROM tbl_app_ad_settings WHERE app_id = '${id}' AND type='${type}' AND is_bifurcate = 0`);
        if(!app){
            return res.status(400).json({status:0, error: "Data not found."})
        }
        else 
        {
            res.json({ status: 1, res_data: app});
        }
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// Update a appremovesetting 
router.post('/appremovesetting', fetchuser, upload.none(), [], async (req, res)=>{
    const { app_remove_flag, app_version, app_remove_title, app_remove_description, app_remove_url, app_remove_button_name, app_remove_skip_button_name, type, id } = req.body;
    try {
        let appData = [];
        appData['app_remove_flag'] = app_remove_flag;
        appData['app_version'] = app_version;
        appData['app_remove_title'] = app_remove_title;
        appData['app_remove_description'] = app_remove_description;
        appData['app_remove_url'] = app_remove_url;
        appData['app_remove_button_name'] = app_remove_button_name;
        appData['app_remove_skip_button_name'] = app_remove_skip_button_name;
        
        const app = await dbUtils.execute_single(`SELECT id FROM tbl_apps_settings WHERE app_id = '${id}' AND type='${type}'`);
        if(!app){
            appData['app_id'] = id;
            appData['type'] = type;
            dbUtils.insert('tbl_apps_settings',appData);
        }
        else 
        {
            appData['update_date'] = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
            dbUtils.update('tbl_apps_settings',appData, "id='"+app.id+"'");
        }

        res.json({status:1, message: "User updated successfully."});
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// get appremovesetting Data 
router.get('/appremovesetting', fetchuser, upload.none(), [], async (req, res)=>{
    const { type, id } = req.query;
    try {
        let app = await dbUtils.execute_single(`SELECT app_remove_flag, app_version, app_remove_title, app_remove_description, app_remove_url, app_remove_button_name, app_remove_skip_button_name FROM tbl_apps_settings WHERE app_id = '${id}' AND type='${type}'`);
        if(!app){
            return res.status(400).json({status:0, error: "Data not found."})
        }
        else 
        {
            res.json({ status: 1, res_data: app});
        }
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// Update a bifurcatesetting 
router.post('/bifurcatesetting', fetchuser, upload.none(), [], async (req, res)=>{
    const { app_color, app_background_color, native_loading, bottom_banner, all_screen_native, list_native, list_native_cnt, exit_dialoge_native, native_btn, native_btn_text, native_background_color, native_text_color, native_button_background_color, native_button_text_color, alternate_with_appopen, inter_loading, inter_interval, back_click_inter, app_open_loading, splash_ads, app_open, 
        all_ads, fullscreen, adblock_version, continue_screen, lets_start_screen, age_screen, next_screen, next_inner_screen, contact_screen, start_screen, real_casting_flow, app_stop, additional_fields, 
        vpn, vpn_dialog, vpn_dialog_open, vpn_country, vpn_url, vpn_carrier_id,
        bifurcate_id, bifurcate_location, type, id } = req.body;
    try {
        let appData = [];
        appData['app_color'] = app_color;
        appData['app_background_color'] = app_background_color;
        appData['native_loading'] = native_loading;
        appData['bottom_banner'] = bottom_banner;
        appData['all_screen_native'] = all_screen_native;
        appData['list_native'] = list_native;
        appData['list_native_cnt'] = list_native_cnt;
        appData['exit_dialoge_native'] = exit_dialoge_native;
        appData['native_btn'] = native_btn;
        appData['native_btn_text'] = native_btn_text;
        appData['native_background_color'] = native_background_color;
        appData['native_text_color'] = native_text_color;
        appData['native_button_background_color'] = native_button_background_color;
        appData['native_button_text_color'] = native_button_text_color;
        appData['alternate_with_appopen'] = alternate_with_appopen;
        appData['inter_loading'] = inter_loading;
        appData['inter_interval'] = inter_interval;
        appData['back_click_inter'] = back_click_inter;
        appData['app_open_loading'] = app_open_loading;
        appData['splash_ads'] = splash_ads;
        appData['app_open'] = app_open;

        appData['all_ads'] = all_ads;
        appData['fullscreen'] = fullscreen;
        appData['adblock_version'] = adblock_version;
        appData['continue_screen'] = continue_screen;
        appData['lets_start_screen'] = lets_start_screen;
        appData['age_screen'] = age_screen;
        appData['next_screen'] = next_screen;
        appData['next_inner_screen'] = next_inner_screen;
        appData['contact_screen'] = contact_screen;
        appData['start_screen'] = start_screen;
        appData['real_casting_flow'] = real_casting_flow;
        appData['app_stop'] = app_stop;
        appData['additional_fields'] = additional_fields;

        appData['vpn'] = vpn;
        appData['vpn_dialog'] = vpn_dialog;
        appData['vpn_dialog_open'] = vpn_dialog_open;
        appData['vpn_country'] = vpn_country;
        appData['vpn_url'] = vpn_url;
        appData['vpn_carrier_id'] = vpn_carrier_id;

        appData['bifurcate_location'] = bifurcate_location;

        let main_table_id = bifurcate_id;
        if(bifurcate_id){
            appData['update_date'] = (new Date()).toISOString().replace('T', ' ').replace('Z', '');
            dbUtils.update('tbl_app_ad_settings',appData, "id='"+bifurcate_id+"'");
            dbUtils.delete('app_ad_setting_locations', "setting_id='"+bifurcate_id+"'");
        }
        else 
        {
            appData['app_id'] = id;
            appData['type'] = type;
            appData['is_bifurcate'] = 1;
            const main_table_data = await dbUtils.insert('tbl_app_ad_settings',appData, 'id');
            main_table_id = main_table_data[0].id;
        }

        const locationValues = bifurcate_location.split(",");
        if (locationValues.length > 0) {
            const values = locationValues.map(loc => `('${main_table_id}', '${loc}')`).join(',');
            await dbUtils.execute(`INSERT INTO app_ad_setting_locations (setting_id, location_value) VALUES ${values}`);
        }

        res.json({status:1, message: "User updated successfully."});
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// get bifurcatesetting Data 
router.get('/bifurcatesetting', fetchuser, upload.none(), [], async (req, res)=>{
    const { type, bifurcate_id, id } = req.query;
    try {
        let app3 = await dbUtils.execute(`SELECT id, bifurcate_location FROM tbl_app_ad_settings WHERE app_id = '${id}' AND type='${type}' AND is_bifurcate = 1`);
        if(bifurcate_id){
            let app = await dbUtils.execute_single(`SELECT * FROM tbl_app_ad_settings WHERE id = '${bifurcate_id}'`);
            if(!app){
                return res.status(400).json({status:0, error: "Data not found."})
            }
            else 
            {
                res.json({ status: 1, res_data: app, res_data3: app3 });
            }
        }
        else {
            let app2 = await dbUtils.execute_single(`SELECT additional_fields FROM tbl_app_ad_settings WHERE app_id = '${id}' AND type='${type}' AND is_bifurcate = 0`);
            res.json({ status: 1, res_data2: app2, res_data3: app3 });
        }
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// delete bifurcatesetting Data 
router.delete('/bifurcatesetting', fetchuser, upload.none(), [], async (req, res)=>{
    const { id } = req.body;
    try {
        console.log(id);
        let app = await dbUtils.execute_single(`SELECT * FROM tbl_app_ad_settings WHERE id = '${id}'`);
        if(!app){
            return res.status(400).json({status:0, error: "Data not found."})
        }
        else 
        {
            dbUtils.delete('tbl_app_ad_settings', "id='"+id+"'");
            res.json({ status: 1, res_data: [] });
        }
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});

// post add user Data 
router.post('/adduser', upload.none(), [], async (req, res)=>{
    const token = req.header('auth-token');
    const { package, as, asname, callingCode, city, continent, continentCode, country, countryCode, countryCode3, currency, currentTime, district, hosting, isp, lat, lon, mobile, offset, org, proxy, query, region, regionName, reverse, status, timezone, zip, device_id, retention, installerinfo, installerurl } = req.body;
    try {
        let app = await dbUtils.execute_single(`SELECT id FROM tbl_app WHERE package = '${package}'`);
        let app_id = app.id;
        const user_as = as;

        let res_data = {};
        let google = null;
        let app_remove = null;
        let other_settings = null;
        let vpn_settings = null;
        let ads_settings = null;

        if(app_id){
            if(user_as != ""){
                let appData = [];
                appData['app_id'] = app.id;
                appData['package'] = package;
                appData['"as"'] = user_as;
                appData['asname'] = asname;
                appData['callingCode'] = callingCode;
                appData['city'] = city;
                appData['continent'] = continent;
                appData['continentCode'] = continentCode;
                appData['country'] = country;
                appData['countryCode'] = countryCode;
                appData['countryCode3'] = countryCode3;
                appData['currency'] = currency;
                appData['currentTime'] = currentTime;
                appData['district'] = district;
                appData['hosting'] = hosting;
                appData['isp'] = isp;
                appData['lat'] = lat;
                appData['lon'] = lon;
                appData['mobile'] = mobile;
                appData['"offset"'] = offset;
                appData['org'] = org;
                appData['proxy'] = proxy;
                appData['query'] = query;
                appData['region'] = region;
                appData['regionName'] = regionName;
                appData['reverse'] = reverse;
                appData['status'] = status;
                appData['timezone'] = timezone;
                appData['zip'] = zip;
                appData['device_id'] = device_id;
                appData['retention'] = retention;
                appData['installerinfo'] = installerinfo;
                appData['installerurl'] = installerurl;
                dbUtils.insert('tbl_app_users',appData);
            }

            const type = installerurl.includes('gclid') ? 2 : 1;
            let app_setting = await dbUtils.execute_single(`SELECT * FROM tbl_apps_settings WHERE app_id = '${app_id}' AND type = ${type}`);
            
            const locationValues = [
                user_as, asname, callingCode, city, continent, continentCode, country, countryCode, countryCode3, currency, currentTime, district, hosting, isp, lat, lon, mobile, offset, org, proxy, query, region, regionName, reverse, status, timezone, zip, device_id, retention, installerinfo, installerurl
            ];
            
            const filteredLocations = locationValues
                .filter(loc => loc != null) // Remove null/undefined
                .filter(loc => loc !== ''); // Remove empty strings
            const pgArray = `ARRAY[${filteredLocations.map(v => `'${v.replace(/'/g, "''")}'`).join(',')}]::text[]`;

            let bifurcate_setting;
            if (filteredLocations.length > 0) {
                bifurcate_setting = await dbUtils.execute_single(
                    `SELECT DISTINCT s.*
                    FROM tbl_app_ad_settings s
                    JOIN app_ad_setting_locations l ON l.setting_id = s.id
                    WHERE s.app_id = '${app_id}'
                        AND s.type = ${type}
                        AND s.is_bifurcate = 1
                        AND l.location_value = ANY(${pgArray})`
                );
            }

            let ad_setting;
            if(!bifurcate_setting){
                ad_setting = await dbUtils.execute_single(`SELECT s.* FROM tbl_app_ad_settings s WHERE s.app_id = '${app_id}' AND s.type = ${type} AND s.is_bifurcate = 0`);
            }
            else {
                ad_setting = bifurcate_setting;
            }
            
            if(app_setting){
                google = {};

                /**************** Google Ads ****************/
                google['google1'] = null;
                google['google2'] = null;
                google['google3'] = null;
                if(app_setting['g1_percentage'] != "" || 
                    app_setting['g1_account_name'] != "" || 
                    app_setting['g1_banner'] != "" || 
                    app_setting['g1_inter'] != "" || 
                    app_setting['g1_native'] != "" || 
                    app_setting['g1_native2'] != "" || 
                    app_setting['g1_appopen'] != "" ||
                    app_setting['g1_appid'] != "")
                {
                    google['google1'] = {};
                    google['google1']['percentageOne'] = app_setting['g1_percentage'];
                    google['google1']['google_account_name'] = app_setting['g1_account_name'];
                    google['google1']['google_banner'] = app_setting['g1_banner'];
                    google['google1']['google_inter'] = app_setting['g1_inter'];
                    google['google1']['google_native'] = app_setting['g1_native'];
                    google['google1']['google_native2'] = app_setting['g1_native2'];
                    google['google1']['google_appOpen'] = app_setting['g1_appopen'];
                    google['google1']['google_appId'] = app_setting['g1_appid'];
                }
                if(app_setting['g2_percentage'] != "" || 
                    app_setting['g2_account_name'] != "" || 
                    app_setting['g2_banner'] != "" || 
                    app_setting['g2_inter'] != "" || 
                    app_setting['g2_native'] != "" || 
                    app_setting['g2_native2'] != "" || 
                    app_setting['g2_appopen'] != "" ||
                    app_setting['g2_appid'] != "")
                {
                    google['google2'] = {};
                    google['google2']['percentageTwo'] = app_setting['g2_percentage'];
                    google['google2']['google_account_name'] = app_setting['g2_account_name'];
                    google['google2']['google_banner'] = app_setting['g2_banner'];
                    google['google2']['google_inter'] = app_setting['g2_inter'];
                    google['google2']['google_native'] = app_setting['g2_native'];
                    google['google2']['google_native2'] = app_setting['g2_native2'];
                    google['google2']['google_appOpen'] = app_setting['g2_appopen'];
                    google['google2']['google_appId'] = app_setting['g2_appid'];
                }
                if(app_setting['g3_account_name'] != "" || 
                    app_setting['g3_banner'] != "" || 
                    app_setting['g3_inter'] != "" || 
                    app_setting['g3_native'] != "" || 
                    app_setting['g3_native2'] != "" || 
                    app_setting['g3_appopen'] != "" ||
                    app_setting['g3_appid'] != "")
                {
                    google['google3'] = {};
                    google['google3']['percentageTwo'] = app_setting['g3_percentage'];
                    google['google3']['google_account_name'] = app_setting['g3_account_name'];
                    google['google3']['google_banner'] = app_setting['g3_banner'];
                    google['google3']['google_inter'] = app_setting['g3_inter'];
                    google['google3']['google_native'] = app_setting['g3_native'];
                    google['google3']['google_native2'] = app_setting['g3_native2'];
                    google['google3']['google_appOpen'] = app_setting['g3_appopen'];
                    google['google3']['google_appId'] = app_setting['g3_appid'];
                }
                
                /************ App Remove Flag ************/
                if(app_setting['app_remove_flag'] != "" || 
                    app_setting['app_version'] != "" || 
                    app_setting['app_remove_title'] != "" || 
                    app_setting['app_remove_description'] != "" || 
                    app_setting['app_remove_url'] != "" || 
                    app_setting['app_remove_button_name'] != "" ||
                    app_setting['app_remove_skip_button_name'] != "")
                {
                    app_remove = {};
                    app_remove['app_remove_flag'] = app_setting['app_remove_flag'];
                    app_remove['version'] = app_setting['app_version'];
                    app_remove['title'] = app_setting['app_remove_title'];
                    app_remove['description'] = app_setting['app_remove_description'];
                    app_remove['url'] = app_setting['app_remove_url'];
                    app_remove['button_name'] = app_setting['app_remove_button_name'];
                    app_remove['skip_button_name'] = app_setting['app_remove_skip_button_name'];
                }
            }

            /******************************* Ad Setting *******************************/
            ads_settings = null;
            if(ad_setting){
                ads_settings = {};
                ads_settings['app_color'] = null;
                if(ad_setting['app_color'] != "" || ad_setting['app_background_color'] != ""){
                    ads_settings['app_color'] = {};
                    ads_settings['app_color']['app_color_for_admin'] = ad_setting['app_color'];
                    ads_settings['app_color']['background_color'] = ad_setting['app_background_color'];
                }

                ads_settings['native'] = null;
                if(ad_setting['native_loading'] != "" || 
                    ad_setting['bottom_banner'] != "" ||
                    ad_setting['all_screen_native'] != "" ||
                    ad_setting['list_native'] != "" ||
                    ad_setting['list_native_cnt'] != "" ||
                    ad_setting['exit_dialoge_native'] != "" ||
                    ad_setting['native_btn'] != "")
                {

                    ads_settings['native'] = {};
                    ads_settings['native']['native_loading'] = ad_setting['native_loading'];
                    ads_settings['native']['bottom_banner'] = ad_setting['bottom_banner'];
                    ads_settings['native']['all_screen_native'] = ad_setting['all_screen_native'];
                    ads_settings['native']['list_native'] = ad_setting['list_native'];
                    ads_settings['native']['static_native_count'] = ad_setting['list_native_cnt'];
                    ads_settings['native']['exit_dialog_native'] = ad_setting['exit_dialoge_native'];
                    ads_settings['native']['native_button_text'] = (ad_setting['native_btn'] == "default") ? ad_setting['native_btn'] : ad_setting['native_btn_text'];
                    ads_settings['native']['native_color'] = null;

                    if(ad_setting['native_background_color'] != "" || 
                        ad_setting['native_text_color'] != "" ||
                        ad_setting['native_button_background_color'] != "" ||
                        ad_setting['native_button_text_color'] != "")
                    {

                        ads_settings['native']['native_color'] = {};
                        ads_settings['native']['native_color']['background'] = ad_setting['native_background_color'];
                        ads_settings['native']['native_color']['text'] = ad_setting['native_text_color'];
                        ads_settings['native']['native_color']['button_background'] = ad_setting['native_button_background_color'];
                        ads_settings['native']['native_color']['button_text'] = ad_setting['native_button_text_color'];
                    }
                }

                ads_settings['inter'] = null;
                if(ad_setting['inter_interval'] != "" || 
                    ad_setting['back_click_inter'] != "" ||
                    ad_setting['inter_loading'] != "" ||
                    ad_setting['alternate_with_appopen'] != "")
                {
                    ads_settings['inter'] = {};
                    ads_settings['inter']['inter_interval'] = ad_setting['inter_interval'];
                    ads_settings['inter']['back_click_inter'] = ad_setting['back_click_inter'];
                    ads_settings['inter']['inter_loading'] = ad_setting['inter_loading'];
                    ads_settings['inter']['alternate_app'] = ad_setting['alternate_with_appopen'];

                }

                ads_settings['app_open'] = null;
                if(ad_setting['splash_ads'] != "" || 
                    ad_setting['app_open'] != "" ||
                    ad_setting['app_open_loading'] != "")
                {
                    ads_settings['app_open'] = {};
                    ads_settings['app_open']['splash_ads'] = ad_setting['splash_ads'];
                    ads_settings['app_open']['app_open'] = ad_setting['app_open'];
                    ads_settings['app_open']['app_open_loading'] = ad_setting['app_open_loading'];
                }

                /************ Other Settings ************/
                if(ad_setting['all_ads'] != "" || 
                    ad_setting['fullscreen'] != "" || 
                    ad_setting['adblock_version'] != "" || 
                    ad_setting['continue_screen'] != "" || 
                    ad_setting['lets_start_screen'] != "" || 
                    ad_setting['age_screen'] != "" || 
                    ad_setting['next_screen'] != "" ||
                    ad_setting['next_inner_screen'] != "" ||
                    ad_setting['contact_screen'] != "" ||
                    ad_setting['start_screen'] != "" ||
                    ad_setting['real_casting_flow'] != "" ||
                    ad_setting['app_stop'] != "" ||
                    ad_setting['additional_fields'] != "")
                {
                    other_settings = {};
                    other_settings['allAds'] = ad_setting['all_ads'];
                    other_settings['screenNavigationFull'] = ad_setting['fullscreen'];
                    other_settings['versionCodeforAdblock'] = ad_setting['adblock_version'];
                    other_settings['continueScreen'] = ad_setting['continue_screen'];
                    other_settings['letStartScreen'] = ad_setting['lets_start_screen'];
                    other_settings['genderScreen'] = ad_setting['age_screen'];
                    other_settings['nextScreen'] = ad_setting['next_screen'];
                    other_settings['nextInnerScreen'] = ad_setting['next_inner_screen'];
                    other_settings['connectScreen'] = ad_setting['contact_screen'];
                    other_settings['startScreen'] = ad_setting['start_screen'];
                    other_settings['castingFlow'] = ad_setting['real_casting_flow'];
                    other_settings['dialogApp'] = ad_setting['app_stop'];
                    other_settings['additionalFields'] = JSON.parse(ad_setting['additional_fields']);
                                    
                    if(ad_setting['additional_fields'] != "" && ad_setting['additional_fields'] != null && ad_setting['additional_fields'] != []){
                        const additional_fields = JSON.parse(ad_setting['additional_fields']);
                        additional_fields.map((af) => {
                            const field_name = af['field_name'];
                            const field_value = af['value'];
                            other_settings[field_name] = field_value;
                        });
                    }
                }

                /************ VPN Settings ************/
                if(ad_setting['vpn'] != "" || 
                    ad_setting['vpn_dialog'] != "" || 
                    ad_setting['vpn_dialog_open'] != "" || 
                    ad_setting['vpn_country'] != "" || 
                    ad_setting['vpn_url'] != "" || 
                    ad_setting['vpn_carrier_id'] != "")
                {
                    vpn_settings = {};
                    vpn_settings['vpn'] = ad_setting['vpn'];
                    vpn_settings['vpn_dialog'] = ad_setting['vpn_dialog'];
                    vpn_settings['vpn_dialog_open'] = ad_setting['vpn_dialog_open'];
                    vpn_settings['vpn_country'] = JSON.parse(ad_setting['vpn_country']);
                    vpn_settings['vpn_url'] = ad_setting['vpn_url'];
                    vpn_settings['vpn_carrier_id'] = ad_setting['vpn_carrier_id'];
                }
            }
            res_data['google'] = google;
            res_data['app_remove'] = app_remove;
            res_data['ads_settings'] = ads_settings;
            res_data['other_settings'] = other_settings;
            res_data['vpn_settings'] = vpn_settings;
            /*****************************************************************************************/
            

            let response;
            if(token){
                const data = jwt.verify(token, JWT_SECRET);
                if(data){
                    response = res_data;
                }
            }
            else {
                response = encrypt(process.env.ENCR_KEY,process.env.ENCR_IV,JSON.stringify(res_data));
            }

            res.json({status:1, res_data: response, message: "User updated successfully."});
        }
        else {
            res.status(500).json({ status: 0, error: "Sorry! somthing went wrong"});
        }
    } catch (error) {
        res.status(500).json({ status: 0, error: "Internal server error"});
    }
});


module.exports = router;