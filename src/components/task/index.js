'use strict'

/**
 * Component used to represent a persisted task.
 * @type {Object}
 * @module src/components/tasks
 */
module.exports = {
  props: {
    /**
     * Task ID.
     * @type {number}
     */
    id: {
      type: 'Number',
      required: true
    },

    /**
     * Task Name.
     * @type {string}
     */
    name: {
      type: 'String',
      default: 'Unamed task'
    },

    /**
     * Task time entries.
     * @type {Array{Object}}
     */
    entries: {
      type: 'Array',
      default: []
    },

    /**
     * ID of the active task.
     * @type {number}
     */
    ongoingTaskID: {
      type: 'Number'
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
  computed: {
    /**
     * Total time the task has been active.
     * @return {String} Total time the task has been active.
     */
    time () {
      // Calculate the total time by adding all the task time entries.
      const total = this.entries.reduce((total, entry) => {
        return total + (entry.to - entry.from)
      }, 0)

      // Return a friendly time.
      return friendlyTime(total)
    },

    /**
     * Determines whether the task is currenty active.
     * @return {Boolean} TRUE if the task is currently active, false otherwise.
     */
    isOngoingTask () {
      return this.ongoingTaskID === this.id
    },

    /**
     * Icon used in the button for toggling the task state.
     * @return {String} Name of the icon used in the button for toggling the
     *                  task state.
     */
    actionIcon () {
      return (this.isOngoingTask) ? 'play_circle_filled' : 'pause_circle_filled'
    }
  },
  methods: {
    /**
     * Function used to toggle the task status by emitting the 'start-stop-task'
     * event with the task ID.
     */
    startStopTask () {
      this.$emit('start-stop-task', this.id)
    },

    /**
     * Function used to delete the task by emitting the 'delete-task' event with
     * the task ID.
     */
    deleteTask () {
      this.$emit('delete-task', this.id)
    }
  }
}

/**
 * Recursive function used to display a friendly total time a task has been
 * active.
 * @param  {number} milliseconds Milliseconds which the task has been active
 * @return {String}              Friendly time.
 */
function friendlyTime (milliseconds) {
  const seconds = Math.floor(milliseconds / 1000)
  if (seconds < 60) {
    return `${seconds}sec`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    milliseconds -= (minutes * 1000 * 60)
    return `${minutes}min ${friendlyTime(milliseconds)}`
  }

  const hours = Math.floor(minutes / 60)
  if (hours < 24) {
    milliseconds -= (hours * 1000 * 60 * 60)
    return `${hours}hr ${friendlyTime(milliseconds)}`
  }

  const days = Math.floor(hours / 24)
  if (days < 7) {
    milliseconds -= (days * 1000 * 60 * 60 * 24)
    return `${days}d ${friendlyTime(milliseconds)}`
  }

  const weeks = Math.floor(days / 7)
  if (weeks < 4) {
    milliseconds -= (weeks * 1000 * 60 * 60 * 24 * 7)
    return `${weeks}w ${friendlyTime(milliseconds)}`
  }

  const months = Math.floor(weeks / 4)
  if (months < 12) {
    milliseconds -= (months * 1000 * 60 * 60 * 24 * 7 * 4)
    return `${months}m ${friendlyTime(milliseconds)}`
  }

  const years = Math.floor(months / 12)
  if (years < 12) {
    milliseconds -= (years * 1000 * 60 * 60 * 24 * 7 * 4 * 12)
    return `${years}y ${friendlyTime(milliseconds)}`
  }
}
