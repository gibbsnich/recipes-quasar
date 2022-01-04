use std::path::Path;
use std::fs::{ File, OpenOptions };
use std::io::{ BufWriter, Write };
use actix_identity::Identity;
use actix_web::{ web, HttpResponse, Responder };
use serde::{ Deserialize, Serialize };
use pwhash::bcrypt;
use uuid::Uuid;
extern crate fs2;
use fs2::FileExt;

use crate::lib::error::Error;

#[derive(Debug, Serialize, Deserialize)]
pub struct SignupEntry {
    login_id: String,
    password: String,
    email: String,
    invitation_code: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Entry {
    login_id: String,
    password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    id: String,
    //description: String,
}

#[derive(Debug, Deserialize, Serialize, PartialEq)]
struct InvitationCode {
    code: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
struct StoredUser {
    login_id: String,
    email: String,
    uuid: String,
    pass_hash: String,
}

async fn check_invitation_code(invitation_code: &String) -> bool {
    //todo first check length of code (all will have an expected len)
    let file = OpenOptions::new().read(true).write(true).create(true).open("data/invitation_codes.json").unwrap();
    let mut available_codes:Vec<InvitationCode> = serde_json::from_reader(&file)
        .expect("error while reading invitation codes");
    if let Some(position) = available_codes.iter().position(|x| x.code == invitation_code.to_string()) {
        available_codes.remove(position);
        let write_file = OpenOptions::new().write(true).truncate(true).open("data/invitation_codes.json").unwrap();
        write_file.lock_exclusive().unwrap();
        let mut writer = BufWriter::new(&write_file);
        serde_json::to_writer(&mut writer, &available_codes).unwrap();
        writer.flush().unwrap();
        write_file.unlock().unwrap();
        return true
    } else {
        return false
    }
}

async fn read_users() -> Vec<StoredUser> {
    let json_file_path = Path::new("data/users.json");
    if json_file_path.exists() {
        let file = File::open(json_file_path).expect("error while read users file");
        let existing_users:Vec<StoredUser> = serde_json::from_reader(file)
            .expect("error while reading users");
        return existing_users;
    } else {
        Vec::new()
    }
}

async fn store_users(users: Vec<StoredUser>) -> std::io::Result<()> {
    let file = OpenOptions::new().write(true).create(true).truncate(true).open("data/users.json")?;
    file.lock_exclusive().unwrap();
    let mut writer = BufWriter::new(&file);
    serde_json::to_writer(&mut writer, &users).unwrap();
    writer.flush()?;
    file.unlock().unwrap();
    Ok(())
}

fn check_login_id_available(users: &Vec<StoredUser>, login_id: String) -> bool {
    users.iter().any(|eu| eu.login_id == login_id)
}

fn check_password(users: &Vec<StoredUser>, login_id: String, password: String) -> bool {
    users.iter().any(|eu|
        eu.login_id == login_id && bcrypt::verify(&password, &eu.pass_hash) 
    )
}

pub async fn signup(id: Identity, signup_entry: web::Json<SignupEntry>) -> Result<web::Json<User>, Error> {
    println!("[user] ++++ signup()");
    let login_id = signup_entry.login_id.clone();
    println!("[user] login_id: {}", login_id);
    let invitation_code = signup_entry.invitation_code.clone();
    let existing_users = read_users().await;

    if check_login_id_available(&existing_users, login_id.clone()) {
        println!("[user] existing user name: {}", login_id);
        return Err(Error {
            message: "Username taken".into(),
            status: 401,
        });
    }

    if signup_entry.password.len() < 12 {
        println!("[user] password too short: {}", signup_entry.password);
        return Err(Error {
            message: "Password too short".into(),
            status: 401,
        });
    }
    if !signup_entry.email.contains("@") {
        println!("[user] invalid email: {}", signup_entry.email);
        return Err(Error {
            message: "Invalid email".into(),
            status: 401,
        });
    }
    if !check_invitation_code(&invitation_code).await {
        println!("[user] invalid invitation code: {}", invitation_code);
        return Err(Error {
            message: "Invalid invitation code".into(),
            status: 401,
        });
    }
    let mut new_users = existing_users.clone();
    let uuid = Uuid::new_v4();
    new_users.push(StoredUser {
        login_id: login_id.clone(),
        email: signup_entry.email.clone(),
        pass_hash: bcrypt::hash(&signup_entry.password).unwrap(),
        uuid: uuid.to_string(),
    });
    store_users(new_users).await.unwrap();
    id.remember(uuid.to_string().to_owned());
    Ok(web::Json(User {
        id: login_id.into(),
        //description: "perfect".into(),
    }))
}

/*
curl -i --request POST \
  --url http://localhost:5000/api/auth \
  --header 'content-type: application/json' \
  --data '{"login_id": "sarah", "password": "123"}'
 */
pub async fn login(id: Identity, entry: web::Json<Entry>) -> impl Responder {
    let login_id = entry.login_id.clone();
    println!("[user] ++++ login()");
    println!("[user] login_id: {}", login_id);

    let existing_users = read_users().await;
    if !check_password(&existing_users, login_id.clone(), entry.password.clone()) {
        println!("passwords do not match");
        return HttpResponse::Unauthorized().finish();
    }
    let user_record = existing_users.iter().find(|eu| eu.login_id == login_id).unwrap();
    id.remember(user_record.uuid.to_owned());

    HttpResponse::Ok().json(User {
        id: login_id.into(),
        //description: "perfect".into(),
    })
}

/*
curl -i --request DELETE \
  --url http://localhost:5000/api/auth \
  --header 'content-type: application/json'
 */
pub async fn logout(id: Identity) -> HttpResponse {
    println!("[user] ++++ logout()");
    id.forget();
    HttpResponse::Ok().finish()
}