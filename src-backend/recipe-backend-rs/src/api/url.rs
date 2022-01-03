use std::str;
use actix_web::{ web, HttpResponse };
use actix_identity::Identity;
use curl::easy::Easy;

pub async fn fetch(id: Identity, body: web::Bytes) -> HttpResponse {
    println!("[url] ++++ fetch()");

    if let Some(user_id) = id.identity() {
        println!("[url] user_id: {}", user_id);
        let url = str::from_utf8(&body).unwrap();
        println!("[url] url = {}", url);
        let mut data = Vec::new();
        let mut handle = Easy::new();
        handle.url(url).unwrap();
        {
            let mut transfer = handle.transfer();
            transfer.write_function(|new_data| {
                data.extend_from_slice(new_data);
                Ok(new_data.len())
            }).unwrap();
            transfer.perform().unwrap();
        }
        return HttpResponse::Ok().body(String::from_utf8(data).unwrap());
    } else {
        println!("[article] user_id: (none)");
        return HttpResponse::Unauthorized().finish();
    }
}