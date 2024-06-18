const prefix = 'SchemaComponent:';

/** 打印 */
export default {
  log(str: string) {
    console.log(`${prefix} : ${str}`);
  },
  warn(str: string) {
    console.warn(`${prefix} : ${str}`);
  },
  error(str: string) {
    console.error(`${prefix} : ${str}`);
  },
};
