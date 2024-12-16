import { EVMConfigMessage, WASMConfigMessage, HCS1RegistrationMessage } from './messages'

export function filterHCS1Messages(messages: any[]): HCS1RegistrationMessage[] {
  return messages.filter((m): m is HCS1RegistrationMessage => 
    m.p === 'hcs-7' && m.op === 'register'
  )
}

export function filterEVMMessages(messages: any[]): EVMConfigMessage[] {
  return messages.filter((m): m is EVMConfigMessage => 
    m.p === 'hcs-7' && m.op === 'register-config' && m.t === 'evm'
  )
}

export function filterWASMMessages(messages: any[]): WASMConfigMessage[] {
  return messages.filter((m): m is WASMConfigMessage => 
    m.p === 'hcs-7' && m.op === 'register-config' && m.t === 'wasm'
  )
}

interface PreviewContent {
  title: string
  subtitle: string
  tags?: string[]
}

export function getMessagePreview(msg: EVMConfigMessage | WASMConfigMessage | HCS1RegistrationMessage): PreviewContent {
  if ('t_id' in msg) {
    return {
      title: msg.t_id,
      subtitle: `Weight: ${msg.d.weight}`,
      tags: msg.d.tags
    }
  }
  
  if (msg.t === 'evm') {
    return {
      title: msg.c.abi.name,
      subtitle: msg.c.contractAddress
    }
  }
  
  if (msg.t === 'wasm') {
    return {
      title: 'WASM Module',
      subtitle: msg.c.wasmTopicId
    }
  }
  
  return {
    title: 'Unknown',
    subtitle: 'Unknown message type'
  }
}
