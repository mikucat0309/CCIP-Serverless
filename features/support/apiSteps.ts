import { Then, When } from '@cucumber/cucumber'
import { WorkerWorld } from './world'
import { expect } from 'expect'

const nestedAttribute = (obj: any, path: string) =>
  path.split('.').reduce((prev, curr) => prev?.[curr], obj)

When('I make a GET request to {string}', async function (this: WorkerWorld, path: string) {
  this.apiResponse = await this.api.fetch(`https://ccip.opass.app${path}`, { method: 'GET' })
})

When(
  'I make a POST request to {string}:',
  async function (this: WorkerWorld, path: string, payload: string) {
    this.apiResponse = await this.api.fetch(`https://ccip.opass.app${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
    })
  }
)

Then('the response status should be {int}', async function (statusCode) {
  expect(this.apiResponse?.status).toEqual(statusCode)
})

Then('the response json should be:', async function (this: WorkerWorld, expectedJsonString) {
  const expectedJson = JSON.parse(expectedJsonString)
  const actualJson = await this.apiResponse?.clone().json()
  expect(actualJson).toEqual(expectedJson)
})

Then(
  'the response json should have property {string} is null',
  async function (this: WorkerWorld, property) {
    const actualJson = await this.apiResponse?.clone().json()
    const actualValue = nestedAttribute(actualJson, property)
    expect(actualValue).not.toBeUndefined()
    expect(actualValue).toBeNull()
  }
)

Then(
  'the response json should have property {string} is not null',
  async function (this: WorkerWorld, property) {
    const actualJson = await this.apiResponse?.clone().json()
    const actualValue = nestedAttribute(actualJson, property)
    expect(actualValue).not.toBeUndefined()
    expect(actualValue).not.toBeNull()
  }
)
