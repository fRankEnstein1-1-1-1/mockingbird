const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const auth = require('../middleware/auth');
const Note = require('../models/Notes');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// UPLOAD IMAGE TO NOTE
router.post('/image/:noteId', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Find note and verify ownership
        const note = await Note.findOne({
            _id: req.params.noteId,
            userId: req.user
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Upload to Cloudinary using buffer
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'notes-app/images',
                resource_type: 'image'
            },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ message: 'Upload failed', error: error.message });
                }

                // Add image URL to note
                note.content.images.push(result.secure_url);
                note.updatedAt = Date.now();
                await note.save();

                res.status(200).json({
                    message: 'Image uploaded successfully',
                    imageUrl: result.secure_url,
                    note
                });
            }
        );

        // Pipe the buffer to Cloudinary
        const streamifier = require('streamifier');
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// UPLOAD VOICE NOTE
router.post('/voice/:noteId', auth, upload.single('voice'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Find note and verify ownership
        const note = await Note.findOne({
            _id: req.params.noteId,
            userId: req.user
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Upload to Cloudinary
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'notes-app/voice',
                resource_type: 'video' // Cloudinary uses 'video' for audio files
            },
            async (error, result) => {
                if (error) {
                    return res.status(500).json({ message: 'Upload failed', error: error.message });
                }

                // Add voice URL to note
                note.content.voiceNotes.push(result.secure_url);
                note.updatedAt = Date.now();
                await note.save();

                res.status(200).json({
                    message: 'Voice note uploaded successfully',
                    voiceUrl: result.secure_url,
                    note
                });
            }
        );

        const streamifier = require('streamifier');
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE IMAGE FROM NOTE
router.delete('/image/:noteId', auth, async (req, res) => {
    try {
        const { imageUrl } = req.body;

        const note = await Note.findOne({
            _id: req.params.noteId,
            userId: req.user
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Remove from array
        note.content.images = note.content.images.filter(url => url !== imageUrl);
        note.updatedAt = Date.now();
        await note.save();

        // Extract public_id from Cloudinary URL and delete
        const publicId = imageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`notes-app/images/${publicId}`);

        res.status(200).json({
            message: 'Image deleted successfully',
            note
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE VOICE NOTE
router.delete('/voice/:noteId', auth, async (req, res) => {
    try {
        const { voiceUrl } = req.body;

        const note = await Note.findOne({
            _id: req.params.noteId,
            userId: req.user
        });

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        // Remove from array
        note.content.voiceNotes = note.content.voiceNotes.filter(url => url !== voiceUrl);
        note.updatedAt = Date.now();
        await note.save();

        // Extract public_id and delete
        const publicId = voiceUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(`notes-app/voice/${publicId}`, { resource_type: 'video' });

        res.status(200).json({
            message: 'Voice note deleted successfully',
            note
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;