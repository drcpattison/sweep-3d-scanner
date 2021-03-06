/**
 * File Manager Route:
 * Contains all the route and backend logic for the file manager page.
 */

// Module Includes
const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

// backend variables
const scan_file_dir = path.join(__dirname, "../output_scans/");
// create directory if it doesn't yet exist
if (!fs.existsSync(scan_file_dir)) {
    fs.mkdirSync(scan_file_dir);
}

// Setup express
var app = express();
//gives your app the ability to parse JSON
app.use(bodyParser.json());
//allows app to read data from URLs (GET requests)
app.use(bodyParser.urlencoded({ extended: false }));


//set the views folder and the view engine
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'jade');

//tells app to use the /public directory where stylesheets and scripts are stored
app.use(express.static(path.join(__dirname, '../public')));

// create a router to handle any routing
var router = express.Router();
app.use(router);

// render the main file manager page
router.route('/')
    .all(function (req, res, next) {
        //console.log('Someone made a request!');
        next();
    })
    .get(function (req, res, next) {
        res.render('file_manager');
    })

// handle requests for the scan files
router.route('/request_scan_files')
    .get(function (req, res, next) {
        res.send({
            files: getScanFiles()
        });
    })

// handle request to delete a specific file
router.route('/delete_file')
    .get(function (req, res, next) {
        let filename = req.query.file;
        console.log(`Deleting...${filename}`);
        deleteFile(filename);
        res.send({
            bSuccessfullyDeletedFile: true,
            file: filename,
            updatedFileList: getScanFiles()
            //errorMsg: ""
        });
    })

// handle request to download a specific file
router.route('/download_file/:file(*)')
    .get(function (req, res, next) {
        let filename = req.params.file;
        if (checkFile(filename))
            res.download(path.join(scan_file_dir, filename));
    })

// returns a list of available scan files
function getScanFiles() {
    // retrieve and chronolgically sort the file names
    let file_names = fs.readdirSync(scan_file_dir);
    file_names.sort(compareFileTimestampDescending);
    return file_names;
}

// compare function used to sort a list of filenames in descending chronological order 
// (ie: most recent first)
function compareFileTimestampDescending(file_a, file_b) {
    return fs.statSync(path.join(scan_file_dir, file_b)).mtime.getTime() -
        fs.statSync(path.join(scan_file_dir, file_a)).mtime.getTime();
}

// deletes a specific scan file
function deleteFile(filename) {
    //let file = path.join('./output_scans/', filename);
    let file = path.join(scan_file_dir, filename);
    fs.unlinkSync(file);
}

// returns true if file exists
function checkFile(filename) {
    let file = path.join(scan_file_dir, filename);
    return fs.existsSync(file);
}

module.exports = app;