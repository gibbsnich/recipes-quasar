use std::io::{ Read, Write };
use std::fs::{ File, OpenOptions };
use std::path::Path;
use std::str;
use actix_identity::Identity;
use actix_web::{ web, HttpResponse, Responder };
extern crate fs2;
use fs2::FileExt;
use sanitize_html::sanitize_str;
use sanitize_html::rules::predefined::DEFAULT;

const FILENAMES: &'static [&'static str] = &["ingredients", "ingredient_categories", "ingredient_stores", "events", "recipes", "recipe_categories"];

fn check_valid_file(file_name: &str) -> bool {
    return FILENAMES.contains(&file_name);
}

fn get_path(user_id: String, file_name: String) -> String{
    format!("data/{}/{}", user_id, file_name)
}

pub async fn read(id: Identity, file_name: web::Path<String>) -> impl Responder {
    println!("[files] ++++ read()");
    println!("file = {}", file_name);
    if let Some(user_id) = id.identity() {
        println!("[files] user_id: {}", user_id);
        if check_valid_file(file_name.as_str()) {
            let path = get_path(user_id, file_name.to_string());
            if std::path::Path::new(&path).exists() {
                let mut file = File::open(path).unwrap();
                let mut contents = String::new();
                file.read_to_string(&mut contents).unwrap();
                return HttpResponse::Ok().body(contents);
            } else {
                return HttpResponse::Ok().body("[]");
            }
        } else {
            return HttpResponse::NotFound().finish();
        }
    } else {
        println!("[files] user_id: (none)");
        return HttpResponse::Unauthorized().finish();
    }
}

pub async fn write(id: Identity, file_name: web::Path<String>, body: web::Bytes) -> impl Responder {
    println!("[files] ++++ write()");
    if let Some(user_id) = id.identity() {
        if check_valid_file(file_name.as_str()) {
            let path = get_path(user_id, file_name.to_string());
            let prefix = Path::new(&path).parent().unwrap();
            std::fs::create_dir_all(prefix).unwrap();
            let mut file = OpenOptions::new()
                .write(true)
                .create(true)
                .truncate(true)
                .open(&path).unwrap();
            file.lock_exclusive().unwrap();
            file.write_all(&sanitize_str(&DEFAULT,  str::from_utf8(&body).unwrap()).unwrap().as_bytes()).unwrap();
            file.unlock().unwrap();
        } else {
            return HttpResponse::NotFound().finish();
        }
    } else {
        return HttpResponse::Unauthorized().finish();
    }
    HttpResponse::Ok().finish()
}