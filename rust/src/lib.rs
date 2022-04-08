// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

use deno_ast::parse_script;
use deno_ast::MediaType;
use deno_ast::ParseParams;
use deno_ast::SourceTextInfo;
use wasm_bindgen::prelude::*;

#[derive(serde::Serialize)]
#[serde(rename_all = "camelCase")]
#[derive(Debug)]
pub struct CjsAnalysis {
  pub exports: Vec<String>,
  pub reexports: Vec<String>,
}

#[wasm_bindgen(js_name = "analyzeCjsExports")]
pub fn analyze_cjs_exports(file_text: &str) -> Result<JsValue, JsValue> {
  set_panic_hook();
  let source_text_info = SourceTextInfo::from_string(file_text.to_string());
  let parsed_source = parse_script(ParseParams {
    specifier: "file:///my_file.js".to_string(),
    media_type: MediaType::Cjs,
    source: source_text_info,
    capture_tokens: true,
    maybe_syntax: None,
    scope_analysis: false,
  })
  .map_err(|err| format!("{:?}", err))?;

  let result = parsed_source.analyze_cjs();
  Ok(
    JsValue::from_serde(&CjsAnalysis {
      exports: result.exports,
      reexports: result.reexports,
    })
    .unwrap(),
  )
}

fn set_panic_hook() {
  // When the `console_error_panic_hook` feature is enabled, we can call the
  // `set_panic_hook` function at least once during initialization, and then
  // we will get better error messages if our code ever panics.
  //
  // For more details see
  // https://github.com/rustwasm/console_error_panic_hook#readme
  #[cfg(feature = "console_error_panic_hook")]
  console_error_panic_hook::set_once();
}
