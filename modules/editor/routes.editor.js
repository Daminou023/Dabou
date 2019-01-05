import express, { Router } from 'express';

const router = express.Router();
const EditorController = require('./controller.editor');
const EditorGamesController = require('./games/controller.editor-games');


// GET LIST OF EVENTS
router.route('/list')
	.get(EditorController.listEditors)


router.route('/new')
	.post(EditorController.createNewEditor);


router.route('/:editorKey')
    .get(EditorController.getEditor)        
    .put(EditorController.editEditor)       
    .delete(EditorController.deleteEditor); 


router.route('/:editorKey/games')
  .get(EditorGamesController.getEditorGames)      
  .post(EditorGamesController.addEditorGames)     
  .delete(EditorGamesController.removeEditorGames)

module.exports = router;