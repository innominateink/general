interface GenericObject {
  [key: string]: any
}

export class TreeTransformation<MsgType> {
  public keys: Transforms<MsgType>

  constructor(keys: Transforms<MsgType>) {
    this.keys = keys
  }

  applyTo(obj: GenericObject): MsgType {
    const transformed: Partial<MsgType> = {}

    for (const newKey in this.keys) {
      const { from = newKey, transformation, required = false, validate, shouldInclude } = this.keys[newKey]

      const currentValue = obj[from]

      // Check only for undefined, as any other value is allowed
      if (currentValue !== undefined) {
        if (validate && !validate(currentValue, obj))
          throw Error(`Property "${from}" did not pass validation with value "${currentValue}"`)

        // Check if shouldInclude was passed and run it if so
        if (shouldInclude && !shouldInclude(currentValue, obj)) continue

        /*
        Assign value to its new place on the return object:
        - If there's no transformation, return the current value.
        - If the transformation is another TransformationTree and the current value is an object, apply it to the object.
        - If the transformation is a function, call it to transform the value.
        - If transformation is any other value, overwrite current value with that.
      */
        transformed[newKey] = ((): any => {
          if (!transformation) return currentValue
          else if (transformation instanceof TreeTransformation) {
            if (typeof currentValue === 'object') return transformation.applyTo(currentValue)
            else
              throw Error(
                `Encountered non-object property "${from}" with value "${currentValue}" at TransformationTree node`
              )
          } else if (typeof transformation === 'function') return transformation(currentValue, obj)
          else return transformation
        })()
        // Stop operation if a required property is not found
      } else if (required) throw Error(`Required property "${from}" is not present`)
    }

    return transformed as MsgType
  }
}

type Transforms<MsgType> = {
  [newKey in keyof MsgType]: {
    /** Name of the original key for this property. If not present is assumed to be the same as the new key. */
    from?: string | newKey
    /** Whether to include this property in the output object */
    shouldInclude?: (value: any, context: GenericObject) => boolean
    /**
     * Apply a transformation to the value at this key.
     *
     * The transformation can be a function (which receives the value and must return a value to replace it),
     * or another TransformationTree (which will be applied to the object present at that key).
     * Any other value will replace the value at that location.
     *
     * Not declaring transformation will keep the current value.
     */
    transformation?: TreeTransformation<MsgType> | TransformFunction | Literal
    /** Whether the key must be defined in the input object */
    required?: boolean
    /** Validator function for the value */
    validate?: (value: any, context: GenericObject) => boolean
  }
}

type TransformFunction = (value: any, context: GenericObject) => any
type Literal = string | number | boolean | GenericObject
