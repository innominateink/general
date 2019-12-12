import 'mocha'
import { expect } from 'chai'

import { TransformationTree } from './TransformationTree'

describe('TransformationTree', () => {
  it('returns an object', () => {
    let transformation = new TransformationTree({
      a: {}
    })

    let obj = { a: 123 }
    let result = transformation.applyTo(obj)

    expect(result).to.be.an('object')
  })

  it('moves values to a new key on the transformed object', () => {
    let transformation = new TransformationTree({
      b: { from: 'a' },
      d: { from: 'c' },
      f: { from: 'e' }
    })

    let obj = {
      a: 'anything',
      c: 'qualquer coisa',
      e: 456
    }

    let result = transformation.applyTo(obj)

    expect(result)
      .and.have.keys('b', 'd', 'f')
      .but.not.have.keys('a', 'c', 'e')

    expect(result).to.deep.equal({
      b: 'anything',
      d: 'qualquer coisa',
      f: 456
    })
  })

  it('transforms values according to a function', () => {
    let transformation = new TransformationTree({
      a: { transformation: a => 'value was ' + a },
      z: { transformation: z => 'value was ' + z }
    })

    let obj = { a: 'zim', z: 'zed' }

    let result = transformation.applyTo(obj)

    expect(result).to.have.keys('a', 'z')

    expect(result.a)
      .to.be.a('string')
      .and.equal('value was zim')

    expect(result.z)
      .to.be.a('string')
      .and.equal('value was zed')
  })

  it('transforms values into literal values', () => {
    let transformation = new TransformationTree({
      a: { transformation: 123 },
      c: { transformation: 456 },
      e: { transformation: 'string' }
    })

    let obj = {
      a: 'anything',
      c: 'qualquer coisa',
      e: 456
    }

    let result = transformation.applyTo(obj)

    expect(result).to.have.keys('a', 'c', 'e')

    expect(result).to.deep.equal({
      a: 123,
      c: 456,
      e: 'string'
    })
  })

  it('transforms values according to a TransformationTree', () => {
    let buttonTT = new TransformationTree({
      text: {},
      target: {
        from: 'payload'
      }
    })

    let transformation = new TransformationTree<{ text: any; buttons: any }>({
      text: {},
      buttons: {
        transformation: buttonTT
      }
    })

    let obj = {
      text: 'anything',
      buttons: {
        text: 'test',
        payload: 'woof'
      }
    }

    let result = transformation.applyTo(obj)

    expect(result).to.have.keys('text', 'buttons')
    expect(result.buttons)
      .to.be.an('object')
      .and.have.keys('text', 'target')

    expect(result.text).to.exist.and.equal('anything')
    expect(result.buttons)
      .to.exist.and.be.an('object')
      .and.deep.equal({
        text: 'test',
        target: 'woof'
      })
    // expect(result.buttons.text).to.equal('test')
    // expect(result.buttons.payload).to.not.exist
    // expect(result.buttons.target).to.exist.and.equal('woof')
  })

  it('applies transformations separately', () => {
    let transformation = new TransformationTree({
      b: {
        from: 'a',
        transformation: a => '!' + a
      },
      c: {
        from: 'b',
        transformation: z => '!' + z
      }
    })

    let obj = { a: 'a', b: 'b' }

    let result = transformation.applyTo(obj)

    expect(result).to.deep.equal({
      b: '!a',
      c: '!b'
    })
  })

  it('filters out properties that are not declared in the transformation', () => {
    let transformation = new TransformationTree({ a: {}, b: {} })

    let obj = { a: 'a', b: 'b', c: 'c' }

    let result = transformation.applyTo(obj)

    expect(result).to.deep.equal({
      a: 'a',
      b: 'b'
    })
  })

  it('throws an error when a required property is not present', () => {
    let transformation = new TransformationTree({ a: { required: true } })

    let obj = { b: 'b', c: 'c' }

    expect(() => transformation.applyTo(obj)).to.throw('Required property "a" is not present')
  })

  it('throws an error when a property does not pass validation', () => {
    let transformation = new TransformationTree({
      a: {
        validate: val => val === true
      }
    })

    let obj = { a: false, b: 'b', c: 'c' }

    expect(() => transformation.applyTo(obj)).to.throw('Property "a" did not pass validation with value "false"')
  })

  it('throws an error with the correct message when the property would be moved but does not validate', () => {
    let transformation = new TransformationTree({
      a: {
        from: 'b',
        validate: val => val === true
      }
    })

    let obj = { b: false, c: 'c' }

    expect(() => transformation.applyTo(obj)).to.throw('Property "b" did not pass validation with value "false"')
  })

  it('throws an error when a TransformationTree node encounters a non-object', () => {
    let transformation = new TransformationTree({
      a: {
        transformation: new TransformationTree({ woof: {} })
      }
    })

    let obj = { a: 'throw me' }
    expect(() => transformation.applyTo(obj)).to.throw(
      'Encountered non-object property "a" with value "throw me" at TransformationTree node'
    )
  })
})
