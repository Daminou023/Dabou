import express, { Router } from 'express';

const router = express.Router();
const AdminEditorController = require('./admin.controller.editor');
const AdminEditorGamesController = require('./games/admin.controller.editor-games');


// GET LIST OF EVENTS
router.route('/list')
	.get(AdminEditorController.listEditors)


router.route('/new')
	.post(AdminEditorController.createNewEditor);


router.route('/:editorKey')
    .get(AdminEditorController.getEditor)        
    .put(AdminEditorController.editEditor)       
    .delete(AdminEditorController.deleteEditor); 


router.route('/:editorKey/games')
  .get(AdminEditorGamesController.getEditorGames)      
  .post(AdminEditorGamesController.addEditorGames)     
  .delete(AdminEditorGamesController.removeEditorGames)

module.exports = router;