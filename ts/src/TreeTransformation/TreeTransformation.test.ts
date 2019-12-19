import 'mocha'
import { expect, should } from 'chai'
should()

import { TreeTransformation } from './TreeTransformation'

describe('TreeTransformation', () => {
  describe('return value', () => {
    it('returns an object', () => {
      const transformation = new TreeTransformation({
        a: {}
      })

      const obj = { a: 123 }
      const result = transformation.applyTo(obj)

      expect(result).to.be.an('object')
    })
  })

  it('moves values to a new key on the transformed object', () => {
    const transformation = new TreeTransformation({
      b: { from: 'a' },
      d: { from: 'c' },
      f: { from: 'e' }
    })

    const obj = {
      a: 'anything',
      c: 'qualquer coisa',
      e: 456
    }

    const result = transformation.applyTo(obj)

    expect(result)
      .to.have.keys('b', 'd', 'f')
      .but.not.have.keys('a', 'c', 'e')

    expect(result).to.deep.equal({
      b: 'anything',
      d: 'qualquer coisa',
      f: 456
    })
  })

  describe('transformations', () => {
    it('transforms values according to a function', () => {
      const transformation = new TreeTransformation({
        a: { transformation: a => 'value was ' + a },
        z: { transformation: z => 'value was ' + z }
      })

      const obj = { a: 'zim', z: 'zed' }

      const result = transformation.applyTo(obj)

      expect(result).to.have.keys('a', 'z')

      expect(result.a)
        .to.be.a('string')
        .and.equal('value was zim')

      expect(result.z)
        .to.be.a('string')
        .and.equal('value was zed')
    })

    it('transforms values into literal values', () => {
      const transformation = new TreeTransformation({
        a: { transformation: 123 },
        c: { transformation: 456 },
        e: { transformation: 'string' }
      })

      const obj = {
        a: 'anything',
        c: 'qualquer coisa',
        e: 456
      }

      const result = transformation.applyTo(obj)

      expect(result).to.have.keys('a', 'c', 'e')

      expect(result).to.deep.equal({
        a: 123,
        c: 456,
        e: 'string'
      })
    })

    it('transforms values according to a TransformationTree', () => {
      const buttonTT = new TreeTransformation({
        text: {},
        target: {
          from: 'payload'
        }
      })

      const transformation = new TreeTransformation<{ text: any; buttons: any }>({
        text: {},
        buttons: {
          transformation: buttonTT
        }
      })

      const obj = {
        text: 'anything',
        buttons: {
          text: 'test',
          payload: 'woof'
        }
      }

      const result = transformation.applyTo(obj)

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
    })
  })

  describe('error cases', () => {
    it('throws an error when a required property is not present', () => {
      const transformation = new TreeTransformation({ a: { required: true } })

      const obj = { b: 'b', c: 'c' }

      expect(() => transformation.applyTo(obj)).to.throw('Required property "a" is not present')
    })

    it('throws an error when a property does not pass validation', () => {
      const transformation = new TreeTransformation({
        a: {
          validate: val => val === true
        }
      })

      const obj = { a: false, b: 'b', c: 'c' }

      expect(() => transformation.applyTo(obj)).to.throw('Property "a" did not pass validation with value "false"')
    })

    it('throws an error with the correct message when the property would be moved but does not validate', () => {
      const transformation = new TreeTransformation({
        a: {
          from: 'b',
          validate: val => val === true
        }
      })

      const obj = { b: false, c: 'c' }

      expect(() => transformation.applyTo(obj)).to.throw('Property "b" did not pass validation with value "false"')
    })

    it('throws an error when a TransformationTree node encounters a non-object', () => {
      const transformation = new TreeTransformation({
        a: {
          transformation: new TreeTransformation({ woof: {} })
        }
      })

      const obj = { a: 'throw me' }
      expect(() => transformation.applyTo(obj)).to.throw(
        'Encountered non-object property "a" with value "throw me" at TransformationTree node'
      )
    })
  })

  it('applies transformations separately', () => {
    const transformation = new TreeTransformation({
      b: {
        from: 'a',
        transformation: a => '!' + a
      },
      c: {
        from: 'b',
        transformation: z => '!' + z
      }
    })

    const obj = { a: 'a', b: 'b' }

    const result = transformation.applyTo(obj)

    expect(result).to.deep.equal({
      b: '!a',
      c: '!b'
    })
  })

  it('filters out properties that are not declared in the transformation', () => {
    const transformation = new TreeTransformation({ a: {}, b: {} })

    const obj = { a: 'a', b: 'b', c: 'c' }

    const result = transformation.applyTo(obj)

    expect(result).to.deep.equal({
      a: 'a',
      b: 'b'
    })
  })
})
