import { init, compress } from '@bokuweb/zstd-wasm';

interface MessagePart {
  c: string;
  o: number;
}

export interface Message extends MessagePart {
  created: Date;
  consensus_timestamp: string;
  sequence_number: number;
}

export class HCSClient {
  public mimeType: string;

  public static instance: HCSClient;

  public constructor(mimeType: string) {
    this.mimeType = mimeType;
  }

  public static async create(mimeType: string) {
    if (!HCSClient.instance) {
      HCSClient.instance = new HCSClient(mimeType);
    }
    return HCSClient.instance;
  }

  chunkMessage(message: string, chunkSize: number, firstChunkPrefix: string) {
    const firstChunkSize = chunkSize - firstChunkPrefix.length;

    let messageArray: MessagePart[] = [];
    let offset = firstChunkSize;

    messageArray.push({
      o: 0,
      c: firstChunkPrefix + message.slice(0, firstChunkSize),
    });

    for (let o = 1; offset < message.length; o++, offset += chunkSize) {
      messageArray.push({
        o,
        c: message.slice(offset, offset + chunkSize),
      });
    }

    return messageArray;
  }

  isJson(data: Buffer): boolean {
    try {
      JSON.parse(data.toString());
      return true;
    } catch (error) {
      return false;
    }
  }

  async getMimeType() {
    return this.mimeType;
  }

  async getTotalMessages(image: Buffer): Promise<number> {
    const messageChunks = await this.prepareImageChunks(image);

    return messageChunks.length;
  }

  async convertImageToBase64(image: Buffer) {
    try {
      await init();
      const compressedImage = compress(image, 10);

      const compressed = Buffer.from(compressedImage).toString('base64');

      return compressed;
    } catch (e) {
      console.log('failed to compress', e);
      return null;
    }
  }

  private async prepareImageChunks(image: Buffer): Promise<MessagePart[]> {
    const mimeType = await this.getMimeType();
    const base64Image = await this.convertImageToBase64(image);

    if (!base64Image) {
      return [];
    }
    const dataPrefix = `data:${mimeType};base64,`;

    const constantPart = JSON.stringify({ c: '', o: 0 });
    const constantPartLength = constantPart.length;
    const estimatedMaxChunks = Math.ceil(base64Image.length / 1024);
    const maxOSize = estimatedMaxChunks.toString().length;

    const maxDataSizePerMessage = 1024 - constantPartLength - maxOSize;

    return this.chunkMessage(base64Image, maxDataSizePerMessage, dataPrefix);
  }
}
