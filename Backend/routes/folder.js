const express = require("express");

const Folder = require("../models/Folder");
const auth = require("../middleware/Auth");

const router = express.Router();


// CREATE FOLDER \git
router.post("/", auth, async (req, res) => {

    try {

        const { name, parentId } = req.body;

        let path = `/${name}`;

        if (parentId) {

            const parentFolder = await Folder.findOne({
                _id: parentId,
                userId: req.user
            });

            if (!parentFolder) {
                return res.status(404).json({
                    message: "Parent folder not found"
                });
            }

            path = `${parentFolder.path}/${name}`;
        }

        const folder = await Folder.create({
            userId: req.user,
            name,
            parentId: parentId || null,
            path
        });

        res.status(201).json(folder);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// GET ALL FOLDERS
router.get("/", auth, async (req, res) => {

    try {

        const folders = await Folder.find({
            userId: req.user
        });

        res.status(200).json(folders);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// GET SINGLE FOLDER
router.get("/:id", auth, async (req, res) => {

    try {

        const folder = await Folder.findOne({
            _id: req.params.id,
            userId: req.user
        });

        if (!folder) {
            return res.status(404).json({
                message: "Folder not found"
            });
        }

        res.status(200).json(folder);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// DELETE FOLDER
router.delete("/:id", auth, async (req, res) => {

    try {

        const folder = await Folder.findOne({
            _id: req.params.id,
            userId: req.user
        });

        if (!folder) {
            return res.status(404).json({
                message: "Folder not found"
            });
        }

        // delete subfolders
        await Folder.deleteMany({
            parentId: req.params.id
        });

        // delete main folder
        await Folder.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Folder deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

module.exports = router;