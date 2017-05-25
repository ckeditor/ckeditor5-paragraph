/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paragraph/paragraphcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command/command';
import Position from '@ckeditor/ckeditor5-engine/src/model/position';
import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * The paragraph command.
 *
 * @extends module:core/command/command~Command
 */
export default class ParagraphCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Value of the command, indicating whether it is applied in the context
		 * of current {@link module:engine/model/document~Document#selection selection}.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean}
		 */
		this.set( 'value', false );

		// Update current value each time changes are done on document.
		this.listenTo( editor.document, 'changesDone', () => {
			this.refreshValue();
			this.refreshState();
		} );
	}

	/**
	 * Executes the command. All the blocks (see {@link module:engine/model/schema~Schema}) in the selection
	 * will be turned to paragraphs.
	 *
	 * @protected
	 * @param {Object} [options] Options for executed command.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps.
	 * New batch will be created if this option is not set.
	 * @param {module:engine/model/selection~Selection} [options.selection] Selection the command should be applied to.
	 * By default, if not provided, the command is applied to {@link module:engine/model/document~Document#selection}.
	 */
	_doExecute( options = {} ) {
		const document = this.editor.document;

		document.enqueueChanges( () => {
			const batch = options.batch || document.batch();
			const blocks = ( options.selection || document.selection ).getSelectedBlocks();

			for ( const block of blocks ) {
				if ( !block.is( 'paragraph' ) ) {
					batch.rename( block, 'paragraph' );
				}
			}
		} );
	}

	/**
	 * Updates command's {@link #value value} based on current selection.
	 */
	refreshValue() {
		const block = first( this.editor.document.selection.getSelectedBlocks() );

		this.value = !!block && block.is( 'paragraph' );
	}

	/**
	 * @inheritDoc
	 */
	_checkEnabled() {
		const block = first( this.editor.document.selection.getSelectedBlocks() );

		return !!block && this.editor.document.schema.check( {
			name: 'paragraph',
			inside: Position.createBefore( block )
		} );
	}
}
