import { em, entity, text } from 'bknd'

const schema = em({
  users: entity('users', {
    name: text().required(),
  }),
})

// Check what em() returns
type EmReturnType = typeof schema

// This should work - toJSON exists
const jsonConfig = schema.toJSON()

// This should FAIL - repo does NOT exist on em() return value
// const userRepo = schema.repo('User'); // ERROR: Property 'repo' does not exist

// This should FAIL - repository does NOT exist on em() return value
// const userRepo2 = schema.repository('User'); // ERROR: Property 'repository' does not exist

// This should FAIL - mutator does NOT exist on em() return value
// const userMutator = schema.mutator('User'); // ERROR: Property 'mutator' does not exist

console.log('Schema config:', jsonConfig)
