'use strict'

;(async function () {
  /**
   * Root HTML Element.
   * @type {Object}
   */
  const rootElement = document.querySelector('.app')

  // Register all components.
  (await require('./components')).forEach(component => {
    Vue.component(component.name, component.options)
  })
  
  // Initialize Vue instance.
  const vm = new Vue({ el: rootElement, data: { page: 'page-one' }})
}())
