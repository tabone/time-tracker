'use strict'

const fs = require('fs')
const path = require('path')
const { remote } = require('electron')

/**
 * File path used to store the app data.
 * @type {string}
 */
const dbPath = path.join(remote.app.getPath('userData'), 'db.json')

/**
 * Function used to return the persisted graph stored in the app data file. This
 * function is implemented in a way that it only retrieves the data file once.
 * @return {Promise}    When the data file is retrieved successfully, it returns
 *                      a resolved promise with the app data.
 * @return {Promise}    When the data file is not retrieved successfully, it
 *                      returns a rejected promise with an error.
 */
const loadGraph = (() => {
  /**
   * Promise object that will store the promise returned by the function used to
   * load the graph.
   * @type {Promise}
   */
  let promise = null

  return () => {
    // Only read the app data file, if it hasn't already been read.
    if (promise === null) promise = loadDB()

    // Return the promise returned by the function used to load the graph.
    return promise
  }
})()

/**
 * Module used to ease the process to do CRUD operations on the data used by the
 * app.
 * @type {Object}
 * @module src/store
 */
module.exports = {
  /**
   * Function used to retrieve resources. This function can be used to retrieve
   * a single resource by its `type` and `id` and to retrieve all the resources
   * of a certain type.
   * @param  {string} type Resource type.
   * @param  {number} id   Resource ID.
   * @return {Promise}     When this function is invoked with the `type` param
   *                       only and it is successful, it returns a resolved
   *                       promise with an array of resources having the
   *                       specified type.
   * @return {Promise}     When this function is invoked with the `type` & `id`
   *                       params and it is successful, it returns a single
   *                       resource having the specified type & id.
   * @return {Promise}     When this function is invoked with a `type` that does
   *                       not exist in the graph, it returns a rejected promise
   *                       with an error.
   */
  async find (type, id) {
    /**
     * Graph storing all the resources used in the app indexed by their type and
     * id.
     * @type {object}
     */
    const graph = await loadGraph()

    // Throw an error when the specified type doesn't exist in the graph.
    if (graph[type] === undefined) throw new Error('unrecognized type')

    // Return resource having the specified type & id if this function is
    // invoked with the `id` param.
    if (id != null) return graph[type][id]

    // Return an array of resources having the specified type if this function
    // is invoked with the `type` param only.
    return Object.keys(graph[type]).map(id => graph[type][id])
  },

  /**
   * Function used to persist a resource.
   * @param  {object} resource      Resource to be persisted.
   * @param  {object} resource.id   Resource id.
   * @param  {object} resource.type Resource type.
   * @return {Promise}              When the resource is persisted successfully,
   *                                it returns a resolved promise with the
   *                                updated graph.
   * @return {Promise}              When the resource to be persisted doesn't
   *                                have a type, it returns a rejected promise
   *                                with an error.
   * @return {Promise}              When the resource is not persisted
   *                                successfully, it returns a rejected promise
   *                                with an error.
   */
  async save (resource) {
    // Throw error if resource doesn't have a type.
    if (resource.type == null) throw new Error('resources must have a type')

    /**
     * Graph storing all the resources used in the app indexed by their type and
     * id.
     * @type {object}
     */
    const graph = await loadGraph()

    // Create entry for the type of the resource to be persisted.
    if (graph[resource.type] === undefined) graph[resource.type] = {}

    /**
     * Resource ID
     * @type {number}
     */
    let resourceID = resource.id

    // Generate a unique ID if:
    //   * Resource to be persisted doesn't have one.
    //   * Resource to be persisted is a new resource.
    if (resourceID == null || graph[resource.type][resource.id] === undefined) {
      resourceID = await generateUniqueID(resource.type)
    }

    // Update ID of resource object to be persisted Resource ID.
    resource.id = resourceID

    // Include resource object in the graph.
    graph[resource.type][resourceID] = resource

    // Persist graph.
    return persistGraph(graph)
  },

  /**
   * Function used to remove a resource.
   * @param  {Object} resource      Resource to be removed.
   * @param  {object} resource.id   Resource id.
   * @param  {object} resource.type Resource type.
   * @return {Promise}              When the resource is removed successfully,
   *                                it returns a resolved promise with the
   *                                updated graph.
   * @return {Promise}              When the resource to be removed doesn't have
   *                                a type, it returns a rejected promise with
   *                                an error.
   * @return {Promise}              When the resource is not removed
   *                                successfully, it returns a rejected promise
   *                                with an error.
   */
  async delete (resource) {
    // Throw error if resource doesn't have a type.
    if (resource.type == null) throw new Error('resources must have a type')

    // Stop process if resource doesn't have an ID. When a resource doesn't have
    // an ID, it means that it is not persisted.
    if (resource.id == null) return

    /**
     * Graph storing all the resources used in the app indexed by their type and
     * id.
     * @type {object}
     */
    const graph = await loadGraph()

    // Stop process if the graph is not storying any resources of the same type
    // of the resource to be removed.
    if (graph[resource.type] === undefined) return

    // Remove resource from graph.
    delete graph[resource.type][resource.id]

    // Persist graph.
    return persistGraph(graph)
  }
}

/**
 * Function used to load the app data from the data file.
 * @return {Promise} [description]
 */
function loadDB () {
  return new Promise((resolve, reject) => {
    // Retrieve content from data file
    fs.readFile(dbPath, 'utf-8', async (err, content) => {
      // Rejected promise with the error if an error is occured and is not
      // because the app data file wasn't found.
      if (err && err.code !== 'ENOENT') return reject(err)

      // When the app data file is found, resolve the promise with the content
      // of the app data file. If it is not found, create it & resolve the
      // promise with the new content of the app data file.
      resolve((err) ? await persistGraph({}) : JSON.parse(content))
    })
  })
}

/**
 * Function used to update the app data file.
 * @param  {Object} payload Data to be persisted.
 * @return {Promise}        When the data is persisted successfully, it returns
 *                          a reslved promise with the new persisted data.
 * @return {Promise}        When the data is not persisted successfully, it
 *                          returns a rejected promise with an error.
 */
function persistGraph (payload) {
  return new Promise((resolve, reject) => {
    // Create/Replace app data file with new data.
    fs.writeFile(dbPath, JSON.stringify(payload), 'utf-8', err => {
      // Reject promise with the error, if an error occurs.
      if (err) return reject(err)

      // Resolve promise with the new persisted data when the app data file is
      // created successfully.
      resolve(payload)
    })
  })
}

/**
 * Function used to generate a unique ID for a resource.
 * @param  {String} type Type of the resource which the ID will be used by.
 * @return {number}      Unique ID.
 */
async function generateUniqueID (type) {
  /**
   * Graph storing all the resources used in the app indexed by their type and
   * id.
   * @type {object}
   */
  const graph = await loadGraph()

  // When there is no entry for the type, return 0 as an ID.
  if (graph[type] === undefined) return 0

  // When there is an entry for the type, find the maxinum ID and add it with 1.
  return Math.max(0, ...Object.keys(graph[type])) + 1
}
