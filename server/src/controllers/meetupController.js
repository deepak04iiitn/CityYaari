import Meetup from '../models/Meetup.js';

// @desc    Create meetup
// @route   POST /api/meetups
// @access  Private
export const createMeetup = async (req, res) => {
  try {
    const { title, details, category, location } = req.body;
    if (!title?.trim() || !details?.trim()) {
      return res.status(400).json({ message: 'Title and details are required' });
    }

    const meetup = await Meetup.create({
      user: req.user._id,
      title: title.trim(),
      details: details.trim(),
      category: category?.trim() || 'Meetup',
      location: location?.trim() || '',
    });

    return res.status(201).json({ message: 'Meetup created', meetup });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get meetups
// @route   GET /api/meetups
// @access  Public
export const getMeetups = async (_req, res) => {
  try {
    const meetups = await Meetup.find()
      .populate('user', '_id fullName username profileImageUri')
      .sort({ createdAt: -1 });
    return res.json(meetups);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Update meetup by owner
// @route   PUT /api/meetups/:id
// @access  Private
export const updateMeetup = async (req, res) => {
  try {
    const meetup = await Meetup.findById(req.params.id);
    if (!meetup) return res.status(404).json({ message: 'Meetup not found' });
    if (meetup.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this meetup' });
    }

    const { title, details, category, location } = req.body;
    if (typeof title === 'string') meetup.title = title.trim();
    if (typeof details === 'string') meetup.details = details.trim();
    if (typeof category === 'string') meetup.category = category.trim();
    if (typeof location === 'string') meetup.location = location.trim();

    const updated = await meetup.save();
    return res.json({ message: 'Meetup updated', meetup: updated });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Delete meetup by owner
// @route   DELETE /api/meetups/:id
// @access  Private
export const deleteMeetup = async (req, res) => {
  try {
    const meetup = await Meetup.findById(req.params.id);
    if (!meetup) return res.status(404).json({ message: 'Meetup not found' });
    if (meetup.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this meetup' });
    }

    await Meetup.deleteOne({ _id: meetup._id });
    return res.json({ message: 'Meetup deleted' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};