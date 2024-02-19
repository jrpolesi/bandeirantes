use crate::player::Player;

pub struct Land<'a> {
    owner: Option<&'a Player>,
    contestant: Option<&'a Player>,
}

pub struct Game<'a> {
    player_list: Vec<Player>,
    password: Option<String>,
    lands: Vec<Land<'a>>,
}

impl Game<'_> {
    pub fn new(squared_size: u8, password: Option<String>) -> Self {
        let range = 1..=squared_size;

        let lands = range
            .map(|x| Land {
                owner: None,
                contestant: None,
            })
            .collect::<Vec<Land>>();

        Self {
            lands,
            password,
            player_list: vec![],
        }
    }

    pub fn player_join(&mut self, player: Player, password: Option<String>) -> () {
        &self.password.is_some();

        todo!()
    }

    pub fn player_leave(&mut self, player: &Player) -> () {
        todo!()
    }

    fn get_land(&self, x: usize, y: usize) -> Option<&Land> {
        todo!()
    }
}


