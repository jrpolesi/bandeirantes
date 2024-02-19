mod game;
mod player;

use game::Game;

fn main() {
    println!("Hello, world!");
    let mut game = Game::new(10, None);
}
