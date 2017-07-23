'use strict'

/**
 * Component used to create new tasks.
 * @type {Object}
 * @module src/components/new-task
 */
module.exports = {
  data () {
    return {
      /**
       * Name of the task to be created.
       * @type {String}
       */
      name: null
    }
  },
  mounted () {
    /**
     * DOM Selector used to retrieve HTML Elements that should be upgraded as
     * Material Design Lite elements.
     * @type {String}
     */
    const selector = '[class^="mdl-"]'

    // Upgrade Material Design Lite Elements.
    componentHandler.upgradeElements(this.$el.querySelectorAll(selector))
  },
  methods: {
    /**
     * Function used to emit the 'create-task' event with the name of the task.
     * In addition to this it closes the dialog & resets the instance variable
     * used to store the task name.
     */
    createTask () {
      // Emit 'create-task' event with the task name.
      this.$emit('create-task', this.name)

      // Close dialog.
      this.$el.close()

      // Reset instance variable used to store the task name.
      this.name = null
    },

    /**
     * Function used to reset the instance variable used to store the task name
     * and closes the dialog with emitting the 'create-task' event.
     */
    closeDialog () {
      // Close dialog.
      this.$el.close()

      // Reset instance variable used to store the task name.
      this.name = null
    }
  }
}
