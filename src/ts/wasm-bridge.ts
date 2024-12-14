// TextEncoder and TextDecoder are available globally in modern browsers
// and in Node.js without explicit import

export interface BaseMessage {
  p: string;
  op: string;
  m: string;
  t?: string;
  t_id?: string;
  d?: Record<string, unknown>;
}

export interface EVMConfig extends BaseMessage {
  c: {
    contractAddress: string;
    abi: {
      inputs: Array<{
        name: string;
        type: string;
      }>;
      name: string;
      outputs: Array<{
        name: string;
        type: string;
      }>;
      stateMutability: string;
      type: string;
    };
  };
}

export interface WASMConfig extends BaseMessage {
  c: {
    wasmTopicId: string;
    inputType: {
      stateData: Record<string, string>;
    };
    outputType: {
      type: string;
      format: string;
    };
  };
}

export interface WasmExports extends WebAssembly.Exports {
  __wbindgen_add_to_stack_pointer: (a: number) => number;
  __wbindgen_malloc: (a: number, b: number) => number;
  __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  __wbindgen_free: (a: number, b: number, c: number) => void;
  memory: WebAssembly.Memory;
  [key: string]: any;
}

export class WasmBridge {
  wasm: WasmExports | null = null;
  private WASM_VECTOR_LEN: number = 0;
  private cachedUint8Memory: Uint8Array | null = null;
  private cachedDataViewMemory: DataView | null = null;
  private readonly textEncoder: TextEncoder;
  private readonly textDecoder: TextDecoder;

  constructor() {
    this.textEncoder = new TextEncoder();
    this.textDecoder = new TextDecoder('utf-8', {
      ignoreBOM: true,
      fatal: true,
    });
    this.textDecoder.decode();
  }

  get wasmInstance(): WasmExports {
    if (!this.wasm) {
      throw new Error('WASM not initialized');
    }
    return this.wasm;
  }

  private getUint8Memory(): Uint8Array {
    if (!this.wasm) {
      throw new Error('WASM not initialized');
    }
    if (
      this.cachedUint8Memory === null ||
      this.cachedUint8Memory.byteLength === 0
    ) {
      this.cachedUint8Memory = new Uint8Array(this.wasm.memory.buffer);
    }
    return this.cachedUint8Memory;
  }

  private getDataViewMemory(): DataView {
    if (!this.wasm) {
      throw new Error('WASM not initialized');
    }
    if (
      this.cachedDataViewMemory === null ||
      this.cachedDataViewMemory.buffer !== this.wasm.memory.buffer
    ) {
      this.cachedDataViewMemory = new DataView(this.wasm.memory.buffer);
    }
    return this.cachedDataViewMemory;
  }

  private encodeString(
    arg: string,
    view: Uint8Array
  ): { read: number; written: number } {
    if (arg.length === 0) {
      return { read: 0, written: 0 };
    }

    const buf = this.textEncoder.encode(arg);
    view.set(buf);
    return { read: arg.length, written: buf.length };
  }

  private passStringToWasm(
    arg: string,
    malloc: (a: number, b: number) => number,
    realloc?: (a: number, b: number, c: number, d: number) => number
  ): number {
    if (realloc === undefined) {
      const buf = this.textEncoder.encode(arg);
      const ptr = malloc(buf.length, 1);
      const view = this.getUint8Memory();
      view.set(buf, ptr);
      this.WASM_VECTOR_LEN = buf.length;
      return ptr;
    }

    let len = this.textEncoder.encode(arg).length;
    let ptr = malloc(len, 1);

    const mem = this.getUint8Memory();

    let offset = 0;

    for (; offset < len; offset++) {
      const code = arg.charCodeAt(offset);
      if (code > 0x7f) break;
      mem[ptr + offset] = code;
    }

    if (offset !== len) {
      if (offset !== 0) {
        arg = arg.slice(offset);
      }
      ptr = realloc(
        ptr,
        len,
        (len = offset + this.textEncoder.encode(arg).length * 3),
        1
      );
      const view = this.getUint8Memory().subarray(ptr + offset, ptr + len);
      const ret = this.encodeString(arg, view);

      offset += ret.written;
    }

    this.WASM_VECTOR_LEN = offset;
    return ptr;
  }

  private getStringFromWasm(ptr: number, len: number): string {
    ptr = ptr >>> 0;
    return this.textDecoder.decode(
      this.getUint8Memory().subarray(ptr, ptr + len)
    );
  }

  createWasmFunction(
    wasmFn: (...args: any[]) => any
  ): (...args: string[]) => string {
    if (!this.wasm) {
      throw new Error('WASM not initialized');
    }

    return (...args: string[]): string => {
      const retptr = this.wasm!.__wbindgen_add_to_stack_pointer(-16);
      let deferred: [number, number] = [0, 0];

      try {
        const ptrLenPairs = args.map((arg) => {
          const ptr = this.passStringToWasm(
            arg,
            this.wasm!.__wbindgen_malloc,
            this.wasm!.__wbindgen_realloc
          );
          return [ptr, this.WASM_VECTOR_LEN];
        });

        const wasmArgs = [retptr, ...ptrLenPairs.flat()];

        wasmFn.apply(this.wasm, wasmArgs);

        const r0 = this.getDataViewMemory().getInt32(retptr + 4 * 0, true);
        const r1 = this.getDataViewMemory().getInt32(retptr + 4 * 1, true);
        deferred = [r0, r1];

        return this.getStringFromWasm(r0, r1);
      } finally {
        this.wasm!.__wbindgen_add_to_stack_pointer(16);
        this.wasm!.__wbindgen_free(deferred[0], deferred[1], 1);
      }
    };
  }

  async initWasm(wasmBytes: BufferSource): Promise<WasmExports> {
    const bridge = this;
    const imports = {
      __wbindgen_placeholder__: {
        __wbindgen_throw: function (ptr: number, len: number) {
          const message = bridge.getStringFromWasm(ptr, len);
          throw new Error(message);
        },
      },
    };

    const wasmModule = await WebAssembly.compile(wasmBytes);
    const wasmInstance = await WebAssembly.instantiate(wasmModule, imports);
    this.wasm = wasmInstance.exports as WasmExports;
    return this.wasm;
  }

  createStateData(wasmConfig: WASMConfig, stateData: Record<string, string> = {}) {
    let dynamicStateData: Record<string, string> = {};
    if (wasmConfig?.c?.inputType?.stateData) {
      // Map each configured state field to its value
      Object.keys(wasmConfig.c.inputType.stateData).forEach((key) => {
        if (stateData && key in stateData && stateData[key] !== undefined) {
          dynamicStateData[key] = String(stateData[key]).replace('-', '');
        } else {
          // Use the default value from config if available
          dynamicStateData[key] = String(
            wasmConfig.c.inputType.stateData[key] || '0'
          ).replace('-', '');
        }
      });
    }
    return dynamicStateData;
  }

  executeWasm(stateData: Record<string, any>, messages: BaseMessage[]) {
    const fn = this.createWasmFunction(this.wasmInstance.process_state);

    return fn(JSON.stringify(stateData), JSON.stringify(messages));
  }
}