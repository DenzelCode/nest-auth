import { SchemaFactory } from '@nestjs/mongoose';

/**
 * Allow the schema to contain defined methods.
 * @param target
 * @returns
 */
export function createSchemaForClassWithMethods<T>(target: new () => T) {
  const schema = SchemaFactory.createForClass<T>(target);
  const proto = target.prototype;
  const descriptors = Object.getOwnPropertyDescriptors(proto);

  for (const name in descriptors) {
    if (name != 'constructor' && typeof proto[name] === 'function') {
      schema.methods[name] = proto[name];
    }

    if (descriptors[name].get || descriptors[name].set) {
      schema
        .virtual(name, {
          toObject: { virtuals: true },
          toJSON: { virtuals: true },
        })
        .get(descriptors[name].get)
        .set(descriptors[name].set);
    }
  }

  return schema;
}
