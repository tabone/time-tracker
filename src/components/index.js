'use strict'

const fs = require('fs')
const path = require('path')

/**
 * Promise object resolved with an array of objects containing the name and
 * options of each component that should be registered with Vue.
 * @type {Promise}
 */
module.exports = retrieveComponents().then(retrieveComponentsOptions)

/**
 * Function used to retrieve the names of components that should be registered
 * with Vue.
 * @return {Promise} When the names of the components is retrieved successfully,
 *                   it returns a resolved promise with the names of the
 *                   components that should be registered to Vue.
 * @return {Promise} When the names of the components is not retrieved
 *                   successfully, it returns a rejected promise with an error.
 */
function retrieveComponents () {
  return new Promise((resolve, reject) => {
    // Retrieve the name of the files in the components directory.
    fs.readdir(__dirname, 'utf-8', (err, files) => {
      // If an error occurs, return a rejected promise with the error.
      if (err) return reject(err)

      // Else return the list of files in the components directory excluding
      // this file (i.e. index.js).
      resolve(files.filter(file => file !== 'index.js'))
    })
  })
}

/**
 * Function used to retrieve the options of the provided components.
 * @param  {Array{string}} components Components that should have their options
 *                                    retrieved.
 * @return {Promise}                  When all options are retrieved
 *                                    successfully, it returns a resolved
 *                                    promise with the options of all
 *                                    components.
 * @return {Promise}                  When not all options are retrieved
 *                                    successfully, it returns a rejected
 *                                    promise with an error.
 */
async function retrieveComponentsOptions (components) {
  return await Promise.all(components.map(retrieveComponentOptions))
}

/**
 * Function used to retrieve the options of a single component.
 * @param  {string} name Component name.
 * @return {Promise}     When the options of the specified component is
 *                       successfully retrieved, it returns a resolved promise
 *                       with the component options.
 * @return {Promise}     When the options of the specified component is not
 *                       successfully retrieved, it returns a rejected promise
 *                       with an error.
 */
async function retrieveComponentOptions (name) {
  // Retrieve component options.
  const options = require(`./${name}/index`)

  // Configure component template.
  options.template = await retrieveTemplate(name)

  // Return component.
  return { name, options }
}

/**
 * Function used to retrieve the template of a single component.
 * @param  {string} name Component name.
 * @return {Promise}     When the template of specified component is retrieved
 *                       successfully, it returns a resolved promise with the
 *                       template content.
 * @return {Promise}     When the template of specified component is not
 *                       retrieved successfully, it returns a rejected promise
 *                       with an error.
 */
function retrieveTemplate (name) {
  return new Promise((resolve, reject) => {
    /**
     * Path for the template file of the specified component.
     * @type {string}
     */
    const templateFile = path.join(__dirname, name, 'template.html')

    // Retrieve component template.
    fs.readFile(templateFile, 'utf-8', (err, data) => {
      // If an error occurs, return a rejected promise with the error.
      if (err) return reject(err)

      // If no error occurs, return a resolved proimise with the template
      // content.
      resolve(data)
    })
  })
}
