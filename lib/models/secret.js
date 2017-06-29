const environment = process.env.NODE_ENV || 'development';
const configuration = require('../../knexfile')[environment];
const database = require('knex')(configuration);

function createSecret(message){
  return database.raw(
    'INSERT INTO secrets (message, created_at) VALUES (?, ?)',
    [message, new Date]
  )
}
function emptySecretsTable() {
  return database.raw('TRUNCATE secrets RESTART IDENTITY')
}

function findFirst() {
  return database.raw("SELECT * FROM secrets LIMIT 1")
}

function find(id){
  return database.raw("SELECT * FROM secrets WHERE id=?", [id])
}

module.exports = {
  create: createSecret,
  first: findFirst,
  find: find,
  destroyAll: emptySecretsTable
}
