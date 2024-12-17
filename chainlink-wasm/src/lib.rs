use wasm_bindgen::prelude::*;
use serde_json::Value;
use num_bigint::BigUint;

fn parse_number_from_result(value: &Value) -> Option<BigUint> {
    value.get("latestRoundData")
        .and_then(|v| v.get("answer"))
        .and_then(|v| v.as_str())
        .and_then(|s| s.parse().ok())
}

#[wasm_bindgen]
pub fn process_state(state_json: &str, messages_json: &str) -> String {
    // Parse JSON inputs
    let state: Value = match serde_json::from_str(state_json) {
        Ok(data) => data,
        Err(_) => return String::new(),
    };

    let messages: Vec<Value> = match serde_json::from_str(messages_json) {
        Ok(data) => data,
        Err(_) => return String::new(),
    };

    // Extract price from Chainlink roundData
    let price = match parse_number_from_result(&state) {
        Some(p) => p,
        None => return String::new()
    };

    // Price is even/odd determines which topic to use
    let is_even = price.clone() % 2u32 == BigUint::from(0u32);

    // Find matching message based on even/odd tag
    messages.iter()
        .find(|msg| {
            msg.get("p").and_then(|p| p.as_str()) == Some("hcs-7") &&
            msg.get("op").and_then(|op| op.as_str()) == Some("register") &&
            msg.get("d")
                .and_then(|d| d.get("tags"))
                .and_then(|tags| tags.as_array())
                .map(|tags| tags.iter().any(|t| t.as_str() == Some(if is_even { "even" } else { "odd" })))
                .unwrap_or(false)
        })
        .and_then(|msg| msg.get("t_id"))
        .and_then(|id| id.as_str())
        .unwrap_or("")
        .to_string()
}

#[wasm_bindgen]
pub fn process_chainlink_state(state_json: &str, messages_json: &str) -> String {
    let state: Value = match serde_json::from_str(state_json) {
        Ok(data) => data,
        Err(_) => return String::new(),
    };

    let messages: Vec<Value> = match serde_json::from_str(messages_json) {
        Ok(data) => data,
        Err(_) => return String::new(),
    };

    // Extract the answer from the Chainlink response
    let answer = match state[0].get("answer") {
        Some(Value::String(s)) => s.parse::<i64>().ok(),
        _ => None,
    };

    let is_even = match answer {
        Some(num) => num % 2 == 0,
        None => return String::new(),
    };

    messages.iter()
        .find(|msg| {
            msg.get("p").and_then(|p| p.as_str()) == Some("hcs-7") &&
            msg.get("op").and_then(|op| op.as_str()) == Some("register") &&
            msg.get("d")
                .and_then(|d| d.get("tags"))
                .and_then(|tags| tags.as_array())
                .map(|tags| tags.iter().any(|t| t.as_str() == Some(if is_even { "even" } else { "odd" })))
                .unwrap_or(false)
        })
        .and_then(|msg| msg.get("t_id"))
        .and_then(|id| id.as_str())
        .unwrap_or("")
        .to_string()
}

#[wasm_bindgen]
pub fn get_params() -> String {
    let params = serde_json::json!({
        "roundId": "uint80",
        "answer": "int256",
        "startedAt": "uint256",
        "updatedAt": "uint256",
        "answeredInRound": "uint80"
    });
    serde_json::to_string(&params).unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_even_price() {
        let state = r#"{
            "latestRoundData": {
                "roundId": "18446744073709553193",
                "answer": "10576402000000",
                "startedAt": "1734389787",
                "updatedAt": "1734389801",
                "answeredInRound": "18446744073709553193"
            }
        }"#;
        
        let messages = r#"[
            {
                "p": "hcs-7",
                "op": "register",
                "t_id": "0.0.123",
                "d": {
                    "tags": ["even"]
                }
            },
            {
                "p": "hcs-7",
                "op": "register",
                "t_id": "0.0.456",
                "d": {
                    "tags": ["odd"]
                }
            }
        ]"#;

        assert_eq!(process_state(state, messages), "0.0.123");
    }

    #[test]
    fn test_odd_price() {
        let state = r#"{
            "latestRoundData": {
                "roundId": "18446744073709553193",
                "answer": "10576402000001",
                "startedAt": "1734389787",
                "updatedAt": "1734389801",
                "answeredInRound": "18446744073709553193"
            }
        }"#;
        
        let messages = r#"[
            {
                "p": "hcs-7",
                "op": "register",
                "t_id": "0.0.123",
                "d": {
                    "tags": ["even"]
                }
            },
            {
                "p": "hcs-7",
                "op": "register",
                "t_id": "0.0.456",
                "d": {
                    "tags": ["odd"]
                }
            }
        ]"#;

        assert_eq!(process_state(state, messages), "0.0.456");
    }

    #[test]
    fn test_even_price_chainlink() {
        let state = r#"[{"answer": "100"}]"#;
        let messages = r#"[
            {
                "p": "hcs-7",
                "op": "register",
                "t_id": "0.0.123",
                "d": {
                    "tags": ["even"]
                }
            },
            {
                "p": "hcs-7",
                "op": "register",
                "t_id": "0.0.456",
                "d": {
                    "tags": ["odd"]
                }
            }
        ]"#;

        assert_eq!(process_chainlink_state(state, messages), "0.0.123");
    }

    #[test]
    fn test_odd_price_chainlink() {
        let state = r#"[{"answer": "101"}]"#;
        let messages = r#"[
            {
                "p": "hcs-7",
                "op": "register",
                "t_id": "0.0.123",
                "d": {
                    "tags": ["even"]
                }
            },
            {
                "p": "hcs-7",
                "op": "register",
                "t_id": "0.0.456",
                "d": {
                    "tags": ["odd"]
                }
            }
        ]"#;

        assert_eq!(process_chainlink_state(state, messages), "0.0.456");
    }
}
