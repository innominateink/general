export class TransformationTree<MsgType> {
  public keys: Transforms<MsgType>

  constructor(keys: Transforms<MsgType>) {
    this.keys = keys
  }

  applyTo(obj: GenericObject): MsgType {
    const transformed = {} as MsgType

    for (let newKey in this.keys) {

      let { from: oldKey = newKey, transformation, required = false, validate } = this.keys[newKey]

      let currentValue = obj[oldKey]

      // Check only for undefined, as any other value is allowed
      if (currentValue !== undefined) {
        if (validate && !validate(currentValue))
          throw Error(`Property "${newKey}" did not pass validation with value "${currentValue}"`)

        /*
        Assign value to its new place on the return object:
        - If there's no transformation, return the current value.
        - If the transformation is another TransformationTree and the current value is an object, apply it to the object.
        - If the transformation is a function, call it to transform the value.
        - If transformation is any other value, overwrite current value with that.
      */
        transformed[newKey] = (() => {
          if (!transformation) return currentValue
          else if (typeof currentValue === 'object' && transformation instanceof TransformationTree) {
            return transformation.applyTo(currentValue)
          } else if (typeof transformation === 'function') return transformation(currentValue)
          else return transformation
        })()
        // Stop operation if a required property is not found
      } else if (required) throw Error(`Required property "${newKey}" is not present`)
    }

    return transformed
  }
}

type Transforms<MsgType> = {
  [newKey in keyof MsgType]: {
    /** Name of the original key for this property. If not present is assumed to be the same as the new key. */
    from?: string | newKey
    /**
     * Apply a transformation to the value at this key.
     * 
     * The transformation can be a function (which receives the value and must return a value to replace it),
     * or another TransformationTree (which will be applied to the object present at that key).
     * Any other value will replace the value at that location.
     * 
     * Not declaring transformation will keep the current value.
     */
    transformation?: TransformationTree<MsgType> | TransformFunction | Literal
    /** Key must be defined */
    required?: boolean
    /** Validator function for the value */
    validate?: (value: unknown) => boolean
  }
}

declare type TransformFunction = (value: any) => any
declare type Literal = string | number | boolean | GenericObject

declare interface GenericObject {
  [key: string]: any;
}