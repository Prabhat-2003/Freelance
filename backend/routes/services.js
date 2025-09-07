const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const services = await Service.find().populate('seller', 'name profilePicture');
    res.json(services);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('seller', 'name profilePicture email');
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (user.userType !== 'freelancer') return res.status(403).json({ message: 'Only freelancers can create services' });

    const { title, description, price, images } = req.body;
    const service = new Service({
      title,
      description,
      price,
      images: images || [],
      seller: user._id
    });
    await service.save();
    res.json(service);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;