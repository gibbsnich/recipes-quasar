use actix_identity::{CookieIdentityPolicy, IdentityService};
use actix_cors::Cors;
use actix_web::http::header;
use actix_web::{ middleware, web, App, HttpResponse, HttpServer };
use actix_http::cookie::SameSite;
use rand::Rng;

mod lib;
mod api;

const COOKIE_NAME: &str = "rcookie";
const ALLOWED_ORIGIN: &str = "http://localhost:65080";

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let private_key = rand::thread_rng().gen::<[u8; 32]>();

    HttpServer::new(move || { // `move` to take the ownership of `private_key`
        App::new()
            .wrap(middleware::Logger::default())
            .wrap(
                Cors::default()
                    .allowed_origin(ALLOWED_ORIGIN)
                    .allowed_methods(vec!["GET", "POST", "DELETE"])
                    .allowed_headers(vec![header::AUTHORIZATION, header::ACCEPT])
                    .allowed_header(header::CONTENT_TYPE)
                    .max_age(3600)
                    .supports_credentials(), // Allow the cookie auth.
            )
            .wrap(IdentityService::new(
                CookieIdentityPolicy::new(&private_key)
                    .name(COOKIE_NAME)
                    // .domain("XXX.net")
                    // .path("/rapi")
                    .max_age(60 * 60) //in seconds
                    .same_site(SameSite::None) // `Lax` by default, but POST isn't allowed for cross-site, though.
                    .secure(true),
            ))
            .service(
                web::scope("/api")
                    .service(
                        web::resource("/auth")
                            .route(web::post().to(api::user::login))
                            .route(web::delete().to(api::user::logout))
                    )
                    .service(
                        web::resource("/signup")
                            .route(web::post().to(api::user::signup))
                    )
                    .service(
                        web::scope("/io")
                            .service(
                                web::resource("/read/{file_name}")
                                    .route(web::get().to(api::files::read))
                            )
                            .service(
                                web::resource("/write/{file_name}")
                                    .route(web::post().to(api::files::write))
                            )
                            .service(
                                web::resource("/fetch")
                                    .route(web::post().to(api::url::fetch))
                            )
                    )
                    .route("/", web::get().to(|| HttpResponse::Ok().body("api")))
            )
            .route("/", web::get().to(|| HttpResponse::Ok().body("/")))
    })
    .bind("127.0.0.1:55340")?
    .run()
    .await
}