use crate::player::Player;

pub struct Land<'a> {
    owner: Option<&'a Player>,
    contestant: Option<&'a Player>,
}

pub struct Game<'a> {
    player_list: Vec<Player>,
    password: Option<String>,
    lands: Vec<Land<'a>>,
    squared_size: u8,
    tps: u8,
    max_players: u8,
}

impl Game<'_> {
    pub fn new(squared_size: u8, tps: u8, password: Option<String>, max_players: u8) -> Self {
        let range = 1..=squared_size * squared_size;

        let lands = range
            .map(|_| Land {
                owner: None,
                contestant: None,
            })
            .collect::<Vec<Land>>();

        Self {
            lands,
            tps,
            squared_size,
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

    pub fn get_player_by_socket_id(&self, socket_id: String) -> Option<&Player> {
        self.player_list.iter().find(|p| p.socket_id == socket_id)
    }

    fn get_land(&self, x: usize, y: usize) -> Option<&Land> {
        let lands_len = self.lands.len();
        let maximum_axis_size = lands_len / 2;

        if x > maximum_axis_size || y > maximum_axis_size {
            return None;
        }

        let index = (y * self.squared_size as usize) + x;

        return Some(&self.lands[index]);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_game() {
        let game = Game::new(10, 2, None, 2);
        assert_eq!(game.lands.len(), 100);
        assert_eq!(game.tps, 2);
        assert_eq!(game.max_players, 2);
        assert_eq!(game.password, None);
    }

    #[test]
    fn get_the_first_land() {
        let game = Game::new(10, 2, None, 2);
        let target = &game.lands[0];
        let result = game.get_land(0, 0).unwrap();

        assert_eq!(result as *const Land, target as *const Land);
    }

    #[test]
    fn get_the_seconnd_land() {
        let game = Game::new(10, 2, None, 2);
        let target = &game.lands[1];
        let result = game.get_land(1, 0).unwrap();

        assert_eq!(result as *const Land, target as *const Land);
    }

    #[test]
    fn get_the_first_from_second_row() {
        let game = Game::new(10, 2, None, 2);
        let target = &game.lands[10];
        let result = game.get_land(0, 1).unwrap();

        assert_eq!(result as *const Land, target as *const Land);
    }

    #[test]
    fn get_the_last_land() {
        let game = Game::new(10, 2, None, 2);
        let target = &game.lands[99];
        let result = game.get_land(9, 9).unwrap();

        assert_eq!(result as *const Land, target as *const Land);
    }
}
