use wasm_bindgen::prelude::*;
use serde_json::Value;
use num_bigint::BigUint;

fn parse_number(value: &Value, key: &str) -> Option<BigUint> {
    value.get(key)
        .and_then(|p| p.as_str())
        .and_then(|s| s.parse().ok())
}

#[wasm_bindgen]
pub fn process_state(state_json: &str, messages_json: &str) -> String {
    let state: Value = match serde_json::from_str(state_json) {
        Ok(data) => data,
        Err(_) => return String::new(),
    };

    let messages: Vec<Value> = match serde_json::from_str(messages_json) {
        Ok(data) => data,
        Err(_) => return String::new(),
    };

    let minted = match parse_number(&state, "minted") {
        Some(p) => p,
        None => return String::new()
    };

    let tokens_remaining = match parse_number(&state, "tokensRemaining") {
        Some(p) => p,
        None => return String::new()
    };

    let combined_value = minted.clone() * tokens_remaining;
    let is_even = combined_value % 2u32 == BigUint::from(0u32);

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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_even_combined() {
        let state = r#"{
            "minted": "2",
            "tokensRemaining": "8"
        }"#;
        let messages = r#"[
            {"t_id": "even_topic", "d": {"tags": ["even"]}},
            {"t_id": "odd_topic", "d": {"tags": ["odd"]}}
        ]"#;
        
        assert_eq!(process_state(state, messages), "");
    }

    #[test]
    fn test_odd_combined() {
        let state = r#"{
            "minted": "3",
            "tokensRemaining": "7"
        }"#;
        let messages = r#"[
            {"t_id": "even_topic", "d": {"tags": ["even"]}},
            {"t_id": "odd_topic", "d": {"tags": ["odd"]}}
        ]"#;
        
        assert_eq!(process_state(state, messages), "");
    }
}
