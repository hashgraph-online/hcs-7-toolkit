import { EVMBridge } from '../ts/evm-bridge';
import { RedisCache } from '../ts/redis-cache';
import { mintedConfig, balanceConfig } from './constants';

async function main() {
  const redisCache = new RedisCache({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    keyPrefix: 'evm-cache:',
    tls: process.env.REDIS_TLS === 'true',
  });

  // Create EVMBridge with Redis cache
  const evmBridge = new EVMBridge('mainnet-public', undefined, redisCache);

  try {
    // Execute commands with Redis caching
    const { results, stateData } = await evmBridge.executeCommands([
      mintedConfig,
      balanceConfig,
    ]);

    console.log('Results (from Redis if cached):', results);
    console.log('State Data:', stateData);

    // Clear specific cache entry
    await evmBridge.clearCacheForContract(
      mintedConfig.c.contractAddress,
      mintedConfig.c.abi.name
    );

    // Clear all cache
    await evmBridge.clearCache();
  } finally {
    // Disconnect from Redis
    await redisCache.disconnect();
  }
}

main().catch(console.error);
