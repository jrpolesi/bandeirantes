use std::fmt::Error;

use crate::player::Player;

pub struct Land<'a> {
    owner: Option<&'a Player>,
    contestant: Option<&'a Player>,
}

pub struct Game<'a> {
    player_list: Vec<Player>,
    password: Option<String>,
    lands: Vec<Land<'a>>,
    tps: u8,
    max_players: u8,
}

impl Game<'_> {
    pub fn new(squared_size: u8, tps: u8, password: Option<String>, max_players: u8) -> Self {
        let range = 1..=squared_size;

        let lands = range
            .map(|_| Land {
                owner: None,
                contestant: None,
            })
            .collect::<Vec<Land>>();

        Self {
            lands,
            tps,
            password,
            max_players,
            player_list: vec![],
        }
    }

    pub fn player_join(&mut self, player: Player, password: Option<String>) -> Result<(), &str> {
        if self.password.is_some() && password != self.password {
            return Err("Password mismatch");
        }

        if self.player_list.len() >= self.max_players as usize {
            return Err("Max players reached");
        }

        self.player_list.push(player);

        Ok(())
    }

    pub fn player_leave(&mut self, player: &Player) -> Result<(), &str> {
        let player_index = self
            .player_list
            .iter()
            .position(|p| p.socket_id == player.socket_id);

        match player_index {
            Some(index) => {
                self.player_list.remove(index);
                Ok(())
            }
            None => Err("Player not found"),
        }
    }

    fn get_land(&self, x: usize, y: usize) -> Option<&Land> {
        todo!()
    }
}
