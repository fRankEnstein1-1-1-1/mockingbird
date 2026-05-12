const express = require("express");

const router = express.Router();

const Note = require("../models/Notes");
const Folder = require("../models/Folder");

const auth = require("../middleware/auth");


// CREATE NOTE
router.post("/", auth, async (req, res) => {

    try {

        const { folderId, title, text } = req.body;

        // check folder ownership
        const folder = await Folder.findOne({
            _id: folderId,
            userId: req.user
        });

        if (!folder) {
            return res.status(404).json({
                message: "Folder not found"
            });
        }

        const note = await Note.create({
            userId: req.user,
            folderId,
            title,
            content: {
                text
            }
        });

        res.status(201).json(note);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// GET ALL NOTES IN FOLDER
router.get("/folder/:folderId", auth, async (req, res) => {

    try {

        const notes = await Note.find({
            folderId: req.params.folderId,
            userId: req.user
        });

        res.status(200).json(notes);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// GET SINGLE NOTE
router.get("/:id", auth, async (req, res) => {

    try {

        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user
        });

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        res.status(200).json(note);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});


// UPDATE NOTE
// UPDATE NOTE
router.put("/:id", auth, async (req, res) => {

    try {

        const { title, text } = req.body;

        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user
        });

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        // Safe title update
        if (title !== undefined) {
            note.title = title;
        }

        // Ensure content object exists
        if (!note.content) {
            note.content = {
                text: "",
                images: [],
                voiceNotes: [],
                annotations: []
            };
        }

        // Safe text update
        if (text !== undefined) {
            note.content.text = text;
        }

        note.updatedAt = new Date();

        await note.save();

        res.status(200).json(note);

    } catch (error) {

        console.log("UPDATE NOTE ERROR:", error);

        res.status(500).json({
            message: error.message
        });

    }

});


// DELETE NOTE
router.delete("/:id", auth, async (req, res) => {

    try {

        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            userId: req.user
        });

        if (!note) {
            return res.status(404).json({
                message: "Note not found"
            });
        }

        res.status(200).json({
            message: "Note deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

// ADD ANNOTATION TO NOTE
router.post('/:id/annotation', auth, async (req, res) => {
    try {
        const { annotation } = req.body;
        // annotation should be an object like:
        // { type: 'circle', x: 100, y: 200, radius: 50, color: '#ff0000' }

        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        note.content.annotations.push(annotation);
        note.updatedAt = Date.now();
        await note.save();

        res.status(200).json({
            message: 'Annotation added successfully',
            note
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPDATE ALL ANNOTATIONS (replace entire array)
router.put('/:id/annotations', auth, async (req, res) => {
    try {
        const { annotations } = req.body;

        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        note.content.annotations = annotations;
        note.updatedAt = Date.now();
        await note.save();

        res.status(200).json({
            message: 'Annotations updated successfully',
            note
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE SPECIFIC ANNOTATION
router.delete('/:id/annotation/:annotationIndex', auth, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            userId: req.user
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        note.content.annotations.splice(req.params.annotationIndex, 1);
        note.updatedAt = Date.now();
        await note.save();

        res.status(200).json({
            message: 'Annotation deleted successfully',
            note
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;