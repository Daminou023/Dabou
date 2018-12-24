import express, { Router } from 'express';

const router = express.Router();
const AdminAuthorController = require('./admin.controller.author');
const AdminAuthorGamesController = require('./games/admin.controller.author-games');


// GET LIST OF EVENTS
router.route('/list')
	.get(AdminAuthorController.listAuthors)


router.route('/new')
	.post(AdminAuthorController.createNewAuthor);


router.route('/:authorKey')
    .get(AdminAuthorController.getAuthor)        
    .put(AdminAuthorController.editAuthor)       
    .delete(AdminAuthorController.deleteAuthor); 


router.route('/:authorKey/games')
  .get(AdminAuthorGamesController.getAuthorGames)      
  .post(AdminAuthorGamesController.addAuthorGames)     
  .delete(AdminAuthorGamesController.removeAuthorGames)

module.exports = router;