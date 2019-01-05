import express, { Router } from 'express';

const router = express.Router();
const AuthorController = require('./controller.author');
const AuthorGamesController = require('./games/controller.author-games');


// GET LIST OF EVENTS
router.route('/list')
	.get(AuthorController.listAuthors)


router.route('/new')
	.post(AuthorController.createNewAuthor);


router.route('/:authorKey')
  .get(AuthorController.getAuthor)        
  .put(AuthorController.editAuthor)       
  .delete(AuthorController.deleteAuthor); 


router.route('/:authorKey/games')
  .get(AuthorGamesController.getAuthorGames)      
  .post(AuthorGamesController.addAuthorGames)     
  .delete(AuthorGamesController.removeAuthorGames);

module.exports = router;