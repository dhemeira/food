declare module '@img/sharp-wasm32/sharp.node' {
  interface SharpInstance {
    resize(
      width: number,
      height: number,
      options?: { fit?: string; position?: string }
    ): SharpInstance;
    jpeg(options?: { quality?: number; mozjpeg?: boolean }): SharpInstance;
    toBuffer(): Promise<Uint8Array>;
  }

  function sharp(input?: Uint8Array | ArrayBuffer): SharpInstance;

  export default sharp;
}
