import { EVMCache } from './evm-bridge';
import Redis from 'ioredis';

export interface RedisConfig {
  host?: string;
  port?: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  tls?: boolean;
  connectTimeout?: number;
  retryStrategy?: (times: number) => number | void;
}

export class RedisCache implements EVMCache {
  private client: Redis;
  private prefix: string;

  constructor(config: RedisConfig = {}) {
    const {
      host = 'localhost',
      port = 6379,
      password,
      db = 0,
      keyPrefix = '',
      tls = false,
      connectTimeout = 5000,
      retryStrategy,
    } = config;

    this.prefix = keyPrefix;
    this.client = new Redis({
      host,
      port,
      password,
      db,
      tls: tls ? {} : undefined,
      keyPrefix,
      connectTimeout,
      retryStrategy: retryStrategy || ((times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }),
      maxRetriesPerRequest: 3,
    });

    this.client.on('error', (error) => {
      console.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      console.debug('Redis connected');
    });
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  async get(key: string): Promise<string | undefined> {
    try {
      const value = await this.client.get(this.getKey(key));
      return value || undefined;
    } catch (error) {
      console.error('Redis get error:', error);
      return undefined;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      const fullKey = this.getKey(key);
      if (ttlSeconds) {
        await this.client.setex(fullKey, ttlSeconds, value);
      } else {
        await this.client.set(fullKey, value);
      }
    } catch (error) {
      console.error('Redis set error:', error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(this.getKey(key));
    } catch (error) {
      console.error('Redis delete error:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await this.client.keys(`${this.prefix}*`);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (error) {
      console.error('Redis clear error:', error);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}
