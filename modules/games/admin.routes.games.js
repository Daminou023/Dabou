import express, { Router } from 'express';

const router = express.Router();


// GET LIST OF GAMES
router.get('/', function(req, res) {
  res.send('Monopoly, Yahtzee, Scrable')
})

module.exports = router;