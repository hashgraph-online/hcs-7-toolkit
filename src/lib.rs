use wasm_bindgen::prelude::*;
use serde_json::Value;
use num_bigint::BigUint;

fn parse_minted(value: &Value) -> Option<BigUint> {
    value.get("minted")
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


    let minted = match parse_minted(&state) {
        Some(p) => p,
        None => return String::new()
    };


    let is_even = minted % 2u32 == BigUint::from(0u32);
    
    let topic_id = if is_even {
        messages.iter()
            .find(|msg| {
                msg.get("t_id").is_some() && 
                msg.get("d")
                    .and_then(|d| d.get("tags"))
                    .and_then(|tags| tags.as_array())
                    .map(|tags| tags.iter().any(|t| t.as_str() == Some("even")))
                    .unwrap_or(false)
            })
            .and_then(|msg| msg.get("t_id").and_then(|id| id.as_str()))
            .map(|s| s.to_string())
    } else {

        messages.iter()
            .find(|msg| {
                msg.get("t_id").is_some() && 
                msg.get("d")
                    .and_then(|d| d.get("tags"))
                    .and_then(|tags| tags.as_array())
                    .map(|tags| tags.iter().any(|t| t.as_str() == Some("odd")))
                    .unwrap_or(false)
            })
            .and_then(|msg| msg.get("t_id").and_then(|id| id.as_str()))
            .map(|s| s.to_string())
    };

    // Return topic ID or empty string if none found
    topic_id.unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_even_minted() {
        let state = serde_json::json!({
            "minted": "100"
        });

        let messages = vec![
            serde_json::json!({
                "t_id": "0.0.1111",
                "d": {
                    "weight": 0.5,
                    "tags": ["even"]
                }
            })
        ];

        let result = process_state(
            &serde_json::to_string(&state).unwrap(),
            &serde_json::to_string(&messages).unwrap()
        );

        assert_eq!(result, "0.0.1111");
    }

    #[test]
    fn test_no_matching_topic() {
        let state = serde_json::json!({
            "minted": "100"
        });

        let messages = vec![
            serde_json::json!({
                "t_id": "0.0.1111",
                "d": {
                    "weight": 0.5,
                    "tags": ["something_else"]
                }
            })
        ];

        let result = process_state(
            &serde_json::to_string(&state).unwrap(),
            &serde_json::to_string(&messages).unwrap()
        );

        assert_eq!(result, "");
    }
}
