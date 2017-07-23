'use strict'

const store = require('../../store')

/**
 * Component used to display the persisted tasks.
 * @type {Object}
 */
module.exports = {
  data () {
    // Retrieve and store all the tasks.
    store.find('tasks').then(tasks => { this.tasks = tasks })

    return {
      /**
       * Array containing the list of persisted tasks.
       * @type {Array}
       */
      tasks: [],

      /**
       * ID of the currently active task.
       * @type {number}
       */
      ongoingTaskID: null,

      /**
       * The timestamp when the active task has been activated.
       * @type {number}
       */
      ongoingTaskFrom: null,

      /**
       * Contains listeners registered to external events.
       * @type {Object}
       */
      listeners: {
        /**
         * Listener used to open the New Task Dialog.
         * @type {Function}
         */
        openNewTaskDialog: null
      }
    }
  },
  created () {
    // Create & store a reference for the listener used to open the New Task
    // Dialog.
    const openNewTaskDialog = this.listeners.openNewTaskDialog = ((ev) => {
      if (ev.shiftKey & ev.ctrlKey & ev.keyCode === 67) {
        this.$el.querySelector('dialog').showModal()
      }
    }).bind(this)

    // Add listener to the window's onkeydown event.
    window.addEventListener('keydown', openNewTaskDialog)
  },
  destroyed () {
    // When this component is destroyed remove any external listeners.
    window.removeEventListener('keydown', this.listeners.openNewTaskDialog)
  },
  watch: {
    /**
     * Watcher used to store the current timestamp when a new task is activated.
     */
    ongoingTaskID (newValue) {
      this.ongoingTaskFrom = (newValue === null) ? null : (new Date()).getTime()
    }
  },
  methods: {
    /**
     * Function used as a listener for `start-stop-task` event emitted by the
     * `task` component and is used to toggle the status of the current active
     * task.
     * @param  {number} id ID of task that emitted the `start-stop-task` event.
     */
    async startStopTask (id) {
      // Create a new time entry in the current active task if there is one. 
      if (this.ongoingTaskID !== null) {
        // Retrive the resource of the current active task.
        const ongoingTask = await store.find('tasks', this.ongoingTaskID)

        // Add a new time entry.
        ongoingTask.entries.push({
          from: this.ongoingTaskFrom,
          to: (new Date()).getTime()
        })

        // Persist change.
        store.save(ongoingTask)
      }

      // Stop the current active task if the task that emitted the
      // `start-stop-task` event is the same as the current active task.
      this.ongoingTaskID = (this.ongoingTaskID === id) ? null : id
    },

    /**
     * Function used to remove a task.
     * @param  {number} id ID of task to be removed.
     */
    async deleteTask (id) {
      // Retrieve task from store.
      const task = await store.find('tasks', id)

      // Retrieve the position of the graph inside the array used by this
      // component to store the persisted tasks.
      const position = this.tasks.indexOf(task)

      // Stop process if the task to be removed isn't in the array used by this
      // component to store the persisted tasks.
      if (position === -1) return

      // Remove task from app data file.
      await store.delete(task)

      // Remove task from the array used by this component to store the
      // persisted tasks.
      this.tasks.splice(position, 1)
    },

    /**
     * Function used to create a new task.
     * @param  {String} name Name of new task.
     */
    async createTask (name) {
      // Create a task resource.
      const task = { type: 'tasks', name, entries: [] }

      // Persist new task in app data file.
      await store.save(task)

      // Include task in the array used by this component to store the persisted
      // tasks.
      this.tasks.push(task)
    }
  }
}